<?php

namespace App\Notifications;

use App\Services\NotificationService;

/**
 * Dispatched when editors request revisions before acceptance.
 */
final class CorrectionRequestedNotification
{
    public static function notifyAuthor(
        NotificationService $notifications,
        int $authorId,
        int $articleId,
        string $articleTitle,
        ?int $actorId = null
    ): void {
        $notifications->notifyAuthorCorrectionRequested($authorId, $articleId, $articleTitle, $actorId);
    }
}
