import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const statusColor = {
  active:    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/10',
  pending:   'bg-amber-100 text-amber-700 ring-1 ring-amber-700/10',
  suspended: 'bg-orange-100 text-orange-700 ring-1 ring-orange-700/10',
  expelled:  'bg-red-100 text-red-700 ring-1 ring-red-700/10',
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm py-2.5 border-b border-slate-50/50 last:border-0 group transition-colors hover:bg-slate-50/30 px-2 rounded-lg">
    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] w-32 shrink-0">{label}</span>
    <span className="text-slate-900 font-black text-right truncate ml-4">{value ?? '—'}</span>
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
      setLoading(true);
      setError(null);
      try {
        const [pRes, tRes] = await Promise.all([
          api.get('/profile'),
          api.get('/tasks/my', { params: { per_page: 5 } }),
        ]);
        setProfile(pRes.data.data);
        setTasks(tRes.data.data?.data ?? []);
      } catch (err) {
        setError('Failed to load your profile. Please check your connection.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
           className="rounded-full h-10 w-10 border-b-2 border-primary"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-red-500 font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20">Retry Load</button>
      </div>
    );
  }

  const activePositions = profile?.positions?.filter(p => p.is_active) ?? [];
  const avatar = profile?.photo_path
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${profile.photo_path}`
    : null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className="p-1 lg:p-4 max-w-6xl mx-auto space-y-6"
    >
      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Member Dashboard</h1>
        <p className="text-sm font-medium text-slate-400 mt-1">Status & Activity Overview</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="lg:col-span-1 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-6 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-primary/20" />
          {avatar
            ? <img src={avatar} alt="" className="w-28 h-28 rounded-full object-cover ring-4 ring-primary/10 shadow-xl mb-4" />
            : <div className="w-28 h-28 rounded-full bg-primary/10 text-primary text-4xl font-black flex items-center justify-center mb-4 ring-4 ring-slate-100">{profile?.full_name?.[0]}</div>
          }
          <h2 className="text-xl font-black text-slate-900">{profile?.full_name}</h2>
          <p className="text-xs text-slate-400 mt-1 font-black uppercase tracking-[0.2em]">{profile?.member_id}</p>
          <span className={`mt-3 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColor[profile?.status] ?? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}>
            {profile?.status}
          </span>

          <div className="mt-8 w-full space-y-2 text-left">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mb-3 px-1">Active Positions</p>
            {activePositions.length === 0 && <p className="text-xs text-slate-400 bg-slate-50/50 rounded-xl px-4 py-3 italic">Not currently assigned to a role.</p>}
            {activePositions.map(pos => (
              <div key={pos.id} className="text-sm bg-slate-50/70 border border-slate-100/50 rounded-xl px-4 py-3 group hover:border-primary/30 transition-all shadow-sm">
                <p className="font-bold text-slate-900 leading-tight">{pos.role?.name}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{pos.organizational_unit?.name}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 w-full space-y-3">
            {profile?.status === 'active' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadIdCard}
                disabled={downloading}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-slate-900/10 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {downloading ? 'Generating Card...' : <><span>ID CARD</span> <span className="opacity-50 text-[16px]">↓</span></>}
              </motion.button>
            )}

            <Link to="/dashboard/member/profile" className="block w-full py-3 text-xs font-bold text-primary bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors">
              Update Profile Details →
            </Link>
          </div>
        </motion.div>

        {/* Info + Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-6"
          >
            <div className="flex items-center gap-2 mb-6 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Personal Identification</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <InfoRow label="Phone Contact"      value={profile?.mobile} />
              <InfoRow label="Email Address"     value={profile?.email} />
              <InfoRow label="Blood Group"       value={profile?.blood_group} />
              <InfoRow label="Join Year"         value={profile?.join_year} />
              <InfoRow label="Institution"       value={profile?.institution} />
              <InfoRow label="Department"        value={profile?.department} />
              <InfoRow label="Academic Session"  value={profile?.session} />
              <InfoRow label="Primary Unit"      value={profile?.organizational_unit?.name} />
            </div>
          </motion.div>

          {/* Tasks */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-6 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="text-8xl font-black">NDM</span>
            </div>
            <div className="flex justify-between items-center mb-6 px-1">
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Assignment Tracker</h3>
              </div>
              <Link to="/dashboard/member/tasks" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-3 py-1 bg-primary/5 rounded-lg">View History</Link>
            </div>
            {tasks.length === 0 ? (
              <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-medium text-slate-400 italic">No tasks currently assigned to your profile.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {tasks.map(a => {
                  const statusCls = {
                    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-700/10',
                    in_progress: 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10',
                    done: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-700/10'
                  };
                  return (
                    <li key={a.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50/50 rounded-xl border border-white/50 hover:border-primary/20 transition-all group">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{a.task?.title}</p>
                        {a.task?.due_date && <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5 uppercase tracking-tighter">
                          <span className="opacity-50 italic">Deadline:</span> {new Date(a.task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>}
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shrink-0 ${statusCls[a.status] ?? 'bg-slate-100 text-slate-600'}`}>{a.status?.replace('_', ' ')}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MemberDashboard;
