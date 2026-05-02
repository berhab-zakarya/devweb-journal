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
