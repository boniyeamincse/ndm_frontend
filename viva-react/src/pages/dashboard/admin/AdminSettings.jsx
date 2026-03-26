import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { NDSM_MOTTO, NDSM_NAME, NDSM_SHORT_NAME } from '../../../constants/branding';
import AuditLogs from './AuditLogs';
import api from '../../../services/api';

const SETTINGS_SECTIONS = [
  { key: 'control-center', group: 'Control Center',             label: 'Overview',                    desc: 'Centralized supervision for modules, safeguards, governance, and operational controls.' },
  { key: 'general',       group: 'System Settings',            label: 'General Settings',            desc: 'Application defaults, branding, and platform options.' },
  { key: 'module-controls', group: 'System Settings',          label: 'Module Controls',             desc: 'Enable or disable key product modules and define operational exposure.' },
  { key: 'maintenance',   group: 'System Settings',            label: 'Maintenance Controls',        desc: 'Restrict write actions, protect public operations, and define emergency mode behavior.' },
  { key: 'branding',      group: 'System Settings',            label: 'Branding Settings',           desc: 'Canonical organization naming, motto, logo policy, and public identity controls.' },
  { key: 'communications',group: 'System Settings',            label: 'Communication Settings',      desc: 'Message channels, admin broadcast limits, and urgent communication defaults.' },
  { key: 'organization',  group: 'System Settings',            label: 'Organization Configuration',   desc: 'Committee hierarchy and organization-level setup.' },
  { key: 'profile',       group: 'Access Control',             label: 'My Profile',                  desc: 'Personal profile and administrator identity details.' },
  { key: 'permissions',   group: 'Access Control',             label: 'Permission Governance',       desc: 'Privilege escalation safeguards, role reviews, and destructive-operation protection.' },
  { key: 'account',       group: 'Access Control',             label: 'Account Settings',            desc: 'Session behavior, account preferences, and controls.' },
  { key: 'security',      group: 'Access Control',             label: 'Change Password',             desc: 'Password updates and account protection settings.' },
  { key: 'storage-controls', group: 'Advanced',                label: 'Storage Controls',            desc: 'Upload policies, retention visibility, and storage operation restrictions.' },
  { key: 'audit-logs',    group: 'Advanced',                   label: 'Audit Logs',                  desc: 'Review administrative events and action history.' },
  { key: 'api-settings',  group: 'Advanced',                   label: 'API Settings',                desc: 'API token policies, integrations, and endpoint controls.' },
];

const SETTINGS_GROUPS = ['Control Center', 'System Settings', 'Access Control', 'Advanced'];

