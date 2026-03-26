import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

const CommitteeManagement = () => {
    const [committees, setCommittees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', level: 'central', parent_id: '', status: 'active' });
    const [saving, setSaving] = useState(false);

    const levels = [
        { id: 'central', name: 'Central (National)' },
        { id: 'division', name: 'Division' },
        { id: 'district', name: 'District / Metro' },
        { id: 'upazila', name: 'Upazila / Thana' },
        { id: 'union', name: 'Union / Ward' },
        { id: 'institutional', name: 'Institutional' },
    ];

    useEffect(() => {
        fetchCommittees();
    }, []);

    const fetchCommittees = async () => {
        try {
            const res = await api.get('/admin/committees');
            setCommittees(res.data.data || []);
        } catch (error) {
            console.error('Failed to load committees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/admin/committees', form);
            setShowModal(false);
            setForm({ name: '', level: 'central', parent_id: '', status: 'active' });
            fetchCommittees();
        } catch (error) {
            console.error('Failed to create committee', error);
        } finally {
            setSaving(false);
        }
    };

    const getLevelBadgeColor = (level) => {
        switch (level) {
            case 'central': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'division': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'district': return 'bg-teal-100 text-teal-700 border-teal-200';
            case 'upazila': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
                        <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Organizational Topology</h1>
                        <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Architect and manage the 5-tier political hierarchy system. Define structural nodes and institutional clusters.</p>
                    </div>
                    <Button onClick={() => setShowModal(true)} variant="accent" className="gap-2 shrink-0 font-black uppercase tracking-widest text-[10px] py-4 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        + Initialize New Unit
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Syncing Hierarchy Matrix...</p>
                </div>
            ) : committees.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-20 text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-30 blur-3xl" />
                    <div className="relative">
                        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-bounce">
                            📁
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">No Units Detected</h3>
                        <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium text-sm leading-relaxed">The organizational map is currently vacant. Initialize the Central Committee to begin cluster propagation.</p>
                        <Button onClick={() => setShowModal(true)} variant="outline" className="mt-8 font-black uppercase tracking-widest text-[10px] px-10 py-4">Begin Initialization</Button>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {committees.map((committee) => (
                        <div
                            key={committee.id}
                            className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl hover:shadow-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all p-8 relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex justify-between items-start mb-6 relative">
                                <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border bg-white/5 ${getLevelBadgeColor(committee.level).replace('bg-', 'text-').replace('-100', '-400').replace('text-700', '').replace('border-', 'border-')}`}>
                                    {committee.level}
                                </div>
                                <div className="text-slate-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-black text-white mb-2 leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">{committee.name}</h3>
                            <p className="text-xs font-bold text-slate-500 mb-8 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                {committee.parent ? `Sub-unit of ${committee.parent.name}` : 'PRIMARY_ROOT_NODE'}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md ring-1 ${committee.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-400 ring-rose-500/20'}`}>
                                    {committee.status}
                                </span>
                                <Link to={`/dashboard/admin/settings/committees/${committee.id}`}>
                                    <Button variant="outline" size="sm" className="font-black uppercase tracking-widest text-[9px] px-5 border-white/10 hover:bg-white/10">
                                        Access Registry
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        
                        <div className="p-10 border-b border-white/5 relative">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Initialize Unit</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Define new operational coordinates in the hierarchy.</p>
                        </div>
                        
                        <form onSubmit={handleCreate} className="p-10 space-y-8 relative">
                            <div className="space-y-6">
                                <Input
                                    label="Unit Designation"
                                    placeholder="ENTER UNIT NAME (E.G. DHAKA NORTH)"
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    required
                                    className="bg-white/5 border-white/10 text-white font-black uppercase placeholder-slate-800"
                                />
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Hierarchy Level</label>
                                        <select
                                            value={form.level}
                                            onChange={e => setForm({...form, level: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                                        >
                                            {levels.map(l => (
                                                <option key={l.id} value={l.id} className="bg-slate-900">{l.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {form.level !== 'central' && (
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Parent Node</label>
                                            <select
                                                value={form.parent_id}
                                                onChange={e => setForm({...form, parent_id: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-slate-900">SELECT PARENT...</option>
                                                {committees.map(c => (
                                                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-4">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-white">Cancel</Button>
                                <Button type="submit" variant="accent" isLoading={saving} className="font-black uppercase tracking-widest text-[10px] px-10 py-4 shadow-xl shadow-primary/20">Commit Initialization</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CommitteeManagement;
