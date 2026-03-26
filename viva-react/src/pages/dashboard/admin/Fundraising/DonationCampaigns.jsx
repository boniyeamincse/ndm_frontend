import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../services/api';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';

const STATUS_OPTS = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const DonationCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [acting, setActing] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_amount: '',
        starts_at: '',
        ends_at: '',
        organizational_unit_id: '',
        status: 'active'
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [campRes, unitRes] = await Promise.all([
                api.get('/admin/fundraising/campaigns'),
                api.get('/admin/units')
            ]);
            setCampaigns(campRes?.data?.data?.data || []);
            setUnits(unitRes?.data?.data?.data || unitRes?.data?.data || []);
        } catch (err) {
            showToast('Failed to load fundraising data.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleOpenModal = (camp = null) => {
        if (camp) {
            setEditing(camp.id);
            setFormData({
                title: camp.title,
                description: camp.description || '',
                target_amount: camp.target_amount,
                starts_at: camp.starts_at?.split(' ')[0] || '',
                ends_at: camp.ends_at?.split(' ')[0] || '',
                organizational_unit_id: String(camp.unit?.id || ''),
                status: String(camp.status || 'active')
            });
        } else {
            setEditing(null);
            setFormData({
                title: '',
                description: '',
                target_amount: '',
                starts_at: new Date().toISOString().split('T')[0],
                ends_at: '',
                organizational_unit_id: '',
                status: 'active'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActing(true);
        try {
            if (editing) {
                await api.put(`/admin/fundraising/campaigns/${editing}`, formData);
                showToast('Campaign updated successfully.');
            } else {
                await api.post('/admin/fundraising/campaigns', formData);
                showToast('New campaign launched!');
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Operation failed.', 'error');
        } finally {
            setActing(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30 group-hover:bg-primary/10 transition-all pointer-events-none" />
                <div className="relative">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Financial Operations</p>
                    <h1 className="mt-3 text-3xl font-black text-white tracking-tight uppercase">Fundraising Campaigns</h1>
                    <p className="text-sm font-medium text-slate-400 mt-2">Strategic resource generation for organizational growth.</p>
                </div>
                <Button 
                    onClick={() => handleOpenModal()}
                    className="relative px-8 py-4 bg-primary hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 shrink-0"
                >
                    + Launch Campaign
                </Button>
            </div>

            {/* Campaign Grid */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-[2rem] bg-white/5 border border-white/10" />
                    ))}
                </div>
            ) : (campaigns?.length || 0) === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-24 text-center">
                    <div className="text-5xl mb-6 opacity-30">💰</div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">No Active Campaigns</h3>
                    <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest leading-relaxed">System operational — awaiting fundraising directives.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaigns?.map(camp => {
                        const percent = camp.target_amount > 0 ? Math.min(100, (camp.current_amount / camp.target_amount) * 100) : 0;
                        return (
                            <motion.div
                                key={camp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:bg-primary/10 transition-all" />
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ${camp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-amber-500/10 text-amber-400 ring-amber-500/20'}`}>
                                            {camp.status}
                                        </span>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-3">{camp.unit?.name || 'Central Fund'}</p>
                                    </div>
                                    <button onClick={() => handleOpenModal(camp)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                </div>

                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 line-clamp-1">{camp.title}</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">Collected</span>
                                        <span className="text-primary">{Number(camp.current_amount).toLocaleString()} BDT</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            className="h-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                                        <span>{percent.toFixed(1)}% Progress</span>
                                        <span>Target: {Number(camp.target_amount).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Timeline</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                            {new Date(camp.starts_at).getFullYear()} → {camp.ends_at ? new Date(camp.ends_at).getFullYear() : 'Ongoing'}
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Donors</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{camp.donations_count} Verified</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Launch/Edit Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Update Strategic Campaign" : "Launch Financial Protocol"}>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-12">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Campaign Title</label>
                            <Input 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                required
                                placeholder="E.G. EMERGENCY FLOOD RELIEF 2026"
                                className="bg-white/5 border-white/10 rounded-xl font-black uppercase text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Financial Target (BDT)</label>
                            <Input 
                                type="number"
                                value={formData.target_amount}
                                onChange={e => setFormData({...formData, target_amount: e.target.value})}
                                required
                                placeholder="500,000"
                                className="bg-white/5 border-white/10 rounded-xl font-black uppercase text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Strategic Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white uppercase focus:ring-2 focus:ring-primary/40 focus:outline-none min-h-[120px]"
                            placeholder="OUTLINE THE OBJECTIVE AND RESOURCE ALLOCATION PLAN..."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Starts At</label>
                            <Input 
                                type="date"
                                value={formData.starts_at}
                                onChange={e => setFormData({...formData, starts_at: e.target.value})}
                                required
                                className="bg-white/5 border-white/10 rounded-xl font-black uppercase text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ends At (Optional)</label>
                            <Input 
                                type="date"
                                value={formData.ends_at}
                                onChange={e => setFormData({...formData, ends_at: e.target.value})}
                                className="bg-white/5 border-white/10 rounded-xl font-black uppercase text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Organizational Node</label>
                            <select 
                                value={String(formData.organizational_unit_id || '')}
                                onChange={e => setFormData({...formData, organizational_unit_id: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-slate-900">CENTRAL_ADMIN (GLOBAL)</option>
                                {units?.map(u => <option key={u.id} value={String(u.id)} className="bg-slate-900">{String(u.name || '').toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Protocol Status</label>
                            <select 
                                value={String(formData.status || '')}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                            >
                                {STATUS_OPTS.map(o => <option key={o.value} value={o.value} className="bg-slate-900">{o.label.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="pt-6">
                         <Button 
                            className="w-full py-4 bg-primary hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                            isLoading={acting}
                            type="submit"
                        >
                            {editing ? 'Update Campaign Manifest' : 'Launch Fundraising Protocol'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-8 right-8 px-8 py-4 rounded-[2rem] border shadow-2xl z-50 flex items-center gap-4 ${
                            toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-primary/10 border-primary/20 text-primary'
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === 'error' ? 'bg-rose-400' : 'bg-primary'}`} />
                        <p className="text-[10px] font-black uppercase tracking-widest">{toast.msg}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DonationCampaigns;
