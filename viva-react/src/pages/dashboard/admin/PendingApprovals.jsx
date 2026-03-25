import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

const COLS = ['Member', 'Mobile', 'NID', 'Institution', 'Unit', 'Registered', 'Actions'];

const Badge = ({ children, color }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{children}</span>
);

const ConfirmModal = ({ action, member, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Confirm: {action.charAt(0).toUpperCase() + action.slice(1)} Member
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to <b>{action}</b> <b>{member?.full_name}</b>?
        {action === 'reject' && ' This will permanently delete their registration.'}
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm text-white font-medium ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}
        >
          {loading ? 'Processing…' : action.charAt(0).toUpperCase() + action.slice(1)}
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
  const [modal, setModal]     = useState(null); // { action, member }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">{meta?.total ?? '—'} member(s) awaiting review</p>
        </div>
        <button onClick={load} className="text-sm text-primary hover:underline">↻ Refresh</button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-4 py-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          🎉 No pending registrations
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{COLS.map(c => <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.photo_path
                        ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${m.photo_path}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                        : <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{m.full_name?.[0]}</div>
                      }
                      <span className="font-medium text-gray-900">{m.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.mobile ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{'••••••' + m.nid_or_bc?.slice(-4)}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{m.institution}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{m.organizational_unit?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ action: 'approve', member: m })} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">Approve</button>
                      <button onClick={() => setModal({ action: 'reject',  member: m })} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {meta?.last_page > 1 && (
            <div className="flex justify-center gap-2 px-4 py-3 border-t border-gray-100">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm ${page === p ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
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

