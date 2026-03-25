<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check() || auth()->user()->user_type !== 'admin') {
            return response()->json([
                'success' => false,
                'error' => 'Forbidden. Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}
