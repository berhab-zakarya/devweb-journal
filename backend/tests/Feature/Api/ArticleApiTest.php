<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArticleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        Storage::fake('local');
    }

    public function test_auteur_index_returns_only_own_articles(): void
    {
        $auteurA = User::factory()->create();
        $auteurA->assignRole('author');

        $auteurB = User::factory()->create();
        $auteurB->assignRole('author');

        $this->createArticleFixture($auteurA, 'Article A1');
        $this->createArticleFixture($auteurB, 'Article B1');

        $this->actingAs($auteurA)
            ->getJson('/api/v1/articles')
            ->assertOk()
            ->assertJsonFragment(['title' => 'Article A1'])
            ->assertJsonMissing(['title' => 'Article B1']);
    }

    public function test_articles_index_requires_authentication(): void
    {
        $this->getJson('/api/v1/articles')->assertUnauthorized();
    }

    public function test_reader_articles_index_returns_only_published_with_publication(): void
    {
        $reader = User::factory()->create();
        $reader->assignRole('reader');

        $author = User::factory()->create();
        $author->assignRole('author');

        $this->createArticleFixture($author, 'Reader must not see draft');
        $published = $this->createArticleFixture($author, 'Reader sees published');

        DB::table('articles')->where('id', $published['article_id'])->update([
            'status' => 'published',
        ]);

        DB::table('publications')->insert([
            'article_id' => $published['article_id'],
            'article_version_id' => $published['version_id'],
            'published_at' => Carbon::now(),
            'doi' => '10.0000/test.' . $published['article_id'],
            'volume' => '1',
            'issue' => '1',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($reader)
            ->getJson('/api/v1/articles')
            ->assertOk()
            ->assertJsonFragment(['title' => 'Reader sees published'])
            ->assertJsonMissing(['title' => 'Reader must not see draft']);
    }

    public function test_articles_index_returns_paginated_structure(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $author = User::factory()->create();
        $author->assignRole('author');

        $this->createArticleFixture($author, 'Article pagine A');
        $this->createArticleFixture($author, 'Article pagine B');

        $response = $this->actingAs($admin)
            ->getJson('/api/v1/articles')
            ->assertOk();

        $payload = $response->json('data');
        $this->assertIsArray($payload);

        if (array_key_exists('data', $payload)) {
            $this->assertArrayHasKey('current_page', $payload);
            $this->assertArrayHasKey('per_page', $payload);
            $this->assertArrayHasKey('total', $payload);
            $this->assertIsArray($payload['data']);
            return;
        }

        $this->assertNotEmpty($payload);
        $this->assertArrayHasKey('id', $payload[0]);
    }

    public function test_auteur_can_submit_article_with_pdf(): void
    {
        $author = User::factory()->create();
        $author->assignRole('author');

        $categoryId = $this->createCategory('soumission');

        $response = $this->actingAs($author)
            ->postJson('/api/v1/articles', [
                'category_id' => $categoryId,
                'title' => 'Nouvel article',
                'abstract' => 'Resume de soumission',
                'keywords' => 'science,test',
                'pdf' => UploadedFile::fake()->create('article.pdf', 200, 'application/pdf'),
            ])
            ->assertCreated();

        $articleId = (int) $response->json('data.id');

        $this->assertDatabaseHas('articles', [
            'id' => $articleId,
            'author_id' => $author->id,
            'status' => 'submitted',
        ]);

        $versionPath = DB::table('article_versions')
            ->where('article_id', $articleId)
            ->value('pdf_path');

        $this->assertNotNull($versionPath);
        Storage::disk('local')->assertExists((string) $versionPath);
    }

    public function test_editors_receive_in_app_notification_when_author_submits_article(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editor');

        $author = User::factory()->create();
        $author->assignRole('author');

        $categoryId = $this->createCategory('notify-editors');

        $this->actingAs($author)
            ->postJson('/api/v1/articles', [
                'category_id' => $categoryId,
                'title' => 'Article pour notification',
                'abstract' => 'Resume',
                'keywords' => 'test',
                'pdf' => UploadedFile::fake()->create('article.pdf', 200, 'application/pdf'),
            ])
            ->assertCreated();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $editor->id,
            'type' => 'article_submitted',
        ]);
    }

    public function test_editeur_can_submit_article_with_pdf(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editor');

        $categoryId = $this->createCategory('soumission-editeur');

        $response = $this->actingAs($editor)
            ->postJson('/api/v1/articles', [
                'category_id' => $categoryId,
                'title' => 'Nouvel article editeur',
                'abstract' => 'Resume de soumission editeur',
                'keywords' => 'editeur,test',
                'pdf' => UploadedFile::fake()->create('article-editeur.pdf', 200, 'application/pdf'),
            ])
            ->assertCreated();

        $articleId = (int) $response->json('data.id');

        $this->assertDatabaseHas('articles', [
            'id' => $articleId,
            'author_id' => $editor->id,
            'status' => 'submitted',
        ]);

        $versionPath = DB::table('article_versions')
            ->where('article_id', $articleId)
            ->value('pdf_path');

        $this->assertNotNull($versionPath);
        Storage::disk('local')->assertExists((string) $versionPath);
    }

    public function test_lecteur_cannot_submit_article(): void
    {
        $reader = User::factory()->create();
        $reader->assignRole('reader');

        $categoryId = $this->createCategory('interdit');

        $this->actingAs($reader)
            ->postJson('/api/v1/articles', [
                'category_id' => $categoryId,
                'title' => 'Tentative lecteur',
                'abstract' => 'Resume',
                'keywords' => 'test',
                'pdf' => UploadedFile::fake()->create('article.pdf', 200, 'application/pdf'),
            ])
            ->assertForbidden();
    }

    public function test_article_submission_requires_pdf(): void
    {
        $author = User::factory()->create();
        $author->assignRole('author');

        $categoryId = $this->createCategory('validation');

        $this->actingAs($author)
            ->postJson('/api/v1/articles', [
                'category_id' => $categoryId,
                'title' => 'Sans PDF',
                'abstract' => 'Resume',
                'keywords' => 'test',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_admin_index_returns_all_articles(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $auteurA = User::factory()->create();
        $auteurA->assignRole('author');

        $auteurB = User::factory()->create();
        $auteurB->assignRole('author');

        $this->createArticleFixture($auteurA, 'Article Admin A');
        $this->createArticleFixture($auteurB, 'Article Admin B');

        $this->actingAs($admin)
            ->getJson('/api/v1/articles')
            ->assertOk()
            ->assertJsonFragment(['title' => 'Article Admin A'])
            ->assertJsonFragment(['title' => 'Article Admin B']);
    }

    public function test_auteur_cannot_view_other_author_article_detail(): void
    {
        $auteurA = User::factory()->create();
        $auteurA->assignRole('author');

        $auteurB = User::factory()->create();
        $auteurB->assignRole('author');

        $fixtureB = $this->createArticleFixture($auteurB, 'Article prive B');

        $this->actingAs($auteurA)
            ->getJson('/api/v1/articles/' . $fixtureB['article_id'])
            ->assertForbidden();
    }

    public function test_auteur_can_update_own_article_but_not_other_article(): void
    {
        $auteurA = User::factory()->create();
        $auteurA->assignRole('author');

        $auteurB = User::factory()->create();
        $auteurB->assignRole('author');

        $fixtureA = $this->createArticleFixture($auteurA, 'Ancien titre A');
        $fixtureB = $this->createArticleFixture($auteurB, 'Ancien titre B');

        $this->actingAs($auteurA)
            ->putJson('/api/v1/articles/' . $fixtureA['article_id'], [
                'title' => 'Nouveau titre A',
            ])
            ->assertOk();

        $this->assertDatabaseHas('articles', [
            'id' => $fixtureA['article_id'],
            'title' => 'Nouveau titre A',
        ]);

        $this->actingAs($auteurA)
            ->putJson('/api/v1/articles/' . $fixtureB['article_id'], [
                'title' => 'Tentative interdite',
            ])
            ->assertForbidden();
    }

    public function test_auteur_delete_own_article_soft_deletes_record(): void
    {
        $auteur = User::factory()->create();
        $auteur->assignRole('author');

        $fixture = $this->createArticleFixture($auteur, 'Article a supprimer');

        $this->actingAs($auteur)
            ->deleteJson('/api/v1/articles/' . $fixture['article_id'])
            ->assertOk();

        $this->assertSoftDeleted('articles', [
            'id' => $fixture['article_id'],
        ]);
    }

    public function test_auteur_cannot_download_other_author_article(): void
    {
        $auteurA = User::factory()->create();
        $auteurA->assignRole('author');

        $auteurB = User::factory()->create();
        $auteurB->assignRole('author');

        $fixtureB = $this->createArticleFixture($auteurB, 'Article PDF B', true);

        $this->actingAs($auteurA)
            ->get('/api/v1/articles/' . $fixtureB['article_id'] . '/download')
            ->assertForbidden();
    }

    public function test_auteur_download_returns_not_found_when_file_is_missing(): void
    {
        $auteur = User::factory()->create();
        $auteur->assignRole('author');

        $fixture = $this->createArticleFixture($auteur, 'Article sans fichier', false);

        $this->actingAs($auteur)
            ->get('/api/v1/articles/' . $fixture['article_id'] . '/download')
            ->assertNotFound();
    }

    public function test_article_download_returns_not_found_when_current_version_is_missing(): void
    {
        $author = User::factory()->create();
        $author->assignRole('author');

        $categoryId = $this->createCategory('no-version');

        $articleId = DB::table('articles')->insertGetId([
            'author_id' => $author->id,
            'category_id' => $categoryId,
            'title' => 'Article sans version',
            'abstract' => 'Resume',
            'keywords' => 'test',
            'status' => 'submitted',
            'current_version_id' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'deleted_at' => null,
        ]);

        $this->actingAs($author)
            ->get('/api/v1/articles/' . $articleId . '/download')
            ->assertNotFound();
    }

    private function createCategory(string $suffix): int
    {
        return DB::table('categories')->insertGetId([
            'name' => 'Categorie ' . $suffix,
            'slug' => 'categorie-' . $suffix . '-' . uniqid(),
            'description' => 'Categorie de test',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
    }

    /**
     * @return array{article_id:int,version_id:int,category_id:int,pdf_path:string}
     */
    private function createArticleFixture(User $author, string $title, bool $withFile = true): array
    {
        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Categorie article ' . $author->id,
            'slug' => 'categorie-article-' . $author->id . '-' . uniqid(),
            'description' => 'Categorie de test article',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $articleId = DB::table('articles')->insertGetId([
            'author_id' => $author->id,
            'category_id' => $categoryId,
            'title' => $title,
            'abstract' => 'Resume article test',
            'keywords' => 'test,article',
            'status' => 'submitted',
            'current_version_id' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'deleted_at' => null,
        ]);

        $pdfPath = 'private/articles/' . $articleId . '/version-1.pdf';

        $versionId = DB::table('article_versions')->insertGetId([
            'article_id' => $articleId,
            'version_number' => 1,
            'pdf_path' => $pdfPath,
            'pdf_original_name' => 'version-1.pdf',
            'pdf_size' => 1024,
            'change_summary' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('articles')->where('id', $articleId)->update([
            'current_version_id' => $versionId,
            'updated_at' => Carbon::now(),
        ]);

        if ($withFile) {
            Storage::disk('local')->put($pdfPath, 'fake-pdf-content');
        }

        return [
            'article_id' => $articleId,
            'version_id' => $versionId,
            'category_id' => $categoryId,
            'pdf_path' => $pdfPath,
        ];
    }
}
