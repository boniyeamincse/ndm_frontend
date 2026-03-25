import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const AuditActionMeta = (action) => {
    const a = (action ?? '').toLowerCase();
    const types = {
        'create': { label: 'Created', bg: 'bg-blue-100', text: 'text-blue-700', icon: '┼' },
        'update': { label: 'Updated', bg: 'bg-amber-100', text: 'text-amber-700', icon: '⟳' },
        'delete': { label: 'Deleted', bg: 'bg-red-100', text: 'text-red-700', icon: '✕' },
        'restore': { label: 'Restored', bg: 'bg-green-100', text: 'text-green-700', icon: '↻' },
        'approve': { label: 'Approved', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' },
        'reject': { label: 'Rejected', bg: 'bg-rose-100', text: 'text-rose-700', icon: '✗' },
        'promote': { label: 'Promoted', bg: 'bg-purple-100', text: 'text-purple-700', icon: '▲' },
        'demote': { label: 'Demoted', bg: 'bg-orange-100', text: 'text-orange-700', icon: '▼' },
        'login': { label: 'Login', bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '○' },
        'logout': { label: 'Logout', bg: 'bg-slate-100', text: 'text-slate-700', icon: '◉' },
        'export': { label: 'Exported', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '↗' },
        'assign': { label: 'Assigned', bg: 'bg-violet-100', text: 'text-violet-700', icon: '→' },
    };

    for (const [key, type] of Object.entries(types)) {
        if (a.includes(key)) return type;
    }

    return { label: action ?? 'Action', bg: 'bg-slate-100', text: 'text-slate-700', icon: '•' };
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="rounded-xl border border-primary-200/30 bg-gradient-to-br from-primary-50 to-primary-100/30 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500">Total Actions</p>
                    <p className="text-2xl font-black text-primary-900 mt-1">{logs.length}</p>
                </div>
                {statsByAction.map(([label, count]) => (
                    <div key={label} className="rounded-xl border border-slate-200/50 bg-white/50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{count}</p>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Date Range</label>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => {
                            setFilters({ ...filters, dateRange: e.target.value });
                            setPage(1);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-primary-200/40 bg-white text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                        <option value="day">Last 24 Hours</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last 3 Months</option>
                        <option value="">All Time</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subject</label>
                    <input
                        type="text"
                        placeholder="Filter by entity..."
                        value={filters.subject}
                        onChange={(e) => {
                            setFilters({ ...filters, subject: e.target.value });
                            setPage(1);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-primary-200/40 bg-white text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Action Type</label>
                    <select
                        value={filters.actionType}
                        onChange={(e) => {
                            setFilters({ ...filters, actionType: e.target.value });
                            setPage(1);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-primary-200/40 bg-white text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                        <option value="">All Actions</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="approve">Approve</option>
                        <option value="login">Login</option>
                    </select>
                </div>
            </div>

            {/* ── Logs Table ── */}
            <div className="rounded-2xl border border-primary-200/30 bg-gradient-to-br from-white via-white/95 to-primary-50/20 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    {loading && logs.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-500"
                            />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-slate-400 font-medium">No audit logs found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-primary-50/40 border-b border-primary-200/20">
                                <tr className="text-left text-[10px] uppercase tracking-widest text-primary-600 font-black">
                                    <th className="px-6 py-3">Action</th>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Details</th>
                                    <th className="px-6 py-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-100/30">
                                {logs.map((log, idx) => {
                                    const meta = AuditActionMeta(log.action);
                                    return (
                                        <motion.tr
                                            key={log.id || idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-primary-50/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg font-bold text-xs uppercase tracking-tighter ${meta.bg} ${meta.text}`}>
                                                    <span>{meta.icon}</span>
                                                    {meta.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-900 font-semibold">{log.subject_type || '—'}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">{log.subject_id || '—'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-900 font-medium">{log.user?.full_name || log.user?.name || 'System'}</p>
                                                <p className="text-[10px] text-slate-500">{log.user?.email || '—'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-600 text-xs font-medium max-w-xs truncate">
                                                    {log.description || log.action || '—'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-slate-600 text-[10px] font-mono whitespace-nowrap">{formatDate(log.created_at)}</p>
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
                    <div className="flex items-center justify-between px-6 py-4 border-t border-primary-200/20 bg-primary-50/20">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-primary-100 text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wider hover:bg-primary-200 transition-colors"
                        >
                            ← Previous
                        </button>
                        <span className="text-sm font-medium text-slate-600">Page {page}</span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={!hasMore && logs.length === 0}
                            className="px-4 py-2 rounded-lg bg-primary-100 text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wider hover:bg-primary-200 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AuditLogs;
