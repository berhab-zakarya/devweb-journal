<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Academic Journal API",
 *     version="1.0.0",
 *     description="REST API for the academic journal management system: submissions, peer review, editorial workflow, and publications.\n\n**Authentication:** Protected routes use Laravel Sanctum in **stateful** mode (session cookie `laravel_session`). **`Authorization: Bearer` tokens are not used** by this backend. Obtain CSRF via `GET /sanctum/csrf-cookie`, login with cookies, then send header `X-XSRF-TOKEN` (must match the `XSRF-TOKEN` cookie) on unsafe requests.\n\n**Errors:** Validation → **422** (`message`, `errors`). Unauthenticated → **401** `{\"message\":\"Unauthenticated.\"}`. Forbidden → **403** `{\"message\":\"Access denied.\"}` or role middleware `{\"message\":\"Access denied for this role.\"}`. Auth endpoints may return **429** when throttled.",
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
 *     description="Session cookie issued after successful `POST /auth/login`. Send `X-XSRF-TOKEN` header on POST/PUT/PATCH/DELETE. Cookie-based Sanctum only (no Authorization Bearer in this codebase)."
 * )
 *
 * @OA\Schema(
 *     schema="ValidationErrorResponse",
 *     title="Laravel validation error",
 *     required={"message", "errors"},
 *     @OA\Property(property="message", type="string", example="The given data was invalid."),
 *     @OA\Property(
 *         property="errors",
 *         type="object",
 *         @OA\AdditionalProperties(type="array", @OA\Items(type="string")),
 *         example={"email":["The email field is required."]}
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="MessageResponse",
 *     title="Simple JSON message",
 *     required={"message"},
 *     @OA\Property(property="message", type="string", example="Access denied.")
 * )
 *
 * @OA\Schema(
 *     schema="ConflictResponse",
 *     title="Conflict or workflow error",
 *     required={"message"},
 *     @OA\Property(property="message", type="string", example="Only accepted articles can be published."),
 *     @OA\Property(property="details", type="string", nullable=true, example="Transition rejected.")
 * )
 *
 * @OA\Schema(
 *     schema="PaginatorLinks",
 *     title="Pagination links (Laravel)",
 *     @OA\Property(property="first", type="string", nullable=true, example="http://localhost/api/v1/articles?page=1"),
 *     @OA\Property(property="last", type="string", nullable=true),
 *     @OA\Property(property="prev", type="string", nullable=true),
 *     @OA\Property(property="next", type="string", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="PaginatorMeta",
 *     title="Pagination meta (Laravel)",
 *     @OA\Property(property="current_page", type="integer", example=1),
 *     @OA\Property(property="from", type="integer", nullable=true, example=1),
 *     @OA\Property(property="last_page", type="integer", example=3),
 *     @OA\Property(property="path", type="string", example="http://localhost/api/v1/articles"),
 *     @OA\Property(property="per_page", type="integer", example=10),
 *     @OA\Property(property="to", type="integer", nullable=true, example=10),
 *     @OA\Property(property="total", type="integer", example=25)
 * )
 *
 * @OA\Tag(name="Auth", description="Registration, login (session cookie), password reset")
 * @OA\Tag(name="Articles", description="Article CRUD and downloads")
 * @OA\Tag(name="Article Versions", description="Revision PDF uploads and history")
 * @OA\Tag(name="Categories", description="Categories")
 * @OA\Tag(name="Reviews", description="Peer reviews")
 * @OA\Tag(name="Reviewer Assignments", description="Assign reviewers and responses")
 * @OA\Tag(name="Editorial Decisions", description="Editor decisions")
 * @OA\Tag(name="Publications", description="Public catalogue and publishing workflow")
 * @OA\Tag(name="Notifications", description="In-app notifications")
 * @OA\Tag(name="Dashboard", description="Role dashboard counters")
 * @OA\Tag(name="Users", description="Admin user management")
 */
abstract class Controller
{
    //
}
