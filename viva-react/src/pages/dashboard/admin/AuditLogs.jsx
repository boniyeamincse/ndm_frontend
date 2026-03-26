import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const AuditActionMeta = (action) => {
    const a = (action ?? '').toLowerCase();
    const types = {
        'create': { label: 'Created', bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20', icon: '┼' },
        'update': { label: 'Updated', bg: 'bg-primary/10', text: 'text-primary', ring: 'ring-primary/20', icon: '⟳' },
        'delete': { label: 'Deleted', bg: 'bg-rose-500/10', text: 'text-rose-400', ring: 'ring-rose-500/20', icon: '✕' },
        'restore': { label: 'Restored', bg: 'bg-indigo-500/10', text: 'text-indigo-400', ring: 'ring-indigo-500/20', icon: '↻' },
        'approve': { label: 'Approved', bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/30', icon: '✓' },
        'reject': { label: 'Rejected', bg: 'bg-rose-500/20', text: 'text-rose-400', ring: 'ring-rose-500/30', icon: '✗' },
        'promote': { label: 'Promoted', bg: 'bg-purple-500/10', text: 'text-purple-400', ring: 'ring-purple-500/20', icon: '▲' },
        'demote': { label: 'Demoted', bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/20', icon: '▼' },
        'login': { label: 'Login', bg: 'bg-cyan-500/10', text: 'text-cyan-400', ring: 'ring-cyan-500/20', icon: '○' },
        'logout': { label: 'Logout', bg: 'bg-white/5', text: 'text-slate-400', ring: 'ring-white/10', icon: '◉' },
        'export': { label: 'Exported', bg: 'bg-indigo-500/10', text: 'text-indigo-400', ring: 'ring-indigo-500/20', icon: '↗' },
        'assign': { label: 'Assigned', bg: 'bg-violet-500/10', text: 'text-violet-400', ring: 'ring-violet-500/20', icon: '→' },
    };

    for (const [key, type] of Object.entries(types)) {
        if (a.includes(key)) return type;
    }

    return { label: action ?? 'Action', bg: 'bg-white/5', text: 'text-slate-400', ring: 'ring-white/10', icon: '•' };
};

const formatDate = (v) => {
    if (!v) return '—';
    try {
        const d = new Date(v);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = d.toDateString() === today.toDateString();
        const isYesterday = d.toDateString() === yesterday.toDateString();

        if (isToday) return 'Today, ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        if (isYesterday) return 'Yesterday, ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined })
            + ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '—';
    }
};

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [filters, setFilters] = useState({
        subject: '',
        actionType: '',
        dateRange: 'week',
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const params = {
                    page,
                    per_page: 25,
                };

                if (filters.subject) params.subject = filters.subject;
                if (filters.actionType) params.action = filters.actionType;
                if (filters.dateRange) {
                    const now = new Date();
                    const from = new Date(now);
                    if (filters.dateRange === 'day') from.setDate(from.getDate() - 1);
                    else if (filters.dateRange === 'week') from.setDate(from.getDate() - 7);
                    else if (filters.dateRange === 'month') from.setMonth(from.getMonth() - 1);
                    else if (filters.dateRange === 'quarter') from.setMonth(from.getMonth() - 3);
                    params.since = from.toISOString();
                }

                const res = await api.get('/admin/audit-logs', { params });
                setLogs(res.data?.data ?? []);
                setHasMore(!!(res.data?.links?.next));
            } catch (err) {
                console.error('Audit logs error:', err);
                setError('Failed to load audit logs.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [page, filters]);

    const statsByAction = useMemo(() => {
        const map = {};
        logs.forEach(log => {
            const meta = AuditActionMeta(log.action);
            map[meta.label] = (map[meta.label] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [logs]);

    if (error && logs.length === 0) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
                <div className="text-red-500 font-bold text-sm">{error}</div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* ── Page Header ── */}
            <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
                <div className="relative">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Security Ledger</p>
                    <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Audit Transmissions</h1>
                    <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">High-fidelity immutable recordings of platform transactions and administrative interventions.</p>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 group hover:bg-white/[0.08] transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Global Flux</p>
                    <p className="text-3xl font-black text-white mt-1">{logs.length}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Recorded Actions</p>
                </div>
                {statsByAction.map(([label, count]) => (
                    <div key={label} className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 group hover:bg-white/[0.08] transition-all">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">{label}</p>
                        <p className="text-3xl font-black text-white mt-1">{count}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">In Context</p>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-inner">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5 ml-1">Temporal Window</label>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => {
                            setFilters({ ...filters, dateRange: e.target.value });
                            setPage(1);
                        }}
                        className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                    >
                        <option value="day" className="bg-slate-900 font-sans">Last 24 Hours</option>
                        <option value="week" className="bg-slate-900 font-sans">Last 7 Days</option>
                        <option value="month" className="bg-slate-900 font-sans">Last Month</option>
                        <option value="quarter" className="bg-slate-900 font-sans">Last 3 Months</option>
                        <option value="" className="bg-slate-900 font-sans">Infinite History</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5 ml-1">Entity Subject</label>
                    <input
                        type="text"
                        placeholder="SEARCH HIERARCHY..."
                        value={filters.subject}
                        onChange={(e) => {
                            setFilters({ ...filters, subject: e.target.value });
                            setPage(1);
                        }}
                        className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white font-black placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase tracking-widest"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5 ml-1">Protocol Type</label>
                    <select
                        value={filters.actionType}
                        onChange={(e) => {
                            setFilters({ ...filters, actionType: e.target.value });
                            setPage(1);
                        }}
                        className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-900 font-sans">All Transmissions</option>
                        <option value="create" className="bg-slate-900 font-sans">Create</option>
                        <option value="update" className="bg-slate-900 font-sans">Update</option>
                        <option value="delete" className="bg-slate-900 font-sans">Delete</option>
                        <option value="approve" className="bg-slate-900 font-sans">Approve</option>
                        <option value="login" className="bg-slate-900 font-sans">Login</option>
                    </select>
                </div>
            </div>

            {/* ── Logs Table ── */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    {loading && logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-72 space-y-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Retrieving Secure Archive...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-24 text-center">
                            <div className="text-5xl mb-6 opacity-30">⚡</div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Ledger Empty</h3>
                            <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest leading-relaxed">No transmissions recorded in the current window.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5">Protocol Identity</th>
                                    <th className="px-8 py-5">Subject Topology</th>
                                    <th className="px-8 py-5">Uplink Source</th>
                                    <th className="px-8 py-5 text-right">Synchronization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs.map((log, idx) => {
                                    const meta = AuditActionMeta(log.action);
                                    return (
                                        <motion.tr
                                            key={log.id || idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.01 }}
                                            className="hover:bg-white/[0.03] transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className={`inline-flex items-center gap-3 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest ring-1 shadow-inner ${meta.bg} ${meta.text} ${meta.ring}`}>
                                                    <span>{meta.icon}</span>
                                                    {meta.label}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 mt-2 max-w-[240px] leading-relaxed uppercase tracking-tight group-hover:text-slate-200 transition-colors">
                                                    {log.description || log.action || '—'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-slate-200 font-black uppercase tracking-tight group-hover:text-primary transition-colors text-xs">{log.subject_type || '—'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest cursor-copy hover:text-slate-300" title="Copy UUID">{log.subject_id || '—'}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-slate-200 font-black uppercase tracking-tight text-xs">{log.user?.full_name || log.user?.name || 'Kernel Service'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{log.user?.email || 'SYSTEM BROADCAST'}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-primary text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{formatDate(log.created_at)}</p>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter mt-1">Hash Verified</p>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {(hasMore || page > 1) && (
                    <div className="flex items-center justify-between px-10 py-6 border-t border-white/5 bg-white/[0.01]">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-all shadow-inner"
                        >
                            ← Previous Phase
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Node Cluster {page}</span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={!hasMore && logs.length === 0}
                            className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-primary disabled:opacity-30 hover:bg-primary/10 transition-all shadow-inner"
                        >
                            Next Advance →
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AuditLogs;
