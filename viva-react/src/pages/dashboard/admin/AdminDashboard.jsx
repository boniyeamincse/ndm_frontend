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
        className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-7 flex flex-col gap-4 transition-all relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 relative">{label}</p>
        <p className={`text-4xl font-black tracking-tight relative ${accent ?? 'text-white'}`}>{toNum(value).toLocaleString()}</p>
        
        {bar !== undefined && (
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1 relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${bar}%` }}
                    transition={{ duration: 1, delay: Math.random() * 0.3 }}
                    className={`h-full rounded-full ${barColor ?? 'bg-primary'}`} 
                />
            </div>
        )}
        
        {sub && (
            <div className="flex items-center gap-2 relative">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${barColor ?? 'bg-primary'}`} />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sub}</p>
            </div>
        )}
    </motion.div>
);

// ── Quick Action Card ──────────────────────────────────────────────────────
const ActionCard = ({ to, label, desc, icon }) => (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link
            to={to}
            className="flex items-center gap-5 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-primary/10 transition-all pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-primary text-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="font-black text-white text-base uppercase tracking-tight truncate">{label}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest truncate">{desc}</p>
            </div>
            <span className="ml-auto text-slate-600 group-hover:text-primary transition-colors text-xl">→</span>
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Platform Intelligence</p>
                <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Dashboard Overview</h1>
                <p className="text-sm font-medium text-slate-400 mt-2 leading-relaxed max-w-2xl">Real-time analytical insights and administrative supervision for the NDM Student Movement global cluster.</p>
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
                    label="Control Center"
                    desc="System settings, governance, and safeguards"
                    icon="CC"
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
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden group">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                        <h2 className="text-sm font-black text-white uppercase tracking-tight">Hierarchy Topology</h2>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">Organizational Distribution</p>
                    </div>
                    <div className="p-8 space-y-5">
                        {UNIT_ORDER.map((type) => {
                            const count = toNum(unitsByType[type]);
                            const pct   = toPercent(count, totalUnits || 1);
                            return (
                                <div key={type} className="group/item">
                                    <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-widest">
                                        <span className="text-slate-400 group-hover/item:text-slate-200 transition-colors">{UNIT_LABELS[type]}</span>
                                        <span className="text-white">{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={`h-full rounded-full ${UNIT_COLORS[type]} opacity-80 group-hover/item:opacity-100 transition-opacity`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pending approvals table */}
                <div className="xl:col-span-2 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-tight">Onboarding Queue</h2>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">Registration Approvals Pending</p>
                        </div>
                        <Link
                            to="/dashboard/admin/members/pending"
                            className="text-[10px] px-5 py-2.5 rounded-xl bg-primary text-slate-900 font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-primary/20 shrink-0"
                        >
                            Open Queue
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-slate-500 font-black border-b border-white/5">
                                    <th className="px-8 py-5">Identity Snapshot</th>
                                    <th className="px-8 py-5">Uplink / Unit</th>
                                    <th className="px-8 py-5">Timeline</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pendingMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-12 text-slate-500 text-center font-bold uppercase tracking-widest text-xs italic">
                                            No pending applications — Cluster Sync Complete
                                        </td>
                                    </tr>
                                )}
                                {pendingMembers.map((m) => (
                                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <p className="font-black text-slate-200 group-hover:text-white transition-colors">{m.full_name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{m.mobile || '—'}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                          <span className="px-3 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest ring-1 ring-primary/20">
                                              {m.organizational_unit?.name || 'Unassigned Cluster'}
                                          </span>
                                        </td>
                                        <td className="px-8 py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{formatDate(m.created_at)}</td>
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
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden group">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                        <h2 className="text-sm font-black text-white uppercase tracking-tight">Temporal Growth</h2>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">Members by Join Year</p>
                    </div>
                    <div className="p-8 space-y-5">
                        {(stats?.members_by_year ?? []).length === 0 && (
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">No historical data available.</p>
                        )}
                        {(stats?.members_by_year ?? []).map((item) => {
                            const pct = toPercent(item.count, totalMembers || 1);
                            return (
                                <div key={item.year} className="group/item">
                                    <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-widest">
                                        <span className="text-slate-400 group-hover/item:text-slate-200 transition-colors">{item.year} Cluster</span>
                                        <span className="text-white">{toNum(item.count).toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, delay: 0.8 }}
                                            className="h-full bg-primary/60 rounded-full group-hover/item:bg-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden group">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                        <h2 className="text-sm font-black text-white uppercase tracking-tight">Recent Pulse</h2>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">Infrastructure Broadcast History</p>
                    </div>
                    <div className="p-4 space-y-1">
                        {activity.length === 0 && (
                            <p className="px-4 py-8 text-xs text-slate-500 font-bold uppercase tracking-widest italic text-center">No broadcast activity recorded.</p>
                        )}
                        {activity.slice(0, 8).map((log) => {
                            const meta = activityMeta(log.action);
                            // Convert standard colors to glass-friendly colors
                            const getGlassColor = (c) => {
                                if (c.includes('green')) return 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30';
                                if (c.includes('blue'))  return 'bg-primary/20 text-primary ring-primary/30';
                                if (c.includes('violet')) return 'bg-indigo-500/20 text-indigo-400 ring-indigo-500/30';
                                if (c.includes('red'))    return 'bg-rose-500/20 text-rose-400 ring-rose-500/30';
                                return 'bg-white/10 text-slate-400 ring-white/20';
                            };
                            return (
                                <div key={log.id} className="flex items-start gap-5 px-4 py-4 rounded-2xl hover:bg-white/[0.03] transition-all group/activity">
                                    <span className={`mt-0.5 px-3 py-1.5 rounded-lg text-[10px] font-black shrink-0 ring-1 shadow-inner ${getGlassColor(meta.color)} uppercase tracking-widest`}>
                                        {meta.label}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-200 group-hover/activity:text-white transition-colors truncate">
                                            {log.action}
                                        </p>
                                        <div className="text-[10px] font-bold text-slate-500 mt-1.5 flex items-center gap-2 uppercase tracking-widest">
                                            <span className="text-primary truncate">{log.performed_by ?? 'System-bot'}</span>
                                            <span className="opacity-30">•</span>
                                            <span className="whitespace-nowrap">{formatDate(log.performed_at)}</span>
                                        </div>
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
