<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrainingCertificate;
use App\Models\TrainingEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TrainingCertificationController extends Controller
{
    public function issue(int $enrollmentId): JsonResponse
    {
        $enrollment = TrainingEnrollment::with('certificate')->findOrFail($enrollmentId);

        if ($enrollment->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Certificate can only be issued for completed enrollments.',
            ], 422);
        }

        $certificate = TrainingCertificate::updateOrCreate(
            ['training_enrollment_id' => $enrollment->id],
            [
                'verification_id' => $enrollment->certificate?->verification_id ?? ('TRN-' . strtoupper(Str::random(10))),
                'certificate_template' => request('certificate_template', 'default'),
                'issued_at' => now(),
                'revoked_at' => null,
                'remarks' => request('remarks'),
            ],
        );

        return response()->json([
            'success' => true,
            'message' => 'Certificate issued successfully.',
            'data' => $certificate,
        ]);
    }

    public function revoke(int $certificateId): JsonResponse
    {
        $certificate = TrainingCertificate::findOrFail($certificateId);
        $certificate->update([
            'revoked_at' => now(),
            'remarks' => request('remarks', $certificate->remarks),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Certificate revoked successfully.',
            'data' => $certificate,
        ]);
    }

    public function verify(string $verificationId): JsonResponse
    {
        $certificate = TrainingCertificate::with(['enrollment.member', 'enrollment.course'])
            ->where('verification_id', $verificationId)
            ->first();

        if (! $certificate) {
            return response()->json(['success' => false, 'message' => 'Invalid certificate ID.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'verification_id' => $certificate->verification_id,
                'issued_at' => $certificate->issued_at?->toDateTimeString(),
                'revoked_at' => $certificate->revoked_at?->toDateTimeString(),
                'member' => [
                    'id' => $certificate->enrollment?->member?->id,
                    'member_id' => $certificate->enrollment?->member?->member_id,
                    'full_name' => $certificate->enrollment?->member?->full_name,
                ],
                'course' => [
                    'id' => $certificate->enrollment?->course?->id,
                    'title' => $certificate->enrollment?->course?->title,
                ],
            ],
        ]);
    }
}