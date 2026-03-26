import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const COLS = ['Member', 'Mobile', 'NID', 'Institution', 'Unit', 'Registered', 'Actions'];

const ConfirmModal = ({ action, member, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 px-6" onClick={onClose}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
      
      <h2 className="text-xl font-black text-white mb-3 uppercase tracking-tight">
        Confirm Action
      </h2>
      <p className="text-sm text-slate-400 mb-8 leading-relaxed">
        Are you sure you want to <span className="text-primary font-black uppercase tracking-widest">{action}</span> <span className="text-white font-bold">{member?.full_name}</span>?
        {action === 'reject' && ' This will permanently remove their registration from the cluster.'}
      </p>
      
      <div className="flex gap-4 justify-end">
        <button 
          onClick={onClose} 
          className="px-6 py-2.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all"
        >
          Abort
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 disabled:opacity-60 shadow-lg shadow-primary/20 transition-all ${
            action === 'approve' ? 'bg-primary hover:bg-emerald-400 shadow-primary/20' : 
            action === 'reject' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 
            'bg-amber-400 hover:bg-amber-500'
          }`}
        >
          {loading ? 'Processing…' : `Confirm ${action}`}
        </button>
      </div>
    </motion.div>
  </div>
);

const PendingApprovals = () => {
  const [members, setMembers] = useState([]);
  const [meta, setMeta]       = useState(null);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [acting, setActing]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/members/pending', { params: { page } });
      setMembers(res.data.data.data);
      setMeta(res.data.data);
    } catch {
      showToast('Failed to load pending members.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const doAction = async () => {
    if (!modal) return;
    setActing(true);
    try {
      const { action, member } = modal;
      if (action === 'approve') await api.post(`/admin/members/${member.id}/approve`);
      else if (action === 'reject')  await api.post(`/admin/members/${member.id}/reject`);
      else if (action === 'suspend') await api.post(`/admin/members/${member.id}/suspend`);
      setModal(null);
      showToast(`Member ${action}d successfully.`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Action failed.', 'error');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30 group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Governance Protocol</p>
          <h1 className="mt-3 text-3xl font-black text-white tracking-tight uppercase">Onboarding Queue</h1>
          <p className="text-sm font-medium text-slate-400 mt-2">
            {meta?.total
              ? <><span className="font-black text-amber-400">{meta.total}</span> units awaiting cluster approval</>
              : 'Protocol stable — registration queue empty.'}
          </p>
        </div>
        <div className="flex items-center gap-4 relative">
          <Link to="/dashboard/admin/members" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
            ← Registry
          </Link>
          <button 
            onClick={load} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-inner"
          >
            ↻ Sync Data
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-xl ${
            toast.type === 'error' 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 ring-1 ring-rose-500/10' 
              : 'bg-primary/10 text-primary border-primary/20 ring-1 ring-primary/10'
          }`}
        >
          {toast.msg}
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-72 space-y-4 animate-pulse">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Retrieving Population Data...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-24 text-center">
          <div className="text-5xl mb-6 opacity-30">⚡</div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Queue Depleted</h3>
          <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest leading-relaxed">System operational status: nominal.</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black border-b border-white/5">
                  {COLS.map(c => <th key={c} className="px-6 py-5">{c === 'Member' ? 'Identity Snapshot' : c === 'Registered' ? 'Timeline' : c}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          {m.photo_path
                            ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${m.photo_path}`} alt="" className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/10 group-hover:scale-105 transition-transform" />
                            : <div className="w-12 h-12 rounded-2xl bg-white/5 text-primary flex items-center justify-center text-sm font-black border border-white/10 shadow-inner group-hover:scale-105 transition-transform">{m.full_name?.[0]}</div>
                          }
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-amber-500`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight truncate">{m.full_name}</p>
                          <Link to={`/dashboard/admin/members/${m.id}`} className="text-[10px] font-bold text-primary hover:text-emerald-400 mt-1 inline-block uppercase tracking-widest">Open Profile →</Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">{m.mobile ?? '—'}</td>
                    <td className="px-6 py-5 font-bold text-slate-600 text-[10px] uppercase tracking-widest">{'••••' + (m.nid_or_bc?.slice(-4) ?? '????')}</td>
                    <td className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-[160px] truncate">{m.institution ?? '—'}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest ring-1 ring-primary/20">
                        {m.organizational_unit?.name ?? 'Unassigned Unit'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-5">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setModal({ action: 'approve', member: m })} 
                          className="px-5 py-2.5 bg-primary text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-primary/20"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => setModal({ action: 'reject',  member: m })} 
                          className="px-5 py-2.5 bg-rose-500/10 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta?.last_page > 1 && (
            <div className="flex justify-center gap-3 px-8 py-6 border-t border-white/5 bg-white/[0.01]">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button 
                  key={p} 
                  onClick={() => setPage(p)} 
                  className={`w-10 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    page === p 
                      ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20' 
                      : 'border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {modal && <ConfirmModal {...modal} onClose={() => setModal(null)} onConfirm={doAction} loading={acting} />}
    </div>
  );
};

export default PendingApprovals;

