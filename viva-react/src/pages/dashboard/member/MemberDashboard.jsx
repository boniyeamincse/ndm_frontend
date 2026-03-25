import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const statusColor = {
  active:    'bg-green-100 text-green-800',
  pending:   'bg-yellow-100 text-yellow-800',
  suspended: 'bg-orange-100 text-orange-800',
  expelled:  'bg-red-100 text-red-800',
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
    <span className="text-gray-500 w-40 shrink-0">{label}</span>
    <span className="text-gray-900 font-medium text-right">{value ?? '—'}</span>
  </div>
);

const MemberDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          api.get('/profile'),
          api.get('/tasks/my', { params: { per_page: 5 } }),
        ]);
        setProfile(pRes.data.data);
        setTasks(tRes.data.data?.data ?? []);
      } catch {
        setError('Failed to load your profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const downloadIdCard = async () => {
    setDownloading(true);
    try {
      const res = await api.get('/id-card', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `NDM_ID_${profile?.member_id ?? 'card'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not generate ID card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  if (error)   return <div className="p-8 text-red-600">{error}</div>;

  const activePositions = profile?.positions?.filter(p => p.is_active) ?? [];
  const avatar = profile?.photo_path
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${profile.photo_path}`
    : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Member Dashboard</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
          {avatar
            ? <img src={avatar} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 mb-4" />
            : <div className="w-24 h-24 rounded-full bg-primary/20 text-primary text-3xl font-bold flex items-center justify-center mb-4 ring-4 ring-primary/10">{profile?.full_name?.[0]}</div>
          }
          <h2 className="text-lg font-bold text-gray-900">{profile?.full_name}</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{profile?.member_id}</p>
          <span className={`mt-2 px-3 py-0.5 rounded-full text-xs font-medium ${statusColor[profile?.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {profile?.status}
          </span>

          <div className="mt-4 w-full space-y-1 text-left">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Current Positions</p>
            {activePositions.length === 0 && <p className="text-sm text-gray-400">No active positions.</p>}
            {activePositions.map(pos => (
              <div key={pos.id} className="text-sm bg-gray-50 rounded-lg px-3 py-2">
                <p className="font-medium text-gray-800">{pos.role?.name}</p>
                <p className="text-xs text-gray-500">{pos.organizational_unit?.name}</p>
              </div>
            ))}
          </div>

          {profile?.status === 'active' && (
            <button
              onClick={downloadIdCard}
              disabled={downloading}
              className="mt-5 w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {downloading ? 'Generating…' : '⬇ Download ID Card (PDF)'}
            </button>
          )}

          <Link to="/dashboard/member/profile" className="mt-2 text-xs text-primary hover:underline">
            Edit Profile →
          </Link>
        </div>

        {/* Info + Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Personal Information</h3>
            <InfoRow label="Mobile"      value={profile?.mobile} />
            <InfoRow label="Blood Group" value={profile?.blood_group} />
            <InfoRow label="Institution" value={profile?.institution} />
            <InfoRow label="Department"  value={profile?.department} />
            <InfoRow label="Session"     value={profile?.session} />
            <InfoRow label="Unit"        value={profile?.organizational_unit?.name} />
            <InfoRow label="Joining Year" value={profile?.join_year} />
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-800">My Tasks</h3>
              <Link to="/dashboard/member/tasks" className="text-xs text-primary hover:underline">View All →</Link>
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks assigned yet.</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map(a => {
                  const statusCls = { pending: 'bg-yellow-50 text-yellow-700', in_progress: 'bg-blue-50 text-blue-700', done: 'bg-green-50 text-green-700' };
                  return (
                    <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{a.task?.title}</p>
                        {a.task?.due_date && <p className="text-xs text-gray-400">Due: {new Date(a.task.due_date).toLocaleDateString()}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusCls[a.status] ?? 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;

