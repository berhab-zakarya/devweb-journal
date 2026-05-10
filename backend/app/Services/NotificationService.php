<?php

namespace App\Services;

use App\Mail\AllReviewsSubmittedMail;
use App\Mail\ArticlePublishedMail;
use App\Mail\DecisionMadeMail;
use App\Mail\ReviewerAssignedMail;
use App\Mail\ReviewSubmittedMail;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Notify every user with the editor role that a new article was submitted.
     */
    public function notifyEditorsArticleSubmitted(
        int $articleId,
        string $articleTitle,
        ?int $actorId = null
    ): void {
        $editorIds = User::query()
            ->role('editor')
            ->pluck('id');

        foreach ($editorIds as $editorId) {
            $this->notify(
                userId: (int) $editorId,
                type: 'article_submitted',
                title: 'New Article Submitted',
                body: sprintf('An author submitted "%s" for editorial handling.', $articleTitle),
                data: [
                    'article_id' => $articleId,
                    'article_title' => $articleTitle,
                ],
                actorId: $actorId,
            );
        }
    }

    public function notifyAuthorCorrectionRequested(
        int $authorId,
        int $articleId,
        string $articleTitle,
        ?int $actorId = null
    ): ?UserNotification {
        $notification = $this->notify(
            userId: $authorId,
            type: 'correction_requested',
            title: 'Corrections requested',
            body: sprintf('The editorial team requested corrections for "%s".', $articleTitle),
            data: [
                'article_id' => $articleId,
                'article_title' => $articleTitle,
            ],
            actorId: $actorId,
        );

        return $notification;
    }

    /**
     * Cree une notification applicative interne.
     */
    public function notify(
        int $userId,
        string $type,
        string $title,
        string $body,
        array $data = [],
        ?int $actorId = null
    ): ?UserNotification {
        if ($actorId !== null && $actorId === $userId) {
            return null;
        }

        return UserNotification::query()->create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'read_at' => null,
        ]);
    }

    public function notifyReviewerAssigned(
        int $reviewerId,
        int $articleId,
        string $articleTitle,
        ?Carbon $dueDate = null,
        ?int $actorId = null
    ): ?UserNotification {
        $deadlineText = $dueDate ? $dueDate->format('d/m/Y H:i') : 'no deadline';

        $notification = $this->notify(
            userId: $reviewerId,
            type: 'reviewer_assigned',
            title: 'New Review Assignment',
            body: sprintf('You have been assigned to article "%s" (due: %s).', $articleTitle, $deadlineText),
            data: [
                'article_id' => $articleId,
                'article_title' => $articleTitle,
                'due_date' => $dueDate?->toIso8601String(),
            ],
            actorId: $actorId,
        );

        $recipient = User::find($reviewerId);
        if ($notification && $recipient) {
            $this->trySendMail(fn () => Mail::to($recipient->email)->queue(
                new ReviewerAssignedMail($articleTitle, $dueDate?->format('d/m/Y H:i'))
            ));
        }

        return $notification;
    }

    public function notifyEditorReviewSubmitted(
        int $editorId,
        int $articleId,
        string $articleTitle,
        int $assignmentId,
        ?int $actorId = null
    ): ?UserNotification {
        $notification = $this->notify(
            userId: $editorId,
            type: 'review_submitted',
            title: 'Review Submitted',
            body: sprintf('A review has been submitted for article "%s".', $articleTitle),
            data: [
                'article_id' => $articleId,
                'article_title' => $articleTitle,
                'assignment_id' => $assignmentId,
            ],
            actorId: $actorId,
        );

        $recipient = User::find($editorId);
        if ($notification && $recipient) {
            $this->trySendMail(fn () => Mail::to($recipient->email)->queue(new ReviewSubmittedMail($articleTitle)));
        }

        return $notification;
    }

    public function notifyEditorAllReviewsSubmitted(
        int $editorId,
        int $articleId,
        string $articleTitle,
        ?int $actorId = null
    ): ?UserNotification {
        $notification = $this->notify(
            userId: $editorId,
            type: 'all_reviews_submitted',
            title: 'All Reviews Submitted',
            body: sprintf('All reviews have been submitted for article "%s".', $articleTitle),
            data: [
                'article_id' => $articleId,
                'article_title' => $articleTitle,
            ],
            actorId: $actorId,
        );

        $recipient = User::find($editorId);
        if ($notification && $recipient) {
            $this->trySendMail(fn () => Mail::to($recipient->email)->queue(new AllReviewsSubmittedMail($articleTitle)));
        }

        return $notification;
    }

    public function notifyAuthorDecisionMade(
        int $authorId,
        int $articleId,
        string $articleTitle,
        string $decision,
        ?int $actorId = null
    ): ?UserNotification {
        $notification = $this->notify(
            userId: $authorId,
            type: 'decision_made',
            title: 'Editorial Decision Available',
            body: sprintf('A final decision (%s) has been made for "%s".', $decision, $articleTitle),
            data: [
                'article_id' => $articleId,
                'article_title' => $articleTitle,
                'decision' => $decision,
            ],
            actorId: $actorId,
        );

        $recipient = User::find($authorId);
        if ($notification && $recipient) {
            $this->trySendMail(fn () => Mail::to($recipient->email)->queue(new DecisionMadeMail($articleTitle, $decision)));
        }

        return $notification;
    }

    public function notifyAuthorArticlePublished(
        int $authorId,
        int $articleId,
        string $articleTitle,
        Carbon $publishedAt,
        ?int $actorId = null
    ): ?UserNotification {
        $notification = $this->notify(
            userId: $authorId,
            type: 'article_published',
            title: 'Article Published',
            body: sprintf('Your article "%s" is now published.', $articleTitle),
            data: [
                'article_id' => $articleId,
                'article_title' => $articleTitle,
                'published_at' => $publishedAt->toIso8601String(),
            ],
            actorId: $actorId,
        );

        $recipient = User::find($authorId);
        if ($notification && $recipient) {
            $this->trySendMail(fn () => Mail::to($recipient->email)->queue(
                new ArticlePublishedMail($articleTitle, $publishedAt->toFormattedDateString())
            ));
        }

        return $notification;
    }

    /**
     * Queue a mail and silently log any transport failure.
     * Email is always secondary to the primary database operation.
     */
    private function trySendMail(callable $send): void
    {
        try {
            $send();
        } catch (\Throwable $e) {
            Log::warning('Mail dispatch skipped due to transport error.', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
