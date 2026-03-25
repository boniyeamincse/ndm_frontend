<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', sans-serif; background: #fff; }

  .card {
    width: 340px; height: 204px;
    background: linear-gradient(135deg, #006A4E 0%, #004d39 60%, #0F1A14 100%);
    border-radius: 10px;
    padding: 12px 14px;
    color: white;
    position: relative;
    overflow: hidden;
  }

  /* Decorative circle */
  .card::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 140px; height: 140px;
    background: rgba(240,192,64,0.15);
    border-radius: 50%;
  }
  .card::after {
    content: '';
    position: absolute;
    bottom: -30px; left: 60px;
    width: 100px; height: 100px;
    background: rgba(220,20,60,0.12);
    border-radius: 50%;
  }

  .header {
    display: flex; align-items: center;
    border-bottom: 1px solid rgba(240,192,64,0.5);
    padding-bottom: 6px; margin-bottom: 8px;
  }
  .org-name {
    font-size: 9px; font-weight: bold; letter-spacing: 1px;
    text-transform: uppercase; color: #F0C040;
  }
  .org-sub { font-size: 7px; color: rgba(255,255,255,0.7); }
  .badge {
    margin-left: auto;
    background: #DC143C; color: white;
    font-size: 6px; padding: 2px 5px;
    border-radius: 3px; font-weight: bold;
    text-transform: uppercase;
  }

  .body { display: flex; gap: 10px; }

  .photo-box {
    width: 60px; height: 70px;
    border: 2px solid #F0C040;
    border-radius: 4px;
    overflow: hidden; flex-shrink: 0;
    background: rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
  }
  .photo-box img { width: 100%; height: 100%; object-fit: cover; }
  .no-photo { font-size: 7px; color: rgba(255,255,255,0.5); text-align: center; }

  .info { flex: 1; }
  .name { font-size: 12px; font-weight: bold; color: #fff; margin-bottom: 2px; }
  .position { font-size: 8px; color: #F0C040; margin-bottom: 4px; font-style: italic; }
  .field { font-size: 7.5px; color: rgba(255,255,255,0.8); margin-bottom: 2px; }
  .field span { color: #fff; font-weight: bold; }

  .footer {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-top: 6px; padding-top: 5px;
    border-top: 1px solid rgba(255,255,255,0.2);
  }
  .member-id-box {
    background: rgba(240,192,64,0.2);
    border: 1px solid #F0C040;
    border-radius: 3px;
    padding: 2px 6px;
  }
  .member-id-label { font-size: 6px; color: #F0C040; text-transform: uppercase; }
  .member-id-val { font-size: 10px; font-weight: bold; color: #F0C040; letter-spacing: 1px; }
  .qr-box { width: 50px; height: 50px; background: white; padding: 2px; border-radius: 3px; }
  .qr-box img { width: 100%; height: 100%; }
  .gen-date { font-size: 6px; color: rgba(255,255,255,0.5); align-self: flex-end; margin-left: 4px; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div>
      <div class="org-name">Nationalist Democratic Movement</div>
      <div class="org-sub">Student Wing — Bangladesh</div>
    </div>
    <div class="badge">Student Member</div>
  </div>

  <div class="body">
    <div class="photo-box">
      @if($photoUrl)
        <img src="{{ $photoUrl }}" alt="Photo">
      @else
        <div class="no-photo">No Photo</div>
      @endif
    </div>

    <div class="info">
      <div class="name">{{ $member->full_name }}</div>
      @if($activePosition)
        <div class="position">{{ $activePosition->role->title ?? '' }}</div>
      @endif
      <div class="field">Institution: <span>{{ $member->institution ?? 'N/A' }}</span></div>
      <div class="field">Blood: <span>{{ $member->blood_group ?? 'N/A' }}</span></div>
      <div class="field">Joined: <span>{{ $member->join_year }}</span></div>
      <div class="field">Unit: <span>{{ $member->organizationalUnit->name ?? 'N/A' }}</span></div>
    </div>
  </div>

  <div class="footer">
    <div>
      <div class="member-id-box">
        <div class="member-id-label">Member ID</div>
        <div class="member-id-val">{{ $member->member_id }}</div>
      </div>
      <div class="gen-date">Issued: {{ $generatedAt }}</div>
    </div>
    <div class="qr-box">
      <img src="data:image/svg+xml;base64,{{ $qrBase64 }}" alt="QR">
    </div>
  </div>
</div>
</body>
</html>
