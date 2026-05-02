<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Academic Journal API",
 *     version="1.0.0",
 *     description="REST API for the academic journal management system. Handles article submissions, peer reviews, editorial decisions, and publications.",
 *     @OA\Contact(email="admin@journal.local")
 * )
 *
 * @OA\Server(url="/api/v1", description="API v1")
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="apiKey",
 *     in="cookie",
 *     name="laravel_session",
 *     description="Laravel Sanctum stateful cookie authentication. Call /api/v1/auth/login first."
 * )
 *
 * @OA\Tag(name="Auth", description="Authentication endpoints")
 * @OA\Tag(name="Articles", description="Article management")
 * @OA\Tag(name="Article Versions", description="Article version uploads")
 * @OA\Tag(name="Categories", description="Article categories")
 * @OA\Tag(name="Reviews", description="Peer reviews")
 * @OA\Tag(name="Reviewer Assignments", description="Reviewer assignment management")
 * @OA\Tag(name="Editorial Decisions", description="Editor decisions on articles")
 * @OA\Tag(name="Publications", description="Published article listing")
 * @OA\Tag(name="Notifications", description="User notification management")
 * @OA\Tag(name="Dashboard", description="Role-based dashboard stats")
 * @OA\Tag(name="Users", description="User management (admin)")
 */
abstract class Controller
{
    //
}
