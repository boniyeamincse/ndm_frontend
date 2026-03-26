<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General
            [
                'key' => 'app_name',
                'value' => 'NDM Student Movement',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Application Name',
                'description' => 'The public name of the portal.',
                'is_public' => true,
            ],
            [
                'key' => 'registration_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Member Registration',
                'description' => 'Toggle whether new users can register on the public site.',
                'is_public' => true,
            ],
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Maintenance Mode',
                'description' => 'If enabled, only admins can access the dashboard.',
                'is_public' => true,
            ],
            [
                'key' => 'maintenance_restrict_writes',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Restrict Member Writes',
                'description' => 'Disable data mutation for non-admin users during maintenance.',
                'is_public' => false,
            ],
            [
                'key' => 'maintenance_public_read_only',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Public Read-Only Mode',
                'description' => 'Disable all public interactions while maintaining visibility.',
                'is_public' => true,
            ],
            [
                'key' => 'maintenance_banner_active',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Show Maintenance Banner',
                'description' => 'Display a high-visibility status banner to all users.',
                'is_public' => true,
            ],
            [
                'key' => 'maintenance_admin_override',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Allow Admin Override',
                'description' => 'Permit administrators to bypass maintenance restrictions.',
                'is_public' => false,
            ],

            // Modules
            [
                'key' => 'module_blog',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'modules',
                'label' => 'Enable Blog Module',
                'description' => 'Activate the public blog and admin blog management.',
                'is_public' => true,
            ],
            [
                'key' => 'module_committees',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'modules',
                'label' => 'Enable Committee Management',
                'description' => 'Toggle the hierarchical committee system.',
                'is_public' => true,
            ],
            [
                'key' => 'module_id_cards',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'modules',
                'label' => 'Enable Digital ID Cards',
                'description' => 'Toggle automated ID card generation and verification.',
                'is_public' => true,
            ],

            // Security & Operations
            [
                'key' => 'audit_retention_days',
                'value' => '90',
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Audit Log Retention',
                'description' => 'Number of days to keep audit logs before auto-deletion.',
                'is_public' => false,
            ],
            [
                'key' => 'sec_force_reauth',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Force Re-Authentication',
                'description' => 'Require active session validation for destructive operations.',
                'is_public' => false,
            ],
            [
                'key' => 'sec_restrict_highest_admins',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Restrict System Settings',
                'description' => 'Isolate global configuration to top-tier administrators.',
                'is_public' => false,
            ],
            [
                'key' => 'sec_log_module_changes',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Log Infrastructure Changes',
                'description' => 'Record all state modifications for system modules.',
                'is_public' => false,
            ],
            [
                'key' => 'sec_block_escalation',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Block Privilege Escalation',
                'description' => 'Prevent non-root admins from elevating account permissions.',
                'is_public' => false,
            ],

            // Branding & Identity
            [
                'key' => 'branding_short_name',
                'value' => 'NDMSM',
                'type' => 'string',
                'group' => 'branding',
                'label' => 'Branding Short Name',
                'description' => 'Abbreviated name for UI elements.',
                'is_public' => true,
            ],
            [
                'key' => 'branding_motto',
                'value' => 'Strength in Unity, Progress in Education.',
                'type' => 'string',
                'group' => 'branding',
                'label' => 'Official Motto',
                'description' => 'The organization slogan.',
                'is_public' => true,
            ],
            [
                'key' => 'branding_bangla_first',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'branding',
                'label' => 'Bangla-First Content',
                'description' => 'Prioritize native language display across public clusters.',
                'is_public' => true,
            ],
            [
                'key' => 'branding_full_naming_policy',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'branding',
                'label' => 'Strict Naming Policy',
                'description' => 'Enforce full canonical naming for public-facing surfaces.',
                'is_public' => true,
            ],

            // Localization
            [
                'key' => 'system_timezone',
                'value' => 'Asia/Dhaka',
                'type' => 'string',
                'group' => 'general',
                'label' => 'System Timezone',
                'description' => 'Primary timezone for logs and events.',
                'is_public' => false,
            ],
            [
                'key' => 'system_language',
                'value' => 'bn',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Primary Language',
                'description' => 'Default interface language.',
                'is_public' => true,
            ],

            // Extended Modules
            [
                'key' => 'module_news',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'modules',
                'label' => 'Enable News Module',
                'description' => 'Toggle the news and press release system.',
                'is_public' => true,
            ],
            [
                'key' => 'module_activities',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'modules',
                'label' => 'Enable Activities Module',
                'description' => 'Toggle event tracking and activity logs.',
                'is_public' => true,
            ],
            [
                'key' => 'module_directory',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'modules',
                'label' => 'Enable Member Directory',
                'description' => 'Toggle public-facing member directory.',
                'is_public' => true,
            ],
            [
                'key' => 'module_tasks',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'modules',
                'label' => 'Enable Task Management',
                'description' => 'Toggle internal task and objective system.',
                'is_public' => true,
            ],
            [
                'key' => 'module_notifications',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'modules',
                'label' => 'Enable Notifications Hub',
                'description' => 'Toggle real-time alerts and inbox system.',
                'is_public' => true,
            ],
            // Communications
            [
                'key' => 'comm_in_app_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'communications',
                'label' => 'In-App Hub Delivery',
                'description' => 'Enable notifications within the internal cluster inbox.',
                'is_public' => false,
            ],
            [
                'key' => 'comm_email_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'communications',
                'label' => 'SMTP Relay Dispatch',
                'description' => 'Allow administrative updates over secure email channels.',
                'is_public' => false,
            ],
            [
                'key' => 'comm_sms_enabled',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'communications',
                'label' => 'Global SMS Gateway',
                'description' => 'Use for critical high-priority organizational alerts.',
                'is_public' => false,
            ],
            [
                'key' => 'comm_urgent_override',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'communications',
                'label' => 'Urgent Priority Bypass',
                'description' => 'Permit emergency alerts to bypass standard suppression.',
                'is_public' => false,
            ],
            [
                'key' => 'comm_broadcast_approval',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'communications',
                'label' => 'Broadcast Safeguard',
                'description' => 'Require multi-tier approval for mass audience delivery.',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $s) {
            \App\Models\SystemSetting::updateOrCreate(['key' => $s['key']], $s);
        }
    }
}
