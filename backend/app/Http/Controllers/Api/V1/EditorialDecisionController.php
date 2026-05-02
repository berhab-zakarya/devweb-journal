<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\EditorialDecision;
use App\Services\ArticleStatusService;
use App\Services\NotificationService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class EditorialDecisionController extends Controller
{
    public function __construct(
        private readonly ArticleStatusService $articleStatusService,
        private readonly NotificationService $notificationService,
    )
    {
    }

    /**
     * Record an editorial decision and update the article status.
     *
     * @OA\Post(
     *     path="/articles/{article}/decision",
     *     tags={"Editorial Decisions"},
     *     summary="Record a final editorial decision (editor only)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"decision","comments"},
     *             @OA\Property(property="decision", type="string", enum={"accepted","rejected","revision_required"}),
     *             @OA\Property(property="comments", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Decision recorded"),
     *     @OA\Response(response=403, description="Access denied"),
     *     @OA\Response(response=409, description="Status transition error")
     * )
     */
    public function store(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'decision' => ['required', 'in:accepted,rejected,revision_required'],
            'comments' => ['required', 'string'],
        ]);

        $user = $request->user();

        // Use gate authorization
        if (!$user->can('create', EditorialDecision::class)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $latestFinal = EditorialDecision::query()
            ->where('article_id', $article->id)
            ->where('stage', 'finale')
            ->orderByDesc('decided_at')
            ->first();

        if ((string) $article->status !== ArticleStatus::UNDER_REVIEW->value && !$latestFinal) {
            return response()->json([
                'message' => 'A decision is only possible for an article under review.',
            ], 409);
        }

        try {
            $decision = DB::transaction(function () use ($validated, $article, $user): EditorialDecision {
                $now = Carbon::now();

                $existingFinal = EditorialDecision::query()
                    ->where('article_id', $article->id)
                    ->where('stage', 'finale')
                    ->orderByDesc('decided_at')
                    ->first();

                if ($existingFinal) {
                    $existingFinal->update([
                        'editor_id' => $user->id,
                        'decision' => $validated['decision'],
                        'comments' => $validated['comments'],
                        'decided_at' => $now,
                    ]);

                    $decision = $existingFinal->fresh();
                } else {
                    $decision = EditorialDecision::query()->create([
                        'article_id' => $article->id,
                        'editor_id' => $user->id,
                        'decision' => $validated['decision'],
                        'stage' => 'finale',
                        'comments' => $validated['comments'],
                        'decided_at' => $now,
                    ]);
                }

                EditorialDecision::query()
                    ->where('article_id', $article->id)
                    ->where('stage', 'finale')
                    ->where('id', '!=', $decision->id)
                    ->delete();

                // Old proposals no longer participate in the final workflow.
                EditorialDecision::query()
                    ->where('article_id', $article->id)
                    ->where('stage', 'proposition')
                    ->delete();

                $targetStatus = match ($validated['decision']) {
                    'accepted' => ArticleStatus::ACCEPTED,
                    'rejected' => ArticleStatus::REJECTED,
                    default => ArticleStatus::REVISION_REQUIRED,
                };

                if ($existingFinal) {
                    $article->update([
                        'status' => $targetStatus->value,
                    ]);
                } else {
                    $this->articleStatusService->transition($article, $targetStatus);
                }

                return $decision;
            });
        } catch (DomainException $exception) {
            return response()->json([
                'message' => 'Status transition not allowed for this decision.',
                'details' => $exception->getMessage(),
            ], 409);
        }

        $this->notificationService->notifyAuthorDecisionMade(
            authorId: (int) $article->author_id,
            articleId: $article->id,
            articleTitle: (string) $article->title,
            decision: $validated['decision'],
            actorId: $user->id,
        );

        return response()->json([
            'message' => 'Final editorial decision recorded successfully.',
            'data' => $decision,
        ], 201);
    }

    /**
     * Show the latest decision and history for an article.
     *
     * @OA\Get(
     *     path="/articles/{article}/decision",
     *     tags={"Editorial Decisions"},
     *     summary="Get the editorial decision and history for an article",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Decision details"),
     *     @OA\Response(response=403, description="Access denied")
     * )
     */
    public function show(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        // Get latest decision first to check authorization
        $latestFinal = EditorialDecision::query()
            ->where('article_id', $article->id)
            ->where('stage', 'finale')
            ->orderByDesc('decided_at')
            ->first();

        // Create temporary decision for authorization check if it exists
        if ($latestFinal && !$user->can('view', $latestFinal)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        // If no decision yet, check if user has general view access
        if (!$latestFinal) {
            $isEditorOrAdmin = $user->hasAnyRole(['admin', 'editor']);
            $isAuthorOwner = $user->hasRole('author') && $article->author_id === $user->id;
            if (!$isEditorOrAdmin && !$isAuthorOwner) {
                return response()->json(['message' => 'Access denied.'], 403);
            }
        }

        $history = EditorialDecision::query()
            ->with(['editor:id,name,email'])
            ->where('article_id', $article->id)
            ->orderByDesc('decided_at')
            ->get();

        return response()->json([
            'data' => [
                'latest' => $latestFinal,
                'latest_proposal' => null,
                'latest_final' => $latestFinal,
                'history' => $history->where('stage', 'finale')->values(),
            ],
        ]);
    }
}
