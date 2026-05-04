# Laravel Logging Setup

## 1. Logging Channels (config/logging.php)
- Logs are split into folders: `storage/logs/app/`, `storage/logs/auth/`, `storage/logs/jobs/`.
- Each uses the `daily` driver with 14-day rotation.
- Custom formatter for readable log lines.

## 2. Usage Examples (app/Logging/logging_usage_examples.php)
- Log to a specific channel:
  ```php
  Log::channel('app')->info('App event', ['user_id' => 123]);
  Log::channel('auth')->warning('Auth warning', ['ip' => request()->ip()]);
  Log::channel('jobs')->error('Job failed', ['job_id' => 456]);
  ```
- Log to multiple channels:
  ```php
  Log::stack(['app', 'auth'])->info('User login event', ['user_id' => 123]);
  ```
- Add context globally (in middleware):
  ```php
  Log::withContext(['request-id' => (string) Str::uuid()]);
  ```

## 3. Custom Formatter (app/Logging/CustomizeFormatter.php)
- Formats log lines for clarity.

## 4. Middleware for Request ID (app/Http/Middleware/LogRequestId.php)
- Adds a unique request ID to every log entry for traceability.
- Register this middleware in your HTTP kernel to enable.

## 5. Real-time Log Tailing (optional)
- Install Laravel Pail for real-time log viewing:
  ```sh
  composer require --dev laravel/pail
  php artisan pail
  ```

---

**You can now use advanced, split, and formatted logging in your Laravel project!**
