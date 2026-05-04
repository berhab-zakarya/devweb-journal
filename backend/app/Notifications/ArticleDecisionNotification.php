<?php

namespace App\Notifications;

use App\Services\NotificationService;

/**
 * Dispatched when a final editorial decision is recorded (accepted or rejected).
 */
final class ArticleDecisionNotification
{
    public static function notifyAuthor(
        NotificationService $notifications,
        int $authorId,
        int $articleId,
        string $articleTitle,
        string $decision,
        ?int $actorId = null
    ): void {
        $notifications->notifyAuthorDecisionMade($authorId, $articleId, $articleTitle, $decision, $actorId);
    }
}
