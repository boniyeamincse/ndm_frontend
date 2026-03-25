<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberPosition extends Model
{
    public $timestamps = false; // Using custom timestamps assigned_at, relieved_at

    protected $fillable = [
        'member_id', 'role_id', 'unit_id', 'assigned_by', 'assigned_at',
        'relieved_at', 'is_active', 'notes'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'relieved_at' => 'datetime',
        'is_active'   => 'boolean',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'unit_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
