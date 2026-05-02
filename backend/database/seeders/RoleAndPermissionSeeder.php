<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear cached roles and permissions
        app()['cache']->forget('spatie.permission.cache');

        // Define all permissions
        $permissions = [
            // Article management
            'create-article' => 'Create new article',
            'edit-article' => 'Edit article',
            'delete-article' => 'Delete article',
            'view-article' => 'View article details',
            'list-articles' => 'List articles',
            'submit-article' => 'Submit article for review',
            'upload-article-version' => 'Upload article version',

            // Review management
            'create-review' => 'Create review',
            'edit-review' => 'Edit review',
            'view-reviews' => 'View all reviews for article',
            'view-own-review' => 'View own review',
            'save-review-draft' => 'Save review draft',

            // Reviewer assignment
            'assign-reviewer' => 'Assign reviewers to articles',
            'view-assignments' => 'View reviewer assignments',
            'respond-to-assignment' => 'Accept/decline review assignment',
            'search-reviewers' => 'Search available reviewers',

            // Editorial decisions
            'make-decision' => 'Make editorial decision (editor)',
            'validate-decision' => 'Validate/override decisions (admin)',
            'view-decisions' => 'View editorial decisions',

            // Publication management
            'publish-article' => 'Publish accepted article',
            'view-publications' => 'View published articles',

            // User management
            'manage-users' => 'Create/edit/delete users',
            'assign-roles' => 'Assign roles to users',
            'view-users' => 'View user list',

            // Category management
            'manage-categories' => 'Manage article categories',

            // System
            'access-admin-panel' => 'Access admin dashboard',
            'view-notifications' => 'View notifications',
        ];

        // Create permissions
        foreach ($permissions as $permission => $description) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['guard_name' => 'web']
            );
        }

        // Get all permissions
        $allPermissions = Permission::all();

        // Define roles and their permissions
        $roles = [
            'admin' => [
                'create-article',
                'edit-article',
                'delete-article',
                'view-article',
                'list-articles',
                'submit-article',
                'upload-article-version',
                'view-reviews',
                'view-own-review',
                'assign-reviewer',
                'view-assignments',
                'search-reviewers',
                'make-decision',
                'validate-decision',
                'view-decisions',
                'publish-article',
                'view-publications',
                'manage-users',
                'assign-roles',
                'view-users',
                'manage-categories',
                'access-admin-panel',
                'view-notifications',
                'create-review',
                'edit-review',
                'save-review-draft',
                'respond-to-assignment',
            ],
            'editor' => [
                'view-article',
                'list-articles',
                'view-reviews',
                'assign-reviewer',
                'view-assignments',
                'search-reviewers',
                'make-decision',
                'view-decisions',
                'publish-article',
                'view-publications',
                'manage-categories',
                'view-notifications',
            ],
            'reviewer' => [
                'view-article',
                'create-review',
                'edit-review',
                'view-own-review',
                'save-review-draft',
                'respond-to-assignment',
                'view-assignments',
                'view-notifications',
            ],
            'author' => [
                'create-article',
                'edit-article',
                'delete-article',
                'view-article',
                'list-articles',
                'submit-article',
                'upload-article-version',
                'view-decisions',
                'view-publications',
                'view-notifications',
            ],
            'reader' => [
                'view-publications',
                'view-notifications',
            ],
        ];

        // Create roles and assign permissions
        foreach ($roles as $roleNames => $permissionNames) {
            $role = Role::firstOrCreate(
                ['name' => $roleNames],
                ['guard_name' => 'web']
            );

            $permissionsToAssign = Permission::whereIn('name', $permissionNames)->get();
            $role->syncPermissions($permissionsToAssign);
        }
    }
}
