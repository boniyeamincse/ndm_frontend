<?php

namespace App\Models;

use App\Enums\UnitType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationalUnit extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'type', 'parent_id', 'code', 'description', 'is_active'];

    protected $casts = ['type' => UnitType::class];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(OrganizationalUnit::class, 'parent_id');
    }

    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'organizational_unit_id');
    }

    public function positions(): HasMany
    {
        return $this->hasMany(MemberPosition::class, 'unit_id');
    }
}
