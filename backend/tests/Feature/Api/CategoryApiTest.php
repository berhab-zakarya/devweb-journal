<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_categories_index_requires_authentication(): void
    {
        $this->getJson('/api/v1/categories')->assertUnauthorized();
    }

    public function test_authenticated_user_can_list_categories(): void
    {
        $reader = User::factory()->create();
        $reader->assignRole('reader');

        DB::table('categories')->insert([
            [
                'name' => 'Biologie',
                'slug' => 'biologie',
                'description' => 'Bio',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Informatique',
                'slug' => 'informatique',
                'description' => 'Info',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        $this->actingAs($reader)
            ->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonFragment(['slug' => 'biologie'])
            ->assertJsonFragment(['slug' => 'informatique']);
    }

    public function test_non_admin_or_editor_cannot_create_category(): void
    {
        $auteur = User::factory()->create();
        $auteur->assignRole('author');

        $this->actingAs($auteur)
            ->postJson('/api/v1/categories', [
                'name' => 'Physique',
                'slug' => 'physique',
                'description' => 'Desc',
            ])
            ->assertForbidden();
    }

    public function test_editor_can_create_category(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editor');

        $this->actingAs($editor)
            ->postJson('/api/v1/categories', [
                'name' => 'Physique',
                'slug' => 'physique',
                'description' => 'Desc',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('categories', [
            'slug' => 'physique',
            'name' => 'Physique',
        ]);
    }

    public function test_editor_cannot_create_category_with_duplicate_slug(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editor');

        DB::table('categories')->insert([
            'name' => 'Physique 1',
            'slug' => 'physique',
            'description' => 'Desc',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($editor)
            ->postJson('/api/v1/categories', [
                'name' => 'Physique 2',
                'slug' => 'physique',
                'description' => 'Desc',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_admin_can_update_category(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Maths',
            'slug' => 'maths',
            'description' => 'Ancienne description',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($admin)
            ->putJson('/api/v1/categories/' . $categoryId, [
                'name' => 'Mathematiques',
                'slug' => 'mathematiques',
                'description' => 'Nouvelle description',
            ])
            ->assertOk();

        $this->assertDatabaseHas('categories', [
            'id' => $categoryId,
            'slug' => 'mathematiques',
            'name' => 'Mathematiques',
        ]);
    }

    public function test_admin_cannot_update_category_with_existing_slug(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        DB::table('categories')->insert([
            'name' => 'Biologie',
            'slug' => 'biologie',
            'description' => 'Desc',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Maths',
            'slug' => 'maths',
            'description' => 'Desc',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($admin)
            ->putJson('/api/v1/categories/' . $categoryId, [
                'slug' => 'biologie',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_non_admin_or_editor_cannot_update_or_delete_category(): void
    {
        $auteur = User::factory()->create();
        $auteur->assignRole('author');

        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Astronomie',
            'slug' => 'astronomie',
            'description' => 'Desc',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($auteur)
            ->putJson('/api/v1/categories/' . $categoryId, [
                'name' => 'Astronomie appliquee',
            ])
            ->assertForbidden();

        $this->actingAs($auteur)
            ->deleteJson('/api/v1/categories/' . $categoryId)
            ->assertForbidden();
    }

    public function test_editor_can_delete_category(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editor');

        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Chimie',
            'slug' => 'chimie',
            'description' => 'Desc',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($editor)
            ->deleteJson('/api/v1/categories/' . $categoryId)
            ->assertOk();

        $this->assertDatabaseMissing('categories', [
            'id' => $categoryId,
        ]);
    }

    public function test_admin_update_returns_not_found_for_missing_category(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->putJson('/api/v1/categories/999999', [
                'name' => 'Inexistant',
            ])
            ->assertNotFound();
    }
}
