<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    /**
     * Determine if user can view the review.
     */
    public function view(User $user, Review $review): bool
    {
        // Admin can view all reviews
        if ($user->hasRole('admin')) {
            return true;
        }

        // Editor can view all reviews
        if ($user->hasRole('editor')) {
            return true;
        }

        // Reviewer can view only their own review
        if ($user->hasRole('reviewer') && $review->reviewer_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if user can create a review.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('reviewer');
    }

    /**
     * Determine if user can update a review.
     */
    public function update(User $user, Review $review): bool
    {
        // Reviewer can update their own review before submission
        if ($user->hasRole('reviewer') && $review->reviewer_id === $user->id) {
            return !$review->isSubmitted();
        }

        return false;
    }

    /**
     * Determine if user can save a review draft.
     */
    public function saveDraft(User $user, Review $review): bool
    {
        return $this->update($user, $review);
    }
}
