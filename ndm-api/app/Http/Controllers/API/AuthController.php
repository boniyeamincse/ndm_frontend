<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Services\MemberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct(
        private readonly MemberService $memberService,
    ) {
    }

    /**
     * Register a new member account.
     *
     * All admission logic (User creation, ID generation, file uploads, audit
     * logging, notification) is delegated to MemberService::admit().
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $member = $this->memberService->admit($request);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Awaiting admin approval.',
            'data' => [
                'member_id' => $member->member_id,
                'status'    => $member->status->value,
            ],
        ], 201);
    }

    /**
     * Get a JWT via given credentials.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! $token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid credentials.',
            ], 401);
        }

        $user = auth()->user();
        $member = $user?->member;

        if ($member && ! $member->status->canLogin()) {
            JWTAuth::setToken($token)->invalidate();

            return response()->json([
                'success' => false,
                'error' => 'Account not active: ' . $member->status->label(),
            ], 403);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(): JsonResponse
    {
        $user = auth()->user()?->load([
            'member.organizationalUnit',
            'member.positions.role',
            'member.positions.organizationalUnit',
        ]);

        return response()->json([
            'success' => true,
            'data' => $user ? [
                'id' => $user->id,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'is_active' => $user->is_active,
                'name' => $user->member?->full_name ?? $user->email,
                'member' => $user->member,
            ] : null,
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(): JsonResponse
    {
        $token = JWTAuth::getToken();

        if ($token) {
            JWTAuth::invalidate($token);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'access_token' => JWTAuth::refresh(),
            'token_type' => 'bearer',
        ]);
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken(string $token): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'success' => true,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => $user ? [
                'id' => $user->id,
                'email' => $user->email,
                'user_type' => $user->user_type,
            ] : null,
        ]);
    }
}
