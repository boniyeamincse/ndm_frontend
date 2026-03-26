import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import MemberCard from '../../../components/member/MemberCard';
import MemberEmptyState from '../../../components/member/MemberEmptyState';
import MemberInfoRow from '../../../components/member/MemberInfoRow';
import MemberSectionHeader from '../../../components/member/MemberSectionHeader';
import MemberStatusBadge from '../../../components/member/MemberStatusBadge';

const MemberDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [idCardAction, setIdCardAction] = useState(null);
  const [idCardError, setIdCardError] = useState('');

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

  const getIdCardBlobUrl = async () => {
    const res = await api.get('/id-card', { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  const triggerDownload = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `NDM_ID_${profile?.member_id ?? 'card'}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

  const handleIdCard = async (mode) => {
    setIdCardAction(mode);
    setIdCardError('');

    try {
      const url = await getIdCardBlobUrl();

      if (mode === 'preview' && !isMobileViewport()) {
        const preview = window.open(url, '_blank', 'noopener,noreferrer');
        if (!preview) {
          triggerDownload(url);
        }
      } else {
        triggerDownload(url);
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      setIdCardError('Could not generate ID card. Please try again.');
    } finally {
      setIdCardAction(null);
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
        <MemberCard
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="lg:col-span-1 p-6 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-primary/20" />
          {avatar
            ? <img src={avatar} alt="" className="w-28 h-28 rounded-full object-cover ring-4 ring-primary/10 shadow-xl mb-4" />
            : <div className="w-28 h-28 rounded-full bg-primary/10 text-primary text-4xl font-black flex items-center justify-center mb-4 ring-4 ring-slate-100">{profile?.full_name?.[0]}</div>
          }
          <h2 className="text-xl font-black text-slate-900">{profile?.full_name}</h2>
          <p className="text-xs text-slate-400 mt-1 font-black uppercase tracking-[0.2em]">{profile?.member_id}</p>
          <MemberStatusBadge status={profile?.status} className="mt-3 px-4" />

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
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleIdCard('preview')}
                  disabled={Boolean(idCardAction)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-slate-900/10 disabled:opacity-60"
                >
                  {idCardAction === 'preview' ? 'Opening...' : 'Preview'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleIdCard('download')}
                  disabled={Boolean(idCardAction)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-slate-900/10 disabled:opacity-60"
                >
                  {idCardAction === 'download' ? 'Downloading...' : 'Download'}
                </motion.button>
              </div>
            )}

            {idCardError && (
              <p className="text-[10px] text-red-600 font-bold">{idCardError}</p>
            )}

            <Link to="/dashboard/member/profile" className="block w-full py-3 text-xs font-bold text-primary bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors">
              Update Profile Details →
            </Link>
          </div>
        </MemberCard>

        {/* Info + Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <MemberCard
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="p-6"
          >
            <MemberSectionHeader title="Personal Identification" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <MemberInfoRow label="Phone Contact"      value={profile?.mobile} />
              <MemberInfoRow label="Email Address"     value={profile?.email} />
              <MemberInfoRow label="Blood Group"       value={profile?.blood_group} />
              <MemberInfoRow label="Join Year"         value={profile?.join_year} />
              <MemberInfoRow label="Institution"       value={profile?.institution} />
              <MemberInfoRow label="Department"        value={profile?.department} />
              <MemberInfoRow label="Academic Session"  value={profile?.session} />
              <MemberInfoRow label="Primary Unit"      value={profile?.organizational_unit?.name} />
            </div>
          </MemberCard>

          {/* Tasks */}
          <MemberCard
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="p-6 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="text-8xl font-black">NDM</span>
            </div>
            <MemberSectionHeader
              title="Assignment Tracker"
              accentClass="bg-amber-400"
              action={<Link to="/dashboard/member/tasks" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-3 py-1 bg-primary/5 rounded-lg">View History</Link>}
            />
            {tasks.length === 0 ? (
              <MemberEmptyState text="No tasks currently assigned to your profile." className="py-12" />
            ) : (
              <ul className="space-y-3">
                {tasks.map(a => {
                  return (
                    <li key={a.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50/50 rounded-xl border border-white/50 hover:border-primary/20 transition-all group">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{a.task?.title}</p>
                        {a.task?.due_date && <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5 uppercase tracking-tighter">
                          <span className="opacity-50 italic">Deadline:</span> {new Date(a.task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>}
                      </div>
                      <MemberStatusBadge status={a.status} variant="task" className="shrink-0 tracking-tighter" />
                    </li>
                  );
                })}
              </ul>
            )}
          </MemberCard>
        </div>
      </div>
    </motion.div>
  );
};

export default MemberDashboard;
