import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 p-5 shadow-sm">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
  </div>
);

const OrganizerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [unitMembers, setUnitMembers] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const profileRes = await api.get('/profile');
        const member = profileRes?.data?.data || null;
        setProfile(member);

        const unitId = member?.organizational_unit?.id || member?.organizational_unit_id;

        const [tasksRes, membersRes] = await Promise.all([
          api.get('/tasks/my', { params: { per_page: 10 } }).catch(() => null),
          unitId ? api.get('/members/search', { params: { unit_id: unitId, per_page: 12 } }).catch(() => null) : Promise.resolve(null),
        ]);

        setTasks(tasksRes?.data?.data?.data || []);
        setUnitMembers(membersRes?.data?.data?.data || []);
      } catch {
        setError('Failed to load organizer dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const metrics = useMemo(() => {
    const pending = tasks.filter((item) => item.status === 'pending').length;
    const inProgress = tasks.filter((item) => item.status === 'in_progress').length;
    const done = tasks.filter((item) => item.status === 'done').length;
    return { pending, inProgress, done };
  }, [tasks]);

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading organizer dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm font-semibold">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">Organizer Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Unit-scoped overview for {profile?.organizational_unit?.name || 'your assigned unit'}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Unit Members" value={unitMembers.length} sub="Active members in your unit" />
        <StatCard label="Pending Tasks" value={metrics.pending} />
        <StatCard label="In Progress" value={metrics.inProgress} />
        <StatCard label="Completed" value={metrics.done} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-slate-700">Unit Member List</h2>
            <Link to="/directory" className="text-xs font-bold text-primary hover:underline">Open Directory</Link>
          </div>
          {unitMembers.length === 0 ? (
            <p className="text-sm text-slate-500">No unit members found.</p>
          ) : (
            <ul className="space-y-2">
              {unitMembers.slice(0, 10).map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{member.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{member.member_id}</p>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">active</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-slate-700">Unit Task Queue</h2>
            <Link to="/dashboard/member" className="text-xs font-bold text-primary hover:underline">Member View</Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No assigned tasks.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.slice(0, 10).map((task) => (
                <li key={task.id} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                  <p className="text-sm font-bold text-slate-900 truncate">{task.task?.title || 'Task'}</p>
                  <p className="text-[11px] text-slate-500">Status: {task.status?.replace('_', ' ') || 'pending'}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
