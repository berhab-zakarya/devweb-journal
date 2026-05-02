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
     *     summary="List all published articles (public)",
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="category", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Paginated publications")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Publication::query()
            ->join('articles', 'articles.id', '=', 'publications.article_id')
            ->join('categories', 'categories.id', '=', 'articles.category_id')
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
            ])
            ->where('articles.status', 'published')
            ->orderByDesc('publications.published_at');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($inner) use ($search): void {
                $inner
                    ->where('articles.title', 'like', '%' . $search . '%')
                    ->orWhere('articles.keywords', 'like', '%' . $search . '%')
                    ->orWhere('articles.abstract', 'like', '%' . $search . '%');
            });
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
     *     @OA\Parameter(name="publication", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Publication details"),
     *     @OA\Response(response=404, description="Not found")
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
     * Public download of the published PDF.
     *
     * @OA\Get(
     *     path="/publications/{publication}/download",
     *     tags={"Publications"},
     *     summary="Download the published PDF (public)",
     *     @OA\Parameter(name="publication", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="PDF file"),
     *     @OA\Response(response=404, description="File not found")
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
}
