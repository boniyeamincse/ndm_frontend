<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Centralized audit logging for all admin and sensitive actions.
 * Logs: who, what action, what model changed, old vs new values, IP.
 */
class AuditLogService
{
    /**
     * Record an audit event.
     *
     * @param  string       $action      e.g. 'member.approved'
     * @param  object|null  $model       Eloquent model instance affected
     * @param  array        $oldValues   Snapshot before change
     * @param  array        $newValues   Snapshot after change
     * @param  string|null  $notes       Optional human-readable note
     */
    public function log(
        string $action,
        ?object $model = null,
        array $oldValues = [],
        array $newValues = [],
        ?string $notes = null
    ): void {
        AuditLog::create([
            'user_id'      => Auth::id(),
            'action'       => $action,
            'model_type'   => $model ? get_class($model) : null,
            'model_id'     => $model?->getKey(),
            'old_values'   => empty($oldValues) ? null : $oldValues,
            'new_values'   => empty($newValues) ? null : $newValues,
            'ip_address'   => Request::ip(),
            'user_agent'   => Request::userAgent(),
            'notes'        => $notes,
            'performed_at' => now(),
        ]);
    }

    /**
     * Shorthand for model-change logging pattern.
     * Automatically computes only the changed keys.
     */
    public function logChange(string $action, object $model, array $changed): void
    {
        $old = [];
        $new = [];

        foreach ($changed as $key => $newVal) {
            $old[$key] = $model->getOriginal($key);
            $new[$key] = $newVal;
        }

        $this->log($action, $model, $old, $new);
    }
}
