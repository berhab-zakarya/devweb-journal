<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ArticleController extends Controller
{
    /**
     * List articles based on the user's role.
     *
     * @OA\Get(
     *     path="/articles",
     *     tags={"Articles"},
     *     summary="List articles (filtered by role)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Paginated list of articles"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Article::query()
            ->with(['author:id,name,email', 'category:id,name,slug', 'publication:id,article_id,published_at,doi,volume,issue'])
            ->orderByDesc('created_at');

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
     *                 @OA\Property(property="title", type="string"),
     *                 @OA\Property(property="abstract", type="string"),
     *                 @OA\Property(property="keywords", type="string"),
     *                 @OA\Property(property="category_id", type="integer"),
     *                 @OA\Property(property="pdf", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Article submitted"),
     *     @OA\Response(response=403, description="Access denied"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreArticleRequest $request): JsonResponse
    {
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
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Article details"),
     *     @OA\Response(response=403, description="Access denied"),
     *     @OA\Response(response=404, description="Not found")
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
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="abstract", type="string"),
     *             @OA\Property(property="keywords", type="string"),
     *             @OA\Property(property="category_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Article updated"),
     *     @OA\Response(response=403, description="Access denied")
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
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Article deleted"),
     *     @OA\Response(response=403, description="Access denied")
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
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="PDF file"),
     *     @OA\Response(response=403, description="Access denied"),
     *     @OA\Response(response=404, description="No version or file not found")
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
