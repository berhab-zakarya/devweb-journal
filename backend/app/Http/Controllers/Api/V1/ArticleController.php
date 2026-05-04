<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Notifications\ArticleSubmittedNotification;
use App\Services\NotificationService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ArticleController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    /**
     * List articles based on the user's role.
     *
     * @OA\Get(
     *     path="/articles",
     *     tags={"Articles"},
     *     summary="List articles (filtered by role)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, description="Matches title, abstract, keywords", @OA\Schema(type="string", example="machine learning")),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", minimum=1, example=1)),
     *     @OA\Response(
     *         response=200,
     *         description="Paginated ArticleResource collection (`data.data` items match ArticleResource)",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="data", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="id", type="integer", example=42),
     *                         @OA\Property(property="author_id", type="integer", example=3),
     *                         @OA\Property(property="category_id", type="integer", example=1),
     *                         @OA\Property(property="title", type="string", example="Quantum embeddings for IR"),
     *                         @OA\Property(property="abstract", type="string"),
     *                         @OA\Property(property="keywords", type="string", example="IR; quantum"),
     *                         @OA\Property(property="status", type="string", example="under_review"),
     *                         @OA\Property(property="status_history", type="array",
     *                             @OA\Items(type="object",
     *                                 @OA\Property(property="status", type="string", example="submitted"),
     *                                 @OA\Property(property="changed_at", type="string", format="date-time"),
     *                                 @OA\Property(property="note", type="string", example="Initial submission")
     *                             )
     *                         ),
     *                         @OA\Property(property="current_version_id", type="integer", example=101),
     *                         @OA\Property(property="submitted_at", type="string", format="date-time"),
     *                         @OA\Property(property="is_published", type="boolean", example=false),
     *                         @OA\Property(property="published_at", type="string", format="date-time", nullable=true),
     *                         @OA\Property(property="author", type="object",
     *                             @OA\Property(property="id", type="integer"),
     *                             @OA\Property(property="name", type="string"),
     *                             @OA\Property(property="email", type="string")
     *                         ),
     *                         @OA\Property(property="category", type="object",
     *                             @OA\Property(property="id", type="integer"),
     *                             @OA\Property(property="name", type="string"),
     *                             @OA\Property(property="slug", type="string")
     *                         ),
     *                         @OA\Property(property="publication", type="object", nullable=true),
     *                         @OA\Property(property="created_at", type="string", format="date-time"),
     *                         @OA\Property(property="updated_at", type="string", format="date-time")
     *                     )
     *                 ),
     *                 @OA\Property(property="links", ref="#/components/schemas/PaginatorLinks"),
     *                 @OA\Property(property="meta", ref="#/components/schemas/PaginatorMeta")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot list articles for this account", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->authorize('viewAny', Article::class);

        $query = Article::query()
            ->with(['author:id,name,email', 'category:id,name,slug', 'publication:id,article_id,published_at,doi,volume,issue'])
            ->orderByDesc('created_at');

        // Readers only see published catalogue entries (matches ArticlePolicy::view).
        if ($user->hasRole('reader') && !$user->hasAnyRole(['admin', 'editor', 'author', 'reviewer'])) {
            $query->whereHas('publication');
        }

        // An author can only see their own articles.
        if ($user->hasRole('author') && !$user->hasAnyRole(['admin', 'editor'])) {
            $query->where('author_id', $user->id);
        }

        // A reviewer can only see articles assigned to them.
        if ($user->hasRole('reviewer') && !$user->hasAnyRole(['admin', 'editor'])) {
            $query->whereExists(function ($exists) use ($user): void {
                $exists
                    ->select(DB::raw(1))
                    ->from('reviewer_assignments')
                    ->whereColumn('reviewer_assignments.article_id', 'articles.id')
                    ->where('reviewer_assignments.reviewer_id', $user->id)
                    ->where('reviewer_assignments.status', '!=', 'decline');
            });
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($inner) use ($search): void {
                $inner
                    ->where('title', 'like', '%' . $search . '%')
                    ->orWhere('abstract', 'like', '%' . $search . '%')
                    ->orWhere('keywords', 'like', '%' . $search . '%');
            });
        }

        $articles = $query->paginate(10);

        return response()->json([
            'data' => ArticleResource::collection($articles),
        ]);
    }

    /**
     * Create an article and its initial version (v1) with secure PDF upload.
     *
     * @OA\Post(
     *     path="/articles",
     *     tags={"Articles"},
     *     summary="Submit a new article (with PDF upload)",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(required=true,
     *         @OA\MediaType(mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"title","abstract","keywords","category_id","pdf"},
     *                 @OA\Property(property="title", type="string", maxLength=255, example="Quantum embeddings for IR"),
     *                 @OA\Property(property="abstract", type="string", example="We propose ..."),
     *                 @OA\Property(property="keywords", type="string", example="information retrieval; quantum"),
     *                 @OA\Property(property="category_id", type="integer", example=2),
     *                 @OA\Property(property="pdf", description="PDF file, max 10240 KiB", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Article submitted",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Article submitted successfully."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=42),
     *                 @OA\Property(property="author_id", type="integer"),
     *                 @OA\Property(property="category_id", type="integer"),
     *                 @OA\Property(property="title", type="string"),
     *                 @OA\Property(property="abstract", type="string"),
     *                 @OA\Property(property="keywords", type="string"),
     *                 @OA\Property(property="status", type="string", example="submitted"),
     *                 @OA\Property(property="status_history", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="current_version_id", type="integer"),
     *                 @OA\Property(property="submitted_at", type="string", format="date-time"),
     *                 @OA\Property(property="is_published", type="boolean", example=false),
     *                 @OA\Property(property="published_at", type="string", nullable=true),
     *                 @OA\Property(property="author", type="object"),
     *                 @OA\Property(property="category", type="object"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Forbidden (policy)", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function store(StoreArticleRequest $request): JsonResponse
    {
        $this->authorize('create', Article::class);

        $validated = $request->validated();

        $user = $request->user();

        $article = DB::transaction(function () use ($validated, $request, $user): Article {
            $article = Article::query()->create([
                'author_id' => $user->id,
                'category_id' => $validated['category_id'],
                'title' => $validated['title'],
                'abstract' => $validated['abstract'],
                'keywords' => $validated['keywords'],
                'status' => 'submitted',
                'submitted_at' => Carbon::now(),
            ]);

            $file = $request->file('pdf');
            $fileName = (string) Str::uuid() . '.pdf';
            $pdfPath = $file->storeAs('private/articles/' . $article->id, $fileName, 'local');

            $versionId = DB::table('article_versions')->insertGetId([
                'article_id' => $article->id,
                'version_number' => 1,
                'pdf_path' => $pdfPath,
                'pdf_original_name' => $file->getClientOriginalName(),
                'pdf_size' => $file->getSize(),
                'change_summary' => null,
                'submitted_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            $article->update([
                'current_version_id' => $versionId,
            ]);

            return $article->fresh(['author:id,name,email', 'category:id,name,slug']);
        });

        ArticleSubmittedNotification::notifyEditors(
            $this->notificationService,
            $article->id,
            (string) $article->title,
            $user->id,
        );

        return response()->json([
            'message' => 'Article submitted successfully.',
            'data' => new ArticleResource($article),
        ], 201);
    }

    /**
     * Show article details.
     *
     * @OA\Get(
     *     path="/articles/{article}",
     *     tags={"Articles"},
     *     summary="Get article details",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer", example=42)),
     *     @OA\Response(
     *         response=200,
     *         description="ArticleResource (relations loaded internally for status_history only; response matches ArticleResource::toArray)",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=42),
     *                 @OA\Property(property="author_id", type="integer"),
     *                 @OA\Property(property="category_id", type="integer"),
     *                 @OA\Property(property="title", type="string"),
     *                 @OA\Property(property="abstract", type="string"),
     *                 @OA\Property(property="keywords", type="string"),
     *                 @OA\Property(property="status", type="string", example="under_review"),
     *                 @OA\Property(property="status_history", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="status", type="string", example="submitted"),
     *                         @OA\Property(property="changed_at", type="string", format="date-time"),
     *                         @OA\Property(property="note", type="string", example="Initial submission")
     *                     )
     *                 ),
     *                 @OA\Property(property="current_version_id", type="integer"),
     *                 @OA\Property(property="submitted_at", type="string", format="date-time"),
     *                 @OA\Property(property="is_published", type="boolean"),
     *                 @OA\Property(property="published_at", type="string", format="date-time", nullable=true),
     *                 @OA\Property(property="author", type="object"),
     *                 @OA\Property(property="category", type="object"),
     *                 @OA\Property(property="publication", type="object", nullable=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot view article", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=404, description="Implicit route model binding when invalid id"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function show(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        // Use gate authorization
        if (!$user->can('view', $article)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $article->load([
            'author:id,name,email',
            'category:id,name,slug',
            'publication:id,article_id,published_at,doi,volume,issue',
            'versions:id,article_id,version_number,submitted_at,change_summary',
            'editorialDecisions:id,article_id,decision,stage,comments,decided_at',
        ]);

        return response()->json([
            'data' => new ArticleResource($article),
        ]);
    }

    /**
     * Update article metadata.
     *
     * @OA\Put(
     *     path="/articles/{article}",
     *     tags={"Articles"},
     *     summary="Update article metadata",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer", example=42)),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", maxLength=255),
     *             @OA\Property(property="abstract", type="string"),
     *             @OA\Property(property="keywords", type="string"),
     *             @OA\Property(property="category_id", type="integer", description="Existing category id")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Updated ArticleResource",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Article updated successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot update", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function update(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        // Use gate authorization
        if (!$user->can('update', $article)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'abstract' => ['sometimes', 'required', 'string'],
            'keywords' => ['sometimes', 'required', 'string'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
        ]);

        $article->update($validated);

        return response()->json([
            'message' => 'Article updated successfully.',
            'data' => new ArticleResource($article->fresh(['author:id,name,email', 'category:id,name,slug', 'publication:id,article_id,published_at,doi,volume,issue'])),
        ]);
    }

    /**
     * Soft-delete an article.
     *
     * @OA\Delete(
     *     path="/articles/{article}",
     *     tags={"Articles"},
     *     summary="Delete (soft) an article",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer", example=42)),
     *     @OA\Response(response=200, description="Soft-deleted", @OA\JsonContent(@OA\Property(property="message", type="string", example="Article deleted successfully."))),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot delete", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function destroy(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        // Use gate authorization
        if (!$user->can('delete', $article)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $article->delete();

        return response()->json([
            'message' => 'Article deleted successfully.',
        ]);
    }

    /**
     * Download the PDF of the current version of an article.
     *
     * @OA\Get(
     *     path="/articles/{article}/download",
     *     tags={"Articles"},
     *     summary="Download the current PDF version of an article",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer", example=42)),
     *     @OA\Response(response=200, description="PDF binary (`application/pdf`)"),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot download", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=404, description="No current version or PDF missing on disk", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function download(Request $request, Article $article): BinaryFileResponse|JsonResponse
    {
        $user = $request->user();

        // Use gate authorization
        if (!$user->can('download', $article)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        if (!$article->current_version_id) {
            return response()->json(['message' => 'No version available.'], 404);
        }

        $version = DB::table('article_versions')->where('id', $article->current_version_id)->first();

        if (!$version || !Storage::disk('local')->exists($version->pdf_path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return response()->download(
            Storage::disk('local')->path($version->pdf_path),
            $version->pdf_original_name,
            ['Content-Type' => 'application/pdf']
        );
    }

    private function hasReviewerAccessToArticle(int $reviewerId, int $articleId): bool
    {
        return DB::table('reviewer_assignments')
            ->where('article_id', $articleId)
            ->where('reviewer_id', $reviewerId)
            ->where('status', '!=', 'decline')
            ->exists();
    }
}
