<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LogRequestId
{
    public function handle(Request $request, Closure $next)
    {
        Log::shareContext([
            'request-id' => (string) Str::uuid(),
        ]);
        return $next($request);
    }
}
