<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Automatically audits all write operations (POST, PUT, PATCH, DELETE)
 * performed by authenticated users.
 *
 * Fine-grained logging (with model diff) is done in individual services/controllers.
 * This middleware provides a coarse-grained audit trail as a safety net.
 */
class AuditMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log mutating authenticated requests
        if ($request->user() && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            $statusCode = $response->getStatusCode();

            // Only audit successful mutations (2xx)
            if ($statusCode >= 200 && $statusCode < 300) {
                AuditLog::create([
                    'user_id'      => $request->user()->id,
                    'action'       => strtolower($request->method()) . ':' . $request->path(),
                    'ip_address'   => $request->ip(),
                    'user_agent'   => $request->userAgent(),
                    'performed_at' => now(),
                ]);
            }
        }

        return $response;
    }
}
