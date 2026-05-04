<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Default journal categories (idempotent on `slug`).
     */
    public function run(): void
    {
        $rows = [
            [
                'name' => 'Artificial Intelligence',
                'slug' => 'artificial-intelligence',
                'description' => 'Articles on AI models and applications.',
            ],
            [
                'name' => 'Computer Science',
                'slug' => 'computer-science',
                'description' => 'Algorithms, systems, programming languages, and software engineering.',
            ],
            [
                'name' => 'Information Systems',
                'slug' => 'information-systems',
                'description' => 'Databases, enterprise systems, and information management.',
            ],
            [
                'name' => 'Mathematics',
                'slug' => 'mathematics',
                'description' => 'Pure and applied mathematics.',
            ],
            [
                'name' => 'Physics',
                'slug' => 'physics',
                'description' => 'Theoretical and experimental physics.',
            ],
            [
                'name' => 'Life Sciences',
                'slug' => 'life-sciences',
                'description' => 'Biology, medicine, and related interdisciplinary work.',
            ],
            [
                'name' => 'Social Sciences',
                'slug' => 'social-sciences',
                'description' => 'Economics, sociology, education, and related fields.',
            ],
            [
                'name' => 'Interdisciplinary',
                'slug' => 'interdisciplinary',
                'description' => 'Work spanning multiple domains.',
            ],
        ];

        foreach ($rows as $row) {
            Category::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'name' => $row['name'],
                    'description' => $row['description'],
                ]
            );
        }
    }
}
