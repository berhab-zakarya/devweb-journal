<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function authValidationMessages(): array
    {
        return [
            'name.required' => 'The name is required.',
            'name.string' => 'The name is invalid.',
            'name.max' => 'The name must not exceed 120 characters.',
            'email.required' => 'The email is required.',
            'email.email' => 'The email is invalid.',
            'email.max' => 'The email must not exceed 190 characters.',
            'email.unique' => 'This email is already in use.',
            'password.required' => 'The password is required.',
            'password.string' => 'The password is invalid.',
            'password.min' => 'The password must be at least 8 characters.',
            'password.confirmed' => 'The password confirmation does not match.',
            'current_password.required_with' => 'The current password is required.',
            'token.required' => 'The reset token is required.',
        ];
    }

    /**
     * Register a new user.
     *
     * @OA\Post(
     *     path="/auth/register",
     *     tags={"Auth"},
     *     summary="Register a new user account",
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="Jane Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="jane@example.com"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8, example="secret123"),
     *             @OA\Property(property="password_confirmation", type="string", example="secret123")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Account created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], $this->authValidationMessages());

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('reader');

        return response()->json([
            'message' => 'Account created successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ],
        ], 201);
    }

    /**
     * Login via Sanctum (stateful cookie).
     *
     * @OA\Post(
     *     path="/auth/login",
     *     tags={"Auth"},
     *     summary="Login and receive a session cookie",
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Login successful"),
     *     @OA\Response(response=422, description="Invalid credentials")
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], $this->authValidationMessages());

        $user = User::query()->where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        auth()->login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ],
        ]);
    }

    /**
     * Logout the current user.
     *
     * @OA\Post(
     *     path="/auth/logout",
     *     tags={"Auth"},
     *     summary="Logout and invalidate the session",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Logged out successfully")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        auth()->guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get the authenticated user's profile.
     *
     * @OA\Get(
     *     path="/auth/me",
     *     tags={"Auth"},
     *     summary="Get the authenticated user's profile",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="User profile"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ],
        ]);
    }

    /**
     * Update the authenticated user's profile.
     *
     * @OA\Put(
     *     path="/auth/profile",
     *     tags={"Auth"},
     *     summary="Update the authenticated user's profile",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"name","email"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="current_password", type="string"),
     *             @OA\Property(property="password", type="string"),
     *             @OA\Property(property="password_confirmation", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Profile updated"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => [
                'required',
                'email',
                'max:190',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'current_password' => ['nullable', 'string', 'required_with:password'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ], $this->authValidationMessages());

        if (!empty($validated['password'])) {
            if (empty($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The current password is invalid.'],
                ]);
            }
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ],
        ]);
    }

    /**
     * Send a password reset link.
     *
     * @OA\Post(
     *     path="/auth/forgot-password",
     *     tags={"Auth"},
     *     summary="Send a password reset link to the given email",
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"email"},
     *             @OA\Property(property="email", type="string", format="email")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Reset link sent (if account exists)")
     * )
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ], $this->authValidationMessages());

        Password::sendResetLink(['email' => $validated['email']]);

        return response()->json([
            'message' => 'If the account exists, a reset link has been sent.',
        ]);
    }

    /**
     * Reset the user's password.
     *
     * @OA\Post(
     *     path="/auth/reset-password",
     *     tags={"Auth"},
     *     summary="Reset the user's password using a reset token",
     *     @OA\RequestBody(required=true,
     *         @OA\JsonContent(required={"token","email","password","password_confirmation"},
     *             @OA\Property(property="token", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string"),
     *             @OA\Property(property="password_confirmation", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Password reset successfully"),
     *     @OA\Response(response=422, description="Invalid or expired token")
     * )
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], $this->authValidationMessages());

        $status = Password::reset(
            [
                'email' => $validated['email'],
                'password' => $validated['password'],
                'password_confirmation' => $request->input('password_confirmation'),
                'token' => $validated['token'],
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['The reset token is invalid or expired.'],
            ]);
        }

        return response()->json([
            'message' => 'Password reset successfully.',
        ]);
    }
}
