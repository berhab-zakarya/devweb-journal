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

class ArticleVersionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        Storage::fake('local');
    }

    public function test_author_can_list_own_article_versions(): void
    {
        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleFixture($author, 'revision_requise');

        DB::table('article_versions')->insert([
            'article_id' => $fixture['article_id'],
            'version_number' => 2,
            'pdf_path' => 'private/articles/' . $fixture['article_id'] . '/version-2.pdf',
            'pdf_original_name' => 'version-2.pdf',
            'pdf_size' => 1024,
            'change_summary' => 'Deuxieme version',
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($author)
            ->getJson('/api/v1/articles/' . $fixture['article_id'] . '/versions')
            ->assertOk()
            ->assertJsonFragment(['version_number' => 2])
            ->assertJsonFragment(['version_number' => 1]);
    }

    public function test_reader_cannot_list_article_versions(): void
    {
        $author = User::factory()->create();
        $author->assignRole('auteur');

        $reader = User::factory()->create();
        $reader->assignRole('lecteur');

        $fixture = $this->createArticleFixture($author, 'soumis');

        $this->actingAs($reader)
            ->getJson('/api/v1/articles/' . $fixture['article_id'] . '/versions')
            ->assertForbidden();
    }

    public function test_author_cannot_list_other_author_versions(): void
    {
        $authorA = User::factory()->create();
        $authorA->assignRole('auteur');

        $authorB = User::factory()->create();
        $authorB->assignRole('auteur');

        $fixtureB = $this->createArticleFixture($authorB, 'soumis');

        $this->actingAs($authorA)
            ->getJson('/api/v1/articles/' . $fixtureB['article_id'] . '/versions')
            ->assertForbidden();
    }

    public function test_author_resubmission_requires_pdf_file(): void
    {
        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleFixture($author, 'revision_requise');

        $this->actingAs($author)
            ->postJson('/api/v1/articles/' . $fixture['article_id'] . '/versions', [
                'change_summary' => 'Sans fichier',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_author_resubmission_rejects_non_pdf_file(): void
    {
        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleFixture($author, 'revision_requise');

        $this->actingAs($author)
            ->postJson('/api/v1/articles/' . $fixture['article_id'] . '/versions', [
                'pdf' => UploadedFile::fake()->create('not-pdf.txt', 10, 'text/plain'),
                'change_summary' => 'Mauvais format',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_author_resubmission_returns_conflict_for_invalid_status_transition(): void
    {
        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleFixture($author, 'rejete');

        $initialCount = DB::table('article_versions')
            ->where('article_id', $fixture['article_id'])
            ->count();

        $this->actingAs($author)
            ->postJson('/api/v1/articles/' . $fixture['article_id'] . '/versions', [
                'pdf' => UploadedFile::fake()->create('revision.pdf', 200, 'application/pdf'),
                'change_summary' => 'Nouvelle tentative',
            ])
            ->assertStatus(409);

        $this->assertSame(
            $initialCount,
            DB::table('article_versions')->where('article_id', $fixture['article_id'])->count()
        );
    }

    public function test_reader_cannot_download_article_version(): void
    {
        $author = User::factory()->create();
        $author->assignRole('auteur');

        $reader = User::factory()->create();
        $reader->assignRole('lecteur');

        $fixture = $this->createArticleFixture($author, 'soumis');

        $this->actingAs($reader)
            ->get('/api/v1/articles/' . $fixture['article_id'] . '/versions/' . $fixture['version_id'] . '/download')
            ->assertForbidden();
    }

    public function test_author_can_download_own_article_version(): void
    {
        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleFixture($author, 'soumis');

        $this->actingAs($author)
            ->get('/api/v1/articles/' . $fixture['article_id'] . '/versions/' . $fixture['version_id'] . '/download')
            ->assertOk()
            ->assertDownload('version-1.pdf');
    }

    public function test_author_cannot_resubmit_version_for_other_author_article(): void
    {
        $authorA = User::factory()->create();
        $authorA->assignRole('auteur');

        $authorB = User::factory()->create();
        $authorB->assignRole('auteur');

        $fixtureB = $this->createArticleFixture($authorB, 'revision_requise');

        $this->actingAs($authorA)
            ->postJson('/api/v1/articles/' . $fixtureB['article_id'] . '/versions', [
                'pdf' => UploadedFile::fake()->create('revision.pdf', 200, 'application/pdf'),
                'change_summary' => 'Tentative interdite',
            ])
            ->assertForbidden();
    }

    public function test_download_returns_not_found_when_article_version_file_is_missing(): void
    {
        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleFixture($author, 'soumis');

        Storage::disk('local')->delete('private/articles/' . $fixture['article_id'] . '/version-1.pdf');

        $this->actingAs($author)
            ->get('/api/v1/articles/' . $fixture['article_id'] . '/versions/' . $fixture['version_id'] . '/download')
            ->assertNotFound();
    }

    /**
     * @return array{article_id:int,version_id:int,category_id:int}
     */
    private function createArticleFixture(User $author, string $status): array
    {
        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Categorie version ' . $author->id,
            'slug' => 'categorie-version-' . $author->id . '-' . uniqid(),
            'description' => 'Categorie de test',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $articleId = DB::table('articles')->insertGetId([
            'author_id' => $author->id,
            'category_id' => $categoryId,
            'title' => 'Article version ' . uniqid(),
            'abstract' => 'Resume',
            'keywords' => 'test,version',
            'status' => $status,
            'current_version_id' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'deleted_at' => null,
        ]);

        $versionPath = 'private/articles/' . $articleId . '/version-1.pdf';

        $versionId = DB::table('article_versions')->insertGetId([
            'article_id' => $articleId,
            'version_number' => 1,
            'pdf_path' => $versionPath,
            'pdf_original_name' => 'version-1.pdf',
            'pdf_size' => 900,
            'change_summary' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('articles')->where('id', $articleId)->update([
            'current_version_id' => $versionId,
            'updated_at' => Carbon::now(),
        ]);

        Storage::disk('local')->put($versionPath, 'pdf-content');

        return [
            'article_id' => $articleId,
            'version_id' => $versionId,
            'category_id' => $categoryId,
        ];
    }
}
