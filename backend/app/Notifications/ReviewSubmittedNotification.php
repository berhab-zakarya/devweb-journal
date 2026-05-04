<?php

namespace App\Notifications;

use App\Services\NotificationService;

/**
 * Dispatched when a reviewer submits a review (and when all reviews are complete).
 */
final class ReviewSubmittedNotification
{
    public static function notifyEditorOfReview(
        NotificationService $notifications,
        int $editorId,
        int $articleId,
        string $articleTitle,
        int $assignmentId,
        ?int $actorId = null
    ): void {
        $notifications->notifyEditorReviewSubmitted($editorId, $articleId, $articleTitle, $assignmentId, $actorId);
    }

    public static function notifyEditorAllReviewsComplete(
        NotificationService $notifications,
        int $editorId,
        int $articleId,
        string $articleTitle,
        ?int $actorId = null
    ): void {
        $notifications->notifyEditorAllReviewsSubmitted($editorId, $articleId, $articleTitle, $actorId);
    }
}
