<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Services\ArticleStatusService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ArticleVersionController extends Controller
{
    public function __construct(private readonly ArticleStatusService $articleStatusService)
    {
    }

    /**
     * Add a new PDF version to an article (re-submission).
     *
     * @OA\Post(
     *     path="/articles/{article}/versions",
     *     tags={"Article Versions"},
     *     summary="Upload a new PDF version for an article",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true,
     *         @OA\MediaType(mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"pdf"},
     *                 @OA\Property(property="pdf", type="string", format="binary"),
     *                 @OA\Property(property="change_summary", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Version uploaded"),
     *     @OA\Response(response=403, description="Access denied"),
     *     @OA\Response(response=409, description="Status transition error")
     * )
     */
    public function store(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('admin') && $article->author_id !== $user->id) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $validated = $request->validate([
            'pdf' => ['required', 'file', 'mimetypes:application/pdf', 'max:10240'],
            'change_summary' => ['nullable', 'string'],
        ]);

        try {
            $articleAfterUpdate = DB::transaction(function () use ($request, $article, $validated): Article {
                $currentMax = (int) DB::table('article_versions')
                    ->where('article_id', $article->id)
                    ->max('version_number');

                $nextVersionNumber = $currentMax + 1;

                $file = $request->file('pdf');
                $fileName = (string) Str::uuid() . '.pdf';
                $pdfPath = $file->storeAs('private/articles/' . $article->id, $fileName, 'local');

                $versionId = DB::table('article_versions')->insertGetId([
                    'article_id' => $article->id,
                    'version_number' => $nextVersionNumber,
                    'pdf_path' => $pdfPath,
                    'pdf_original_name' => $file->getClientOriginalName(),
                    'pdf_size' => $file->getSize(),
                    'change_summary' => $validated['change_summary'] ?? null,
                    'submitted_at' => Carbon::now(),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);

                $article->update([
                    'current_version_id' => $versionId,
                    'submitted_at' => Carbon::now(),
                ]);

                // A re-submission puts the article back in the review workflow.
                $this->articleStatusService->transition($article, ArticleStatus::UNDER_REVIEW);

                return $article->fresh();
            });
        } catch (DomainException $exception) {
            return response()->json([
                'message' => 'Status transition not allowed for this re-submission.',
                'details' => $exception->getMessage(),
            ], 409);
        }

        return response()->json([
            'message' => 'New version submitted successfully.',
            'data' => [
                'article_id' => $articleAfterUpdate->id,
                'current_version_id' => $articleAfterUpdate->current_version_id,
                'status' => $articleAfterUpdate->status,
            ],
        ], 201);
    }

    /**
     * List the version history of an article.
     *
     * @OA\Get(
     *     path="/articles/{article}/versions",
     *     tags={"Article Versions"},
     *     summary="List all versions of an article",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="List of article versions",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="article_id", type="integer"),
     *                     @OA\Property(property="version_number", type="integer"),
     *                     @OA\Property(property="pdf_original_name", type="string"),
     *                     @OA\Property(property="pdf_size", type="integer"),
     *                     @OA\Property(property="change_summary", type="string", nullable=true),
     *                     @OA\Property(property="submitted_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="Access denied")
     * )
     */
    public function index(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        $isAdminOrEditor = $user->hasAnyRole(['admin', 'editor']);
        $isAuthorOwner = $user->hasRole('author') && $article->author_id === $user->id;

        if (!$isAdminOrEditor && !$isAuthorOwner) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $versions = DB::table('article_versions')
            ->where('article_id', $article->id)
            ->orderByDesc('version_number')
            ->get();

        return response()->json([
            'data' => $versions,
        ]);
    }

    /**
     * Download a specific version of an article.
     *
     * @OA\Get(
     *     path="/articles/{article}/versions/{versionId}/download",
     *     tags={"Article Versions"},
     *     summary="Download a specific PDF version of an article",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="versionId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="PDF file download",
     *         @OA\MediaType(mediaType="application/pdf",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Access denied"),
     *     @OA\Response(response=404, description="Version or file not found")
     * )
     */
    public function download(Request $request, Article $article, int $versionId): BinaryFileResponse|JsonResponse
    {
        $user = $request->user();

        $isAdminOrEditor = $user->hasAnyRole(['admin', 'editor']);
        $isAuthorOwner = $user->hasRole('author') && $article->author_id === $user->id;

        if (!$isAdminOrEditor && !$isAuthorOwner) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $version = DB::table('article_versions')
            ->where('id', $versionId)
            ->where('article_id', $article->id)
            ->first();

        if (!$version || !Storage::disk('local')->exists($version->pdf_path)) {
            return response()->json(['message' => 'Version or file not found.'], 404);
        }

        return response()->download(
            Storage::disk('local')->path($version->pdf_path),
            $version->pdf_original_name,
            ['Content-Type' => 'application/pdf']
        );
    }
}
