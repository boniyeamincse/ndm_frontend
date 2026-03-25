<?php

namespace App\Models;

use App\Enums\MemberStatus;
use App\Enums\Gender;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    protected $fillable = [
        'user_id', 'member_id', 'full_name', 'father_name', 'mother_name',
        'date_of_birth', 'gender', 'nid_or_bc', 'blood_group', 'phone',
        'email', 'present_address', 'permanent_address',
        'institution', 'department', 'session', 'photo_path',
        'status', 'approved_by', 'approved_at', 'join_year',
        'organizational_unit_id',
    ];

    protected $casts = [
        'status'       => MemberStatus::class,
        'gender'       => Gender::class,
        'approved_at'  => 'datetime',
        'date_of_birth'=> 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'organizational_unit_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function positions(): HasMany
    {
        return $this->hasMany(MemberPosition::class)->where('is_active', 1);
    }

    public function allPositions(): HasMany
    {
        return $this->hasMany(MemberPosition::class);
    }

    public function positionHistory(): HasMany
    {
        return $this->hasMany(PositionHistory::class);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path
            ? asset('storage/' . $this->photo_path)
            : null;
    }

    public function deactivateAllPositions(string $remarks = ''): void
    {
        $this->positions()->update(['is_active' => 0, 'relieved_at' => now()]);

        PositionHistory::insert(
            $this->positions()->get()->map(fn($p) => [
                'member_id'    => $this->id,
                'role_id'      => $p->role_id,
                'unit_id'      => $p->unit_id,
                'action'       => 'relieved',
                'performed_by' => auth()->id(),
                'performed_at' => now(),
                'remarks'      => $remarks,
            ])->toArray()
        );
    }
}
