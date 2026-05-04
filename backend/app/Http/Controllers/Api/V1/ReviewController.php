<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Article;
use App\Models\Review;
use App\Models\ReviewerAssignment;
use App\Notifications\ReviewSubmittedNotification;
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
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer", example=77)),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="is_draft", type="boolean", nullable=true, example=false),
     *             @OA\Property(property="comments", type="string", description="Required when `is_draft` is false"),
     *             @OA\Property(property="originality_score", type="integer", minimum=0, maximum=10),
     *             @OA\Property(property="methodology_score", type="integer", minimum=0, maximum=10),
     *             @OA\Property(property="clarity_score", type="integer", minimum=0, maximum=10),
     *             @OA\Property(property="overall_score", type="integer", minimum=0, maximum=10),
     *             @OA\Property(property="recommendation", type="string", enum={"accept","reject","minor_revision","major_revision"}, description="Required when not draft")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="First save or submit (resource created)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="assignment_id", type="integer"),
     *                 @OA\Property(property="article_version_id", type="integer"),
     *                 @OA\Property(property="originality_score", type="integer", nullable=true),
     *                 @OA\Property(property="methodology_score", type="integer", nullable=true),
     *                 @OA\Property(property="clarity_score", type="integer", nullable=true),
     *                 @OA\Property(property="overall_score", type="integer", nullable=true),
     *                 @OA\Property(property="comments", type="string"),
     *                 @OA\Property(property="is_draft", type="boolean"),
     *                 @OA\Property(property="is_submitted", type="boolean"),
     *                 @OA\Property(property="submitted_at", type="string", format="date-time", nullable=true),
     *                 @OA\Property(property="assignment", type="object"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Existing review updated (draft resave or second submit blocked upstream)",
     *         @OA\JsonContent(@OA\Property(property="message", type="string"), @OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot respond to assignment", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=409, description="Workflow conflict", @OA\JsonContent(ref="#/components/schemas/ConflictResponse")),
     *     @OA\Response(response=500, description="Server error")
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
            ReviewSubmittedNotification::notifyEditorOfReview(
                $this->notificationService,
                (int) $assignment->assigned_by,
                $article->id,
                (string) $article->title,
                $assignment->id,
                $user->id,
            );

            $pendingAssignmentsRemain = ReviewerAssignment::query()
                ->where('article_id', $article->id)
                ->where('assigned_by', $assignment->assigned_by)
                ->whereIn('status', ['pending', 'accepted'])
                ->exists();

            if (!$pendingAssignmentsRemain) {
                ReviewSubmittedNotification::notifyEditorAllReviewsComplete(
                    $this->notificationService,
                    (int) $assignment->assigned_by,
                    $article->id,
                    (string) $article->title,
                    $user->id,
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
     *     @OA\Parameter(name="assignment", in="path", required=true, @OA\Schema(type="integer", example=77)),
     *     @OA\Response(
     *         response=200,
     *         description="ReviewResource",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot view review", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=404, description="No review row yet", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
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
     *     summary="List submitted reviews for an article (editor/admin)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer", example=42)),
     *     @OA\Response(
     *         response=200,
     *         description="ReviewResource collection (assignments must be complete)",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="assignment_id", type="integer"),
     *                     @OA\Property(property="comments", type="string"),
     *                     @OA\Property(property="is_submitted", type="boolean", example=true),
     *                     @OA\Property(property="submitted_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Role not allowed", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
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
