<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MemberTask extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'created_by',
        'parent_task_id',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_task_id');
    }

    public function subTasks(): HasMany
    {
        return $this->hasMany(self::class, 'parent_task_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TaskAssignment::class, 'task_id');
    }

    public function assignedMembers()
    {
        return $this->belongsToMany(Member::class, 'task_assignments', 'task_id', 'member_id')
                    ->withPivot(['status', 'progress_note', 'completed_at'])
                    ->withTimestamps();
    }
}
