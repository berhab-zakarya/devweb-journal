<?php

namespace App\Notifications;

use App\Services\NotificationService;
use Illuminate\Support\Carbon;

/**
 * Dispatched when an editor assigns a reviewer to an article.
 */
final class ReviewerAssignedNotification
{
    public static function notifyReviewer(
        NotificationService $notifications,
        int $reviewerId,
        int $articleId,
        string $articleTitle,
        ?Carbon $dueDate = null,
        ?int $actorId = null
    ): void {
        $notifications->notifyReviewerAssigned($reviewerId, $articleId, $articleTitle, $dueDate, $actorId);
    }
}
