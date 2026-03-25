import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const toNum = (v) => Number(v ?? 0);
const toPercent = (v, total) => (!total ? 0 : Math.max(0, Math.min(100, Math.round((v / total) * 100))));
const formatDate = (v) => {
    if (!v) return '—';
    try { return new Date(v).toLocaleString(); } catch { return '—'; }
};

const UNIT_ORDER = ['central', 'division', 'district', 'upazila', 'union', 'ward', 'campus'];
const UNIT_LABELS = {
    central:  'Central',
    division: 'Division',
    district: 'District',
    upazila:  'Upazila',
    union:    'Union',
    ward:     'Ward',
    campus:   'Campus',
};
const UNIT_COLORS = {
    central:  'bg-purple-500',
    division: 'bg-blue-500',
    district: 'bg-teal-500',
    upazila:  'bg-amber-500',
    union:    'bg-orange-500',
    ward:     'bg-rose-500',
    campus:   'bg-green-500',
};

const activityMeta = (action) => {
    const a = (action ?? '').toLowerCase();
    if (a.includes('register') || a.includes('create'))
        return { label: 'Registration', color: 'bg-blue-100 text-blue-700' };
    if (a.includes('approve'))
        return { label: 'Approved', color: 'bg-green-100 text-green-700' };
    if (a.includes('promote') || a.includes('position') || a.includes('assign'))
        return { label: 'Promotion', color: 'bg-violet-100 text-violet-700' };
    if (a.includes('suspend') || a.includes('expel') || a.includes('reject'))
        return { label: 'Status Change', color: 'bg-red-100 text-red-700' };
    return { label: action ?? 'Action', color: 'bg-gray-100 text-gray-600' };
};

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, bar, barColor, sub, accent }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-4xl font-black ${accent ?? 'text-slate-900'}`}>{toNum(value).toLocaleString()}</p>
        {bar !== undefined && (
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className={`h-full rounded-full ${barColor ?? 'bg-blue-500'}`} style={{ width: `${bar}%` }} />
            </div>
        )}
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
);

// ── Quick Action Card ──────────────────────────────────────────────────────
const ActionCard = ({ to, label, desc, icon }) => (
    <Link
        to={to}
        className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all group"
    >
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary text-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
            {icon}
        </div>
        <div>
            <p className="font-bold text-slate-900 text-sm">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
        </div>
        <span className="ml-auto text-slate-300 group-hover:text-primary text-lg">›</span>
    </Link>
);

// ── Main Component ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [statsRes, activityRes, pendingRes] = await Promise.all([
                    api.get('/admin/dashboard/stats'),
                    api.get('/admin/dashboard/activity'),
                    api.get('/admin/members/pending', { params: { per_page: 5 } }),
                ]);
                setStats(statsRes.data?.data ?? {});
                setActivity(activityRes.data?.data ?? []);
                setPendingMembers(pendingRes.data?.data?.data ?? []);
            } catch (err) {
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    setError('Unauthorized: please sign in with an admin account.');
                } else {
                    setError('Failed to load dashboard data.');
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const members    = useMemo(() => stats?.members ?? {}, [stats]);
    const positions  = useMemo(() => stats?.positions ?? {}, [stats]);
    const units      = useMemo(() => stats?.units ?? {}, [stats]);
    const unitsByType = useMemo(() => {
        const map = {};
        (stats?.units_by_type ?? []).forEach(r => { map[r.type] = r.count; });
        return map;
    }, [stats]);

    const totalMembers  = toNum(members.total);
    const activeMembers = toNum(members.active);
    const pendingCount  = toNum(members.pending);
    const totalPositions = toNum(positions.total_active);
    const totalUnits     = toNum(units.total);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* ── Page Title ── */}
            <div>
                <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">NDM Student Wing · Admin overview</p>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ActionCard
                    to="/dashboard/admin/members/pending"
                    label="Approve Member"
                    desc={`${pendingCount} awaiting review`}
                    icon="✓"
                />
                <ActionCard
                    to="/dashboard/admin/positions"
                    label="Assign Position"
                    desc="Manage active positions"
                    icon="★"
                />
                <ActionCard
                    to="/dashboard/admin/settings"
                    label="Create Unit"
                    desc="Add an organizational unit"
                    icon="+"
                />
            </div>

            {/* ── Overview Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <StatCard
                    label="Total Members"
                    value={totalMembers}
                    bar={100}
                    barColor="bg-blue-500"
                />
                <StatCard
                    label="Active Members"
                    value={activeMembers}
                    bar={toPercent(activeMembers, totalMembers)}
                    barColor="bg-emerald-500"
                    accent="text-emerald-700"
                />
                <StatCard
                    label="Pending Approvals"
                    value={pendingCount}
                    bar={toPercent(pendingCount, totalMembers)}
                    barColor="bg-amber-500"
                    accent="text-amber-600"
                    sub={pendingCount > 0 ? 'Needs attention' : 'All clear'}
                />
                <StatCard
                    label="Total Positions"
                    value={totalPositions}
                    bar={toPercent(totalPositions, totalMembers || 1)}
                    barColor="bg-violet-500"
                    accent="text-violet-700"
                    sub="Active assignments"
                />
                <StatCard
                    label="Total Units"
                    value={totalUnits}
                    bar={100}
                    barColor="bg-indigo-400"
                    accent="text-indigo-700"
                    sub="Central → Campus"
                />
            </div>

            {/* ── Middle Row ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* Units breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-900">Units by Tier</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Central → Campus hierarchy</p>
                    </div>
                    <div className="p-6 space-y-3">
                        {UNIT_ORDER.map((type) => {
                            const count = toNum(unitsByType[type]);
                            const pct   = toPercent(count, totalUnits || 1);
                            return (
                                <div key={type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 font-medium">{UNIT_LABELS[type]}</span>
                                        <span className="font-bold text-slate-900">{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${UNIT_COLORS[type]}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pending approvals table */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Pending Approvals</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Most recent registration requests</p>
                        </div>
                        <Link
                            to="/dashboard/admin/members/pending"
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900 font-bold hover:bg-amber-500 transition-colors"
                        >
                            Open Queue
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                                    <th className="px-6 py-3">Member</th>
                                    <th className="px-6 py-3">Phone</th>
                                    <th className="px-6 py-3">Unit</th>
                                    <th className="px-6 py-3">Applied</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pendingMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-slate-400 text-center">
                                            No pending applications — all clear!
                                        </td>
                                    </tr>
                                )}
                                {pendingMembers.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <p className="font-semibold text-slate-900">{m.full_name}</p>
                                            <p className="text-xs text-slate-400">{m.member_id || 'Pending ID'}</p>
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">{m.mobile || m.phone || '—'}</td>
                                        <td className="px-6 py-3">
                                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                                {m.organizational_unit?.name || 'Not assigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(m.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {/* Members by Year */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-900">Members by Join Year</h2>
                    </div>
                    <div className="p-6">
                        {(stats?.members_by_year ?? []).length === 0 && (
                            <p className="text-sm text-slate-400">No yearly data yet.</p>
                        )}
                        {(stats?.members_by_year ?? []).map((item) => {
                            const pct = toPercent(item.count, totalMembers || 1);
                            return (
                                <div key={item.year} className="mb-3 last:mb-0">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">{item.year}</span>
                                        <span className="font-bold text-slate-900">{toNum(item.count).toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Registrations, promotions &amp; status changes</p>
                    </div>
                    <div className="p-6 space-y-3">
                        {activity.length === 0 && (
                            <p className="text-sm text-slate-400">No recent activity.</p>
                        )}
                        {activity.slice(0, 8).map((log) => {
                            const meta = activityMeta(log.action);
                            return (
                                <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-b-0 last:pb-0">
                                    <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${meta.color}`}>
                                        {meta.label}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm text-slate-700 truncate">
                                            <span className="font-medium">{log.action}</span>
                                            {log.model_type ? <span className="text-slate-400"> · {log.model_type} #{log.model_id}</span> : null}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {log.performed_by ?? 'System'} · {formatDate(log.performed_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
