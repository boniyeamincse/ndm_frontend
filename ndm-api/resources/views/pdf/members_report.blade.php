<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  /* dompdf-safe CSS: no flex, no grid — table-based layout only */
  * { margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10px; color: #1e293b; background: #fff; }

  .hdr-table { width: 100%; border-collapse: collapse; background: #0f2b4c; margin-bottom: 14px; }
  .hdr-left  { padding: 14px 20px; color: #fff; width: 70%; vertical-align: middle; }
  .hdr-right { padding: 14px 20px; color: #cbd5e1; font-size: 9px; text-align: right; vertical-align: middle; }
  .org-name  { font-size: 15px; font-weight: bold; }
  .org-sub   { font-size: 9px; color: #94a3b8; margin-top: 3px; }

  .filter-bar { background: #f8fafc; border: 1px solid #e2e8f0; padding: 7px 14px; margin-bottom: 12px; font-size: 9px; color: #475569; }

  .sum-table    { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  .sum-table td { width: 20%; padding: 8px 6px; text-align: center; background: #f1f5f9; border: 1px solid #e2e8f0; }
  .sum-val { font-size: 17px; font-weight: bold; }
  .sum-lbl { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 2px; }

  .data-table { width: 100%; border-collapse: collapse; font-size: 9px; }
  .data-table thead tr { background: #0f2b4c; color: #fff; }
  .data-table thead th { padding: 7px 7px; text-align: left; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .data-table tbody tr.even { background: #f8fafc; }
  .data-table tbody tr.odd  { background: #ffffff; }
  .data-table tbody td { padding: 5px 7px; border-bottom: 1px solid #f1f5f9; color: #334155; }

  .badge       { display: inline; padding: 1px 6px; font-size: 8px; font-weight: 600; }
  .s-active    { background: #dcfce7; color: #166534; }
  .s-pending   { background: #fef9c3; color: #854d0e; }
  .s-suspended { background: #ffedd5; color: #9a3412; }
  .s-expelled  { background: #fee2e2; color: #991b1b; }

  .footer-table { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; border-collapse: collapse; border-top: 1px solid #e2e8f0; background: #fff; }
  .footer-table td { padding: 5px 20px; font-size: 8px; color: #94a3b8; }
</style>
</head>
<body>

{{-- Header --}}
<table class="hdr-table">
  <tr>
    <td class="hdr-left">
      <div class="org-name">NDM STUDENT WING</div>
      <div class="org-sub">Nationalist Democratic Movement &mdash; Member Report</div>
    </td>
    <td class="hdr-right">
      Generated: {{ $generatedAt }}<br>
      Total Records: {{ $members->count() }}
    </td>
  </tr>
</table>

{{-- Filter bar --}}
<div class="filter-bar">
  @if($filters['status'])  Status: <strong>{{ ucfirst($filters['status']) }}</strong> &nbsp;&nbsp; @endif
  @if($filters['unit_id']) Unit ID: <strong>{{ $filters['unit_id'] }}</strong> &nbsp;&nbsp; @endif
  @if($filters['year'])    Join Year: <strong>{{ $filters['year'] }}</strong> @endif
  @if(!array_filter($filters)) Filters: <strong>All Members</strong> @endif
</div>

{{-- Summary strip --}}
<table class="sum-table">
  <tr>
    <td><div class="sum-val" style="color:#1d4ed8;">{{ $summary['total'] }}</div><div class="sum-lbl">Total</div></td>
    <td><div class="sum-val" style="color:#166534;">{{ $summary['active'] }}</div><div class="sum-lbl">Active</div></td>
    <td><div class="sum-val" style="color:#854d0e;">{{ $summary['pending'] }}</div><div class="sum-lbl">Pending</div></td>
    <td><div class="sum-val" style="color:#9a3412;">{{ $summary['suspended'] }}</div><div class="sum-lbl">Suspended</div></td>
    <td><div class="sum-val" style="color:#991b1b;">{{ $summary['expelled'] }}</div><div class="sum-lbl">Expelled</div></td>
  </tr>
</table>

{{-- Member data table --}}
<table class="data-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Member ID</th>
      <th>Full Name</th>
      <th>Mobile</th>
      <th>Institution</th>
      <th>Department</th>
      <th>Unit</th>
      <th>Gender</th>
      <th>Year</th>
      <th>Status</th>
      <th>Registered</th>
    </tr>
  </thead>
  <tbody>
    @foreach($members as $i => $m)
    @php $rowClass = ($i % 2 === 0) ? 'even' : 'odd'; @endphp
    <tr class="{{ $rowClass }}">
      <td style="color:#94a3b8;">{{ $i + 1 }}</td>
      <td style="font-size:8px;">{{ $m->member_id ?? '—' }}</td>
      <td style="font-weight:600;">{{ $m->full_name }}</td>
      <td>{{ $m->mobile ?? $m->phone ?? '—' }}</td>
      <td>{{ $m->institution ?? '—' }}</td>
      <td>{{ $m->department ?? '—' }}</td>
      <td>{{ $m->organizationalUnit?->name ?? '—' }}</td>
      <td>{{ $m->gender?->value ?? '—' }}</td>
      <td>{{ $m->join_year ?? '—' }}</td>
      <td>
        @php $st = $m->status?->value ?? '' @endphp
        <span class="badge s-{{ $st }}">{{ ucfirst($st ?: '—') }}</span>
      </td>
      <td>{{ $m->created_at?->format('d M Y') ?? '—' }}</td>
    </tr>
    @endforeach
  </tbody>
</table>

{{-- Footer --}}
<table class="footer-table">
  <tr>
    <td>NDM Student Wing &mdash; Confidential</td>
    <td style="text-align:right;">{{ $generatedAt }}</td>
  </tr>
</table>

</body>
</html>
