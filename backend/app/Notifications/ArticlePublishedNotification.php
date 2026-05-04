<?php

namespace App\Notifications;

use App\Services\NotificationService;
use Illuminate\Support\Carbon;

/**
 * Dispatched when an accepted article is published in the journal catalogue.
 */
final class ArticlePublishedNotification
{
    public static function notifyAuthor(
        NotificationService $notifications,
        int $authorId,
        int $articleId,
        string $articleTitle,
        Carbon $publishedAt,
        ?int $actorId = null
    ): void {
        $notifications->notifyAuthorArticlePublished($authorId, $articleId, $articleTitle, $publishedAt, $actorId);
    }
}
