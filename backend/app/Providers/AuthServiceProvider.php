<?php

namespace App\Providers;

use App\Models\Article;
use App\Models\EditorialDecision;
use App\Models\Publication;
use App\Models\Review;
use App\Models\ReviewerAssignment;
use App\Models\User;
use App\Policies\ArticlePolicy;
use App\Policies\EditorialDecisionPolicy;
use App\Policies\PublicationPolicy;
use App\Policies\ReviewerAssignmentPolicy;
use App\Policies\ReviewPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Article::class => ArticlePolicy::class,
        Review::class => ReviewPolicy::class,
        ReviewerAssignment::class => ReviewerAssignmentPolicy::class,
        EditorialDecision::class => EditorialDecisionPolicy::class,
        Publication::class => PublicationPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
