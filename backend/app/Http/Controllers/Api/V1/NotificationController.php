<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\MarkNotificationReadRequest;
use App\Http\Resources\NotificationResource;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class NotificationController extends Controller
{
    /**
     * List notifications for the authenticated user.
     *
     * @OA\Get(
     *     path="/notifications",
     *     tags={"Notifications"},
     *     summary="List notifications for the authenticated user",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="only_unread", in="query", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", minimum=1)),
     *     @OA\Response(
     *         response=200,
     *         description="Paginated NotificationResource inside nested `data` (20 per page)",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="data", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="id", type="integer", example=900),
     *                         @OA\Property(property="user_id", type="integer"),
     *                         @OA\Property(property="type", type="string", example="review_submitted"),
     *                         @OA\Property(property="title", type="string"),
     *                         @OA\Property(property="body", type="string"),
     *                         @OA\Property(property="data", type="object", nullable=true),
     *                         @OA\Property(property="read_at", type="string", format="date-time", nullable=true),
     *                         @OA\Property(property="created_at", type="string", format="date-time"),
     *                         @OA\Property(property="updated_at", type="string", format="date-time")
     *                     )
     *                 ),
     *                 @OA\Property(property="links", ref="#/components/schemas/PaginatorLinks"),
     *                 @OA\Property(property="meta", ref="#/components/schemas/PaginatorMeta")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at');

        if ($request->boolean('only_unread')) {
            $query->whereNull('read_at');
        }

        $notifications = $query->paginate(20);

        return response()->json([
            'data' => NotificationResource::collection($notifications),
        ]);
    }

    /**
     * Mark a notification as read.
     *
     * @OA\Patch(
     *     path="/notifications/{notification}/read",
     *     tags={"Notifications"},
     *     summary="Mark a notification as read",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="notification", in="path", required=true, @OA\Schema(type="integer", example=900)),
     *     @OA\Response(
     *         response=200,
     *         description="NotificationResource after update",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Notification marked as read."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=403, description="Belongs to another user", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function markRead(MarkNotificationReadRequest $request, UserNotification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        if (!$notification->read_at) {
            $notification->update([
                'read_at' => Carbon::now(),
            ]);
        }

        return response()->json([
            'message' => 'Notification marked as read.',
            'data' => new NotificationResource($notification->fresh()),
        ]);
    }

    /**
     * Mark all unread notifications as read.
     *
     * @OA\Post(
     *     path="/notifications/read-all",
     *     tags={"Notifications"},
     *     summary="Mark all unread notifications as read",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Bulk update count",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="All notifications marked as read."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="updated", type="integer", example=4)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $updatedRows = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
            'data' => [
                'updated' => $updatedRows,
            ],
        ]);
    }

    /**
     * Return the number of unread notifications.
     *
     * @OA\Get(
     *     path="/notifications/unread-count",
     *     tags={"Notifications"},
     *     summary="Get the unread notification count",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Duplicates count under `data` and root for backward compatibility",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="unread_count", type="integer", example=3)
     *             ),
     *             @OA\Property(property="unread_count", type="integer", example=3)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/MessageResponse")),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'data' => [
                'unread_count' => $count,
            ],
            'unread_count' => $count,
        ]);
    }
}
