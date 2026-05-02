<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\UserNotification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_user_sees_only_own_notifications(): void
    {
        $user = User::factory()->create();
        $user->assignRole('auteur');

        $other = User::factory()->create();
        $other->assignRole('lecteur');

        UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => 'article',
            'title' => 'Notif user',
            'body' => 'Message user',
            'read_at' => null,
        ]);

        UserNotification::query()->create([
            'user_id' => $other->id,
            'type' => 'article',
            'title' => 'Notif other',
            'body' => 'Message other',
            'read_at' => null,
        ]);

        $this->actingAs($user);

        $this->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonFragment(['title' => 'Notif user'])
            ->assertJsonMissing(['title' => 'Notif other']);
    }

    public function test_notifications_index_requires_authentication(): void
    {
        $this->getJson('/api/v1/notifications')->assertUnauthorized();
    }

    public function test_notifications_index_only_unread_filter_works(): void
    {
        $user = User::factory()->create();
        $user->assignRole('auteur');

        UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => 'article',
            'title' => 'Unread notif',
            'body' => 'Unread body',
            'read_at' => null,
        ]);

        UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => 'article',
            'title' => 'Read notif',
            'body' => 'Read body',
            'read_at' => Carbon::now(),
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/notifications?only_unread=1')
            ->assertOk()
            ->assertJsonFragment(['title' => 'Unread notif'])
            ->assertJsonMissing(['title' => 'Read notif']);
    }

    public function test_user_can_mark_single_notification_as_read(): void
    {
        $user = User::factory()->create();
        $user->assignRole('auteur');

        $notification = UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => 'review',
            'title' => 'A lire',
            'body' => 'Texte',
            'read_at' => null,
        ]);

        $this->actingAs($user);

        $this->patchJson("/api/v1/notifications/{$notification->id}/read")
            ->assertOk();

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_cannot_mark_other_user_notification_as_read(): void
    {
        $user = User::factory()->create();
        $user->assignRole('auteur');

        $other = User::factory()->create();
        $other->assignRole('lecteur');

        $notification = UserNotification::query()->create([
            'user_id' => $other->id,
            'type' => 'review',
            'title' => 'Notif privee',
            'body' => 'Body',
            'read_at' => null,
        ]);

        $this->actingAs($user)
            ->patchJson('/api/v1/notifications/' . $notification->id . '/read')
            ->assertForbidden();

        $this->assertNull($notification->fresh()->read_at);
    }

    public function test_mark_all_read_returns_updated_count_and_updates_unread_count(): void
    {
        $user = User::factory()->create();
        $user->assignRole('auteur');

        UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => 'review',
            'title' => 'N1',
            'body' => 'Body',
            'read_at' => null,
        ]);

        UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => 'review',
            'title' => 'N2',
            'body' => 'Body',
            'read_at' => null,
        ]);

        $this->actingAs($user);

        $this->postJson('/api/v1/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.updated', 2);

        $this->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 0);
    }

    public function test_unread_count_returns_only_current_user_unread_notifications(): void
    {
        $user = User::factory()->create();
        $user->assignRole('auteur');

        $other = User::factory()->create();
        $other->assignRole('lecteur');

        UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => 'article',
            'title' => 'U1',
            'body' => 'Body',
            'read_at' => null,
        ]);

        UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => 'article',
            'title' => 'R1',
            'body' => 'Body',
            'read_at' => Carbon::now(),
        ]);

        UserNotification::query()->create([
            'user_id' => $other->id,
            'type' => 'article',
            'title' => 'Other unread',
            'body' => 'Body',
            'read_at' => null,
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 1);
    }
}
