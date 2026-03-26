import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';

const formatDate = (val) => val ? new Date(val).toLocaleString() : '—';

const ACTION_COLORS = {
    assigned:    'bg-green-100 text-green-700',
    relieved:    'bg-amber-100 text-amber-700',
    transferred: 'bg-blue-100 text-blue-700',
};

const PositionHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: '' });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchHistory();
    }, [filter, page]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (filter.action) params.set('action', filter.action);
            const res = await api.get(`/admin/positions/history?${params}`);
            const payload = res.data.data;
            setRecords(payload?.data || payload || []);
            if (payload?.current_page) {
                setPagination({ current_page: payload.current_page, last_page: payload.last_page });
            }
        } catch (err) {
            console.error('Failed to load position history', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (action) => {
        setFilter({ action });
        setPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
            {/* ── Page Header ── */}
            <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Governance Audit</p>
                        <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Authority Chain Audit</h1>
                        <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Complete historical manifest of all position assignments, transfers, and reliefs across the organizational topology.</p>
                    </div>
                    <Link to="/dashboard/admin/positions" className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl">
                        ← Active Positions
                    </Link>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-xl">
                <div className="w-64 space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Event Vector</label>
                    <select
                        value={filter.action}
                        onChange={e => handleFilterChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[10px] text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer hover:bg-white/[0.08] transition-all"
                    >
                        <option value="" className="bg-slate-900">ALL_ACTIONS</option>
                        <option value="assigned" className="bg-slate-900">ASSIGNED_STATUS</option>
                        <option value="relieved" className="bg-slate-900">RELIEVED_STATUS</option>
                        <option value="transferred" className="bg-slate-900">TRANSFERRED_STATUS</option>
                    </select>
                </div>
                <div className="flex-1 border-l border-white/5 pl-6">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Querying temporal records for governance forensics.</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
                
                {loading ? (
                    <div className="flex justify-center py-32 relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-2xl" />
                    </div>
                ) : records.length === 0 ? (
                    <div className="p-32 text-center relative">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No historical vectors detected in current query range.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto relative">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    {['Member Entity', 'Designated Role', 'Topology Unit', 'Event Type', 'Operator', 'Timestamp', 'Forensics'].map(h => (
                                        <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {records.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-white/[0.04] transition-all group/row">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="font-black text-white uppercase tracking-tight group-hover/row:text-primary transition-colors">{rec.member?.full_name ?? '—'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{rec.member?.member_id ?? ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-300 font-black uppercase tracking-tight">{rec.role?.name ?? '—'}</td>
                                        <td className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">{rec.unit?.name ?? '—'}</td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-black text-[9px] uppercase tracking-widest ring-1 shadow-inner ${rec.action === 'assigned' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : rec.action === 'relieved' ? 'bg-rose-500/10 text-rose-400 ring-rose-500/20' : 'bg-blue-500/10 text-blue-400 ring-blue-500/20'}`}>
                                                <span className={`w-1 h-1 rounded-full ${rec.action === 'assigned' ? 'bg-emerald-400' : rec.action === 'relieved' ? 'bg-rose-400' : 'bg-blue-400'}`} />
                                                {rec.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 font-black uppercase tracking-widest text-[9px]">{rec.performed_by?.name ?? 'SYSTEM'}</td>
                                        <td className="px-6 py-5 text-slate-500 font-bold tabular-nums text-[10px] whitespace-nowrap">{formatDate(rec.performed_at)}</td>
                                        <td className="px-6 py-5">
                                            <div className="max-w-[150px] truncate text-[10px] text-slate-600 font-medium italic" title={rec.remarks}>{rec.remarks ?? 'NO_REMARKS'}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-6 px-10 py-8 bg-white/5 border-t border-white/10 relative">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-6 py-3 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                        >
                            ← PREV_BLOCK
                        </button>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                            BLOCK {pagination.current_page} OF {pagination.last_page}
                        </span>
                        <button
                            disabled={page >= pagination.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-3 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                        >
                            NEXT_BLOCK →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PositionHistory;
