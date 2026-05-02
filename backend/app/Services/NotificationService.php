<?php

namespace App\Services;

use App\Models\UserNotification;
use Illuminate\Support\Carbon;

class NotificationService
{
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

        return $this->notify(
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
    }

    public function notifyEditorReviewSubmitted(
        int $editorId,
        int $articleId,
        string $articleTitle,
        int $assignmentId,
        ?int $actorId = null
    ): ?UserNotification {
        return $this->notify(
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
    }

    public function notifyEditorAllReviewsSubmitted(
        int $editorId,
        int $articleId,
        string $articleTitle,
        ?int $actorId = null
    ): ?UserNotification {
        return $this->notify(
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
    }

    public function notifyAuthorDecisionMade(
        int $authorId,
        int $articleId,
        string $articleTitle,
        string $decision,
        ?int $actorId = null
    ): ?UserNotification {
        return $this->notify(
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
    }

    public function notifyAuthorArticlePublished(
        int $authorId,
        int $articleId,
        string $articleTitle,
        Carbon $publishedAt,
        ?int $actorId = null
    ): ?UserNotification {
        return $this->notify(
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
    }
}
