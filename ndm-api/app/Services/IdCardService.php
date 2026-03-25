<?php

namespace App\Services;

use App\Models\Member;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/**
 * Digital Member ID Card Generator.
 * Produces a PDF ID card with embedded QR code for field verification.
 */
class IdCardService
{
    /**
     * Generate a PDF ID card for a member.
     *
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generate(Member $member)
    {
        $member->loadMissing(['user', 'organizationalUnit', 'positions.role']);

        $qrData = json_encode([
            'member_id' => $member->member_id,
            'name'      => $member->full_name,
            'status'    => $member->status->value,
            'verify'    => url('/api/members/' . $member->member_id),
        ]);

        // Generate QR as SVG string for embedding in HTML
        $qrSvg = QrCode::format('svg')
            ->size(120)
            ->errorCorrection('H')
            ->generate($qrData);

        // Base64-encode QR for inline embedding in HTML/PDF
        $qrBase64 = base64_encode($qrSvg);

        $photoUrl = $member->photo_path
            ? Storage::disk('public')->url($member->photo_path)
            : null;

        $activePosition = $member->positions
            ->where('is_active', 1)
            ->sortBy('role.rank_order')
            ->first();

        $pdf = Pdf::loadView('pdf.id_card', [
            'member'          => $member,
            'qrBase64'        => $qrBase64,
            'photoUrl'        => $photoUrl,
            'activePosition'  => $activePosition,
            'generatedAt'     => now()->format('d M Y'),
        ]);

        $pdf->setPaper([0, 0, 255, 153], 'landscape'); // CR80 card size in points

        return $pdf;
    }
}
