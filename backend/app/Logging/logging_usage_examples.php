<?php
// Example: Add this to a controller or service to log to a specific channel
use Illuminate\Support\Facades\Log;

// Log to the app channel
Log::channel('app')->info('App event occurred', ['user_id' => 123]);

// Log to the auth channel
Log::channel('auth')->warning('Auth warning', ['ip' => request()->ip()]);

// Log to the jobs channel
Log::channel('jobs')->error('Job failed', ['job_id' => 456]);

// Log to multiple channels at once
Log::stack(['app', 'auth'])->info('User login event', ['user_id' => 123]);

// Add context globally (e.g., in middleware)
Log::withContext(['request-id' => (string) \Str::uuid()]);
