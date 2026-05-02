<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ReviewerAssignment;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReviewerAssignmentController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    /**
     * Search reviewers by email to populate the assignment autocomplete.
     *
     * @OA\Get(
     *     path="/articles/{article}/reviewers/search",
     *     tags={"Reviewer Assignments"},
     *     summary="Search for available reviewers by email (editor)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="q", in="query", required=true, @OA\Schema(type="string")),
     *     @OA\Parameter(name="limit", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="List of matching reviewers"),
     *     @OA\Response(response=403, description="Access denied")
     * )
     */
    public function searchReviewers(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        if (!$user->can('create', ReviewerAssignment::class)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:190'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:25'],
        ]);

        $term = trim((string) $validated['q']);
        $limit = (int) ($validated['limit'] ?? 10);
        $escapedTerm = addcslashes($term, '\%_');
        $containsTerm = '%' . $escapedTerm . '%';
        $startsWithTerm = $escapedTerm . '%';

        $reviewers = User::query()
            ->select(['id', 'name', 'email'])
            ->whereHas('roles', function ($roleQuery): void {
                $roleQuery->where('name', 'reviewer');
            })
            ->where('email', 'like', $containsTerm)
            ->whereNotIn('id', function ($subQuery) use ($article): void {
                $subQuery
                    ->select('reviewer_id')
                    ->from('reviewer_assignments')
                    ->where('article_id', $article->id);
            })
            ->orderByRaw('CASE WHEN email LIKE ? THEN 0 ELSE 1 END', [$startsWithTerm])
            ->orderBy('email')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $reviewers]);
    }

    /**
     * Create reviewer assignments for an article.
     *
     * @OA\Post(
     *     path="/articles/{article}/assignments",
     *     tags={"Reviewer Assignments"},
     *     summary="Assign reviewers to an article (editor)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"reviewer_ids"},
     *             @OA\Property(property="reviewer_ids", type="array", @OA\Items(type="integer")),
     *             @OA\Property(property="due_date", type="string", format="date")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Assignments created"),
     *     @OA\Response(response=403, description="Access denied")
     * )
     */
    public function store(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        if (!$user->can('create', ReviewerAssignment::class)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $validated = $request->validate([
            'reviewer_ids' => ['required', 'array', 'min:1'],
            'reviewer_ids.*' => ['required', 'integer', 'distinct', 'exists:users,id'],
            'due_date' => ['nullable', 'date'],
        ]);

        $editor = $request->user();
        $created = [];

        DB::transaction(function () use ($validated, $article, $editor, &$created): void {
            foreach ($validated['reviewer_ids'] as $reviewerId) {
                $reviewer = User::query()->find($reviewerId);

                if (!$reviewer || !$reviewer->hasRole('reviewer')) {
                    continue;
                }

                $assignment = ReviewerAssignment::query()->firstOrCreate(
                    [
                        'article_id' => $article->id,
                        'reviewer_id' => $reviewer->id,
                    ],
                    [
                        'status' => 'pending',
                        'assigned_by' => $editor->id,
                        'assigned_at' => Carbon::now(),
                        'due_date' => $validated['due_date'] ?? null,
                    ]
                );

                if ($assignment->wasRecentlyCreated) {
                    $this->notificationService->notifyReviewerAssigned(
                        reviewerId: $reviewer->id,
                        articleId: $article->id,
                        articleTitle: (string) $article->title,
                        dueDate: $assignment->due_date,
                        actorId: $editor->id,
                    );
                }

                $created[] = $assignment;
            }
        });

        return response()->json([
            'message' => 'Assignments created successfully.',
            'data' => $created,
        ], 201);
    }

    /**
     * List assignments for an article.
     *
     * @OA\Get(
     *     path="/articles/{article}/assignments",
     *     tags={"Reviewer Assignments"},
     *     summary="List assignments for an article",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="List of assignments")
     * )
     */
    public function index(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        $query = ReviewerAssignment::query()
            ->with(['reviewer:id,name,email', 'assignedBy:id,name,email'])
            ->where('article_id', $article->id)
            ->orderByDesc('assigned_at');

        // A reviewer can only see their own assignments.
        if ($user->hasRole('reviewer') && !$user->hasAnyRole(['admin', 'editor'])) {
            $query->where('reviewer_id', $user->id);
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Delete an assignment (if not completed).
     *
     * @OA\Delete(
     *     path="/assignments/{assignment}",
     *     tags={"Reviewer Assignments"},
     *     summary="Delete an assignment (editor)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Assignment deleted"),
     *     @OA\Response(response=403, description="Access denied"),
     *     @OA\Response(response=409, description="Cannot delete completed assignment")
     * )
     */
    public function destroy(Request $request, ReviewerAssignment $assignment): JsonResponse
    {
        $user = $request->user();

        if (!$user->can('delete', $assignment)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        if ($assignment->status === 'complete') {
            return response()->json([
                'message' => 'Cannot delete a completed assignment.',
            ], 409);
        }

        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted successfully.']);
    }

    /**
     * Show assignment details for the assigned reviewer or editorial staff.
     *
     * @OA\Get(
     *     path="/assignments/{assignment}",
     *     tags={"Reviewer Assignments"},
     *     summary="Get assignment details",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Assignment details"),
     *     @OA\Response(response=403, description="Access denied")
     * )
     */
    public function show(Request $request, ReviewerAssignment $assignment): JsonResponse
    {
        $user = $request->user();

        if (!$user->can('view', $assignment)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        return response()->json([
            'data' => $assignment->load([
                'reviewer:id,name,email',
                'assignedBy:id,name,email',
                'article:id,title,status,current_version_id',
            ]),
        ]);
    }

    /**
     * The reviewer accepts or declines their assignment.
     *
     * @OA\Patch(
     *     path="/assignments/{assignment}/respond",
     *     tags={"Reviewer Assignments"},
     *     summary="Accept or decline a reviewer assignment (reviewer)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"response"},
     *             @OA\Property(property="response", type="string", enum={"accepted","decline"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Response recorded"),
     *     @OA\Response(response=403, description="Access denied")
     * )
     */
    public function respond(Request $request, ReviewerAssignment $assignment): JsonResponse
    {
        $validated = $request->validate([
            'response' => ['required', 'in:accepted,decline'],
        ]);

        $user = $request->user();

        if (!$user->can('respond', $assignment)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        if ($assignment->status !== 'pending') {
            return response()->json([
                'message' => 'This assignment has already been processed.',
            ], 409);
        }

        $assignment->update(['status' => $validated['response']]);

        return response()->json([
            'message' => 'Response recorded successfully.',
            'data' => $assignment->fresh(),
        ]);
    }
}