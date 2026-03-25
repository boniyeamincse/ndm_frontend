import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm p-6 flex flex-col gap-2 transition-shadow hover:shadow-lg"
    >
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-4xl font-black ${accent ?? 'text-slate-900'}`}>{toNum(value).toLocaleString()}</p>
        {bar !== undefined && (
            <div className="h-1.5 bg-slate-100/50 rounded-full overflow-hidden mt-1">
                <div className={`h-full rounded-full ${barColor ?? 'bg-blue-500'}`} style={{ width: `${bar}%` }} />
            </div>
        )}
        {sub && <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
            <span className={`w-1 h-1 rounded-full ${barColor ?? 'bg-blue-500'}`} />
            {sub}
        </p>}
    </motion.div>
);

// ── Quick Action Card ──────────────────────────────────────────────────────
const ActionCard = ({ to, label, desc, icon }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
            to={to}
            className="flex items-center gap-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all group"
        >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary text-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                {icon}
            </div>
            <div>
                <p className="font-bold text-slate-900 text-sm">{label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
            </div>
            <span className="ml-auto text-slate-300 group-hover:text-primary text-lg translate-x-0 group-hover:translate-x-1 transition-transform">›</span>
        </Link>
    </motion.div>
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
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="rounded-full h-10 w-10 border-b-2 border-primary"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 font-bold">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">Retry</button>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="p-1 lg:p-4 max-w-7xl mx-auto space-y-6"
        >
            {/* ── Page Title ── */}
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-sm font-medium text-slate-400 mt-1">NDM Student Movement · Admin Insights</p>
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            </motion.div>

            {/* ── Overview Stats ── */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
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
                    label="Active Positions"
                    value={totalPositions}
                    bar={toPercent(totalPositions, totalMembers || 1)}
                    barColor="bg-violet-500"
                    accent="text-violet-700"
                    sub="Current assignments"
                />
                <StatCard
                    label="Total Units"
                    value={totalUnits}
                    bar={100}
                    barColor="bg-indigo-400"
                    accent="text-indigo-700"
                    sub="Central → Campus"
                />
            </motion.div>

            {/* ── Middle Row ── */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Units breakdown */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                        <h2 className="text-sm font-bold text-slate-900">Units by Tier</h2>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">Organizational Distribution</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {UNIT_ORDER.map((type) => {
                            const count = toNum(unitsByType[type]);
                            const pct   = toPercent(count, totalUnits || 1);
                            return (
                                <div key={type}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-slate-500 font-semibold">{UNIT_LABELS[type]}</span>
                                        <span className="font-black text-slate-900">{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={`h-full rounded-full ${UNIT_COLORS[type]}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pending approvals table */}
                <div className="xl:col-span-2 bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Pending Approvals</h2>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">Registration Queue</p>
                        </div>
                        <Link
                            to="/dashboard/admin/members/pending"
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900 font-bold hover:bg-amber-500 transition-colors shadow-sm shadow-amber-500/20"
                        >
                            Open Queue
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 font-black">
                                    <th className="px-6 py-3">Member</th>
                                    <th className="px-6 py-3">Contact</th>
                                    <th className="px-6 py-3">Unit</th>
                                    <th className="px-6 py-3">Applied</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/50">
                                {pendingMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-slate-400 text-center font-medium">
                                            No pending applications — all clear!
                                        </td>
                                    </tr>
                                )}
                                {pendingMembers.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{m.full_name}</p>
                                            <p className="text-[10px] font-mono text-slate-400">{m.member_id || 'PENDING'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{m.mobile || m.phone || '—'}</td>
                                        <td className="px-6 py-4">
                                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold ring-1 ring-blue-700/10 uppercase tracking-tighter">
                                              {m.organizational_unit?.name || 'Unassigned'}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-[10px] font-medium whitespace-nowrap">{formatDate(m.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* ── Bottom Row ── */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Members by Year */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                        <h2 className="text-sm font-bold text-slate-900">Growth Trends</h2>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">Members by Join Year</p>
                    </div>
                    <div className="p-6">
                        {(stats?.members_by_year ?? []).length === 0 && (
                            <p className="text-sm text-slate-400">No yearly data yet.</p>
                        )}
                        {(stats?.members_by_year ?? []).map((item) => {
                            const pct = toPercent(item.count, totalMembers || 1);
                            return (
                                <div key={item.year} className="mb-4 last:mb-0">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-slate-500 font-semibold">{item.year}</span>
                                        <span className="font-black text-slate-900">{toNum(item.count).toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, delay: 0.8 }}
                                            className="h-full bg-blue-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                        <h2 className="text-sm font-bold text-slate-900">Recent Pulse</h2>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">System-wide events</p>
                    </div>
                    <div className="p-6 divide-y divide-slate-100/50">
                        {activity.length === 0 && (
                            <p className="text-sm text-slate-400">No activity recorded yet.</p>
                        )}
                        {activity.slice(0, 8).map((log) => {
                            const meta = activityMeta(log.action);
                            return (
                                <div key={log.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 group transition-colors">
                                    <span className={`mt-0.5 px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 shadow-sm ring-1 ring-black/5 ${meta.color} uppercase tracking-tighter`}>
                                        {meta.label}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                                            {log.action}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-1 flex items-center gap-2">
                                            <span className="text-slate-500 font-bold">{log.performed_by ?? 'System-bot'}</span>
                                            <span>•</span>
                                            <span>{formatDate(log.performed_at)}</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboard;
