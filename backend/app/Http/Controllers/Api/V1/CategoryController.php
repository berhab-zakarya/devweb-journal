<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * List categories.
     *
     * @OA\Get(
     *     path="/categories",
     *     tags={"Categories"},
     *     summary="List all categories",
     *     @OA\Response(response=200, description="List of categories")
     * )
     */
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Create a category.
     *
     * @OA\Post(
     *     path="/categories",
     *     tags={"Categories"},
     *     summary="Create a new category (admin/editor)",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"name","slug"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="slug", type="string"),
     *             @OA\Property(property="description", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Category created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $category = Category::query()->create($validated);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => new CategoryResource($category),
        ], 201);
    }

    /**
     * Update a category.
     *
     * @OA\Put(
     *     path="/categories/{category}",
     *     tags={"Categories"},
     *     summary="Update a category (admin/editor)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="category", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="slug", type="string"),
     *             @OA\Property(property="description", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Category updated")
     * )
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'slug' => ['sometimes', 'required', 'string', 'max:170', 'unique:categories,slug,' . $category->id],
            'description' => ['nullable', 'string'],
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Delete a category.
     *
     * @OA\Delete(
     *     path="/categories/{category}",
     *     tags={"Categories"},
     *     summary="Delete a category (admin/editor)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="category", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Category deleted")
     * )
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }
}
