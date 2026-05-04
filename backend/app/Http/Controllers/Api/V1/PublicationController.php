<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicationController extends Controller
{
    /**
     * Public list of published articles with filters and search.
     *
     * @OA\Get(
     *     path="/publications",
     *     tags={"Publications"},
     *     summary="List all published articles (public, no auth)",
     *     @OA\Parameter(name="search", in="query", required=false, description="Title, keywords, abstract", @OA\Schema(type="string")),
     *     @OA\Parameter(name="category", in="query", required=false, description="Category slug", @OA\Schema(type="string", example="computer-science")),
     *     @OA\Parameter(name="volume", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="issue", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", minimum=1)),
     *     @OA\Response(
     *         response=200,
     *         description="LengthAwarePaginator JSON nested under `data` (12 per page); rows are joined article/category/publication fields",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="data", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="id", type="integer", description="Publication id"),
     *                         @OA\Property(property="published_at", type="string", format="date-time"),
     *                         @OA\Property(property="doi", type="string", nullable=true, example="10.1234/journal.2026.1"),
     *                         @OA\Property(property="volume", type="string", nullable=true),
     *                         @OA\Property(property="issue", type="string", nullable=true),
     *                         @OA\Property(property="article_id", type="integer"),
     *                         @OA\Property(property="title", type="string"),
     *                         @OA\Property(property="abstract", type="string"),
     *                         @OA\Property(property="keywords", type="string"),
     *                         @OA\Property(property="category_name", type="string"),
     *                         @OA\Property(property="category_slug", type="string")
     *                     )
     *                 ),
     *                 @OA\Property(property="first_page_url", type="string"),
     *                 @OA\Property(property="last_page_url", type="string"),
     *                 @OA\Property(property="links", ref="#/components/schemas/PaginatorLinks"),
     *                 @OA\Property(property="meta", ref="#/components/schemas/PaginatorMeta"),
     *                 @OA\Property(property="next_page_url", type="string", nullable=true),
     *                 @OA\Property(property="path", type="string"),
     *                 @OA\Property(property="per_page", type="integer", example=12),
     *                 @OA\Property(property="prev_page_url", type="string", nullable=true),
     *                 @OA\Property(property="total", type="integer")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Publication::query()
            ->join('articles', 'articles.id', '=', 'publications.article_id')
            ->join('categories', 'categories.id', '=', 'articles.category_id')
            ->join('users as authors', 'authors.id', '=', 'articles.author_id')
            ->select([
                'publications.id',
                'publications.published_at',
                'publications.doi',
                'publications.volume',
                'publications.issue',
                'articles.id as article_id',
                'articles.title',
                'articles.abstract',
                'articles.keywords',
                'categories.name as category_name',
                'categories.slug as category_slug',
                'authors.name as author_name',
            ])
            ->where('articles.status', 'published')
            ->orderByDesc('publications.published_at');

        if ($search = trim((string) $request->query('search', ''))) {
            $escaped = addcslashes($search, '%_\\');
            $like = '%' . $escaped . '%';
            $query->where(function ($inner) use ($like): void {
                $inner
                    ->where('articles.title', 'like', $like)
                    ->orWhere('articles.keywords', 'like', $like)
                    ->orWhere('articles.abstract', 'like', $like)
                    ->orWhere('authors.name', 'like', $like);
            });
        }

        if ($author = trim((string) $request->query('author', ''))) {
            $escaped = addcslashes($author, '%_\\');
            $query->where('authors.name', 'like', '%' . $escaped . '%');
        }

        $year = (int) $request->query('year', 0);
        if ($year > 0) {
            $query->whereYear('publications.published_at', $year);
        }

        if ($category = trim((string) $request->query('category', ''))) {
            $query->where('categories.slug', $category);
        }

        if ($volume = trim((string) $request->query('volume', ''))) {
            $query->where('publications.volume', $volume);
        }

        if ($issue = trim((string) $request->query('issue', ''))) {
            $query->where('publications.issue', $issue);
        }

        return response()->json([
            'data' => $query->paginate(12),
        ]);
    }

    /**
     * Public detail of a publication.
     *
     * @OA\Get(
     *     path="/publications/{publication}",
     *     tags={"Publications"},
     *     summary="Get publication details (public)",
     *     @OA\Parameter(name="publication", in="path", required=true, @OA\Schema(type="integer", example=9)),
     *     @OA\Response(
     *         response=200,
     *         description="Joined publication + article + category + author",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=9),
     *                 @OA\Property(property="published_at", type="string", format="date-time"),
     *                 @OA\Property(property="doi", type="string", nullable=true),
     *                 @OA\Property(property="volume", type="string", nullable=true),
     *                 @OA\Property(property="issue", type="string", nullable=true),
     *                 @OA\Property(property="article_version_id", type="integer"),
     *                 @OA\Property(property="article_id", type="integer"),
     *                 @OA\Property(property="title", type="string"),
     *                 @OA\Property(property="abstract", type="string"),
     *                 @OA\Property(property="keywords", type="string"),
     *                 @OA\Property(property="category_name", type="string"),
     *                 @OA\Property(property="category_slug", type="string"),
     *                 @OA\Property(property="author_name", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="Not published / not found", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function show(Publication $publication): JsonResponse
    {
        $record = Publication::query()
            ->join('articles', 'articles.id', '=', 'publications.article_id')
            ->join('categories', 'categories.id', '=', 'articles.category_id')
            ->join('users as authors', 'authors.id', '=', 'articles.author_id')
            ->where('publications.id', $publication->id)
            ->where('articles.status', 'published')
            ->select([
                'publications.id',
                'publications.published_at',
                'publications.doi',
                'publications.volume',
                'publications.issue',
                'publications.article_version_id',
                'articles.id as article_id',
                'articles.title',
                'articles.abstract',
                'articles.keywords',
                'categories.name as category_name',
                'categories.slug as category_slug',
                'authors.name as author_name',
            ])
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Publication not found.',
            ], 404);
        }

        return response()->json([
            'data' => $record,
        ]);
    }

    /**
     * Public detail resolved by article id (published articles only).
     */
    public function showByArticle(int $article): JsonResponse
    {
        $publication = Publication::query()
            ->where('article_id', $article)
            ->whereHas('article', static fn ($q) => $q->where('status', 'published'))
            ->first();

        if (!$publication) {
            return response()->json([
                'message' => 'Publication not found.',
            ], 404);
        }

        return $this->show($publication);
    }

    /**
     * Public download resolved by article id (published articles only).
     */
    public function downloadByArticle(int $article): BinaryFileResponse|JsonResponse
    {
        $publication = Publication::query()
            ->where('article_id', $article)
            ->whereHas('article', static fn ($q) => $q->where('status', 'published'))
            ->first();

        if (!$publication) {
            return response()->json([
                'message' => 'Publication not found.',
            ], 404);
        }

        return $this->download($publication);
    }

    /**
     * Public download of the published PDF.
     *
     * @OA\Get(
     *     path="/publications/{publication}/download",
     *     tags={"Publications"},
     *     summary="Download the published PDF (public)",
     *     @OA\Parameter(name="publication", in="path", required=true, @OA\Schema(type="integer", example=9)),
     *     @OA\Response(response=200, description="PDF binary stream"),
     *     @OA\Response(response=404, description="Missing publication row or PDF", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function download(Publication $publication): BinaryFileResponse|JsonResponse
    {
        $record = DB::table('publications')
            ->join('articles', 'articles.id', '=', 'publications.article_id')
            ->join('article_versions', 'article_versions.id', '=', 'publications.article_version_id')
            ->where('publications.id', $publication->id)
            ->where('articles.status', 'published')
            ->select([
                'article_versions.pdf_path',
                'article_versions.pdf_original_name',
            ])
            ->first();

        if (!$record || !Storage::disk('local')->exists($record->pdf_path)) {
            return response()->json([
                'message' => 'Published file not found.',
            ], 404);
        }

        return response()->download(
            Storage::disk('local')->path($record->pdf_path),
            $record->pdf_original_name,
            ['Content-Type' => 'application/pdf']
        );
    }

    /**
     * Return distinct volumes/issues available for filtering.
     *
     * @OA\Get(
     *     path="/publications/volumes",
     *     tags={"Publications"},
     *     summary="List available volumes and issues (public)",
     *     @OA\Response(
     *         response=200,
     *         description="Distinct rows ordered by year/volume/issue",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(type="object",
     *                     @OA\Property(property="volume", type="string", nullable=true, example="12"),
     *                     @OA\Property(property="issue", type="string", nullable=true, example="3"),
     *                     @OA\Property(property="year", type="integer", example=2026)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function volumes(): JsonResponse
    {
        $volumes = DB::table('publications')
            ->select([
                'volume',
                'issue',
                DB::raw('YEAR(published_at) as year'),
            ])
            ->whereNotNull('volume')
            ->distinct()
            ->orderByDesc('year')
            ->orderBy('volume')
            ->orderBy('issue')
            ->get();

        return response()->json(['data' => $volumes]);
    }
}
