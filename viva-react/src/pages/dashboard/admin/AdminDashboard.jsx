import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const StatCard = ({ label, value, icon, color, to }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 ${to ? 'cursor-pointer' : ''}`}
  >
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </motion.div>
);

const statusColor = { active: 'text-green-700 bg-green-50', pending: 'text-yellow-700 bg-yellow-50', suspended: 'text-orange-700 bg-orange-50', expelled: 'text-red-700 bg-red-50' };

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/dashboard/activity'),
        ]);
        setStats(sRes.data.data);
        setActivity(aRes.data.data ?? []);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  if (error)   return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">NDM Student Wing — Overview</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members"    value={stats?.members?.total}    icon="👥" color="bg-blue-50 text-blue-600"   />
        <StatCard label="Active"           value={stats?.members?.active}   icon="✅" color="bg-green-50 text-green-600" />
        <StatCard label="Pending Approval" value={stats?.members?.pending}  icon="⏳" color="bg-yellow-50 text-yellow-600" />
        <StatCard label="Suspended"        value={stats?.members?.suspended} icon="🚫" color="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Units"  value={stats?.units?.total}       icon="🏫" color="bg-purple-50 text-purple-600" />
        <StatCard label="All Tasks"    value={stats?.tasks?.total}       icon="📋" color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Open Tasks"   value={stats?.tasks?.open}        icon="🔓" color="bg-teal-50 text-teal-600"    />
        <StatCard label="Expelled"     value={stats?.members?.expelled}  icon="❌" color="bg-red-50 text-red-600"      />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members by year */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Members by Joining Year</h2>
          <ul className="space-y-2">
            {stats?.members_by_year?.map(row => (
              <li key={row.year} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{row.year}</span>
                <span className="font-semibold text-gray-900">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
            <Link to="/dashboard/admin/members/pending" className="text-xs text-primary hover:underline">
              View Pending →
            </Link>
          </div>
          <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {activity.length === 0 && <li className="text-sm text-gray-400">No recent activity.</li>}
            {activity.map((log) => (
              <li key={log.id} className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-medium text-gray-800">{log.action}</span>
                  {log.model_type && <span className="text-gray-500"> on {log.model_type}#{log.model_id}</span>}
                  <p className="text-gray-400 text-xs">{new Date(log.performed_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        {[
          { to: '/dashboard/admin/members/pending', label: '⏳ Pending Approvals' },
          { to: '/dashboard/admin/members',         label: '👥 All Members' },
          { to: '/dashboard/admin/roles',            label: '🔐 Role Management' },
          { to: '/dashboard/admin/units',            label: '🏫 Units' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

