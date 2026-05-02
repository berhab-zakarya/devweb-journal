<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasAnyRole
{
    /**
     * Verify that the authenticated user has at least one of the allowed roles.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return new JsonResponse([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (empty($roles) || $user->hasAnyRole($roles)) {
            return $next($request);
        }

        return new JsonResponse([
            'message' => 'Access denied for this role.',
        ], 403);
    }
}
