<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Publication;
use App\Services\ArticleStatusService;
use App\Services\NotificationService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ArticlePublicationController extends Controller
{
    public function __construct(
        private readonly ArticleStatusService $articleStatusService,
        private readonly NotificationService $notificationService,
    )
    {
    }

    /**
     * Explicitly publish an accepted article.
     *
     * @OA\Post(
     *     path="/articles/{article}/publish",
     *     tags={"Publications"},
     *     summary="Publish an accepted article (editor/admin)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer", example=42)),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="published_at", type="string", format="date-time", nullable=true, description="Defaults to now"),
     *             @OA\Property(property="doi", type="string", maxLength=120, nullable=true, example="10.1234/journal.2026.ai"),
     *             @OA\Property(property="volume", type="string", maxLength=30, nullable=true, example="12"),
     *             @OA\Property(property="issue", type="string", maxLength=30, nullable=true, example="3")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Publication model persisted + article status becomes published",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Article published successfully."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=18),
     *                 @OA\Property(property="article_id", type="integer"),
     *                 @OA\Property(property="article_version_id", type="integer"),
     *                 @OA\Property(property="published_at", type="string", format="date-time"),
     *                 @OA\Property(property="doi", type="string", nullable=true),
     *                 @OA\Property(property="volume", type="string", nullable=true),
     *                 @OA\Property(property="issue", type="string", nullable=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Role not allowed", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=409, description="Workflow conflict", @OA\JsonContent(ref="#/components/schemas/ConflictResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function store(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'published_at' => ['nullable', 'date'],
            'doi' => ['nullable', 'string', 'max:120', 'unique:publications,doi'],
            'volume' => ['nullable', 'string', 'max:30'],
            'issue' => ['nullable', 'string', 'max:30'],
        ]);

        if ((string) $article->status !== ArticleStatus::ACCEPTED->value) {
            return response()->json([
                'message' => 'Only accepted articles can be published.',
            ], 409);
        }

        if (!$article->current_version_id) {
            return response()->json([
                'message' => 'Cannot publish without a current version.',
            ], 409);
        }

        if (Publication::query()->where('article_id', $article->id)->exists()) {
            return response()->json([
                'message' => 'This article is already published.',
            ], 409);
        }

        $publishedAt = isset($validated['published_at'])
            ? Carbon::parse((string) $validated['published_at'])
            : Carbon::now();

        try {
            $publication = DB::transaction(function () use ($article, $validated, $publishedAt): Publication {
                $publication = Publication::query()->create([
                    'article_id' => $article->id,
                    'article_version_id' => $article->current_version_id,
                    'published_at' => $publishedAt,
                    'doi' => $validated['doi'] ?? null,
                    'volume' => $validated['volume'] ?? null,
                    'issue' => $validated['issue'] ?? null,
                ]);

                $this->articleStatusService->transition($article, ArticleStatus::PUBLISHED);

                return $publication;
            });
        } catch (DomainException $exception) {
            return response()->json([
                'message' => 'Status transition not allowed for publication.',
                'details' => $exception->getMessage(),
            ], 409);
        }

        $this->notificationService->notifyAuthorArticlePublished(
            authorId: (int) $article->author_id,
            articleId: $article->id,
            articleTitle: (string) $article->title,
            publishedAt: $publishedAt,
            actorId: $request->user()?->id,
        );

        return response()->json([
            'message' => 'Article published successfully.',
            'data' => $publication,
        ], 201);
    }
}
