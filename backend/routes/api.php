<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ArticleController;
use App\Http\Controllers\Api\V1\ArticlePublicationController;
use App\Http\Controllers\Api\V1\ArticleVersionController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\EditorialDecisionController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PublicationController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\ReviewerAssignmentController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Session\Middleware\StartSession;

Route::prefix('v1')->group(function () {
    Route::get('publications/volumes', [PublicationController::class, 'volumes']);
    Route::get('publications', [PublicationController::class, 'index']);
    Route::get('publications/{publication}', [PublicationController::class, 'show']);
    Route::get('publications/{publication}/download', [PublicationController::class, 'download']);

    Route::prefix('auth')->middleware(StartSession::class)->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
        });
    });

    Route::middleware([StartSession::class, 'auth:sanctum'])->group(function () {
        Route::get('dashboard/summary', [DashboardController::class, 'summary']);

        Route::get('categories', [CategoryController::class, 'index']);

        Route::middleware('role.any:admin,editor')->group(function () {
            Route::post('categories', [CategoryController::class, 'store']);
            Route::put('categories/{category}', [CategoryController::class, 'update']);
            Route::delete('categories/{category}', [CategoryController::class, 'destroy']);
        });

        Route::get('articles', [ArticleController::class, 'index']);
        Route::get('articles/{article}', [ArticleController::class, 'show']);
        Route::get('articles/{article}/download', [ArticleController::class, 'download']);
        Route::get('articles/{article}/versions', [ArticleVersionController::class, 'index']);
        Route::get('articles/{article}/versions/{versionId}/download', [ArticleVersionController::class, 'download']);
        Route::get('articles/{article}/assignments', [ReviewerAssignmentController::class, 'index']);
        Route::get('articles/{article}/reviews', [ReviewController::class, 'indexByArticle'])
            ->middleware('role.any:admin,editor');
        Route::get('articles/{article}/decision', [EditorialDecisionController::class, 'show'])
            ->middleware('role.any:admin,editor,author');

        Route::get('notifications', [NotificationController::class, 'index']);
        Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);

        Route::middleware('role.any:admin')->group(function () {
            Route::post('users', [UserController::class, 'store']);
            Route::get('users', [UserController::class, 'index']);
            Route::get('users/{user}', [UserController::class, 'show']);
            Route::put('users/{user}', [UserController::class, 'update']);
            Route::delete('users/{user}', [UserController::class, 'destroy']);
            Route::post('users/{user}/assign-role', [UserController::class, 'assignRole']);
        });

        Route::middleware('role.any:author,editor,admin')->group(function () {
            Route::post('articles', [ArticleController::class, 'store']);
            Route::put('articles/{article}', [ArticleController::class, 'update']);
            Route::delete('articles/{article}', [ArticleController::class, 'destroy']);
            Route::post('articles/{article}/versions', [ArticleVersionController::class, 'store']);
        });

        Route::middleware('role.any:admin,editor')->group(function () {
            Route::get('articles/{article}/reviewers/search', [ReviewerAssignmentController::class, 'searchReviewers']);
            Route::post('articles/{article}/assignments', [ReviewerAssignmentController::class, 'store']);
            Route::delete('assignments/{assignment}', [ReviewerAssignmentController::class, 'destroy']);
        });

        Route::middleware('role.any:editor')->group(function () {
            Route::post('articles/{article}/decision', [EditorialDecisionController::class, 'store']);
        });

        Route::middleware('role.any:admin,editor')->group(function () {
            Route::post('articles/{article}/publish', [ArticlePublicationController::class, 'store']);
        });

        Route::middleware('role.any:reviewer')->group(function () {
            Route::patch('assignments/{assignment}/respond', [ReviewerAssignmentController::class, 'respond']);
            Route::post('assignments/{assignment}/review', [ReviewController::class, 'store']);
        });

        Route::middleware('role.any:admin,editor,reviewer')->group(function () {
            Route::get('assignments/{assignment}', [ReviewerAssignmentController::class, 'show']);
            Route::get('assignments/{assignment}/review', [ReviewController::class, 'show']);
        });
    });
});
