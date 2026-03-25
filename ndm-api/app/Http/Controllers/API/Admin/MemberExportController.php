<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Export member data as PDF or CSV/Excel.
 *
 * Security:
 *  - Admin-only (protected by 'admin' middleware upstream)
 *  - Input validation prevents injection in filenames / query params
 *  - No raw SQL; uses Eloquent with parameterised wheres
 */
class MemberExportController extends Controller
{
    // ── Shared query builder ──────────────────────────────────────────

    private function buildQuery(Request $request)
    {
        $request->validate([
            'status'  => ['nullable', 'in:active,pending,suspended,expelled'],
            'unit_id' => ['nullable', 'integer', 'exists:organizational_units,id'],
            'year'    => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ]);

        return Member::with(['organizationalUnit'])
            ->when($request->status,  fn ($q) => $q->where('status', $request->status))
            ->when($request->unit_id, fn ($q) => $q->where('organizational_unit_id', $request->unit_id))
            ->when($request->year,    fn ($q) => $q->where('join_year', $request->year))
            ->orderBy('full_name');
    }

    private function filters(Request $request): array
    {
        return [
            'status'  => $request->status,
            'unit_id' => $request->unit_id,
            'year'    => $request->year,
        ];
    }

    private function summary($members): array
    {
        $counts = $members->countBy(fn ($m) => $m->status?->value ?? 'unknown');
        return [
            'total'     => $members->count(),
            'active'    => $counts->get('active', 0),
            'pending'   => $counts->get('pending', 0),
            'suspended' => $counts->get('suspended', 0),
            'expelled'  => $counts->get('expelled', 0),
        ];
    }

    // ── PDF ───────────────────────────────────────────────────────────

    public function pdf(Request $request): Response
    {
        $members = $this->buildQuery($request)->get();

        $pdf = Pdf::loadView('pdf.members_report', [
            'members'     => $members,
            'filters'     => $this->filters($request),
            'summary'     => $this->summary($members),
            'generatedAt' => now()->format('d M Y, H:i'),
        ]);

        $pdf->setPaper('a4', 'landscape');

        $filename = 'NDM_Members_Report_' . now()->format('Ymd_Hi') . '.pdf';

        return response($pdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
        ]);
    }

    // ── CSV (Excel-compatible) ────────────────────────────────────────

    public function csv(Request $request): StreamedResponse
    {
        $members  = $this->buildQuery($request)->get();
        $filename = 'NDM_Members_Report_' . now()->format('Ymd_Hi') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
        ];

        $columns = [
            '#', 'Member ID', 'Full Name', 'Email', 'Mobile', 'Phone',
            'Date of Birth', 'Gender', 'Blood Group',
            'Institution', 'Department', 'Session',
            'Organizational Unit', 'Join Year', 'Status',
            'Present Address', 'Approved At', 'Registered At',
        ];

        $callback = function () use ($members, $columns) {
            $out = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($out, "\xEF\xBB\xBF");

            fputcsv($out, $columns);

            foreach ($members as $i => $m) {
                fputcsv($out, [
                    $i + 1,
                    $m->member_id ?? '',
                    $m->full_name,
                    $m->email ?? $m->user?->email ?? '',
                    $m->mobile ?? '',
                    $m->phone ?? '',
                    $m->date_of_birth?->format('Y-m-d') ?? '',
                    $m->gender?->value ?? '',
                    $m->blood_group ?? '',
                    $m->institution ?? '',
                    $m->department ?? '',
                    $m->session ?? '',
                    $m->organizationalUnit?->name ?? '',
                    $m->join_year ?? '',
                    $m->status?->value ?? '',
                    $m->present_address ?? '',
                    $m->approved_at?->format('Y-m-d H:i') ?? '',
                    $m->created_at?->format('Y-m-d H:i') ?? '',
                ]);
            }

            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }
}
