<?php

namespace App\Policies;

use App\Models\EditorialDecision;
use App\Models\User;

class EditorialDecisionPolicy
{
    /**
     * Determine if user can view the decision.
     */
    public function view(User $user, EditorialDecision $decision): bool
    {
        // Admin can view all decisions
        if ($user->hasRole('admin')) {
            return true;
        }

        // Editor can view all decisions
        if ($user->hasRole('editor')) {
            return true;
        }

        // Author can view decision for their own article
        if ($user->hasRole('author')) {
            return $decision->article->author_id === $user->id && $decision->stage === 'finale';
        }

        return false;
    }

    /**
     * Determine if user can make an editorial decision.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('editor');
    }

    /**
     * Determine if user can validate/override a decision (admin only).
     */
    public function validate(User $user): bool
    {
        return $user->hasRole('admin');
    }
}
