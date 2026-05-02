<?php

namespace App\Policies;

use App\Models\ReviewerAssignment;
use App\Models\User;

class ReviewerAssignmentPolicy
{
    /**
     * Determine if user can view the assignment.
     */
    public function view(User $user, ReviewerAssignment $assignment): bool
    {
        // Admin can view all
        if ($user->hasRole('admin')) {
            return true;
        }

        // Editor can view all assignments
        if ($user->hasRole('editor')) {
            return true;
        }

        // Reviewer can view their own assignments
        if ($user->hasRole('reviewer') && $assignment->reviewer_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if user can create (assign) a reviewer.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'editor']);
    }

    /**
     * Determine if user can update the assignment (respond to it).
     */
    public function update(User $user, ReviewerAssignment $assignment): bool
    {
        // Only the assigned reviewer can respond to the assignment
        if ($user->hasRole('reviewer') && $assignment->reviewer_id === $user->id) {
            return $assignment->isPending();
        }

        return false;
    }

    /**
     * Determine if user can delete the assignment.
     */
    public function delete(User $user, ReviewerAssignment $assignment): bool
    {
        return $user->hasAnyRole(['admin', 'editor']);
    }

    /**
     * Determine if user can respond to assignment.
     */
    public function respond(User $user, ReviewerAssignment $assignment): bool
    {
        return $this->update($user, $assignment);
    }
}
