import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiUserPlus, FiTrash2, FiShield } from 'react-icons/fi';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';

const CommitteeDetail = () => {
    const { id } = useParams();
    const [committee, setCommittee] = useState(null);
    const [members, setMembers] = useState([]); // All system members for the dropdown
    const [loading, setLoading] = useState(true);
    
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [form, setForm] = useState({ member_id: '', designation: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const OFFICIAL_ROLES = [
        'President', 'Vice President', 'General Secretary', 'Joint General Secretary',
        'Organizing Secretary', 'Office Secretary', 'Finance Secretary / Treasurer',
        'Publicity Secretary', 'Information & Research Secretary', 'Education Affairs Secretary',
        'Cultural Secretary', 'Social Welfare Secretary', 'Sports Secretary',
        'Legal Affairs Secretary', 'International Affairs Secretary', 
        'Executive Member', 'General Member'
    ];

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [commRes, memRes] = await Promise.all([
                api.get(`/admin/committees/${id}`),
                api.get('/admin/members')
            ]);
            setCommittee(commRes.data.data);
            setMembers(memRes.data.data.data || memRes.data.data || []);
        } catch (error) {
            console.error('Failed to load detail data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.post(`/admin/committees/${id}/members`, form);
            setShowAssignModal(false);
            setForm({ member_id: '', designation: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign role. Member mighty already hold this designation.');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveRole = async (roleId) => {
        if (!window.confirm('Are you sure you want to remove this member from the committee?')) return;
        try {
            await api.delete(`/admin/committees/${id}/roles/${roleId}`);
            fetchData();
        } catch (error) {
            console.error('Failed to remove role', error);
        }
    };

    if (loading) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!committee) return <div className="text-center py-32">Committee not found.</div>;

    // Group roles visually
    const activeRoles = committee.roles?.filter(r => r.status === 'active') || [];
    const leadershipRoles = activeRoles.filter(r => r.designation !== 'General Member' && r.designation !== 'Executive Member');
    
    const filteredRoles = activeRoles.filter(r => {
        const search = searchTerm.toLowerCase();
        return (
            r.member?.full_name?.toLowerCase().includes(search) ||
            r.member?.member_id?.toLowerCase().includes(search) ||
            r.designation?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
            {/* ── Navigation ── */}
            <Link to="/dashboard/admin/settings" className="inline-flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary transition-all group">
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Governance Matrix
            </Link>

            {/* ── Page Header ── */}
            <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-4 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.2em] shadow-inner">
                                {committee.level}
                            </span>
                            <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-inner ring-1 ${committee.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-400 ring-rose-500/20'}`}>
                                {committee.status}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight uppercase truncate max-w-2xl">{committee.name}</h1>
                        <p className="text-sm font-medium text-slate-400 mt-2 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            Established Source: {committee.established_date || 'INITIAL_BLOCK'}
                        </p>
                    </div>
                    <Button onClick={() => setShowAssignModal(true)} variant="accent" className="gap-2 shrink-0 font-black uppercase tracking-widest text-[10px] py-4 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <FiUserPlus /> Assign Leadership
                    </Button>
                </div>
            </div>

            {/* ── Leadership Grid ── */}
            <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <FiShield className="text-primary" /> Primary Command Staff ({leadershipRoles.length})
                    </h3>
                </div>
                
                {leadershipRoles.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-12 text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 opacity-30 blur-3xl" />
                        <div className="relative text-slate-500 font-black uppercase tracking-widest text-[10px]">
                            No leadership nodes designated in current cluster.
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {leadershipRoles.map(role => (
                            <div key={role.id} className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl p-8 relative group overflow-hidden hover:bg-white/[0.07] hover:border-white/20 transition-all">
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button onClick={() => handleRemoveRole(role.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-inner group-hover:border-primary/40 transition-colors">
                                        {role.member?.photo_path ? (
                                            <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${role.member.photo_path}`} alt={role.member.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary font-black text-2xl uppercase">
                                                {role.member?.full_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-white text-lg leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">{role.member?.full_name}</h4>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{role.member?.member_id}</p>
                                        <div className="inline-block mt-3 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest">
                                            {role.designation}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Deployment Roster ── */}
            <div className="space-y-8 mt-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <FiShield className="text-slate-500" /> Full Deployment Roster ({activeRoles.length})
                        </h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 ml-8">Comprehensive personnel mapping for this node.</p>
                    </div>
                    <div className="relative w-full md:w-80 group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="SEARCH PERSONNEL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3.5 text-[10px] text-slate-200 font-black uppercase tracking-widest placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/10">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Personnel Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Assigned Role</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment ID</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No matching personnel detected in current query.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRoles.map(role => (
                                        <tr key={role.id} className="group hover:bg-white/[0.03] transition-all">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black text-xs uppercase group-hover:border-primary/40 transition-colors shadow-inner">
                                                        {role.member?.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-200 uppercase tracking-tight group-hover:text-white transition-colors">{role.member?.full_name}</p>
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{role.member?.mobile || 'NO_MOBILE_LINK'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${role.designation === 'General Member' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                    {role.designation}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{role.member?.member_id}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Deployed</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link to={`/dashboard/admin/members/${role.member?.id}`}>
                                                        <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">View Profile</button>
                                                    </Link>
                                                    <button onClick={() => handleRemoveRole(role.id)} className="p-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500/40 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                        <FiTrash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Assign Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                            
                            <div className="p-10 border-b border-white/5 relative">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Designate Leader</h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 px-1">Mapping authority node to {committee.name.toUpperCase()}</p>
                            </div>
                            
                            <form onSubmit={handleAssign} className="p-10 space-y-8 relative">
                                {error && (
                                    <div className="px-6 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-3">
                                        <span className="text-lg">⚠</span> {error}
                                    </div>
                                )}
                                
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Member Entity</label>
                                        <select
                                            value={form.member_id}
                                            onChange={e => setForm({...form, member_id: e.target.value})}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900">IDENTIFY MEMBER...</option>
                                            {members.map(m => (
                                                <option key={m.id} value={m.id} className="bg-slate-900">{m.full_name?.toUpperCase()} ({m.member_id})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assigned Designation</label>
                                        <select
                                            value={form.designation}
                                            onChange={e => setForm({...form, designation: e.target.value})}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900">SELECT ROLE...</option>
                                            {OFFICIAL_ROLES.map(r => (
                                                <option key={r} value={r} className="bg-slate-900">{r.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-4">
                                    <Button type="button" variant="ghost" onClick={() => setShowAssignModal(false)} className="font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-white">Cancel</Button>
                                    <Button type="submit" variant="accent" isLoading={saving} className="font-black uppercase tracking-widest text-[10px] px-10 py-4 shadow-xl shadow-primary/20">Commit Assignment</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommitteeDetail;
