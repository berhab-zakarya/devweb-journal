<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_public_publications_index_returns_published_articles(): void
    {
        $publicationId = $this->createPublicationFixture('Article Publie', 'publie');

        $this->getJson('/api/v1/publications')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $publicationId,
                'title' => 'Article Publie',
            ]);
    }

    public function test_publications_index_returns_paginated_structure(): void
    {
        $this->createPublicationFixture('Article Page 1', 'publie');

        $this->getJson('/api/v1/publications')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'current_page',
                    'data',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_publication_detail_returns_not_found_for_unpublished_article(): void
    {
        $publicationId = $this->createPublicationFixture('Article Non Publie', 'soumis');

        $this->getJson("/api/v1/publications/{$publicationId}")
            ->assertNotFound();
    }

    public function test_publication_detail_returns_data_for_published_article(): void
    {
        $publicationId = $this->createPublicationFixture('Article Visible', 'publie');

        $this->getJson('/api/v1/publications/' . $publicationId)
            ->assertOk()
            ->assertJsonFragment([
                'id' => $publicationId,
                'title' => 'Article Visible',
                'category_slug' => 'informatique',
            ]);
    }

    public function test_public_publications_index_excludes_unpublished_articles(): void
    {
        $publishedId = $this->createPublicationFixture('Article Publie 2', 'publie');
        $unpublishedId = $this->createPublicationFixture('Article Non Publie 2', 'soumis', categorySlug: 'medecine');

        $this->getJson('/api/v1/publications')
            ->assertOk()
            ->assertJsonFragment(['id' => $publishedId, 'title' => 'Article Publie 2'])
            ->assertJsonMissing(['id' => $unpublishedId]);
    }

    public function test_publications_index_supports_search_category_volume_and_issue_filters(): void
    {
        $this->createPublicationFixture(
            title: 'Reseaux neuronaux explainables',
            articleStatus: 'publie',
            categorySlug: 'intelligence-artificielle',
            volume: '2026',
            issue: '2'
        );

        $otherPublicationId = $this->createPublicationFixture(
            title: 'Systemes distribues resilients',
            articleStatus: 'publie',
            categorySlug: 'systemes-distribues',
            volume: '2025',
            issue: '1'
        );

        $this->getJson('/api/v1/publications?search=explainables&category=intelligence-artificielle&volume=2026&issue=2')
            ->assertOk()
            ->assertJsonFragment(['title' => 'Reseaux neuronaux explainables'])
            ->assertJsonMissing(['id' => $otherPublicationId]);
    }

    public function test_publications_index_is_sorted_by_published_date_descending(): void
    {
        $olderPublicationId = $this->createPublicationFixture(
            title: 'Article ancien',
            articleStatus: 'publie',
            categorySlug: 'archives',
            publishedAt: Carbon::now()->subDays(2)
        );

        $latestPublicationId = $this->createPublicationFixture(
            title: 'Article recent',
            articleStatus: 'publie',
            categorySlug: 'actualites',
            publishedAt: Carbon::now()
        );

        $response = $this->getJson('/api/v1/publications')->assertOk();

        $rows = $response->json('data.data');

        $this->assertNotEmpty($rows);
        $this->assertSame($latestPublicationId, $rows[0]['id']);
        $this->assertContains($olderPublicationId, array_column($rows, 'id'));
    }

    public function test_publication_download_returns_file_when_published_and_file_exists(): void
    {
        $publicationId = $this->createPublicationFixture('Article telechargeable', 'publie');

        $this->get('/api/v1/publications/' . $publicationId . '/download')
            ->assertOk()
            ->assertDownload('test.pdf');
    }

    public function test_publication_download_returns_not_found_for_unpublished_article(): void
    {
        $publicationId = $this->createPublicationFixture('Article non telechargeable', 'soumis');

        $this->get('/api/v1/publications/' . $publicationId . '/download')
            ->assertNotFound();
    }

    public function test_publication_download_returns_not_found_when_file_missing(): void
    {
        $publicationId = $this->createPublicationFixture('Article sans fichier', 'publie', withFile: false);

        $this->get('/api/v1/publications/' . $publicationId . '/download')
            ->assertNotFound();
    }

    private function createPublicationFixture(
        string $title,
        string $articleStatus,
        string $categorySlug = 'informatique',
        string $volume = '2026',
        string $issue = '1',
        bool $withFile = true,
        ?Carbon $publishedAt = null
    ): int
    {
        $author = User::factory()->create();

        $categoryId = DB::table('categories')->where('slug', $categorySlug)->value('id');

        if (!$categoryId) {
            $categoryId = DB::table('categories')->insertGetId([
                'name' => ucwords(str_replace('-', ' ', $categorySlug)),
                'slug' => $categorySlug,
                'description' => 'Categorie test',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        $articleId = DB::table('articles')->insertGetId([
            'author_id' => $author->id,
            'category_id' => $categoryId,
            'title' => $title,
            'abstract' => 'Resume test',
            'keywords' => 'php,laravel',
            'status' => $articleStatus,
            'current_version_id' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'deleted_at' => null,
        ]);

        $versionId = DB::table('article_versions')->insertGetId([
            'article_id' => $articleId,
            'version_number' => 1,
            'pdf_path' => 'private/articles/test.pdf',
            'pdf_original_name' => 'test.pdf',
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
            Storage::disk('local')->put('private/articles/test.pdf', 'pdf-content');
        }

        return DB::table('publications')->insertGetId([
            'article_id' => $articleId,
            'article_version_id' => $versionId,
            'published_at' => $publishedAt ?? Carbon::now(),
            'doi' => null,
            'volume' => $volume,
            'issue' => $issue,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
    }
}
