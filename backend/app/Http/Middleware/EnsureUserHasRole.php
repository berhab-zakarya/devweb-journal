<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Verify that the authenticated user has the given role (single role, e.g. middleware('role:admin')).
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (!$user) {
            return new JsonResponse([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->hasRole($role)) {
            return $next($request);
        }

        return new JsonResponse([
            'message' => 'Access denied for this role.',
        ], 403);
    }
}
