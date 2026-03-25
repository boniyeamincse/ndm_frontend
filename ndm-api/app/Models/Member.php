<?php

namespace App\Models;

use App\Enums\Gender;
use App\Enums\MemberStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'member_id',
        'full_name',
        'father_name',
        'mother_name',
        'date_of_birth',
        'gender',
        'nid_or_bc',
        'blood_group',
        'phone',
        'email',
        'present_address',
        'permanent_address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'institution',
        'department',
        'session',
        'skills',
        'photo_path',
        'nid_doc_path',
        'student_id_doc_path',
        'status',
        'approved_by',
        'approved_at',
        'join_year',
        'organizational_unit_id',
        'mobile',
        'division',
        'district',
        'upazila',
        'union',
        'ward',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'approved_at' => 'datetime',
        'gender' => Gender::class,
        'status' => MemberStatus::class,
        'join_year' => 'integer',
        'nid_or_bc' => 'encrypted',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Granular role assigned by admin (general_member, organizer, admin) */
    public function memberRole(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(\App\Models\MemberRole::class);
    }

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(MemberTask::class, 'task_assignments', 'member_id', 'task_id')
                    ->withPivot(['status', 'progress_note', 'completed_at'])
                    ->withTimestamps();
    }

    public function organizationalUnit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(MemberPosition::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function committeeRoles(): HasMany
    {
        return $this->hasMany(CommitteeRole::class);
    }
}
