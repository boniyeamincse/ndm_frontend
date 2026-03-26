import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../../../services/api';
import { Link } from 'react-router-dom';

const FundraisingDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/fundraising/stats');
            setStats(res.data.data);
        } catch (err) {
            console.error('Failed to load fundraising stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    if (loading) return <div className="p-8 animate-pulse space-y-8">
        <div className="h-64 bg-white/5 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
    </div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-slate-950/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Command</p>
                    <h1 className="mt-4 text-4xl font-black text-white tracking-tighter uppercase leading-none">Fundraising Center</h1>
                    <p className="mt-4 text-slate-400 text-sm font-medium max-w-xl leading-relaxed">System-wide financial telemetry and resource allocation tracking.</p>
                </div>
                
                <div className="mt-10 flex flex-wrap gap-4 relative z-10">
                    <Link to="/dashboard/admin/fundraising/campaigns" className="px-6 py-3 bg-primary text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all">Manage Campaigns</Link>
                    <Link to="/dashboard/admin/fundraising/donations" className="px-6 py-3 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 border border-white/10 transition-all">View Ledger</Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Collected" value={`${stats?.total_verified_amount?.toLocaleString()} BDT`} icon="💰" color="emerald" />
                <StatCard label="Awaiting Verification" value={`${stats?.total_pending_amount?.toLocaleString()} BDT`} icon="⏳" color="amber" />
                <StatCard label="30D Contribution Vol" value={stats?.recent_donations_count} icon="📈" color="blue" />
                <StatCard label="Active Drives" value={stats?.campaign_performance?.length} icon="🎯" color="violet" />
            </div>

            {/* Campaign Performance */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Campaign Velocity
                    </h3>
                    
                    <div className="space-y-8">
                        {stats?.campaign_performance?.map((camp, idx) => (
                            <div key={idx} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-tight">{camp.title}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Goal: {camp.target.toLocaleString()} BDT</p>
                                    </div>
                                    <span className="text-[10px] font-black text-primary tracking-widest">{camp.percent}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${camp.percent}%` }}
                                        className="h-full bg-gradient-to-r from-emerald-600 to-primary shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col justify-center items-center text-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-3xl mb-6 ring-1 ring-primary/20">🏦</div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Compliance & Auditing</h3>
                    <p className="mt-4 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs">
                        All financial data is immutable and linked to administrative verification logs for total transparency.
                    </p>
                    <Link to="/dashboard/admin/fundraising/reports" className="mt-8 px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-white transition-all">
                        Execute Period Report
                    </Link>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-xl group hover:border-white/20 transition-all relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-${color}-500/10 transition-all`} />
        <div className="flex items-center gap-4 mb-4">
            <span className="text-xl">{icon}</span>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</p>
        </div>
        <p className={`text-2xl font-black text-${color === 'emerald' ? 'primary' : color + '-400'} tracking-tighter leading-none`}>{value}</p>
    </div>
);

export default FundraisingDashboard;
