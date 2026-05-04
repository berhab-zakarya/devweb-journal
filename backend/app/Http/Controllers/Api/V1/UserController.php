<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignUserRoleRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Create a user and assign their primary role.
     *
     * @OA\Post(
     *     path="/users",
     *     tags={"Users"},
     *     summary="Create a new user and assign a role (admin only)",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"name","email","password","password_confirmation","role"},
     *             @OA\Property(property="name", type="string", maxLength=120, example="Ada Lovelace"),
     *             @OA\Property(property="email", type="string", format="email", example="ada@example.com"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8, example="secret12345"),
     *             @OA\Property(property="password_confirmation", type="string", example="secret12345"),
     *             @OA\Property(property="role", type="string", description="Must exist in `roles.name` (e.g. admin, editor, reviewer, author, reader)", example="reviewer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="UserResource",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="User created successfully."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=44),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="email", type="string"),
     *                 @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true),
     *                 @OA\Property(property="roles", type="array", @OA\Items(type="string"), example={"reviewer"}),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="deleted_at", type="string", format="date-time", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Not admin / policy", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        // Authorization: only admin can create users
        if (!$request->user() || !$request->user()->can('create', User::class)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $validated = $request->validated();

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        $user->syncRoles([$validated['role']]);

        return response()->json([
            'message' => 'User created successfully.',
            'data' => new UserResource($user->fresh('roles:id,name')),
        ], 201);
    }

    /**
     * List users (admin), with simple search filter.
     *
     * @OA\Get(
     *     path="/users",
     *     tags={"Users"},
     *     summary="List all users with optional search/filter (admin only)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, description="Substring match on name or email", @OA\Schema(type="string")),
     *     @OA\Parameter(name="role", in="query", required=false, description="Exact Spatie role name", @OA\Schema(type="string", example="reviewer")),
     *     @OA\Parameter(name="sort_by", in="query", required=false, description="One of id, name, email, created_at", @OA\Schema(type="string", example="created_at")),
     *     @OA\Parameter(name="sort_direction", in="query", required=false, description="asc or desc (default desc)", @OA\Schema(type="string", enum={"asc","desc"})),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", minimum=1)),
     *     @OA\Response(
     *         response=200,
     *         description="Paginated UserResource inside `data` (see Article index pattern)",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="data", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="name", type="string"),
     *                         @OA\Property(property="email", type="string"),
     *                         @OA\Property(property="roles", type="array", @OA\Items(type="string"))
     *                     )
     *                 ),
     *                 @OA\Property(property="links", ref="#/components/schemas/PaginatorLinks"),
     *                 @OA\Property(property="meta", ref="#/components/schemas/PaginatorMeta")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Not admin", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        // Authorization: only admin can list users
        if (!$request->user() || !$request->user()->can('viewAny', User::class)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $query = User::query()
            ->with('roles:id,name');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($inner) use ($search): void {
                $inner
                    ->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        $role = trim((string) $request->query('role', ''));
        if ($role !== '') {
            $query->whereHas('roles', function ($rolesQuery) use ($role): void {
                $rolesQuery->where('name', $role);
            });
        }

        $sortBy = (string) $request->query('sort_by', 'id');
        $sortDirection = strtolower((string) $request->query('sort_direction', 'desc'));
        $sortDirection = $sortDirection === 'asc' ? 'asc' : 'desc';

        $allowedSortColumns = ['id', 'name', 'email', 'created_at'];
        if (! in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'id';
        }

        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(20);

        return response()->json([
            'data' => UserResource::collection($users),
        ]);
    }

    /**
     * Show user details.
     *
     * @OA\Get(
     *     path="/users/{user}",
     *     tags={"Users"},
     *     summary="Get user details (admin or same user)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer", example=44)),
     *     @OA\Response(
     *         response=200,
     *         description="UserResource",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot view user", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=404, description="Unknown user id"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function show(User $user): JsonResponse
    {
        // Authorization: admin or owner
        if (!auth()->user() || !auth()->user()->can('view', $user)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        return response()->json([
            'data' => new UserResource($user->load('roles:id,name')),
        ]);
    }

    /**
     * Update basic user information.
     *
     * @OA\Put(
     *     path="/users/{user}",
     *     tags={"Users"},
     *     summary="Update user information (admin or own profile)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer", example=44)),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", maxLength=120),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8),
     *             @OA\Property(property="password_confirmation", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="UserResource",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="User updated successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Cannot update user", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        // Authorization: admin or owner
        if (!auth()->user() || !auth()->user()->can('update', $user)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $validated = $request->validated();

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => new UserResource($user->fresh('roles:id,name')),
        ]);
    }

    /**
     * Soft-delete a user.
     *
     * @OA\Delete(
     *     path="/users/{user}",
     *     tags={"Users"},
     *     summary="Soft-delete a user (admin only)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer", example=44)),
     *     @OA\Response(response=200, description="Soft-deleted", @OA\JsonContent(@OA\Property(property="message", type="string", example="User deleted successfully."))),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Not allowed", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Authorization: only admin can delete
        if (!$request->user() || !$request->user()->can('delete', $user)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * Assign a primary role to a user.
     *
     * @OA\Post(
     *     path="/users/{user}/assign-role",
     *     tags={"Users"},
     *     summary="Assign a role to a user (admin only)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer", example=44)),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"role"},
     *             @OA\Property(property="role", type="string", description="Must exist in `roles.name`", example="editor")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="UserResource after syncRoles",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Role assigned successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Not admin", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=422, description="Validation failed", @OA\JsonContent(ref="#/components/schemas/ValidationErrorResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function assignRole(AssignUserRoleRequest $request, User $user): JsonResponse
    {
        // Authorization: only admin can assign roles
        if (!$request->user() || !$request->user()->can('assignRole', User::class)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $validated = $request->validated();

        // A single primary role simplifies rights management on the frontend.
        $user->syncRoles([$validated['role']]);

        return response()->json([
            'message' => 'Role assigned successfully.',
            'data' => new UserResource($user->fresh('roles:id,name')),
        ]);
    }
}
