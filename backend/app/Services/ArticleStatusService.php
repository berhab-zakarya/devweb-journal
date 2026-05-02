<?php

namespace App\Services;

use App\Enums\ArticleStatus;
use App\Models\Article;
use DomainException;

class ArticleStatusService
{
    /**
     * Allowed lifecycle transitions.
     *
     * @var array<string, list<string>>
     */
    private array $allowedTransitions = [
        'submitted'         => ['under_review', 'rejected'],
        'under_review'      => ['accepted', 'rejected', 'revision_required'],
        'revision_required' => ['under_review'],
        'accepted'          => ['published'],
        'rejected'          => [],
        'published'         => [],
    ];

    /**
     * Check whether a transition is allowed.
     */
    public function canTransition(string $fromStatus, string $toStatus): bool
    {
        return in_array($toStatus, $this->allowedTransitions[$fromStatus] ?? [], true);
    }

    /**
     * Apply a status transition if it is allowed.
     */
    public function transition(Article $article, ArticleStatus $toStatus): Article
    {
        $fromStatus = (string) $article->status;

        if (!$this->canTransition($fromStatus, $toStatus->value) && $fromStatus !== $toStatus->value) {
            throw new DomainException(
                sprintf('Invalid status transition: %s -> %s', $fromStatus, $toStatus->value)
            );
        }

        $article->update([
            'status' => $toStatus->value,
        ]);

        return $article->fresh();
    }
}
