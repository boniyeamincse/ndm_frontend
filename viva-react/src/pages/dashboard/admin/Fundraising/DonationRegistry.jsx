import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../services/api';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';

const STATUS_MAP = {
    pending: { color: 'amber', label: 'Pending' },
    verified: { color: 'emerald', label: 'Verified' },
    rejected: { color: 'rose', label: 'Rejected' }
};

const DonationRegistry = () => {
    const [donations, setDonations] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', campaign_id: '', transaction_id: '' });
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [actionNote, setActionNote] = useState('');
    const [acting, setActing] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [donRes, campRes] = await Promise.all([
                api.get('/admin/fundraising/donations', { params: filter }),
                api.get('/admin/fundraising/campaigns')
            ]);
            setDonations(donRes?.data?.data?.data || []);
            setCampaigns(campRes?.data?.data?.data || []);
        } catch (err) {
            showToast('Failed to load donation records.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAction = async (type) => {
        setActing(true);
        try {
            const endpoint = `/admin/fundraising/donations/${selectedDonation.id}/${type}`;
            await api.post(endpoint, { note: actionNote });
            showToast(`Donation ${type} successfully.`);
            setShowVerifyModal(false);
            setShowRejectModal(false);
            loadData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Operation failed.', 'error');
        } finally {
            setActing(false);
            setActionNote('');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header & Stats Banner */}
            <div className="bg-slate-950/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Financial Ledger</p>
                        <h1 className="mt-3 text-3xl font-black text-white tracking-tight uppercase">Contribution Registry</h1>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 min-w-[140px]">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Awaiting Verification</p>
                            <p className="text-xl font-black text-amber-400 mt-1">{donations?.filter(d => d.status === 'pending').length || 0}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 min-w-[140px]">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Verified Today</p>
                            <p className="text-xl font-black text-primary mt-1">{donations?.filter(d => d.status === 'verified').length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <select 
                        value={filter.status}
                        onChange={e => setFilter({...filter, status: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white tracking-widest focus:ring-2 focus:ring-primary/40 focus:outline-none appearance-none"
                    >
                        <option value="" className="bg-slate-900">ALL PROTOCOL STATES</option>
                        <option value="pending" className="bg-slate-900">PENDING_VERIFICATION</option>
                        <option value="verified" className="bg-slate-900">VERIFIED_CONTROLLERS</option>
                        <option value="rejected" className="bg-slate-900">REJECTED_ENTRIES</option>
                    </select>

                    <select 
                        value={filter.campaign_id}
                        onChange={e => setFilter({...filter, campaign_id: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white tracking-widest focus:ring-2 focus:ring-primary/40 focus:outline-none appearance-none"
                    >
                        <option value="" className="bg-slate-900">ALL CAMPAIGN STREAMS</option>
                        {campaigns?.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.title.toUpperCase()}</option>)}
                    </select>

                    <Input 
                        placeholder="SEARCH TRANSACTION ID..."
                        value={filter.transaction_id}
                        onChange={e => setFilter({...filter, transaction_id: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest h-[42px]"
                    />
                </div>
            </div>

            {/* Donation Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Donor & Intention</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Amount & Channel</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Reference/TXID</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Protocol State</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="h-20 bg-white/[0.02]" />
                                    </tr>
                                ))
                            ) : (donations?.length || 0) === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">No matching contribution records found.</td>
                                </tr>
                            ) : (
                                donations?.map(don => (
                                    <motion.tr 
                                        key={don.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-white/[0.03] transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                                                    {don.donor_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{don.donor_name}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{don.campaign_title}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-primary tracking-tight">{Number(don.amount).toLocaleString()} BDT</p>
                                            <p className="text-[9px] font-black text-slate-500 mt-1 uppercase tracking-widest">{don.payment_channel}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            {don.transaction_id ? (
                                                <code className="text-slate-300 text-[10px] bg-white/5 px-2 py-1 rounded-md font-mono">{don.transaction_id}</code>
                                            ) : (
                                                <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">NO_DIGITAL_SIGNATURE</span>
                                            )}
                                            <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{don.payment_reference || 'MANUAL_DEPOSIT'}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full bg-${STATUS_MAP[don.status].color}-400 shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest text-${STATUS_MAP[don.status].color}-400`}>
                                                    {STATUS_MAP[don.status].label}
                                                </span>
                                            </div>
                                            {don.verified_at && (
                                                <p className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-widest">BY: {don.verifier_name}</p>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {don.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        onClick={() => { setSelectedDonation(don); setShowVerifyModal(true); }}
                                                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-900 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                                    >
                                                        Verify
                                                    </Button>
                                                    <Button 
                                                        onClick={() => { setSelectedDonation(don); setShowRejectModal(true); }}
                                                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {don.status !== 'pending' && (
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic pr-4">LOCKED_MANIFEST</p>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verify Modal */}
            <Modal open={showVerifyModal} onClose={() => setShowVerifyModal(false)} title="Authenticate Contribution">
                <div className="p-8 space-y-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">Transaction ID</span>
                            <span className="text-white text-right font-mono">{selectedDonation?.transaction_id || 'N/A'}</span>
                            <span className="text-slate-500">Amount</span>
                            <span className="text-primary text-right">{selectedDonation?.amount?.toLocaleString()} BDT</span>
                            <span className="text-slate-500">Ref</span>
                            <span className="text-white text-right">{selectedDonation?.payment_reference || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Verification Intelligence Note</label>
                        <textarea 
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white uppercase focus:ring-2 focus:ring-primary/40 focus:outline-none min-h-[100px]"
                            placeholder="RECONCILED WITH BANK STATEMENT / BKASH PORTAL..."
                        />
                    </div>
                    <Button 
                        onClick={() => handleAction('verify')}
                        isLoading={acting}
                        className="w-full py-4 bg-primary text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20"
                    >
                        Commit Verification
                    </Button>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Contribution Record">
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-1 font-bold">Rejection Justification (Required)</label>
                        <textarea 
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                            className="w-full bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-xs font-bold text-white uppercase focus:ring-2 focus:ring-rose-500/40 focus:outline-none min-h-[120px]"
                            placeholder="EXPLAIN WHY THIS RECORD WAS REJECTED (e.g. INVALID TRANSACTION ID)..."
                        />
                    </div>
                    <Button 
                        onClick={() => handleAction('reject')}
                        isLoading={acting}
                        disabled={!actionNote.trim()}
                        className="w-full py-4 bg-rose-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-rose-900/20"
                    >
                        Confirm Rejection
                    </Button>
                </div>
            </Modal>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`fixed bottom-8 right-8 px-8 py-4 rounded-[2rem] border shadow-2xl z-50 flex items-center gap-4 ${
                            toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-primary/10 border-primary/20 text-primary'
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-400' : 'bg-primary'}`} />
                        <p className="text-[10px] font-black uppercase tracking-widest">{toast.msg}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DonationRegistry;
