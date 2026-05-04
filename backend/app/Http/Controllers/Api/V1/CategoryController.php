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
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="CategoryResource collection",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Computer Science"),
     *                     @OA\Property(property="slug", type="string", example="computer-science"),
     *                     @OA\Property(property="description", type="string", nullable=true, example="CS topics"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
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
     *             @OA\Property(property="name", type="string", maxLength=150, example="Computer Science"),
     *             @OA\Property(property="slug", type="string", maxLength=170, example="computer-science"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Peer-reviewed CS articles")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="CategoryResource created",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Category created successfully."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=5),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="slug", type="string"),
     *                 @OA\Property(property="description", type="string", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Role not allowed", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=500, description="Server error")
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
     *     @OA\Parameter(name="category", in="path", required=true, @OA\Schema(type="integer", example=5)),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", maxLength=150),
     *             @OA\Property(property="slug", type="string", maxLength=170),
     *             @OA\Property(property="description", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="CategoryResource updated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Category updated successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Role not allowed", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=500, description="Server error")
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
     *     @OA\Parameter(name="category", in="path", required=true, @OA\Schema(type="integer", example=5)),
     *     @OA\Response(response=200, description="Deleted", @OA\JsonContent(@OA\Property(property="message", type="string", example="Category deleted successfully."))),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Role not allowed", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
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
