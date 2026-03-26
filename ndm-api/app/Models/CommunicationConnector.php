<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommunicationConnector extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'channel',
        'provider',
        'credentials',
        'is_active',
        'health_status',
        'fallback_connector_id',
        'last_health_checked_at',
    ];

    protected $casts = [
        'credentials' => 'array',
        'is_active' => 'boolean',
        'last_health_checked_at' => 'datetime',
    ];

    public function fallbackConnector(): BelongsTo
    {
        return $this->belongsTo(self::class, 'fallback_connector_id');
    }

    public function deliveryLogs(): HasMany
    {
        return $this->hasMany(OutreachDeliveryLog::class, 'connector_id');
    }
}