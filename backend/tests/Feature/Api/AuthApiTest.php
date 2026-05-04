<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_register_creates_user_and_assigns_reader_role(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Nouveau Lecteur',
            'email' => 'lecteur.test@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'role' => 'reader',
        ])->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'lecteur.test@example.com',
            'name' => 'Nouveau Lecteur',
        ]);

        $user = User::query()->where('email', 'lecteur.test@example.com')->firstOrFail();
        $this->assertTrue($user->hasRole('reader'));
    }

    public function test_register_with_author_role_assigns_author(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Nouvel Auteur',
            'email' => 'auteur.test@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'role' => 'author',
        ])->assertCreated();

        $user = User::query()->where('email', 'auteur.test@example.com')->firstOrFail();
        $this->assertTrue($user->hasRole('author'));
    }

    public function test_register_requires_role(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sans Role',
            'email' => 'sansrole@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['role']);
    }

    public function test_login_returns_user_payload_with_roles(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('Password@123'),
        ]);
        $user->assignRole('author');

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Password@123',
        ])
            ->assertOk()
            ->assertJsonFragment(['email' => $user->email])
            ->assertJsonPath('data.roles.0', 'author');
    }

    public function test_login_with_invalid_credentials_returns_validation_error(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('Password@123'),
        ]);
        $user->assignRole('author');

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'WrongPassword@123',
        ])->assertStatus(422);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();
        $user->assignRole('editor');

        $this->actingAs($user)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $user->id,
                'email' => $user->email,
            ]);
    }

    public function test_logout_endpoint_is_accessible_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        $user->assignRole('reader');

        $this->actingAs($user)
            ->postJson('/api/v1/auth/logout')
            ->assertOk();
    }

    public function test_forgot_password_accepts_valid_email_payload(): void
    {
        $user = User::factory()->create();
        $user->assignRole('reader');

        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ])->assertOk();
    }

    public function test_reset_password_with_invalid_token_returns_validation_error(): void
    {
        $user = User::factory()->create();
        $user->assignRole('reader');

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'NewPassword@123',
            'password_confirmation' => 'NewPassword@123',
        ])->assertStatus(422);
    }

    public function test_auth_endpoints_are_rate_limited_after_five_attempts_per_minute(): void
    {
        $payload = ['email' => 'anyone@example.com'];

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.50'])
                ->postJson('/api/v1/auth/forgot-password', $payload)
                ->assertOk();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.50'])
            ->postJson('/api/v1/auth/forgot-password', $payload)
            ->assertStatus(429);
    }
}
