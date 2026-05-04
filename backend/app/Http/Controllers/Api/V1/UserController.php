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
     *         @OA\JsonContent(required={"name","email","password","role"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string"),
     *             @OA\Property(property="role", type="string", enum={"admin","editor","reviewer","author","reader"})
     *         )
     *     ),
     *     @OA\Response(response=201, description="User created"),
     *     @OA\Response(response=403, description="Access denied")
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
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="role", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="sort_direction", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Paginated user list"),
     *     @OA\Response(response=403, description="Access denied")
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
     *     summary="Get user details (admin or own profile)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="User details"),
     *     @OA\Response(response=403, description="Access denied")
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
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         @OA\Property(property="name", type="string"),
     *         @OA\Property(property="email", type="string")
     *     )),
     *     @OA\Response(response=200, description="User updated"),
     *     @OA\Response(response=403, description="Access denied")
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
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="User deleted"),
     *     @OA\Response(response=403, description="Access denied")
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
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"role"},
     *             @OA\Property(property="role", type="string", enum={"admin","editor","reviewer","author","reader"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Role assigned"),
     *     @OA\Response(response=403, description="Access denied")
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
