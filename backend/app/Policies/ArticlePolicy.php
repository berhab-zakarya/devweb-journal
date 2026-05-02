<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    /**
     * Determine if user can list articles.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'editor', 'author', 'reviewer']);
    }

    /**
     * Determine if user can view the article.
     */
    public function view(User $user, Article $article): bool
    {
        // Admin can view all
        if ($user->hasRole('admin')) {
            return true;
        }

        // Author can view their own
        if ($user->hasRole('author') && $article->author_id === $user->id) {
            return true;
        }

        // Editor can view all articles
        if ($user->hasRole('editor')) {
            return true;
        }

        // Reviewer can view assigned articles
        if ($user->hasRole('reviewer')) {
            return $article->reviewerAssignments()
                ->where('reviewer_id', $user->id)
                ->exists();
        }

        // Reader can only view published articles
        if ($user->hasRole('reader')) {
            return $article->publication()->exists();
        }

        return false;
    }

    /**
     * Determine if user can create an article.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'author']);
    }

    /**
     * Determine if user can update the article.
     */
    public function update(User $user, Article $article): bool
    {
        // Admin can update all
        if ($user->hasRole('admin')) {
            return true;
        }

        // Author can only update their own unpublished articles
        if ($user->hasRole('author') && $article->author_id === $user->id) {
            return $article->isUnderReview() || $article->isPending();
        }

        return false;
    }

    /**
     * Determine if user can delete the article.
     */
    public function delete(User $user, Article $article): bool
    {
        // Admin can delete all
        if ($user->hasRole('admin')) {
            return true;
        }

        // Author can only delete their own unpublished articles
        if ($user->hasRole('author') && $article->author_id === $user->id) {
            return !$article->isPublished();
        }

        return false;
    }

    /**
     * Determine if user can download the article file.
     */
    public function download(User $user, Article $article): bool
    {
        return $this->view($user, $article);
    }
}
