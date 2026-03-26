<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SystemSettingController extends Controller
{
    /**
     * Display a listing of system settings, grouped.
     */
    public function index(Request $request)
    {
        $query = SystemSetting::query();
        
        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        $settings = $query->orderBy('group')->orderBy('key')->get();

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    /**
     * Update multiple settings at once.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:system_settings,key',
            'settings.*.value' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->settings as $item) {
            $setting = SystemSetting::where('key', $item['key'])->first();
            if ($setting) {
                // Handle different types if needed
                $setting->update(['value' => $item['value']]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully'
        ]);
    }

    /**
     * Get public settings (for frontend initialization).
     */
    public function public()
    {
        $settings = SystemSetting::where('is_public', true)
            ->get(['key', 'value', 'type', 'label'])
            ->keyBy('key')
            ->map(function($item) {
                return $item->value;
            });

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }
}
