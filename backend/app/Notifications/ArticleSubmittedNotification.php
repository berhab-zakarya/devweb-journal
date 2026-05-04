<?php

namespace App\Notifications;

use App\Services\NotificationService;

/**
 * Dispatched when an author submits a new manuscript (in-app alert to editors).
 */
final class ArticleSubmittedNotification
{
    public static function notifyEditors(
        NotificationService $notifications,
        int $articleId,
        string $articleTitle,
        ?int $actorId = null
    ): void {
        $notifications->notifyEditorsArticleSubmitted($articleId, $articleTitle, $actorId);
    }
}
