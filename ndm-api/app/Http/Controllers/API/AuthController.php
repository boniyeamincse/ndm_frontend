<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\Member;
use App\Models\User;
use App\Services\MemberIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct(private readonly MemberIdService $memberIdService)
    {
    }

    /**
     * Register a new member account.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'email' => $request->string('email')->toString(),
            'password' => Hash::make($request->string('password')->toString()),
            'user_type' => 'member',
            'is_active' => true,
        ]);

        $memberId = $this->memberIdService->generate();

        Member::create([
            'user_id' => $user->id,
            'member_id' => $memberId,
            'full_name' => $request->string('full_name')->toString(),
            'phone' => $request->input('phone'),
            'institution' => $request->input('institution'),
            'department' => $request->input('department'),
            'session' => $request->input('session'),
            'present_address' => $request->input('present_address'),
            'date_of_birth' => $request->input('date_of_birth'),
            'gender' => $request->input('gender'),
            'join_year' => now()->year,
            'status' => 'pending',
            'organizational_unit_id' => $request->input('unit_id'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Awaiting admin approval.',
            'data' => [
                'member_id' => $memberId,
                'status' => 'pending',
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
            JWTAuth::invalidate($token);

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
        return response()->json([
            'success' => true,
            'data' => auth()->user(),
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
