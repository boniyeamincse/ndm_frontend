import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const INIT_FORM = {
  full_name: '', email: '', password: '', mobile: '', institution: '',
  department: '', gender: '', date_of_birth: '', blood_group: '',
  organizational_unit_id: '', status: 'active',
  join_year: new Date().getFullYear(), present_address: '',
};
const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30';
const Lbl = ({ label, required, err, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
  </div>
);

const STATUS_OPTIONS = ['', 'active', 'pending', 'suspended', 'expelled'];
const statusStyle = {
  active:    'bg-green-50 text-green-700',
  pending:   'bg-yellow-50 text-yellow-700',
  suspended: 'bg-orange-50 text-orange-700',
  expelled:  'bg-red-50 text-red-700',
};

const AllMembers = () => {
  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [meta, setMeta]       = useState(null);
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState({ status: searchParams.get('status') ?? '', search: '' });

  useEffect(() => {
    setFilters(f => ({ ...f, status: searchParams.get('status') ?? '' }));
    setPage(1);
  }, [searchParams]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);
  const [actionRow, setActionRow] = useState(null);

  // ── Add Member slide-over ──────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState(INIT_FORM);
  const [units, setUnits]     = useState([]);
  const [saving, setSaving]   = useState(false);
  const [formErr, setFormErr] = useState({});
  const firstRef              = useRef(null);

  useEffect(() => {
    api.get('/units/campus').then(r => setUnits(r.data?.data ?? r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (showAdd) setTimeout(() => firstRef.current?.focus(), 80);
    else { setForm(INIT_FORM); setFormErr({}); }
  }, [showAdd]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submitAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErr({});
    try {
      await api.post('/admin/members', form);
      showToast('Member added successfully.');
      setShowAdd(false);
      load();
    } catch (err) {
      const errs = err.response?.data?.errors ?? {};
      if (Object.keys(errs).length) setFormErr(errs);
      else showToast(err.response?.data?.message ?? 'Failed to add member.', 'error');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">All Members</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
        >
          <span className="text-lg leading-none">+</span> Add Member
        </button>
      </div>

      {/* ── Add Member Slide-Over ────────────────────────────────────── */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30"
              onClick={() => !saving && setShowAdd(false)}
            />
            <motion.aside
              key="panel"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-40 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Add Member Manually</h2>
                <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none">✕</button>
              </div>

              <form onSubmit={submitAdd} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  Admin-created members are set to <strong>Active</strong> by default and bypass the approval queue.
                </p>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Account</p>
                <div className="grid grid-cols-2 gap-4">
                  <Lbl label="Email" required err={formErr.email?.[0]}>
                    <input ref={firstRef} type="email" value={form.email} onChange={e => setF('email', e.target.value)} className={inp} required />
                  </Lbl>
                  <Lbl label="Password" required err={formErr.password?.[0]}>
                    <input type="password" value={form.password} onChange={e => setF('password', e.target.value)} className={inp} required minLength={8} />
                  </Lbl>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 pt-2">Personal Info</p>
                <Lbl label="Full Name" required err={formErr.full_name?.[0]}>
                  <input type="text" value={form.full_name} onChange={e => setF('full_name', e.target.value)} className={inp} required maxLength={191} />
                </Lbl>
                <div className="grid grid-cols-2 gap-4">
                  <Lbl label="Mobile" err={formErr.mobile?.[0]}>
                    <input type="tel" value={form.mobile} onChange={e => setF('mobile', e.target.value)} className={inp} />
                  </Lbl>
                  <Lbl label="Date of Birth" err={formErr.date_of_birth?.[0]}>
                    <input type="date" value={form.date_of_birth} onChange={e => setF('date_of_birth', e.target.value)} className={inp} />
                  </Lbl>
                  <Lbl label="Gender">
                    <select value={form.gender} onChange={e => setF('gender', e.target.value)} className={inp}>
                      <option value="">Select…</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </Lbl>
                  <Lbl label="Blood Group">
                    <select value={form.blood_group} onChange={e => setF('blood_group', e.target.value)} className={inp}>
                      <option value="">Select…</option>
                      {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Lbl>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 pt-2">Academic &amp; Org</p>
                <div className="grid grid-cols-2 gap-4">
                  <Lbl label="Institution">
                    <input type="text" value={form.institution} onChange={e => setF('institution', e.target.value)} className={inp} maxLength={255} />
                  </Lbl>
                  <Lbl label="Department">
                    <input type="text" value={form.department} onChange={e => setF('department', e.target.value)} className={inp} maxLength={191} />
                  </Lbl>
                  <Lbl label="Organizational Unit" err={formErr.organizational_unit_id?.[0]}>
                    <select value={form.organizational_unit_id} onChange={e => setF('organizational_unit_id', e.target.value)} className={inp}>
                      <option value="">Not assigned</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </Lbl>
                  <Lbl label="Join Year">
                    <input type="number" value={form.join_year} onChange={e => setF('join_year', e.target.value)} className={inp} min={2000} max={2100} />
                  </Lbl>
                </div>

                <Lbl label="Present Address">
                  <textarea value={form.present_address} onChange={e => setF('present_address', e.target.value)} className={inp} rows={2} maxLength={500} />
                </Lbl>

                <Lbl label="Initial Status">
                  <select value={form.status} onChange={e => setF('status', e.target.value)} className={inp}>
                    <option value="active">Active (approved immediately)</option>
                    <option value="pending">Pending (requires approval)</option>
                  </select>
                </Lbl>

                <div className="flex gap-3 pt-2 pb-6">
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    {saving ? 'Saving…' : 'Add Member'}
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

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

