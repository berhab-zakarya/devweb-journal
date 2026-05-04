<?php

namespace Tests\Feature;

use App\Models\Review;
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
        $reviewer1 = User::query()->where('email', 'relecteur1@journal.local')->first();
        $reviewer2 = User::query()->where('email', 'relecteur2@journal.local')->first();
        $author1 = User::query()->where('email', 'auteur1@journal.local')->first();
        $author2 = User::query()->where('email', 'auteur2@journal.local')->first();
        $author3 = User::query()->where('email', 'auteur3@journal.local')->first();
        $reader = User::query()->where('email', 'lecteur@journal.local')->first();

        $this->assertNotNull($admin);
        $this->assertNotNull($editor);
        $this->assertNotNull($reviewer1);
        $this->assertNotNull($reviewer2);
        $this->assertNotNull($author1);
        $this->assertNotNull($author2);
        $this->assertNotNull($author3);
        $this->assertNotNull($reader);

        $this->assertTrue($admin->hasRole('admin'));
        $this->assertTrue($editor->hasRole('editor'));
        $this->assertTrue($reviewer1->hasRole('reviewer'));
        $this->assertTrue($reviewer2->hasRole('reviewer'));
        $this->assertTrue($author1->hasRole('author'));
        $this->assertTrue($author2->hasRole('author'));
        $this->assertTrue($author3->hasRole('author'));
        $this->assertTrue($reader->hasRole('reader'));

        $this->assertGreaterThanOrEqual(3, \App\Models\Article::query()->count(), 'Expected at least three demo articles.');
        $this->assertGreaterThanOrEqual(
            2,
            Review::query()->whereNotNull('submitted_at')->count(),
            'Expected at least two completed reviews.'
        );
    }
}
