<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Committee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'level',
        'parent_id',
        'status',
        'established_date',
        'expiry_date',
    ];

    protected $casts = [
        'established_date' => 'date',
        'expiry_date' => 'date',
    ];

    /**
     * Get the parent committee
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Committee::class, 'parent_id');
    }

    /**
     * Get the child committees
     */
    public function children(): HasMany
    {
        return $this->hasMany(Committee::class, 'parent_id');
    }

    /**
     * Get the roles/members assigned to this committee
     */
    public function roles(): HasMany
    {
        return $this->hasMany(CommitteeRole::class);
    }
}
