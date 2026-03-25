import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const COLS = ['Member', 'Mobile', 'NID', 'Institution', 'Unit', 'Registered', 'Actions'];

const ConfirmModal = ({ action, member, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div
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
          className={`px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-60 ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}
        >
          {loading ? 'Processing…' : action.charAt(0).toUpperCase() + action.slice(1)}
        </button>
      </div>
    </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">
            {meta?.total
              ? <><span className="font-semibold text-amber-600">{meta.total}</span> member{meta.total !== 1 ? 's' : ''} awaiting review</>
              : 'No pending registrations — all clear!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/admin/members" className="text-sm text-primary hover:underline">
            ← All Members
          </Link>
          <button onClick={load} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {toast.msg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          Loading…
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1 text-sm">No pending registrations at this time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{COLS.map(c => <th key={c} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{c}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {m.photo_path
                          ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${m.photo_path}`} alt="" className="w-9 h-9 rounded-full object-cover" />
                          : <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">{m.full_name?.[0]}</div>
                        }
                        <div>
                          <p className="font-semibold text-gray-900">{m.full_name}</p>
                          <Link to={`/dashboard/admin/members/${m.id}`} className="text-xs text-primary hover:underline">View full profile →</Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{m.mobile ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{'••••••' + (m.nid_or_bc?.slice(-4) ?? '????')}</td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-[160px] truncate">{m.institution ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {m.organizational_unit?.name ?? 'Not assigned'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => setModal({ action: 'approve', member: m })} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">Approve</button>
                        <button onClick={() => setModal({ action: 'reject',  member: m })} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 border border-red-100 transition-colors">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta?.last_page > 1 && (
            <div className="flex justify-center gap-2 px-4 py-3 border-t border-gray-100">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}>{p}</button>
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

