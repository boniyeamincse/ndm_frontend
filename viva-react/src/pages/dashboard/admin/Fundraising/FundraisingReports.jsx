import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../../../services/api';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';

const FundraisingReports = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [params, setParams] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        campaign_id: ''
    });

    const generateReport = async () => {
        setLoading(true);
        try {
            // Reusing stats endpoint for simulation or a specific reports endpoint if created
            const res = await api.get('/admin/fundraising/donations', { 
                params: { ...params, status: 'verified' } 
            });
            
            const donations = res.data.data.data;
            const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);
            
            const channelGroups = donations.reduce((acc, d) => {
                acc[d.payment_channel] = (acc[d.payment_channel] || 0) + Number(d.amount);
                return acc;
            }, {});

            setReportData({
                donations,
                total,
                channelGroups,
                count: donations.length
            });
        } catch (err) {
            console.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-slate-950/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Compliance Protocol</p>
                <h1 className="mt-3 text-3xl font-black text-white tracking-tight uppercase">Financial Transparency Reports</h1>
                
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Period Start</label>
                        <Input 
                            type="date" 
                            value={params.start_date}
                            onChange={e => setParams({...params, start_date: e.target.value})}
                            className="bg-white/5 border-white/10 rounded-xl text-[10px] font-black h-[42px]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Period End</label>
                        <Input 
                            type="date" 
                            value={params.end_date}
                            onChange={e => setParams({...params, end_date: e.target.value})}
                            className="bg-white/5 border-white/10 rounded-xl text-[10px] font-black h-[42px]"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button 
                            onClick={generateReport}
                            isLoading={loading}
                            className="w-full h-[42px] bg-primary text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all"
                        >
                            Execute Intelligence Audit
                        </Button>
                    </div>
                </div>
            </div>

            {/* Report Output */}
            {reportData ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Total Auditors Reconciled</p>
                            <p className="text-3xl font-black text-primary tracking-tighter">{reportData.total.toLocaleString()} BDT</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Contribution Instances</p>
                            <p className="text-3xl font-black text-white tracking-tighter">{reportData.count}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Average Ticket Size</p>
                            <p className="text-3xl font-black text-blue-400 tracking-tighter">
                                {reportData.count > 0 ? (reportData.total / reportData.count).toFixed(0).toLocaleString() : 0} BDT
                            </p>
                        </div>
                    </div>

                    {/* Channel Distribution */}
                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Channel Distribution Index</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                            {Object.entries(reportData.channelGroups).map(([channel, amount]) => (
                                <div key={channel} className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{channel}</p>
                                    <p className="text-xs font-black text-white">{amount.toLocaleString()} BDT</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ledger Export View */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Immutable Ledger Manifest</h3>
                            <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Download CSV Audit</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Date</th>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Entity</th>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Campaign</th>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Channel</th>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right">Volume</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {reportData.donations.map(don => (
                                        <tr key={don.id} className="text-[10px] font-bold text-slate-300">
                                            <td className="px-8 py-4">{don.created_at.split(' ')[0]}</td>
                                            <td className="px-8 py-4 text-white font-black uppercase tracking-tight">{don.donor_name}</td>
                                            <td className="px-8 py-4 uppercase tracking-tighter">{don.campaign_title}</td>
                                            <td className="px-8 py-4 uppercase">{don.payment_channel}</td>
                                            <td className="px-8 py-4 text-right font-black text-primary">{don.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-24 text-center opacity-50">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Awaiting parameter selection for audit generation...</p>
                </div>
            )}
        </div>
    );
};

export default FundraisingReports;