const MODULE_KEYS = [
  { key: 'news', label: 'News', risk: 'public' },
  { key: 'activities', label: 'Activities', risk: 'public' },
  { key: 'directory', label: 'Directory', risk: 'public' },
  { key: 'committees', label: 'Committees', risk: 'internal' },
  { key: 'tasks', label: 'Tasks', risk: 'internal' },
  { key: 'blog', label: 'Blog', risk: 'public' },
  { key: 'notifications', label: 'Notifications', risk: 'sensitive' },
  { key: 'id_cards', label: 'ID Cards', risk: 'sensitive' },
];

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [saved, setSaved] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    appName: NDSM_NAME,
    timezone: 'Asia/Dhaka',
    locale: 'bn',
    defaultJoinYear: new Date().getFullYear(),
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
  });
  const [moduleControls, setModuleControls] = useState({
    news: true,
    activities: true,
    directory: true,
    committees: true,
    tasks: true,
    blog: true,
    notifications: true,
    id_cards: true,
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    enabled: false,
    memberWritesRestricted: true,
    publicReadOnly: false,
    emergencyBanner: true,
    allowAdminOverride: true,
  });
  const [brandingForm, setBrandingForm] = useState({
    displayName: NDSM_NAME,
    shortName: NDSM_SHORT_NAME,
    motto: NDSM_MOTTO,
    banglaFirst: true,
    publicFullNameRequired: true,
  });
  const [communicationForm, setCommunicationForm] = useState({
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    urgentOverrideEnabled: true,
    allMemberBroadcastRequiresApproval: true,
  });
  const [securityForm, setSecurityForm] = useState({
    forceReauthForDestructiveActions: true,
    restrictGlobalSettingsToHighestAdmins: true,
    logModuleStateChanges: true,
    blockPrivilegeEscalationByNonSuperAdmins: true,
  });
  const [loading, setLoading] = useState(true);

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/settings');
        if (data.status === 'success') {
          const settings = data.data;
          
          // Map settings to forms
          const findVal = (key) => settings.find(s => s.key === key)?.value;
          const isTrue = (val) => val === 'true' || val === true || val === '1' || val === 1;

          setGeneralForm(prev => ({
            ...prev,
            appName: findVal('app_name') || prev.appName,
            timezone: findVal('system_timezone') || prev.timezone,
            locale: findVal('system_language') || prev.locale,
            maintenanceMode: isTrue(findVal('maintenance_mode')),
          }));

          setModuleControls(prev => ({
            ...prev,
            news: isTrue(findVal('module_news')),
            activities: isTrue(findVal('module_activities')),
            directory: isTrue(findVal('module_directory')),
            committees: isTrue(findVal('module_committees')),
            tasks: isTrue(findVal('module_tasks')),
            blog: isTrue(findVal('module_blog')),
            notifications: isTrue(findVal('module_notifications')),
            id_cards: isTrue(findVal('module_id_cards')),
          }));

          setMaintenanceForm(prev => ({
            ...prev,
            enabled: isTrue(findVal('maintenance_mode')),
            memberWritesRestricted: isTrue(findVal('maintenance_restrict_writes')),
            publicReadOnly: isTrue(findVal('maintenance_public_read_only')),
            emergencyBanner: isTrue(findVal('maintenance_banner_active')),
            allowAdminOverride: isTrue(findVal('maintenance_admin_override')),
          }));

          setBrandingForm(prev => ({
            ...prev,
            displayName: findVal('app_name') || prev.displayName,
            shortName: findVal('branding_short_name') || prev.shortName,
            motto: findVal('branding_motto') || prev.motto,
            banglaFirst: isTrue(findVal('branding_bangla_first')),
            publicFullNameRequired: isTrue(findVal('branding_full_naming_policy')),
          }));

          setCommunicationForm(prev => ({
            ...prev,
            inAppEnabled: isTrue(findVal('comm_in_app_enabled')),
            emailEnabled: isTrue(findVal('comm_email_enabled')),
            smsEnabled: isTrue(findVal('comm_sms_enabled')),
            urgentOverrideEnabled: isTrue(findVal('comm_urgent_override')),
            allMemberBroadcastRequiresApproval: isTrue(findVal('comm_broadcast_approval')),
          }));

          setSecurityForm(prev => ({
            ...prev,
            forceReauthForDestructiveActions: isTrue(findVal('sec_force_reauth')),
            restrictGlobalSettingsToHighestAdmins: isTrue(findVal('sec_restrict_highest_admins')),
            logModuleStateChanges: isTrue(findVal('sec_log_module_changes')),
            blockPrivilegeEscalationByNonSuperAdmins: isTrue(findVal('sec_block_escalation')),
          }));
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const currentSection = searchParams.get('section') || 'general';
  const activeSection = SETTINGS_SECTIONS.find(s => s.key === currentSection) || SETTINGS_SECTIONS[0];

  const selectSection = (key) => {
    setSaved(false);
    setSearchParams({ section: key });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSave = async () => {
    try {
      const settingsToUpdate = [
        // General & Maintenance
        { key: 'app_name', value: generalForm.appName },
        { key: 'system_timezone', value: generalForm.timezone },
        { key: 'system_language', value: generalForm.locale },
        { key: 'maintenance_mode', value: String(maintenanceForm.enabled) },
        { key: 'maintenance_restrict_writes', value: String(maintenanceForm.memberWritesRestricted) },
        { key: 'maintenance_public_read_only', value: String(maintenanceForm.publicReadOnly) },
        { key: 'maintenance_banner_active', value: String(maintenanceForm.emergencyBanner) },
        { key: 'maintenance_admin_override', value: String(maintenanceForm.allowAdminOverride) },
        
        // Modules
        { key: 'module_news', value: String(moduleControls.news) },
        { key: 'module_activities', value: String(moduleControls.activities) },
        { key: 'module_directory', value: String(moduleControls.directory) },
        { key: 'module_committees', value: String(moduleControls.committees) },
        { key: 'module_tasks', value: String(moduleControls.tasks) },
        { key: 'module_blog', value: String(moduleControls.blog) },
        { key: 'module_notifications', value: String(moduleControls.notifications) },
        { key: 'module_id_cards', value: String(moduleControls.id_cards) },
        
        // Branding
        { key: 'branding_short_name', value: brandingForm.shortName },
        { key: 'branding_motto', value: brandingForm.motto },
        { key: 'branding_bangla_first', value: String(brandingForm.banglaFirst) },
        { key: 'branding_full_naming_policy', value: String(brandingForm.publicFullNameRequired) },

        // Communications
        { key: 'comm_in_app_enabled', value: String(communicationForm.inAppEnabled) },
        { key: 'comm_email_enabled', value: String(communicationForm.emailEnabled) },
        { key: 'comm_sms_enabled', value: String(communicationForm.smsEnabled) },
        { key: 'comm_urgent_override', value: String(communicationForm.urgentOverrideEnabled) },
        { key: 'comm_broadcast_approval', value: String(communicationForm.allMemberBroadcastRequiresApproval) },

        // Security
        { key: 'sec_force_reauth', value: String(securityForm.forceReauthForDestructiveActions) },
        { key: 'sec_restrict_highest_admins', value: String(securityForm.restrictGlobalSettingsToHighestAdmins) },
        { key: 'sec_log_module_changes', value: String(securityForm.logModuleStateChanges) },
        { key: 'sec_block_escalation', value: String(securityForm.blockPrivilegeEscalationByNonSuperAdmins) },
      ];

      const { data } = await api.post('/admin/settings/bulk-update', { settings: settingsToUpdate });
      
      if (data.status === 'success') {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  const sectionTabs = useMemo(() => (
    SETTINGS_SECTIONS.map(section => (
      <button
        key={section.key}
        onClick={() => selectSection(section.key)}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
          activeSection.key === section.key
            ? 'bg-primary text-white border-primary shadow-lg shadow-primary-500/20'
            : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
        }`}
      >
        {section.label}
      </button>
    ))
  ), [activeSection.key]);

  const moduleSummary = useMemo(() => {
    const enabled = Object.values(moduleControls).filter(Boolean).length;
    return { enabled, total: Object.keys(moduleControls).length };
  }, [moduleControls]);

  const renderSectionBody = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-pulse">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Syncing with Governance Cluster...</p>
        </div>
      );
    }

    if (activeSection.key === 'control-center') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl relative overflow-hidden group hover:bg-white/[0.07] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Modules Active</p>
              <p className="mt-4 text-4xl font-black text-white">{moduleSummary.enabled}<span className="text-slate-600 text-xl font-medium ml-1">/ {moduleSummary.total}</span></p>
              <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">System feature exposure</p>
            </div>
            <div className={`rounded-3xl border p-6 shadow-xl relative overflow-hidden group transition-all ${maintenanceForm.enabled ? 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'}`}>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-2xl group-hover:opacity-100 opacity-50 transition-all ${maintenanceForm.enabled ? 'bg-amber-500/20' : 'bg-emerald-500/10'}`} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Maintenance Mode</p>
              <p className={`mt-4 text-4xl font-black ${maintenanceForm.enabled ? 'text-amber-500' : 'text-emerald-500'}`}>{maintenanceForm.enabled ? 'Active' : 'Standby'}</p>
              <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Operational Posture</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl relative overflow-hidden group hover:bg-white/[0.07] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Brand ID</p>
              <p className="mt-4 text-2xl font-black text-white truncate">{brandingForm.shortName}</p>
              <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Language: {brandingForm.banglaFirst ? 'Bangla First' : 'Multi-lang'}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl relative overflow-hidden group hover:bg-white/[0.07] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Guards</p>
              <p className="mt-4 text-4xl font-black text-primary">{Object.values(securityForm).filter(Boolean).length}</p>
              <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Security policy enforcements</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur shadow-2xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Governance Priorities</h3>
              <div className="mt-6 space-y-4">
                {[
                  'Secure global settings with multi-factor requirements.',
                  'Audit all administrative module state updates.',
                  'Maintain content consistency across public & admin surfaces.',
                  'Isolate destructive tools from read-only directory views.'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold italic">{i+1}</span>
                    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/5 p-8 backdrop-blur shadow-2xl">
              <h3 className="text-lg font-black text-rose-400 uppercase tracking-tight">High-Risk Operations</h3>
              <div className="mt-6 space-y-4">
                {[
                  ['Maintenance activation', 'Restricts member write access globally.'],
                  ['Module shutdowns', 'Disables core platform functionality.'],
                  ['ID Card Visibility', 'Impacts public directory and physical logs.'],
                  ['Permission Elevation', 'Grants destructive access to accounts.']
                ].map(([title, desc], i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-rose-300">{title}</p>
                    <p className="text-xs font-medium text-rose-500/70">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'general') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Input 
                label="Application Identity" 
                value={generalForm.appName}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, appName: e.target.value }))}
                placeholder="e.g. NDM Student Wing"
              />
              <Input 
                label="Primary Cluster Join Year" 
                type="number"
                value={generalForm.defaultJoinYear}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, defaultJoinYear: Number(e.target.value || new Date().getFullYear()) }))}
              />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Temporal Zone</label>
                <select
                  value={generalForm.timezone}
                  onChange={(e) => setGeneralForm(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="Asia/Dhaka" className="bg-slate-900">Asia/Dhaka (GMT+6)</option>
                  <option value="Asia/Kolkata" className="bg-slate-900">Asia/Kolkata (GMT+5:30)</option>
                  <option value="UTC" className="bg-slate-900">Universal Time (UTC)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Linguistic Policy</label>
                <select
                  value={generalForm.locale}
                  onChange={(e) => setGeneralForm(prev => ({ ...prev, locale: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="en" className="bg-slate-900">English (Global)</option>
                  <option value="bn" className="bg-slate-900">Bangla (Native)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 border-t border-white/5 pt-8">
            {[
              ['maintenanceMode', 'Maintenance Protocol', 'Restrict global write operations.'],
              ['emailNotifications', 'Email Dispatch', 'Enable administrative email alerts.'],
              ['smsNotifications', 'SMS Gateway', 'Enable urgent mobile notifications.']
            ].map(([key, title, desc]) => (
              <label key={key} className={`rounded-2xl border p-5 flex items-start gap-4 cursor-pointer transition-all duration-300 group ${generalForm[key] ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                <div className="relative flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={generalForm[key]}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-5 h-5 rounded-md bg-white/5 border-white/20 text-primary focus:ring-primary/40 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <p className={`text-sm font-bold transition-colors ${generalForm[key] ? 'text-primary' : 'text-slate-200'}`}>{title}</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection.key === 'module-controls') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-4">
            {MODULE_KEYS.map((module) => (
              <label key={module.key} className={`rounded-[2rem] border p-6 flex items-start gap-5 cursor-pointer transition-all duration-300 group ${moduleControls[module.key] ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                <div className="relative flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={moduleControls[module.key]}
                    onChange={(e) => setModuleControls(prev => ({ ...prev, [module.key]: e.target.checked }))}
                    className="w-6 h-6 rounded-lg bg-white/5 border-white/20 text-primary focus:ring-primary/40 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-base font-black transition-colors uppercase tracking-tight ${moduleControls[module.key] ? 'text-primary' : 'text-slate-200 group-hover:text-white'}`}>{module.label}</p>
                    <span className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] ${module.risk === 'sensitive' ? 'bg-rose-500/20 text-rose-400' : module.risk === 'internal' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {module.risk}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 mt-2 leading-relaxed">
                    {moduleControls[module.key] ? 'Activated for authorized cluster workflows.' : 'Isolated from active platform environment.'}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-8 py-6 text-xs font-medium text-slate-500 italic leading-relaxed shadow-inner">
            <span className="text-primary font-bold not-italic font-black uppercase tracking-widest mr-2">Advisory:</span>
            Module toggles define system-wide capability intent. Changes propagate to all API endpoints and public surfaces upon commitment.
          </div>
        </div>
      );
    }

    if (activeSection.key === 'maintenance') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-5">
            {[
              ['enabled', 'Emergency Lockdown', 'Activate global maintenance protocol and restrict clusters.'],
              ['memberWritesRestricted', 'Write Safeguard', 'Disable non-admin data mutation across all modules.'],
              ['publicReadOnly', 'Public Sandbox', 'Maintain public visibility while disabling interactions.'],
              ['emergencyBanner', 'Status Broadcast', 'Project high-visibility maintenance state to all users.'],
              ['allowAdminOverride', 'Override Privilege', 'Permitted administrators bypass lockouts for recovery.'],
            ].map(([key, title, desc]) => (
              <label key={key} className={`rounded-[2rem] border p-6 flex items-start gap-5 cursor-pointer transition-all duration-300 group ${maintenanceForm[key] ? 'border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                <div className="relative flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={maintenanceForm[key]}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-6 h-6 rounded-lg bg-white/5 border-white/20 text-amber-500 focus:ring-amber-500/40 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <p className={`text-base font-black transition-colors uppercase tracking-tight ${maintenanceForm[key] ? 'text-amber-400' : 'text-slate-200 group-hover:text-white'}`}>{title}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-2 leading-relaxed">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection.key === 'branding') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Input 
                label="Canonical Brand Name" 
                value={brandingForm.displayName} 
                onChange={(e) => setBrandingForm(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Full official name"
              />
              <Input 
                label="Canonical Short Name" 
                value={brandingForm.shortName} 
                onChange={(e) => setBrandingForm(prev => ({ ...prev, shortName: e.target.value }))}
                placeholder="Abbreviated name"
              />
            </div>
            <div className="flex flex-col justify-end">
              <Input 
                label="Official Mission Statement / Motto" 
                value={brandingForm.motto} 
                onChange={(e) => setBrandingForm(prev => ({ ...prev, motto: e.target.value }))}
                placeholder="Primary slogan"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 border-t border-white/5 pt-8">
            <label className={`rounded-2xl border p-5 flex items-start gap-4 cursor-pointer transition-all duration-300 group ${brandingForm.banglaFirst ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
              <div className="relative flex items-center mt-1">
                <input type="checkbox" checked={brandingForm.banglaFirst} onChange={(e) => setBrandingForm(prev => ({ ...prev, banglaFirst: e.target.checked }))} className="w-5 h-5 rounded-md bg-white/5 border-white/20 text-primary focus:ring-primary/40 focus:ring-offset-0 transition-all cursor-pointer" />
              </div>
              <div><p className={`text-sm font-bold transition-colors ${brandingForm.banglaFirst ? 'text-primary' : 'text-slate-200'}`}>Bangla-First Content</p><p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed">Prioritize native language display across public clusters.</p></div>
            </label>
            <label className={`rounded-2xl border p-5 flex items-start gap-4 cursor-pointer transition-all duration-300 group ${brandingForm.publicFullNameRequired ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
              <div className="relative flex items-center mt-1">
                <input type="checkbox" checked={brandingForm.publicFullNameRequired} onChange={(e) => setBrandingForm(prev => ({ ...prev, publicFullNameRequired: e.target.checked }))} className="w-5 h-5 rounded-md bg-white/5 border-white/20 text-primary focus:ring-primary/40 focus:ring-offset-0 transition-all cursor-pointer" />
              </div>
              <div><p className={`text-sm font-bold transition-colors ${brandingForm.publicFullNameRequired ? 'text-primary' : 'text-slate-200'}`}>Strict Naming Policy</p><p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed">Enforce full canonical naming for public-facing surfaces.</p></div>
            </label>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'communications') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-5">
            {[
              ['inAppEnabled', 'In-App Hub Delivery', 'Enable high-fidelity notifications within the cluster inbox.'],
              ['emailEnabled', 'SMTP Relay Dispatch', 'Allow administrative updates over secure email channels.'],
              ['smsEnabled', 'Global SMS Gateway', 'Use for critical high-priority organizational alerts.'],
              ['urgentOverrideEnabled', 'Tier 1 Priority Bypass', 'Permit emergency alerts to bypass standard suppression.'],
              ['allMemberBroadcastRequiresApproval', 'Broadcast Safeguard', 'Require 2-tier approval for mass audience delivery.'],
            ].map(([key, title, desc]) => (
              <label key={key} className={`rounded-[2rem] border p-6 flex items-start gap-5 cursor-pointer transition-all duration-300 group ${communicationForm[key] ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                <div className="relative flex items-center mt-1">
                  <input type="checkbox" checked={communicationForm[key]} onChange={(e) => setCommunicationForm(prev => ({ ...prev, [key]: e.target.checked }))} className="w-6 h-6 rounded-lg bg-white/5 border-white/20 text-primary focus:ring-primary/40 transition-all" />
                </div>
                <div><p className={`text-base font-black transition-colors uppercase tracking-tight ${communicationForm[key] ? 'text-primary' : 'text-slate-200 group-hover:text-white'}`}>{title}</p><p className="text-[11px] font-medium text-slate-500 mt-2 leading-relaxed">{desc}</p></div>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection.key === 'organization') {
      return (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight relative">Hierarchy Topology</h3>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed relative">Configure structural defaults for the 5-tier political map and institutional clusters. Manage depth and node parameters.</p>
            <div className="mt-8 flex gap-3 relative">
              <button className="rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">View Schema</button>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight relative">Onboarding Logic</h3>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed relative">Define mapping rules for new member registration. Automate node assignment and supervisory redirection during approval.</p>
            <div className="mt-8 flex gap-3 relative">
              <button className="rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">Configure Rules</button>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'permissions') {
      return (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl space-y-8">
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Privilege Safeguards</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Configure global escalation guardrails and lockouts.</p>
            </div>
            <div className="space-y-4">
              {[
                ['forceReauthForDestructiveActions', 'Biometric/Re-Auth Safeguard', 'Require active session validation for destructive operations.'],
                ['restrictGlobalSettingsToHighestAdmins', 'Cluster Restriction', 'Isolate system settings to highest-tier administrators.'],
                ['logModuleStateChanges', 'Policy Audit Logs', 'Record every state change for infrastructure modules.'],
                ['blockPrivilegeEscalationByNonSuperAdmins', 'Spawn Restriction', 'Block permission elevation by non-root administrators.'],
              ].map(([key, label, desc]) => (
                <label key={key} className={`rounded-2xl border p-5 flex items-start gap-4 cursor-pointer transition-all duration-300 group ${securityForm[key] ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                  <div className="relative flex items-center mt-1">
                    <input type="checkbox" checked={securityForm[key]} onChange={(e) => setSecurityForm(prev => ({ ...prev, [key]: e.target.checked }))} className="w-5 h-5 rounded-md bg-white/5 border-white/20 text-primary focus:ring-primary/40 transition-all" />
                  </div>
                  <div>
                    <p className={`text-sm font-black transition-colors uppercase tracking-tight ${securityForm[key] ? 'text-primary' : 'text-slate-200'}`}>{label}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-rose-500/20 bg-rose-500/5 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />
            <h3 className="text-lg font-black text-rose-400 uppercase tracking-tight relative">Restricted Ops</h3>
            <p className="text-xs font-medium text-rose-500/70 mt-2 relative">The following actions bypass standard logic and impact global clusters.</p>
            <div className="mt-8 space-y-5 relative">
              {[
                ['Infrastructure Shutdown', 'Global maintenance mode or cluster lockout.'],
                ['Linguistic Override', 'Branding, motto, or public naming policy changes.'],
                ['Privacy Redaction', 'Directory suppression or ID Card visibility toggles.'],
                ['Root Elevation', 'Assignment of Super Admin or Cluster Admin roles.']
              ].map(([title, desc], i) => (
                <div key={i} className="flex flex-col gap-1 border-l-2 border-rose-500/20 pl-4">
                  <p className="text-sm font-black text-rose-300 uppercase tracking-tight">{title}</p>
                  <p className="text-[10px] font-medium text-rose-500/60 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'storage-controls') {
      return (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight relative">Asset Retention</h3>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed relative">Manage storage buckets for documents, media, and exports. Define retention policies, size limits, and multi-region synchronization.</p>
            <div className="mt-8 flex gap-3 relative">
              <button className="rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">Storage Map</button>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl relative group">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight relative">Governance Proxy</h3>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed relative">Align storage controls with infrastructure audit logs. Enforce document-level access tokens and sensitive export restrictions.</p>
            <div className="mt-8 flex gap-3 relative">
              <button className="rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">Audit Policy</button>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'audit-logs') {
      return <AuditLogs />;
    }

    if (activeSection.key === 'profile' || activeSection.key === 'account' || activeSection.key === 'security') {
      return (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Identity Snapshot</h3>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">Platform Email</p>
                <p className="text-sm font-bold text-slate-100">{user?.email ?? '—'}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">Access Tier</p>
                <p className="text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary px-3 py-1 rounded-md">{user?.user_type ?? 'admin'}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl space-y-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Security Pulse</h3>
            <p className="text-sm font-medium text-slate-400 leading-relaxed">Identity controls and password rotation are isolated to this secure cluster to prevent accidental disclosure during global policy updates.</p>
            <Button variant="outline" className="w-full font-black uppercase tracking-widest text-[10px] py-4">Change Cluster Key</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-lg font-black text-white uppercase tracking-tight relative">API Gateway</h3>
          <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed relative">Manage programmatic access tokens and integration endpoints. Configure webhook clusters and third-party authentication relays.</p>
          <div className="mt-8 flex gap-3 relative">
            <button className="rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">Token Policy</button>
          </div>
        </div>
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl relative group">
          <div className="absolute inset-0 bg-emerald-500/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-lg font-black text-white uppercase tracking-tight relative">Cluster Relays</h3>
          <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed relative">Configure behavior for external data synchronization and state reporting. Define endpoint timeout and retry logic for high-availability clusters.</p>
          <div className="mt-8 flex gap-3 relative">
            <button className="rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">Manage Webhooks</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.1),_transparent_40%),radial-gradient(circle_at_right,_rgba(245,158,11,0.05),_transparent_30%)]" />
        <div className="relative px-8 py-10 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Platform Governance</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Admin Settings</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-slate-400 leading-relaxed">
                Centralized command for system behavior, branding identity, and administrative safeguards. Manage the core configuration of the NDM Student Wing platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl shadow-xl min-w-[140px]">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Clusters</p>
                <p className="mt-1 text-xl font-black text-white">{SETTINGS_SECTIONS.length}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl shadow-xl min-w-[140px]">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Active</p>
                <p className="mt-1 text-sm font-black text-primary uppercase tracking-tighter">{activeSection.label}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl shadow-xl min-w-[140px]">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Group</p>
                <p className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{activeSection.group}</p>
              </div>
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4 backdrop-blur-xl shadow-xl min-w-[140px]">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-500/50">State</p>
                <p className="mt-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">Synced</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[360px_1fr] gap-8 items-start">
        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-6 space-y-6 h-fit lg:sticky lg:top-24 shadow-2xl">
          <div className="px-4 pb-2 border-b border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Settings Menu</p>
            <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">Select a governance module to update system-wide policy.</p>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {SETTINGS_GROUPS.map(group => (
              <div key={group} className="space-y-2">
                <p className="px-4 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary/60">{group}</p>
                <div className="space-y-1.5">
                  {SETTINGS_SECTIONS.filter(section => section.group === group).map(section => {
                    const active = activeSection.key === section.key;
                    return (
                      <button
                        key={section.key}
                        onClick={() => selectSection(section.key)}
                        className={`w-full text-left px-4 py-4 rounded-2xl transition-all duration-300 group ${
                          active
                            ? 'bg-primary text-white font-bold shadow-xl shadow-primary-500/20 ring-1 ring-primary/40'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                      >
                        <span className="block text-sm uppercase tracking-tight">{section.label}</span>
                        <span className={`mt-1 block text-[10px] font-medium leading-relaxed ${active ? 'text-white/70' : 'text-slate-500 group-hover:text-slate-400'}`}>{section.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-primary/10 border border-primary/20 p-6 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Quick Navigation</p>
            <div className="mt-4 space-y-3">
              <Link to="/dashboard/admin/members" className="flex items-center justify-between text-xs font-bold text-slate-300 hover:text-primary transition-colors">Manage Users <span>→</span></Link>
              <Link to="/dashboard/admin/roles" className="flex items-center justify-between text-xs font-bold text-slate-300 hover:text-primary transition-colors">Permissions <span>→</span></Link>
              <Link to="/dashboard/admin/units" className="flex items-center justify-between text-xs font-bold text-slate-300 hover:text-primary transition-colors">Organization <span>→</span></Link>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 lg:p-10 space-y-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
          
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{activeSection.group}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white uppercase">{activeSection.label}</h2>
              <p className="mt-3 text-sm font-medium leading-[1.8] text-slate-400">{activeSection.desc}</p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 min-w-[260px] shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Infrastructure Policy</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Access Tier</span>
                  <span className="font-black text-slate-200 uppercase tracking-tighter">Super Admin</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5">
                  <span className="text-slate-500 font-medium">Domain Scope</span>
                  <span className="font-black text-slate-200 uppercase tracking-tighter">Cluster-wide</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-x-auto rounded-[2rem] border border-white/10 bg-white/5 p-3 backdrop-blur shadow-inner">
            <div className="flex items-center gap-3 min-w-max pr-4">{sectionTabs}</div>
          </div>

          <div className="relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
            {renderSectionBody()}
          </div>

          {saved && (
            <div className="px-6 py-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              System policies updated successfully.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-6 border-t border-white/5 pt-10">
            <p className="text-xs font-medium text-slate-500 max-w-sm italic">Note: Changes here propagate globally and affect all administrative and public clusters.</p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="font-black uppercase tracking-widest text-[10px] py-4 px-8" onClick={() => navigate('/dashboard/admin')}>Dashboard</Button>
              <Button variant="accent" className="font-black uppercase tracking-widest text-[10px] py-4 px-10 ring-4 ring-primary/10 shadow-2xl shadow-primary-500/40" onClick={handleSave}>{activeSection.key === 'security' ? 'Sync Security' : 'Commit Changes'}</Button>
              <Button variant="outline" className="font-black uppercase tracking-widest text-[10px] py-4 px-8 border-rose-500/40 text-rose-400 hover:bg-rose-500 hover:text-white" onClick={handleLogout}>Terminate</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
