import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

const STATUS_OPTIONS = ['', 'active', 'pending', 'suspended', 'expelled'];
const statusStyle = {
  active:    'bg-green-50 text-green-700',
  pending:   'bg-yellow-50 text-yellow-700',
  suspended: 'bg-orange-50 text-orange-700',
  expelled:  'bg-red-50 text-red-700',
};

const AllMembers = () => {
  const [members, setMembers] = useState([]);
  const [meta, setMeta]       = useState(null);
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);
  const [actionRow, setActionRow] = useState(null); // member id being acted on

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/members', {
        params: { page, status: filters.status || undefined, search: filters.search || undefined },
      });
      setMembers(res.data.data.data);
      setMeta(res.data.data);
    } catch {
      showToast('Failed to load members.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const doStatus = async (id, action) => {
    setActionRow(id);
    try {
      await api.post(`/admin/members/${id}/${action}`);
      showToast(`Member ${action}d.`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Failed.', 'error');
    } finally {
      setActionRow(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Members</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search name / ID / mobile…"
          value={filters.search}
          onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select
          value={filters.status}
          onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <button onClick={load} className="text-sm text-primary hover:underline">↻ Refresh</button>
        <span className="ml-auto text-sm text-gray-500">{meta?.total ?? '—'} total</span>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-4 py-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}
          >{toast.msg}</motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Member', 'Member ID', 'Mobile', 'Institution', 'Status', 'Joined', 'Actions'].map(c => (
                  <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.length === 0 && (
                <tr><td colSpan={7} className="py-16 text-center text-gray-400">No members found.</td></tr>
              )}
              {members.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.photo_path
                        ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${m.photo_path}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                        : <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{m.full_name?.[0]}</div>
                      }
                      <div>
                        <p className="font-medium text-gray-900">{m.full_name}</p>
                        <p className="text-xs text-gray-400">{m.organizational_unit?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{m.member_id ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{m.mobile ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{m.institution}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[m.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{m.join_year}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Link to={`/dashboard/admin/members/${m.id}`} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">View</Link>
                      {m.status === 'pending'  && <button onClick={() => doStatus(m.id, 'approve')} disabled={actionRow === m.id} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">Approve</button>}
                      {m.status === 'active'   && <button onClick={() => doStatus(m.id, 'suspend')} disabled={actionRow === m.id} className="px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100">Suspend</button>}
                      {m.status !== 'expelled' && <button onClick={() => doStatus(m.id, 'expel')}   disabled={actionRow === m.id} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">Expel</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {meta?.last_page > 1 && (
            <div className="flex justify-center gap-2 px-4 py-3 border-t border-gray-100">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm ${page === p ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllMembers;

