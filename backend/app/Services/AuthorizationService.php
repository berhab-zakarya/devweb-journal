<?php

namespace App\Services;

use App\Models\Article;
use App\Models\EditorialDecision;
use App\Models\Review;
use App\Models\ReviewerAssignment;
use App\Models\User;

class AuthorizationService
{
    /**
     * Check if user can perform action on article
     */
    public function canViewArticle(User $user, Article $article): bool
    {
        return $user->can('view', $article);
    }

    public function canCreateArticle(User $user): bool
    {
        return $user->can('create', Article::class);
    }

    public function canEditArticle(User $user, Article $article): bool
    {
        return $user->can('update', $article);
    }

    public function canDeleteArticle(User $user, Article $article): bool
    {
        return $user->can('delete', $article);
    }

    public function canDownloadArticle(User $user, Article $article): bool
    {
        return $user->can('download', $article);
    }

    /**
     * Check if user can perform action on reviews
     */
    public function canViewReview(User $user, Review $review): bool
    {
        return $user->can('view', $review);
    }

    public function canCreateReview(User $user): bool
    {
        return $user->can('create', Review::class);
    }

    public function canUpdateReview(User $user, Review $review): bool
    {
        return $user->can('update', $review);
    }

    public function canViewReviewsForArticle(User $user, Article $article): bool
    {
        return $user->hasAnyRole(['admin', 'editor']);
    }

    /**
     * Check if user can perform action on reviewer assignments
     */
    public function canViewAssignment(User $user, ReviewerAssignment $assignment): bool
    {
        return $user->can('view', $assignment);
    }

    public function canCreateAssignment(User $user): bool
    {
        return $user->can('create', ReviewerAssignment::class);
    }

    public function canRespondToAssignment(User $user, ReviewerAssignment $assignment): bool
    {
        return $user->can('respond', $assignment);
    }

    public function canDeleteAssignment(User $user, ReviewerAssignment $assignment): bool
    {
        return $user->can('delete', $assignment);
    }

    /**
     * Check if user can perform action on editorial decisions
     */
    public function canViewDecision(User $user, EditorialDecision $decision): bool
    {
        return $user->can('view', $decision);
    }

    public function canMakeDecision(User $user): bool
    {
        return $user->can('create', EditorialDecision::class);
    }

    public function canValidateDecision(User $user): bool
    {
        return $user->can('validate', EditorialDecision::class);
    }

    /**
     * Check access based on role
     */
    public function isAdmin(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function isEditor(User $user): bool
    {
        return $user->hasRole('editor');
    }

    public function isReviewer(User $user): bool
    {
        return $user->hasRole('reviewer');
    }

    public function isAuthor(User $user): bool
    {
        return $user->hasRole('author');
    }

    public function isReader(User $user): bool
    {
        return $user->hasRole('reader');
    }
}
