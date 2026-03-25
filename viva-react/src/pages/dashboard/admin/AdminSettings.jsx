import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { NDSM_MOTTO, NDSM_NAME, NDSM_SHORT_NAME } from '../../../constants/branding';
import AuditLogs from './AuditLogs';

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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const sectionTabs = useMemo(() => (
    SETTINGS_SECTIONS.map(section => (
      <button
        key={section.key}
        onClick={() => selectSection(section.key)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
          activeSection.key === section.key
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
    if (activeSection.key === 'control-center') {
      return (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Enabled Modules</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{moduleSummary.enabled}/{moduleSummary.total}</p>
              <p className="mt-1 text-sm text-slate-500">Current platform exposure</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Maintenance</p>
              <p className={`mt-2 text-3xl font-black ${maintenanceForm.enabled ? 'text-amber-600' : 'text-emerald-600'}`}>{maintenanceForm.enabled ? 'On' : 'Off'}</p>
              <p className="mt-1 text-sm text-slate-500">Emergency control posture</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Brand Policy</p>
              <p className="mt-2 text-lg font-black text-slate-900">{brandingForm.shortName}</p>
              <p className="mt-1 text-sm text-slate-500">Bangla-first: {brandingForm.banglaFirst ? 'Yes' : 'No'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Destructive Safeguards</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{Object.values(securityForm).filter(Boolean).length}</p>
              <p className="mt-1 text-sm text-slate-500">Active policy protections</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800">Control Center Priorities</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Protect global settings behind highest-privilege access.</li>
                <li>Ensure module toggles are audited and environment-aware.</li>
                <li>Keep branding and multilingual defaults consistent across public/admin UI.</li>
                <li>Separate public-safe controls from destructive operations.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-sm font-semibold text-amber-900">High-Risk Operations</h3>
              <ul className="mt-3 space-y-2 text-sm text-amber-800">
                <li>Maintenance-mode activation</li>
                <li>Notification and broadcast module shutdown</li>
                <li>ID-card or directory visibility changes</li>
                <li>Role/permission elevation and storage policy changes</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'general') {
      return (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Application Name</label>
              <input
                value={generalForm.appName}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, appName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Default Join Year</label>
              <input
                type="number"
                value={generalForm.defaultJoinYear}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, defaultJoinYear: Number(e.target.value || new Date().getFullYear()) }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Timezone</label>
              <select
                value={generalForm.timezone}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="Asia/Dhaka">Asia/Dhaka</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Language</label>
              <select
                value={generalForm.locale}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, locale: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="en">English</option>
                <option value="bn">Bangla</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <label className="rounded-xl border border-slate-200 p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={generalForm.maintenanceMode}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">Maintenance Mode</p>
                <p className="text-xs text-slate-500 mt-0.5">Temporarily restricts member-facing write actions.</p>
              </div>
            </label>
            <label className="rounded-xl border border-slate-200 p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={generalForm.emailNotifications}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">Email Notifications</p>
                <p className="text-xs text-slate-500 mt-0.5">Send admin updates via email.</p>
              </div>
            </label>
            <label className="rounded-xl border border-slate-200 p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={generalForm.smsNotifications}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">SMS Notifications</p>
                <p className="text-xs text-slate-500 mt-0.5">Send urgent alerts by SMS.</p>
              </div>
            </label>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'module-controls') {
      return (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            {MODULE_KEYS.map((module) => (
              <label key={module.key} className="rounded-xl border border-slate-200 p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                <input
                  type="checkbox"
                  checked={moduleControls[module.key]}
                  onChange={(e) => setModuleControls(prev => ({ ...prev, [module.key]: e.target.checked }))}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{module.label}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${module.risk === 'sensitive' ? 'bg-red-100 text-red-700' : module.risk === 'internal' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {module.risk}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {moduleControls[module.key] ? 'Enabled for authorized workflows.' : 'Disabled from normal platform use.'}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Module toggles here define control-center intent and governance defaults. Backend-persistent feature flags should mirror this behavior before production use.
          </div>
        </div>
      );
    }

    if (activeSection.key === 'maintenance') {
      return (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ['enabled', 'Enable maintenance mode', 'Restrict risky platform operations during incidents or releases.'],
              ['memberWritesRestricted', 'Restrict member write actions', 'Protect critical workflows while preserving limited admin access.'],
              ['publicReadOnly', 'Keep public pages read-only', 'Allow public visibility while disabling mutating operations.'],
              ['emergencyBanner', 'Show emergency banner', 'Expose visible operational state to admins and public users.'],
              ['allowAdminOverride', 'Allow admin override access', 'Permit authorized administrators to continue operations during maintenance.'],
            ].map(([key, title, desc]) => (
              <label key={key} className="rounded-xl border border-slate-200 p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                <input
                  type="checkbox"
                  checked={maintenanceForm[key]}
                  onChange={(e) => setMaintenanceForm(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500 mt-1">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection.key === 'branding') {
      return (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Canonical Name</label>
              <input
                value={brandingForm.displayName}
                onChange={(e) => setBrandingForm(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Short Name</label>
              <input
                value={brandingForm.shortName}
                onChange={(e) => setBrandingForm(prev => ({ ...prev, shortName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Official Motto</label>
            <input
              value={brandingForm.motto}
              onChange={(e) => setBrandingForm(prev => ({ ...prev, motto: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="rounded-xl border border-slate-200 p-4 flex items-start gap-3 cursor-pointer bg-white">
              <input type="checkbox" checked={brandingForm.banglaFirst} onChange={(e) => setBrandingForm(prev => ({ ...prev, banglaFirst: e.target.checked }))} className="mt-0.5" />
              <div><p className="text-sm font-semibold text-slate-800">Bangla-first public content</p><p className="text-xs text-slate-500 mt-1">Use Bangla as primary public display language where content exists.</p></div>
            </label>
            <label className="rounded-xl border border-slate-200 p-4 flex items-start gap-3 cursor-pointer bg-white">
              <input type="checkbox" checked={brandingForm.publicFullNameRequired} onChange={(e) => setBrandingForm(prev => ({ ...prev, publicFullNameRequired: e.target.checked }))} className="mt-0.5" />
              <div><p className="text-sm font-semibold text-slate-800">Require full public name</p><p className="text-xs text-slate-500 mt-1">Avoid inconsistent short naming on key public-facing surfaces.</p></div>
            </label>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'communications') {
      return (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ['inAppEnabled', 'In-app inbox enabled', 'Primary delivery channel for notices and announcements.'],
              ['emailEnabled', 'Email delivery enabled', 'Allow approved communications over email.'],
              ['smsEnabled', 'SMS delivery enabled', 'Use for urgent or high-priority notices only.'],
              ['urgentOverrideEnabled', 'Urgent override allowed', 'Permit emergency alerts to bypass standard opt-out settings.'],
              ['allMemberBroadcastRequiresApproval', 'All-member broadcasts require approval', 'Prevent mass communication without higher-level review.'],
            ].map(([key, title, desc]) => (
              <label key={key} className="rounded-xl border border-slate-200 p-4 flex items-start gap-3 cursor-pointer bg-white">
                <input type="checkbox" checked={communicationForm[key]} onChange={(e) => setCommunicationForm(prev => ({ ...prev, [key]: e.target.checked }))} className="mt-0.5" />
                <div><p className="text-sm font-semibold text-slate-800">{title}</p><p className="text-xs text-slate-500 mt-1">{desc}</p></div>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection.key === 'organization') {
      return (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h3 className="text-sm font-semibold text-slate-800">Hierarchy Defaults</h3>
            <p className="text-sm text-slate-600 mt-2">Configure defaults for central, division, district, upazila, union, ward, and campus levels.</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <h3 className="text-sm font-semibold text-slate-800">Registration Rules</h3>
            <p className="text-sm text-slate-600 mt-2">Define how new members are mapped to organizational units during approval.</p>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'permissions') {
      return (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h3 className="text-sm font-semibold text-slate-800">Privilege Escalation Guardrails</h3>
            <div className="mt-3 space-y-3">
              {[
                ['forceReauthForDestructiveActions', 'Require re-authentication for destructive operations'],
                ['restrictGlobalSettingsToHighestAdmins', 'Restrict global settings to highest-privilege admins'],
                ['logModuleStateChanges', 'Audit all module state changes'],
                ['blockPrivilegeEscalationByNonSuperAdmins', 'Block non-super-admin privilege escalation'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={securityForm[key]} onChange={(e) => setSecurityForm(prev => ({ ...prev, [key]: e.target.checked }))} className="mt-0.5" />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-red-200 p-4 bg-red-50">
            <h3 className="text-sm font-semibold text-red-900">Restricted Actions</h3>
            <ul className="mt-2 space-y-2 text-sm text-red-800">
              <li>Global maintenance mode activation</li>
              <li>Mass-broadcast or emergency communication privileges</li>
              <li>Module disablement for ID cards, tasks, directory, or notifications</li>
              <li>Branding and public identity overrides</li>
            </ul>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'storage-controls') {
      return (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h3 className="text-sm font-semibold text-slate-800">Storage Policy</h3>
            <p className="text-sm text-slate-600 mt-2">Define upload restrictions, safe file handling, retention visibility, and protected access rules for documents, media, and sensitive system exports.</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <h3 className="text-sm font-semibold text-slate-800">Retention Alignment</h3>
            <p className="text-sm text-slate-600 mt-2">Keep storage controls aligned with audit retention, document access policies, and any future module-level archival workflow.</p>
          </div>
        </div>
      );
    }

    if (activeSection.key === 'audit-logs') {
      return <AuditLogs />;
    }

    if (activeSection.key === 'profile' || activeSection.key === 'account' || activeSection.key === 'security') {
      return (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h3 className="text-sm font-semibold text-slate-800">Account Snapshot</h3>
            <div className="text-sm space-y-1.5 mt-2 text-slate-700">
              <p><span className="text-slate-500 inline-block w-24">Email</span>{user?.email ?? '—'}</p>
              <p><span className="text-slate-500 inline-block w-24">Role</span>{user?.user_type ?? 'admin'}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <h3 className="text-sm font-semibold text-slate-800">Security Controls</h3>
            <p className="text-sm text-slate-600 mt-2">Use this area to manage password rotation, session controls, and profile security checks.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
          <h3 className="text-sm font-semibold text-slate-800">API & Integrations</h3>
          <p className="text-sm text-slate-600 mt-2">Manage API token policies, webhook configurations, and third-party integrations.</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 bg-white">
          <h3 className="text-sm font-semibold text-slate-800">Integration Controls</h3>
          <p className="text-sm text-slate-600 mt-2">Manage API access behavior and integration settings for external services.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_38%),radial-gradient(circle_at_right,_rgba(245,158,11,0.12),_transparent_24%)]" />
        <div className="relative px-6 py-7 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Control Center</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Admin Settings</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Manage system behavior, organizational defaults, access control, and advanced operational settings from one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Sections</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{SETTINGS_SECTIONS.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Group</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{activeSection.group}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Active</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{activeSection.label}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">State</p>
                <p className="mt-1 text-sm font-bold text-emerald-600">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[320px_1fr] gap-6">
        <div className="bg-white rounded-[26px] border border-slate-200 p-4 space-y-4 h-fit sticky top-24 shadow-sm">
          <div className="px-2 pb-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Settings Menu</p>
            <p className="mt-1 text-sm text-slate-500">Choose a section to update configuration values and security controls.</p>
          </div>

          {SETTINGS_GROUPS.map(group => (
            <div key={group} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5">
              <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{group}</p>
              <div className="space-y-1">
                {SETTINGS_SECTIONS.filter(section => section.group === group).map(section => {
                  const active = activeSection.key === section.key;
                  return (
                    <button
                      key={section.key}
                      onClick={() => selectSection(section.key)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                        active
                          ? 'bg-slate-900 text-white font-semibold shadow-sm'
                          : 'text-slate-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <span className="block">{section.label}</span>
                      <span className={`mt-0.5 block text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{section.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Quick Access</p>
            <div className="mt-2 space-y-1.5">
              <Link to="/dashboard/admin/members" className="block text-sm font-medium text-amber-900 hover:underline">Manage Users →</Link>
              <Link to="/dashboard/admin/roles" className="block text-sm font-medium text-amber-900 hover:underline">Roles & Permissions →</Link>
              <Link to="/dashboard/admin/settings?section=module-controls" className="block text-sm font-medium text-amber-900 hover:underline">Module Controls →</Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[26px] border border-slate-200 p-6 lg:p-7 space-y-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{activeSection.group}</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{activeSection.label}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{activeSection.desc}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 min-w-[220px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Environment</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Access Level</span>
                <span className="font-semibold text-slate-900">Administrator</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-slate-500">Scope</span>
                <span className="font-semibold text-slate-900">System-wide</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center gap-2 min-w-max">{sectionTabs}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/40 p-5 lg:p-6">
            {renderSectionBody()}
          </div>

          {saved && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium">
              Settings saved successfully.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-500">Changes affect administrative workflows and platform defaults.</p>
            <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/admin')}>Back to Dashboard</Button>
            <Button variant="accent" onClick={handleSave}>{activeSection.key === 'security' ? 'Update Security Settings' : 'Save Changes'}</Button>
            <Button variant="outline" onClick={handleLogout}>Log Out</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
