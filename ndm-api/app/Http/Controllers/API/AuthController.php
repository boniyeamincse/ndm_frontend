<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\Member;
use App\Models\User;
use App\Services\DocumentUploadService;
use App\Services\MemberIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct(
        private readonly MemberIdService $memberIdService,
        private readonly DocumentUploadService $documentUploadService
    ) {
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

        // Handle File Uploads
        $photoPath = $request->file('photo') 
            ? $this->documentUploadService->upload($request->file('photo'), 'photos', 'profile') 
            : null;
            
        $nidPath = $request->file('nid_doc') 
            ? $this->documentUploadService->upload($request->file('nid_doc'), 'documents', 'nid') 
            : null;
            
        $studentIdPath = $request->file('student_id_doc') 
            ? $this->documentUploadService->upload($request->file('student_id_doc'), 'documents', 'sid') 
            : null;

        Member::create([
            'user_id' => $user->id,
            'member_id' => $memberId,
            'full_name' => $request->string('full_name')->toString(),
            'father_name' => $request->string('father_name')->toString(),
            'mother_name' => $request->string('mother_name')->toString(),
            'date_of_birth' => $request->input('date_of_birth'),
            'gender' => $request->input('gender'),
            'nid_or_bc' => $request->input('nid_or_bc'), // Will be encrypted via Model cast
            'blood_group' => $request->input('blood_group'),
            'phone' => $request->input('phone'),
            'present_address' => $request->input('present_address'),
            'permanent_address' => $request->input('permanent_address'),
            'emergency_contact_name' => $request->input('emergency_contact_name'),
            'emergency_contact_phone' => $request->input('emergency_contact_phone'),
            'institution' => $request->input('institution'),
            'department' => $request->input('department'),
            'session' => $request->input('session'),
            'skills' => $request->input('skills'),
            'photo_path' => $photoPath,
            'nid_doc_path' => $nidPath,
            'student_id_doc_path' => $studentIdPath,
            'join_year' => now()->year,
            'status' => 'pending',
            'organizational_unit_id' => $request->input('organizational_unit_id'),
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
