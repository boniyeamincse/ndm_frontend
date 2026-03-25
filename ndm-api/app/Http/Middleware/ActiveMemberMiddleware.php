<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures only members with status = 'active' can access protected endpoints.
 * Admins bypass this check entirely (they have no member record).
 */
class ActiveMemberMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Admins are exempt
        if ($user && $user->user_type === 'admin') {
            return $next($request);
        }

        if ($user) {
            $member = $user->member;

            if (! $member || $member->status->value !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is not active. Please wait for admin approval.',
                    'status'  => $member?->status->value ?? 'unknown',
                ], 403);
            }
        }

        return $next($request);
    }
}
