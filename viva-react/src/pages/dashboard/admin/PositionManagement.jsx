import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';

const formatDate = (val) => val ? new Date(val).toLocaleDateString() : '—';

const PositionManagement = () => {
    const [positions, setPositions] = useState([]);
    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ member_id: '', role_id: '', unit_id: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({ unit_id: '', role_id: '' });

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        fetchPositions();
    }, [filter]);

    const loadDropdowns = async () => {
        try {
            const [membersRes, rolesRes, unitsRes] = await Promise.all([
                api.get('/admin/members'),
                api.get('/admin/roles'),
                api.get('/admin/units'),
            ]);
            setMembers(membersRes.data.data?.data || membersRes.data.data || []);
            setRoles(rolesRes.data.data || []);
            setUnits(unitsRes.data.data || []);
        } catch (err) {
            console.error('Failed to load dropdown data', err);
        }
    };

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ is_active: '1' });
            if (filter.unit_id) params.set('unit_id', filter.unit_id);
            if (filter.role_id) params.set('role_id', filter.role_id);
            const res = await api.get(`/admin/positions?${params}`);
            setPositions(res.data.data?.data || res.data.data || []);
        } catch (err) {
            console.error('Failed to load positions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.post('/admin/positions', form);
            setShowModal(false);
            setForm({ member_id: '', role_id: '', unit_id: '', notes: '' });
            fetchPositions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign position.');
        } finally {
            setSaving(false);
        }
    };

    const handleRelieve = async (id) => {
        if (!window.confirm('Relieve this position? The action will be logged to position history.')) return;
        try {
            await api.delete(`/admin/positions/${id}`);
            fetchPositions();
        } catch (err) {
            console.error('Failed to relieve position', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
            {/* ── Page Header ── */}
            <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Governance Layer</p>
                        <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Authority Node Registry</h1>
                        <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Assign and monitor active leadership nodes across the organizational topology. Manage real-time authority distribution and unit placement.</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <Link to="/dashboard/admin/positions/history" className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl">
                            View History Protocol →
                        </Link>
                        <Button onClick={() => { setError(''); setShowModal(true); }} variant="accent" className="font-black uppercase tracking-widest text-[10px] py-4 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            + Initialize Assignment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex flex-wrap gap-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-20" />
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Topology Unit</label>
                    <select
                        value={filter.unit_id}
                        onChange={e => setFilter(f => ({ ...f, unit_id: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[10px] text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer hover:bg-white/[0.08] transition-all"
                    >
                        <option value="" className="bg-slate-900">ALL_UNITS</option>
                        {units.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name?.toUpperCase() || 'UNKNOWN_UNIT'}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Governance Role</label>
                    <select
                        value={filter.role_id}
                        onChange={e => setFilter(f => ({ ...f, role_id: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[10px] text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer hover:bg-white/[0.08] transition-all"
                    >
                        <option value="" className="bg-slate-900">ALL_ROLES</option>
                        {roles.map(r => <option key={r.id} value={r.id} className="bg-slate-900">{r.name?.toUpperCase() || 'UNKNOWN_ROLE'}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
                
                {loading ? (
                    <div className="flex justify-center py-32 relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-2xl" />
                    </div>
                ) : positions.length === 0 ? (
                    <div className="p-32 text-center relative border border-white/5 rounded-[2rem] mx-8 my-8">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No active governance nodes mapped in current topology.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto relative">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    {['Member Entity', 'Designated Role', 'Active Unit', 'Assigned', 'Origin Operator', ''].map(h => (
                                        <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {positions.map((pos) => (
                                    <tr key={pos.id} className="hover:bg-white/[0.04] transition-all group/row">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="font-black text-white uppercase tracking-tight group-hover/row:text-primary transition-colors">{pos.member?.full_name ?? '—'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{pos.member?.member_id ?? ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-slate-300 font-black uppercase tracking-tight px-3 py-1 rounded-lg bg-white/5 border border-white/10 shadow-inner">{pos.role?.name ?? '—'}</span>
                                        </td>
                                        <td className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">{pos.unit?.name ?? '—'}</td>
                                        <td className="px-6 py-5 text-slate-500 font-bold tabular-nums text-[10px] whitespace-nowrap">{formatDate(pos.assigned_at)}</td>
                                        <td className="px-6 py-5 text-slate-500 font-black uppercase tracking-widest text-[9px]">{pos.assigned_by?.name ?? 'SYSTEM'}</td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => handleRelieve(pos.id)}
                                                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
                                            >
                                                Termination Protocol
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Assign Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                        
                        <div className="p-10 border-b border-white/5 relative">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Assignment Prototype</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 px-1">Injecting authority node into the organizational lattice.</p>
                        </div>
                        
                        <form onSubmit={handleAssign} className="p-10 space-y-8 relative">
                            {error && (
                                <div className="px-6 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-3 animate-pulse">
                                    <span className="text-lg">⚠</span> {error}
                                </div>
                            )}
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Member Entity</label>
                                    <select
                                        value={form.member_id}
                                        onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900">IDENTIFY ENTITY...</option>
                                        {members.map(m => (
                                            <option key={m.id} value={m.id} className="bg-slate-900">{m.full_name?.toUpperCase()} ({m.member_id ?? 'PENDING'})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Designated Role</label>
                                        <select
                                            value={form.role_id}
                                            onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900">SELECT_ROLE</option>
                                            {roles.map(r => <option key={r.id} value={r.id} className="bg-slate-900">{r.name?.toUpperCase() || 'UNKNOWN_ROLE'}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Unit</label>
                                        <select
                                            value={form.unit_id}
                                            onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900">SELECT_UNIT</option>
                                            {units.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name?.toUpperCase() || 'UNKNOWN_UNIT'}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Protocol Remarks (OPTIONAL)</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-slate-700 resize-none shadow-inner"
                                        rows={3}
                                        value={form.notes}
                                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="INPUT ANNOTATIONS..."
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-4">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-white transition-colors">Abort Ingress</Button>
                                <Button type="submit" variant="accent" isLoading={saving} className="font-black uppercase tracking-widest text-[10px] px-10 py-4 shadow-xl shadow-primary/20">Commit Ingress</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PositionManagement;
