<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * List users: admin only.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * View a user: admin or owner.
     */
    public function view(User $user, User $model): bool
    {
        return $user->hasRole('admin') || $user->id === $model->id;
    }

    /**
     * Update user: admin only.
     */
    public function update(User $user, User $model): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Delete user: admin only, cannot delete self.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->hasRole('admin') && $user->id !== $model->id;
    }

    /**
     * Create a user: admin only.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Assign roles: admin only.
     */
    public function assignRole(User $user): bool
    {
        return $user->hasRole('admin');
    }
}
