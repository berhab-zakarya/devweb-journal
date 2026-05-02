<?php

namespace App\Http\Resources;

use DateTimeInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Article
 */
class ArticleResource extends JsonResource
{
    /**
     * Build a user-facing status timeline from related workflow data.
     *
     * @return array<int, array{status:string, changed_at:string, note:string}>
     */
    private function buildStatusHistory(): array
    {
        $history = collect();

        $initialDate = $this->submitted_at ?? $this->created_at;
        if ($initialDate) {
            $history->push([
                'status' => 'soumis',
                'changed_at' => $initialDate,
                'note' => 'Soumission initiale',
            ]);
        }

        if ($this->relationLoaded('versions')) {
            $resubmissions = $this->versions
                ->filter(fn ($version) => (int) ($version->version_number ?? 0) > 1)
                ->sortBy('submitted_at')
                ->map(function ($version): array {
                    $versionNumber = (int) ($version->version_number ?? 0);

                    return [
                        'status' => 'en_revision',
                        'changed_at' => $version->submitted_at,
                        'note' => (string) ($version->change_summary ?: ('Version ' . $versionNumber . ' soumise')),
                    ];
                });

            $history = $history->concat($resubmissions);
        }

        if ($this->relationLoaded('editorialDecisions')) {
            $finalDecisions = $this->editorialDecisions
                ->filter(fn ($decision) => ($decision->stage ?? 'finale') === 'finale')
                ->sortBy('decided_at')
                ->map(function ($decision): array {
                    return [
                        'status' => (string) $decision->decision,
                        'changed_at' => $decision->decided_at,
                        'note' => (string) ($decision->comments ?: 'Decision editoriale finale'),
                    ];
                });

            $history = $history->concat($finalDecisions);
        }

        if ($this->relationLoaded('publication') && $this->publication?->published_at) {
            $history->push([
                'status' => 'publie',
                'changed_at' => $this->publication->published_at,
                'note' => 'Article publie',
            ]);
        }

        $normalizedHistory = $history
            ->filter(fn (array $entry): bool => !empty($entry['status']) && !empty($entry['changed_at']))
            ->map(function (array $entry): array {
                $changedAt = $entry['changed_at'];

                if ($changedAt instanceof DateTimeInterface) {
                    $changedAt = $changedAt->format(DATE_ATOM);
                }

                return [
                    'status' => (string) $entry['status'],
                    'changed_at' => (string) $changedAt,
                    'note' => (string) ($entry['note'] ?? ''),
                ];
            })
            ->sortBy('changed_at')
            ->values();

        if ($normalizedHistory->isEmpty() && $this->status) {
            return [[
                'status' => (string) $this->status,
                'changed_at' => (string) ($this->submitted_at ?? $this->created_at ?? $this->updated_at),
                'note' => 'Statut actuel de l article',
            ]];
        }

        $lastStatus = (string) ($normalizedHistory->last()['status'] ?? '');
        if ($this->status && $lastStatus !== (string) $this->status) {
            $normalizedHistory->push([
                'status' => (string) $this->status,
                'changed_at' => (string) ($this->updated_at ?? $this->created_at),
                'note' => 'Statut actuel de l article',
            ]);
        }

        return $normalizedHistory
            ->sortBy('changed_at')
            ->values()
            ->all();
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'author_id' => $this->author_id,
            'category_id' => $this->category_id,
            'title' => $this->title,
            'abstract' => $this->abstract,
            'keywords' => $this->keywords,
            'status' => $this->status,
            'status_history' => $this->buildStatusHistory(),
            'current_version_id' => $this->current_version_id,
            'submitted_at' => $this->submitted_at,
            'is_published' => $this->status === 'publie',
            'published_at' => $this->publication?->published_at,
            'author' => $this->whenLoaded('author'),
            'category' => $this->whenLoaded('category'),
            'publication' => $this->whenLoaded('publication'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
