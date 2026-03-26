<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_report_id',
        'media_type',
        'title',
        'file_path',
        'caption',
        'is_public',
        'moderation_status',
        'uploaded_by',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(EventReport::class, 'event_report_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}