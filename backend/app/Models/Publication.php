<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Publication extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'article_id',
        'article_version_id',
        'published_at',
        'doi',
        'volume',
        'issue',
    ];

    /**
     * Casts de types natifs.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    /**
     * Article lie a la publication.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * Version publiee de l article.
     */
    public function articleVersion(): BelongsTo
    {
        return $this->belongsTo(ArticleVersion::class);
    }
}
