<?php

namespace App\Policies;

use App\Models\Publication;
use App\Models\User;

class PublicationPolicy
{
    /**
     * Determine if user can view the publication.
     */
    public function view(User $user, Publication $publication): bool
    {
        // Everyone can view published articles
        return true;
    }

    /**
     * Determine if user can download the publication.
     */
    public function download(User $user, Publication $publication): bool
    {
        return true;
    }

    /**
     * Determine if user can create a publication.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'editor']);
    }
}
