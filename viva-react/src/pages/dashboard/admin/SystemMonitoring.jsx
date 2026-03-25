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
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-10 w-10 border-b-2 border-primary-600"
        />
      </div>
    );

  const getHealthColor = (status) => {
    const colors = {
      operational: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      degraded: 'bg-amber-100 text-amber-700 border-amber-300',
      down: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status] || colors.degraded;
  };

  const getPercentColor = (value) => {
    if (value < 60) return 'bg-emerald-500';
    if (value < 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="rounded-2xl bg-gradient-to-br from-white via-white/95 to-primary-50/20 border border-primary-200/30 p-6">
        <h1 className="text-3xl font-black text-slate-900">System Monitoring</h1>
        <p className="text-sm text-primary-600 font-medium mt-1">Last checked: {systemHealth?.lastCheck}</p>
      </div>

      {/* ── Overall Health ── */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-primary-200/30 bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">System Status</p>
          <p className="text-2xl font-black text-emerald-900 mt-2">{systemHealth?.status === 'healthy' ? '✓ Healthy' : '⚠ Degraded'}</p>
          <p className="text-[10px] text-emerald-700 mt-1">Uptime: {systemHealth?.uptime}</p>
        </div>

        <div className="rounded-2xl border border-primary-200/30 bg-gradient-to-br from-blue-50 to-blue-100/30 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Users</p>
          <p className="text-2xl font-black text-blue-900 mt-2">{systemHealth?.activeUsers}</p>
          <p className="text-[10px] text-blue-700 mt-1">Online now</p>
        </div>

        <div className="rounded-2xl border border-primary-200/30 bg-gradient-to-br from-violet-50 to-violet-100/30 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Avg Response Time</p>
          <p className="text-2xl font-black text-violet-900 mt-2">{systemHealth?.avgResponseTime}ms</p>
          <p className="text-[10px] text-violet-700 mt-1">API performance</p>
        </div>

        <div className="rounded-2xl border border-primary-200/30 bg-gradient-to-br from-red-50 to-red-100/30 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">Error Rate</p>
          <p className="text-2xl font-black text-red-900 mt-2">{systemHealth?.errorRate}%</p>
          <p className="text-[10px] text-red-700 mt-1">Last 24 hours</p>
        </div>
      </div>

      {/* ── Resource Usage ── */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'CPU Usage', value: systemHealth?.cpu, unit: '%' },
          { label: 'Memory Usage', value: systemHealth?.memory, unit: '%' },
          { label: 'Disk Usage', value: systemHealth?.disk, unit: '%' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-primary-200/30 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600">{item.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-3">{item.value}{item.unit}</p>
            <div className="h-2 bg-slate-100/50 rounded-full overflow-hidden mt-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1 }}
                className={`h-full ${getPercentColor(item.value)}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Service Status ── */}
      <div className="rounded-2xl border border-primary-200/30 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Service Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Database', status: systemHealth?.database },
            { name: 'Cache', status: systemHealth?.cache },
            { name: 'API', status: systemHealth?.api },
            { name: 'Mail Service', status: systemHealth?.mail },
          ].map((service) => (
            <div key={service.name} className={`rounded-xl border p-4 ${getHealthColor(service.status)}`}>
              <p className="font-bold text-sm">{service.name}</p>
              <p className="text-xs mt-1 font-medium">{service.status === 'operational' ? '🟢 Operational' : '🟡 Degraded'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity Summary ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-primary-200/30 bg-white p-6">
          <h3 className="font-bold text-slate-900 mb-4">Total API Requests</h3>
          <p className="text-4xl font-black text-primary-600">{systemHealth?.totalRequests?.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">Last 24 hours</p>
        </div>

        <div className="rounded-2xl border border-primary-200/30 bg-white p-6">
          <h3 className="font-bold text-slate-900 mb-4">Security Events</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Failed Login Attempts</span>
              <span className="font-bold text-red-600">{systemHealth?.failedLogins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Active Sessions</span>
              <span className="font-bold text-emerald-600">{systemHealth?.activeUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-lg bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors">
          Refresh Data
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 font-bold text-sm hover:bg-slate-200 transition-colors">
          View Full Logs
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 font-bold text-sm hover:bg-slate-200 transition-colors">
          Export Report
        </button>
      </div>
    </motion.div>
  );
};

export default SystemMonitoring;
