<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\EditorialDecision;
use App\Models\ReviewerAssignment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/dashboard",
     *     tags={"Dashboard"},
     *     summary="Get role-based dashboard statistics",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Dashboard stats"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return response()->json(['data' => $this->adminSummary()]);
        }

        if ($user->hasRole('editor')) {
            return response()->json(['data' => $this->editorSummary($user->id)]);
        }

        if ($user->hasRole('reviewer')) {
            return response()->json(['data' => $this->reviewerSummary($user->id)]);
        }

        if ($user->hasRole('author')) {
            return response()->json(['data' => $this->authorSummary($user->id)]);
        }

        return response()->json(['data' => $this->readerSummary()]);
    }

    private function authorSummary(int $userId): array
    {
        $submitted = Article::query()->where('author_id', $userId)->count();
        $revisionsRequired = Article::query()
            ->where('author_id', $userId)
            ->where('status', ArticleStatus::REVISION_REQUIRED->value)
            ->count();
        $pendingDecision = Article::query()
            ->where('author_id', $userId)
            ->whereIn('status', [ArticleStatus::SUBMITTED->value, ArticleStatus::UNDER_REVIEW->value])
            ->count();
        $decisionsReceived = EditorialDecision::query()
            ->join('articles', 'articles.id', '=', 'editorial_decisions.article_id')
            ->where('articles.author_id', $userId)
            ->where('editorial_decisions.stage', 'finale')
            ->count();
        $published = Article::query()
            ->where('author_id', $userId)
            ->where('status', ArticleStatus::PUBLISHED->value)
            ->count();

        return [
            'role' => 'author',
            'requires_attention' => [
                ['key' => 'revisions_required', 'label' => 'Revisions required', 'count' => $revisionsRequired, 'route' => '/articles'],
            ],
            'pending' => [
                ['key' => 'pending_decision', 'label' => 'Pending submissions', 'count' => $pendingDecision, 'route' => '/articles'],
                ['key' => 'submitted_total', 'label' => 'Total submissions', 'count' => $submitted, 'route' => '/articles'],
            ],
            'completed' => [
                ['key' => 'decisions_received', 'label' => 'Decisions received', 'count' => $decisionsReceived, 'route' => '/articles'],
                ['key' => 'published', 'label' => 'Published articles', 'count' => $published, 'route' => '/journal'],
            ],
        ];
    }

    private function reviewerSummary(int $userId): array
    {
        $pendingResponse = ReviewerAssignment::query()
            ->where('reviewer_id', $userId)
            ->where('status', 'pending')
            ->count();

        $inProgress = ReviewerAssignment::query()
            ->where('reviewer_id', $userId)
            ->where('status', 'accepted')
            ->count();

        $overdue = ReviewerAssignment::query()
            ->where('reviewer_id', $userId)
            ->whereIn('status', ['pending', 'accepted'])
            ->whereNotNull('due_date')
            ->where('due_date', '<', Carbon::now())
            ->count();

        $completed = ReviewerAssignment::query()
            ->where('reviewer_id', $userId)
            ->where('status', 'complete')
            ->count();

        return [
            'role' => 'reviewer',
            'requires_attention' => [
                ['key' => 'pending_response', 'label' => 'Assignments awaiting response', 'count' => $pendingResponse, 'route' => '/articles'],
                ['key' => 'overdue_reviews', 'label' => 'Overdue reviews', 'count' => $overdue, 'route' => '/articles'],
            ],
            'pending' => [
                ['key' => 'in_progress', 'label' => 'Reviews in progress', 'count' => $inProgress, 'route' => '/articles'],
            ],
            'completed' => [
                ['key' => 'completed_reviews', 'label' => 'Completed reviews', 'count' => $completed, 'route' => '/articles'],
            ],
        ];
    }

    private function editorSummary(int $userId): array
    {
        $underReview = Article::query()->where('status', ArticleStatus::UNDER_REVIEW->value)->count();

        $withoutAssignments = Article::query()
            ->where('status', ArticleStatus::UNDER_REVIEW->value)
            ->whereDoesntHave('reviewerAssignments')
            ->count();

        $readyForProposal = Article::query()
            ->where('status', ArticleStatus::UNDER_REVIEW->value)
            ->whereHas('reviewerAssignments', function ($query): void {
                $query->where('status', 'complete');
            })
            ->whereDoesntHave('editorialDecisions', function ($query): void {
                $query->where('stage', 'proposition');
            })
            ->count();

        $proposalsByEditor = EditorialDecision::query()
            ->where('editor_id', $userId)
            ->where('stage', 'proposition')
            ->count();

        $proposalsAwaitingAdmin = $this->countPendingAdminFinalApprovals();

        return [
            'role' => 'editor',
            'requires_attention' => [
                ['key' => 'without_assignments', 'label' => 'Articles without assignments', 'count' => $withoutAssignments, 'route' => '/articles'],
                ['key' => 'ready_for_proposal', 'label' => 'Ready for proposal', 'count' => $readyForProposal, 'route' => '/articles'],
            ],
            'pending' => [
                ['key' => 'under_review', 'label' => 'Articles under review', 'count' => $underReview, 'route' => '/articles'],
                ['key' => 'awaiting_admin', 'label' => 'Proposals awaiting admin', 'count' => $proposalsAwaitingAdmin, 'route' => '/articles'],
            ],
            'completed' => [
                ['key' => 'editor_proposals', 'label' => 'Proposals sent', 'count' => $proposalsByEditor, 'route' => '/articles'],
            ],
        ];
    }

    private function adminSummary(): array
    {
        $pendingFinal = $this->countPendingAdminFinalApprovals();

        $acceptedAwaitingPublication = Article::query()
            ->where('status', ArticleStatus::ACCEPTED->value)
            ->whereDoesntHave('publication')
            ->count();

        $publishedThisMonth = Article::query()
            ->join('publications', 'publications.article_id', '=', 'articles.id')
            ->where('articles.status', ArticleStatus::PUBLISHED->value)
            ->whereBetween('publications.published_at', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth(),
            ])
            ->count();

        $usersTotal = User::query()->count();

        return [
            'role' => 'admin',
            'requires_attention' => [
                ['key' => 'pending_final', 'label' => 'Pending final validations', 'count' => $pendingFinal, 'route' => '/articles'],
                ['key' => 'accepted_to_publish', 'label' => 'Accepted awaiting publication', 'count' => $acceptedAwaitingPublication, 'route' => '/articles'],
            ],
            'pending' => [
                ['key' => 'users_total', 'label' => 'Active users', 'count' => $usersTotal, 'route' => '/admin/users'],
            ],
            'completed' => [
                ['key' => 'published_this_month', 'label' => 'Published this month', 'count' => $publishedThisMonth, 'route' => '/journal'],
            ],
        ];
    }

    private function readerSummary(): array
    {
        return [
            'role' => 'reader',
            'requires_attention' => [],
            'pending' => [
                ['key' => 'discover_publications', 'label' => 'New publications', 'count' => 0, 'route' => '/journal'],
            ],
            'completed' => [],
        ];
    }

    private function countPendingAdminFinalApprovals(): int
    {
        $latestProposals = DB::table('editorial_decisions')
            ->select('article_id', DB::raw('MAX(decided_at) as proposal_at'))
            ->where('stage', 'proposition')
            ->groupBy('article_id');

        $latestFinals = DB::table('editorial_decisions')
            ->select('article_id', DB::raw('MAX(decided_at) as final_at'))
            ->where('stage', 'finale')
            ->groupBy('article_id');

        return DB::table('articles')
            ->joinSub($latestProposals, 'lp', function ($join): void {
                $join->on('lp.article_id', '=', 'articles.id');
            })
            ->leftJoinSub($latestFinals, 'lf', function ($join): void {
                $join->on('lf.article_id', '=', 'articles.id');
            })
            ->where('articles.status', ArticleStatus::UNDER_REVIEW->value)
            ->where(function ($query): void {
                $query->whereNull('lf.final_at')
                    ->orWhereColumn('lf.final_at', '<', 'lp.proposal_at');
            })
            ->count();
    }
}
