<?php

namespace Tests\Feature\Api;

use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class UserManagementApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $target = User::factory()->create();
        $target->assignRole('author');

        $this->actingAs($admin);

        $response = $this->getJson('/api/v1/users');

        $response
            ->assertOk()
            ->assertJsonFragment([
                'email' => $target->email,
            ]);
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $author = User::factory()->create();
        $author->assignRole('author');

        $this->actingAs($author);

        $this->getJson('/api/v1/users')->assertForbidden();
    }

    public function test_admin_can_assign_role_to_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $user = User::factory()->create();
        $user->assignRole('reader');

        $this->actingAs($admin);

        $this->postJson("/api/v1/users/{$user->id}/assign-role", [
            'role' => 'editor',
        ])->assertOk();

        $this->assertTrue($user->fresh()->hasRole('editor'));
    }

    public function test_admin_can_create_user_with_role(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->postJson('/api/v1/users', [
                'name' => 'Nouvel Utilisateur',
                'email' => 'nouveau.utilisateur@example.test',
                'password' => 'SecretPass123',
                'password_confirmation' => 'SecretPass123',
                'role' => 'author',
            ])
            ->assertCreated()
            ->assertJsonFragment([
                'email' => 'nouveau.utilisateur@example.test',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'nouveau.utilisateur@example.test',
        ]);

        $created = User::query()->where('email', 'nouveau.utilisateur@example.test')->firstOrFail();
        $this->assertTrue($created->hasRole('author'));
    }

    public function test_admin_cannot_delete_its_own_account(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin);

        $this->deleteJson("/api/v1/users/{$admin->id}")
            ->assertStatus(409);

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }
}
