<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_database_seeder_populates_iam_and_demo_accounts_in_testing(): void
    {
        $this->seed();

        foreach (['admin', 'editor', 'reviewer', 'author', 'reader'] as $roleName) {
            $this->assertNotNull(Role::query()->where('name', $roleName)->first(), "Missing role: {$roleName}");
        }

        $this->assertGreaterThan(0, Permission::query()->count(), 'Permissions were not seeded.');

        $admin = User::query()->where('email', 'admin@journal.local')->first();
        $editor = User::query()->where('email', 'editeur@journal.local')->first();
        $reviewer = User::query()->where('email', 'relecteur@journal.local')->first();
        $author = User::query()->where('email', 'auteur@journal.local')->first();
        $reader = User::query()->where('email', 'lecteur@journal.local')->first();

        $this->assertNotNull($admin);
        $this->assertNotNull($editor);
        $this->assertNotNull($reviewer);
        $this->assertNotNull($author);
        $this->assertNotNull($reader);

        $this->assertTrue($admin->hasRole('admin'));
        $this->assertTrue($editor->hasRole('editor'));
        $this->assertTrue($reviewer->hasRole('reviewer'));
        $this->assertTrue($author->hasRole('author'));
        $this->assertTrue($reader->hasRole('reader'));
    }
}
