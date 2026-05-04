<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /** @return list<string> */
    public static function readerPermissionNames(): array
    {
        return ['notifications.view'];
    }

    /**
     * Ensure the default `reader` role exists (e.g. after migrate without db:seed).
     */
    public static function ensureReaderRole(): Role
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (self::readerPermissionNames() as $permissionName) {
            Permission::query()->firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        $role = Role::query()->firstOrCreate([
            'name' => 'reader',
            'guard_name' => 'web',
        ]);

        $role->syncPermissions(self::readerPermissionNames());

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return $role;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'users.view',
            'users.manage',
            'categories.view',
            'categories.manage',
            'articles.submit',
            'articles.view.any',
            'articles.view.own',
            'articles.update.own',
            'articles.delete.own',
            'articles.assign.reviewers',
            'reviews.submit',
            'reviews.view',
            'decisions.make',
            'publications.publish',
            'notifications.view',
            'notifications.manage',
        ];

        foreach ($permissions as $permissionName) {
            Permission::query()->firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        $rolesMap = [
            'admin' => $permissions,
            'editor' => [
                'categories.view',
                'categories.manage',
                'articles.view.any',
                'articles.assign.reviewers',
                'reviews.view',
                'decisions.make',
                'publications.publish',
                'notifications.view',
                'notifications.manage',
            ],
            'reviewer' => [
                'articles.view.any',
                'reviews.submit',
                'notifications.view',
            ],
            'author' => [
                'articles.submit',
                'articles.view.own',
                'articles.update.own',
                'articles.delete.own',
                'notifications.view',
            ],
            'reader' => self::readerPermissionNames(),
        ];

        foreach ($rolesMap as $roleName => $rolePermissions) {
            $role = Role::query()->firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);

            $role->syncPermissions($rolePermissions);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
