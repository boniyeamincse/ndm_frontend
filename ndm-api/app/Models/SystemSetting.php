<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key', 
        'value', 
        'type', 
        'group', 
        'label', 
        'description', 
        'is_public'
    ];

    /**
     * Get a setting value by key.
     */
    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;

        $val = $setting->value;
        switch ($setting->type) {
            case 'boolean': return filter_var($val, FILTER_VALIDATE_BOOLEAN);
            case 'integer': return (int)$val;
            case 'json':    return json_decode($val, true);
            default:        return $val;
        }
    }

    /**
     * Set a setting value by key.
     */
    public static function set($key, $value, $type = 'string')
    {
        $val = is_array($value) ? json_encode($value) : (string)$value;
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $val, 'type' => $type]
        );
    }
}
