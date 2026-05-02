<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleVersion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'article_id',
        'version_number',
        'pdf_path',
        'pdf_original_name',
        'pdf_size',
        'change_summary',
        'submitted_at',
    ];

    /**
     * Casts de types natifs.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * Article parent de cette version.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
