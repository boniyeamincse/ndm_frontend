import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const SystemMonitoring = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Mock data for now - would connect to backend health endpoint
        setSystemHealth({
          status: 'healthy',
          uptime: '24d 14h 32m',
          lastCheck: new Date().toLocaleString(),
          cpu: 34,
          memory: 62,
          disk: 48,
          database: 'operational',
          cache: 'operational',
          api: 'operational',
          mail: 'operational',
          totalRequests: 125432,
          errorRate: 0.23,
          avgResponseTime: 142,
          activeUsers: 47,
          failedLogins: 3,
        });
      } catch (err) {
        setError('Failed to load system health data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Initializing Telemetry Mesh...</p>
      </div>
    );

  const getPercentColor = (value) => {
    if (value < 60) return 'bg-emerald-500';
    if (value < 80) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Core Intelligence</p>
          <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">System Monitoring</h1>
          <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Real-time telemetry and resource supervision across the NDM Student Movement global cluster.</p>
          <div className="flex items-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] leading-none">Last sync: {systemHealth?.lastCheck}</p>
          </div>
        </div>
      </div>

      {/* ── Overall Health ── */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-xl p-8 group relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System State</p>
          <p className="text-3xl font-black text-white mt-4 uppercase tracking-tighter">{systemHealth?.status === 'healthy' ? '✓ Nominal' : '⚠ Warning'}</p>
          <p className="text-[10px] font-bold text-emerald-600/60 mt-2 uppercase tracking-widest">Uptime: {systemHealth?.uptime}</p>
        </div>

        <div className="rounded-[2rem] border border-primary/20 bg-primary/10 backdrop-blur-xl p-8 group relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Traffic</p>
          <p className="text-3xl font-black text-white mt-4 uppercase tracking-tighter">{systemHealth?.activeUsers}</p>
          <p className="text-[10px] font-bold text-primary/60 mt-2 uppercase tracking-widest">Active Units</p>
        </div>

        <div className="rounded-[2rem] border border-indigo-500/20 bg-indigo-500/10 backdrop-blur-xl p-8 group relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 blur-2xl" />
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Latency Flux</p>
          <p className="text-3xl font-black text-white mt-4 uppercase tracking-tighter">{systemHealth?.avgResponseTime}ms</p>
          <p className="text-[10px] font-bold text-indigo-600/60 mt-2 uppercase tracking-widest">Avg Pulse</p>
        </div>

        <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/10 backdrop-blur-xl p-8 group relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full -mr-12 -mt-12 blur-2xl" />
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Chaos Index</p>
          <p className="text-3xl font-black text-white mt-4 uppercase tracking-tighter">{systemHealth?.errorRate}%</p>
          <p className="text-[10px] font-bold text-rose-600/60 mt-2 uppercase tracking-widest">Error Vectors</p>
        </div>
      </div>

      {/* ── Resource Usage ── */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'CPU LOAD', value: systemHealth?.cpu, unit: '%' },
          { label: 'MEMORY LOAD', value: systemHealth?.memory, unit: '%' },
          { label: 'STORAGE LOAD', value: systemHealth?.disk, unit: '%' },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 group hover:bg-white/[0.08] transition-all shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">{item.label}</p>
            <p className="text-4xl font-black text-white mt-4">{item.value}{item.unit}</p>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full opacity-80 group-hover:opacity-100 transition-opacity ${getPercentColor(item.value)}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Service Status ── */}
      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Service Mesh Status</h2>
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-500/20 shadow-inner">All Systems Nominal</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'POSTGRES DB', status: systemHealth?.database },
            { name: 'REDIS CACHE', status: systemHealth?.cache },
            { name: 'VITE API', status: systemHealth?.api },
            { name: 'SMTP MAIL', status: systemHealth?.mail },
          ].map((service) => {
            const isOp = service.status === 'operational';
            return (
                <div key={service.name} className={`rounded-2xl border p-6 transition-all group/item hover:bg-white/[0.04] backdrop-blur-sm ${isOp ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-rose-400'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{service.name}</p>
                  <p className="text-xs mt-3 font-bold uppercase tracking-tight flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-current ${isOp ? 'animate-pulse' : ''}`} />
                    {isOp ? 'Operational' : 'Critical'}
                  </p>
                </div>
            )
          })}
        </div>
      </div>

      {/* ── Activity Summary ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 group hover:bg-white/[0.08] transition-all shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Aggregate Transaction Volume</p>
          <p className="text-5xl font-black text-primary tracking-tighter">{systemHealth?.totalRequests?.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-[0.2em]">Total API Handshakes · 24H Epoch</p>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 group hover:bg-white/[0.08] transition-all shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Registry Security Threats</p>
          <div className="space-y-6">
            <div className="flex justify-between items-center group/line">
              <span className="text-xs font-bold text-slate-400 group-hover/line:text-white transition-colors uppercase tracking-widest">Refused Handshakes</span>
              <span className="font-black text-rose-500 text-lg uppercase tracking-widest">{systemHealth?.failedLogins} Events</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex justify-between items-center group/line">
              <span className="text-xs font-bold text-slate-400 group-hover/line:text-white transition-colors uppercase tracking-widest">Authorized Sessions</span>
              <span className="font-black text-emerald-400 text-lg uppercase tracking-widest">{systemHealth?.activeUsers} Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-4 pt-4">
        <button className="px-8 py-3 rounded-xl bg-primary text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
          Sync Monitor
        </button>
        <button className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-inner hover:scale-105 active:scale-95">
          Infrastructure Log
        </button>
        <button className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-inner hover:scale-105 active:scale-95">
          Export Telemetry
        </button>
      </div>
    </motion.div>
  );
};

export default SystemMonitoring;
