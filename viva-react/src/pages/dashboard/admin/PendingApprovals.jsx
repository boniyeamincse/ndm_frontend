import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import AdminSurface from '../../../components/admin/AdminSurface';
import AdminToast from '../../../components/admin/AdminToast';
import AdminLoadingState from '../../../components/admin/AdminLoadingState';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';

const COLS = ['Member', 'Mobile', 'NID', 'Institution', 'Unit', 'Registered', 'Actions'];

const ConfirmModal = ({ action, member, ids, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 px-6" onClick={onClose}>
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
        Are you sure you want to <span className="text-primary font-black uppercase tracking-widest">{action}</span> {ids ? <span className="text-white font-bold">{ids.length} members</span> : <span className="text-white font-bold">{member?.full_name}</span>}?
        {action === 'reject' && ' This will permanently remove the record(s) from the cluster.'}
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewMember, setPreviewMember] = useState(null);

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
      setSelectedIds([]);
    } catch {
      showToast('Failed to load pending members.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === members.length) setSelectedIds([]);
    else setSelectedIds(members.map(m => m.id));
  };

  const executeAction = async () => {
    if (!modal) return;
    setActing(true);
    try {
      const { action, member, ids } = modal;
      if (ids) {
        await api.post('/admin/members/bulk-status', { ids, action });
        showToast(`${ids.length} members ${action}d.`);
      } else {
        await api.post(`/admin/members/${member.id}/${action}`);
        showToast(`Member ${action}d successfully.`);
      }
      setModal(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Action failed.', 'error');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-32">
      {/* Modals & Overlays */}
      {modal && <ConfirmModal {...modal} onClose={() => setModal(null)} onConfirm={executeAction} loading={acting} />}

      <AnimatePresence>
        {previewMember && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 md:p-12" onClick={() => setPreviewMember(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">{previewMember.full_name}</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Personnel Document Validation Protocol</p>
                </div>
                <button onClick={() => setPreviewMember(null)} className="text-slate-500 hover:text-white transition-colors text-2xl leading-none">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Photo */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/20 pb-2 flex justify-between">
                    Identity Photo <span>01/03</span>
                  </p>
                  <div className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/10 overflow-hidden group/img relative shadow-inner">
                    {previewMember.photo_path ? (
                       <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${previewMember.photo_path}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Identity" />
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                         <span className="text-4xl opacity-20">👤</span>
                         <span className="text-[9px] font-black tracking-tighter">NO_DATA</span>
                       </div>
                    )}
                  </div>
                </div>

                {/* Identity Doc */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] border-b border-rose-500/20 pb-2 flex justify-between">
                    NID / Birth Cert <span>02/03</span>
                  </p>
                  <div className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/10 overflow-hidden group/img relative shadow-inner">
                    {previewMember.nid_doc_path ? (
                       <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${previewMember.nid_doc_path}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="NID" />
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                         <span className="text-4xl opacity-20">🪪</span>
                         <span className="text-[9px] font-black tracking-tighter">NO_DATA</span>
                       </div>
                    )}
                  </div>
                </div>

                {/* Student Doc */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] border-b border-emerald-500/20 pb-2 flex justify-between">
                    Institution ID <span>03/03</span>
                  </p>
                  <div className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/10 overflow-hidden group/img relative shadow-inner">
                    {previewMember.student_id_path ? (
                       <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${previewMember.student_id_path}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Student ID" />
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                         <span className="text-4xl opacity-20">🎓</span>
                         <span className="text-[9px] font-black tracking-tighter">NO_DATA</span>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                <button onClick={() => { setModal({ action: 'approve', member: previewMember }); setPreviewMember(null); }} className="flex-1 py-4 bg-primary hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-xl shadow-primary/20">Grant Admission</button>
                <button onClick={() => { setModal({ action: 'reject',  member: previewMember }); setPreviewMember(null); }} className="flex-1 py-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-rose-500/20 transition-all">Reject Vector</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] w-full max-w-xl px-4"
          >
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 pl-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs ring-4 ring-primary/5">
                  {selectedIds.length}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Selected Units</p>
              </div>

              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={() => setModal({ action: 'approve', ids: selectedIds })}
                  disabled={acting}
                  className="px-6 py-3 bg-primary hover:bg-emerald-400 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                >
                  Approve Bulk
                </button>
                <button
                  onClick={() => setModal({ action: 'reject', ids: selectedIds })}
                  disabled={acting}
                  className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-3 text-slate-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <AdminToast
            message={toast.msg}
            type={toast.type}
            mode="dark"
            className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-xl"
          />
        </motion.div>
      )}

      {loading ? (
        <AdminLoadingState text="Retrieving Population Data..." className="h-72 space-y-4" />
      ) : members.length === 0 ? (
        <AdminSurface className="rounded-[2rem] p-24">
          <AdminEmptyState
            icon="⚡"
            title="Queue Depleted"
            subtitle="System operational status: nominal."
          />
        </AdminSurface>
      ) : (
        <AdminSurface className="rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black border-b border-white/5">
                  <th className="px-6 py-5 w-10 text-center">
                    <input 
                      type="checkbox" 
                      checked={members.length > 0 && selectedIds.length === members.length}
                      onChange={toggleAll}
                      className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/40"
                    />
                  </th>
                  {COLS.map(c => <th key={c} className="px-6 py-5">{c === 'Member' ? 'Identity Snapshot' : c === 'Registered' ? 'Timeline' : c}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map(m => (
                  <tr key={m.id} className={`hover:bg-white/[0.03] transition-colors group ${selectedIds.includes(m.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleSelect(m.id)}
                        className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/40"
                      />
                    </td>
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
                          <div className="flex gap-4 mt-1">
                            <button onClick={() => setPreviewMember(m)} className="text-[10px] font-bold text-primary hover:text-emerald-400 uppercase tracking-widest">Review Docs</button>
                            <Link to={`/dashboard/admin/members/${m.id}`} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest">Detail →</Link>
                          </div>
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
        </AdminSurface>
      )}
    </div>
  );
};

export default PendingApprovals;
