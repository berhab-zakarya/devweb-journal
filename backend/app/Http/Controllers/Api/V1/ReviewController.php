<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Article;
use App\Models\Review;
use App\Models\ReviewerAssignment;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    /**
     * Submit a review for an accepted assignment.
     *
     * @OA\Post(
     *     path="/assignments/{assignment}/review",
     *     tags={"Reviews"},
     *     summary="Submit or save a draft review for an assignment (reviewer)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="comments", type="string"),
     *             @OA\Property(property="recommendation", type="string"),
     *             @OA\Property(property="is_draft", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Review submitted"),
     *     @OA\Response(response=403, description="Access denied"),
     *     @OA\Response(response=409, description="Assignment not accepted")
     * )
     */
    public function store(StoreReviewRequest $request, ReviewerAssignment $assignment): JsonResponse
    {
        $user = $request->user();

        // Check if user can respond to this assignment
        if (!$user->can('respond', $assignment)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        if (!in_array($assignment->status, ['accepted', 'complete'], true)) {
            return response()->json([
                'message' => 'The assignment must be accepted before submitting a review.',
            ], 409);
        }

        $validated = $request->validated();
        $isDraft = (bool) ($validated['is_draft'] ?? false);
        $comments = trim((string) ($validated['comments'] ?? ''));

        if ($assignment->status === 'complete') {
            return response()->json([
                'message' => 'This review has already been submitted and cannot be modified.',
            ], 409);
        }

        $article = Article::query()->findOrFail($assignment->article_id);

        if (!$article->current_version_id) {
            return response()->json([
                'message' => 'No current version for this article.',
            ], 409);
        }

        $justSubmitted = false;
        $reviewWasCreated = false;

        $review = DB::transaction(function () use ($assignment, $article, $validated, $comments, $isDraft, &$justSubmitted, &$reviewWasCreated): Review {
            $review = Review::query()->firstOrNew([
                'assignment_id' => $assignment->id,
            ]);
            $reviewWasCreated = !$review->exists;

            $review->fill([
                'article_version_id' => $article->current_version_id,
                'originality_score' => $validated['originality_score'] ?? null,
                'methodology_score' => $validated['methodology_score'] ?? null,
                'clarity_score' => $validated['clarity_score'] ?? null,
                'overall_score' => $validated['overall_score'] ?? null,
                'comments' => $comments,
                'decision_suggestion' => $validated['recommendation'] ?? null,
                'submitted_at' => $isDraft ? null : Carbon::now(),
            ]);
            $review->save();

            if (!$isDraft) {
                $assignment->update([
                    'status' => 'complete',
                ]);
                $justSubmitted = true;
            }

            return $review->fresh();
        });

        if ($justSubmitted && $assignment->assigned_by) {
            $this->notificationService->notifyEditorReviewSubmitted(
                editorId: (int) $assignment->assigned_by,
                articleId: $article->id,
                articleTitle: (string) $article->title,
                assignmentId: $assignment->id,
                actorId: $user->id,
            );

            $pendingAssignmentsRemain = ReviewerAssignment::query()
                ->where('article_id', $article->id)
                ->where('assigned_by', $assignment->assigned_by)
                ->whereIn('status', ['pending', 'accepted'])
                ->exists();

            if (!$pendingAssignmentsRemain) {
                $this->notificationService->notifyEditorAllReviewsSubmitted(
                    editorId: (int) $assignment->assigned_by,
                    articleId: $article->id,
                    articleTitle: (string) $article->title,
                    actorId: $user->id,
                );
            }
        }

        return response()->json([
            'message' => $isDraft ? 'Review draft saved.' : 'Review submitted successfully.',
            'data' => new ReviewResource($review->load(['assignment.reviewer:id,name,email'])),
        ], $reviewWasCreated ? 201 : 200);
    }

    /**
     * Show the review for an assignment.
     *
     * @OA\Get(
     *     path="/assignments/{assignment}/review",
     *     tags={"Reviews"},
     *     summary="Get the review for a given assignment",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Review details"),
     *     @OA\Response(response=403, description="Access denied"),
     *     @OA\Response(response=404, description="Review not found")
     * )
     */
    public function show(Request $request, ReviewerAssignment $assignment): JsonResponse
    {
        $user = $request->user();

        $review = Review::query()
            ->where('assignment_id', $assignment->id)
            ->first();

        if (!$review) {
            return response()->json(['message' => 'Review not found.'], 404);
        }

        // Check authorization using Review policy
        if (!$user->can('view', $review)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $review->load(['assignment.reviewer:id,name,email']);

        return response()->json([
            'data' => new ReviewResource($review),
        ]);
    }

    /**
     * List reviews for an article (editor/admin).
     *
     * @OA\Get(
     *     path="/articles/{article}/reviews",
     *     tags={"Reviews"},
     *     summary="List all submitted reviews for an article (editor/admin)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="List of reviews")
     * )
     */
    public function indexByArticle(Article $article): JsonResponse
    {
        $reviews = Review::query()
            ->with([
                'assignment.reviewer:id,name,email',
            ])
            ->whereIn(
                'assignment_id',
                DB::table('reviewer_assignments')
                    ->where('article_id', $article->id)
                    ->where('status', 'complete')
                    ->select('id')
            )
            ->orderByDesc('submitted_at')
            ->get();

        return response()->json([
            'data' => ReviewResource::collection($reviews),
        ]);
    }
}
