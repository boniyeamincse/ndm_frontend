import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const toNumber = (value) => Number(value ?? 0);
const toPercent = (value, total) => {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
};

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '—';
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, activityRes, pendingRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/dashboard/activity'),
          api.get('/admin/members/pending', { params: { per_page: 3 } }),
        ]);

        setStats(statsRes.data?.data ?? {});
        setActivity(activityRes.data?.data ?? []);
        setPendingMembers(pendingRes.data?.data?.data ?? []);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError('Unauthorized: please sign in with an admin account.');
        } else if (err?.response?.status >= 500) {
          setError('Server error while loading dashboard data.');
        } else {
          setError('Failed to load admin dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const members = useMemo(() => stats?.members ?? {}, [stats]);
  const units = useMemo(() => stats?.units ?? {}, [stats]);
  const tasks = useMemo(() => stats?.tasks ?? {}, [stats]);

  const totalMembers = toNumber(members.total);
  const activeMembers = toNumber(members.active);
  const pendingCount = toNumber(members.pending);
  const suspendedCount = toNumber(members.suspended);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh] text-gray-400">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">NDM Student Wing · Admin panel snapshot</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Members</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalMembers.toLocaleString()}</p>
          <div className="h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${toPercent(totalMembers, totalMembers || 1)}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Pending Approvals</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{pendingCount.toLocaleString()}</p>
          <div className="h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${toPercent(pendingCount, totalMembers || 1)}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active Members</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{activeMembers.toLocaleString()}</p>
          <div className="h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${toPercent(activeMembers, totalMembers || 1)}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Units</p>
          <p className="text-3xl font-bold text-violet-700 mt-2">{toNumber(units.total).toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-3">Tasks: {toNumber(tasks.total).toLocaleString()} · Open: {toNumber(tasks.open).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Pending Approvals</h2>
              <p className="text-xs text-slate-400">GET /api/admin/members/pending</p>
            </div>
            <Link to="/dashboard/admin/members/pending" className="text-xs px-3 py-1.5 rounded-lg bg-amber-300 text-slate-900 font-semibold">Open Queue</Link>
          </div>
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Unit</th>
                  <th className="pb-3">Applied</th>
                </tr>
              </thead>
              <tbody>
                {pendingMembers.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-slate-400">No pending records.</td></tr>
                )}
                {pendingMembers.map((member) => (
                  <tr key={member.id} className="border-t border-slate-100">
                    <td className="py-3">
                      <p className="font-medium text-slate-900">{member.full_name}</p>
                      <p className="text-xs text-slate-400">{member.member_id || 'Pending ID'}</p>
                    </td>
                    <td className="py-3 text-slate-600">{member.mobile || member.phone || '—'}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {member.organizational_unit?.name || 'Not assigned'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">{formatDateTime(member.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Status Distribution</h2>
            <p className="text-xs text-slate-400">Members snapshot</p>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-2xl font-bold text-slate-900">{totalMembers.toLocaleString()}</p>
            <div className="text-sm text-slate-600">✅ Active: <strong>{activeMembers.toLocaleString()}</strong></div>
            <div className="text-sm text-slate-600">⏳ Pending: <strong>{pendingCount.toLocaleString()}</strong></div>
            <div className="text-sm text-slate-600">🚫 Suspended: <strong>{suspendedCount.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Members by Year</h2>
          </div>
          <div className="p-5">
            {(stats?.members_by_year ?? []).length === 0 && <p className="text-sm text-slate-400">No yearly data.</p>}
            {(stats?.members_by_year ?? []).map((item) => (
              <div key={item.year} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-b-0">
                <span className="text-slate-500">{item.year}</span>
                <span className="font-semibold text-slate-900">{toNumber(item.count).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="p-5 space-y-3">
            {activity.length === 0 && <p className="text-sm text-slate-400">No recent activity.</p>}
            {activity.slice(0, 8).map((log) => (
              <div key={log.id} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-b-0">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs flex items-center justify-center">•</div>
                <div>
                  <p className="text-sm text-slate-700">
                    {log.action} {log.model_type ? <strong>{log.model_type} #{log.model_id}</strong> : null}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{formatDateTime(log.performed_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
