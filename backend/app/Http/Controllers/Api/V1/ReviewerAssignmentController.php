<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ReviewerAssignment;
use App\Models\User;
use App\Notifications\ReviewerAssignedNotification;
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
     *     summary="Search for available reviewers by email (editor/admin)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer", example=42)),
     *     @OA\Parameter(name="q", in="query", required=true, description="Min length 2", @OA\Schema(type="string", example="rev@")),
     *     @OA\Parameter(name="limit", in="query", required=false, @OA\Schema(type="integer", minimum=1, maximum=25, default=10)),
     *     @OA\Response(
     *         response=200,
     *         description="{ id, name, email } reviewers",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(type="object",
     *                     @OA\Property(property="id", type="integer", example=15),
     *                     @OA\Property(property="name", type="string", example="Pat Reviewer"),
     *                     @OA\Property(property="email", type="string", example="pat.reviewer@uni.edu")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot create assignments", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=500, description="Server error")
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
     *     summary="Assign reviewers to an article (editor/admin)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer", example=42)),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"reviewer_ids"},
     *             @OA\Property(property="reviewer_ids", type="array", minItems=1,
     *                 @OA\Items(type="integer", example=15)
     *             ),
     *             @OA\Property(property="due_date", type="string", format="date", nullable=true, example="2026-06-01")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="ReviewerAssignment models created/reused",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Assignments created successfully."),
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="article_id", type="integer"),
     *                     @OA\Property(property="reviewer_id", type="integer"),
     *                     @OA\Property(property="assigned_by", type="integer", nullable=true),
     *                     @OA\Property(property="assigned_at", type="string", format="date-time"),
     *                     @OA\Property(property="status", type="string", example="pending"),
     *                     @OA\Property(property="due_date", type="string", format="date-time", nullable=true)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Forbidden", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=500, description="Server error")
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
                    ReviewerAssignedNotification::notifyReviewer(
                        $this->notificationService,
                        $reviewer->id,
                        $article->id,
                        (string) $article->title,
                        $assignment->due_date,
                        $editor->id,
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
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer", example=42)),
     *     @OA\Response(
     *         response=200,
     *         description="Eloquent models with reviewer + assignedBy loaded",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 description="ReviewerAssignment models with `reviewer` and `assignedBy` eager-loaded (JSON keys follow Laravel model serialization)",
     *                 @OA\Items(type="object",
     *                     @OA\Property(property="id", type="integer", example=101),
     *                     @OA\Property(property="article_id", type="integer"),
     *                     @OA\Property(property="reviewer_id", type="integer"),
     *                     @OA\Property(property="status", type="string", example="pending"),
     *                     @OA\Property(property="due_date", type="string", format="date-time", nullable=true)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
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
     *     summary="Delete an assignment (editor/admin)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer", example=101)),
     *     @OA\Response(response=200, description="Deleted", @OA\JsonContent(@OA\Property(property="message", type="string", example="Assignment deleted successfully."))),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Forbidden", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=409, description="Assignment already complete", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
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
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer", example=101)),
     *     @OA\Response(
     *         response=200,
     *         description="Assignment with reviewer, assignedBy, article summary",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Forbidden", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
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
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer", example=101)),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"response"},
     *             @OA\Property(property="response", type="string", enum={"accepted","decline"}, example="accepted")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Updated assignment model",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Response recorded successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Forbidden", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=409, description="Already processed assignment", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
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