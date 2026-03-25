import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

const STATUS_TABS = [
  { value: '',          label: 'All',       color: 'text-slate-700', activeColor: 'border-slate-700 text-slate-900' },
  { value: 'active',    label: 'Active',    color: 'text-emerald-600', activeColor: 'border-emerald-600 text-emerald-700' },
  { value: 'pending',   label: 'Pending',   color: 'text-amber-600',  activeColor: 'border-amber-600 text-amber-700' },
  { value: 'suspended', label: 'Suspended', color: 'text-orange-600', activeColor: 'border-orange-600 text-orange-700' },
  { value: 'expelled',  label: 'Expelled',  color: 'text-red-600',    activeColor: 'border-red-600 text-red-700' },
];

const statusStyle = {
  active:    'bg-green-50 text-green-700',
  pending:   'bg-yellow-50 text-yellow-700',
  suspended: 'bg-orange-50 text-orange-700',
  expelled:  'bg-red-50 text-red-700',
};

const AllMembers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [meta, setMeta]       = useState(null);
  const [page, setPage]       = useState(1);
  const currentStatus = searchParams.get('status') ?? '';
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);
  const [actionRow, setActionRow] = useState(null);

  // ── Add Member slide-over ──────────────────────────────────────────────────
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
        params: { page, status: currentStatus || undefined, search: search || undefined },
      });
      setMembers(res.data.data.data);
      setMeta(res.data.data);
    } catch {
      showToast('Failed to load members.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, currentStatus, search]);

  useEffect(() => { load(); }, [load]);

  // Reset page when tab or search changes
  useEffect(() => { setPage(1); }, [currentStatus, search]);

  const switchTab = (status) => {
    const next = new URLSearchParams();
    if (status) next.set('status', status);
    setSearchParams(next);
  };

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

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Member Management</h1>
          <p className="text-sm text-gray-500 mt-1">{meta?.total ?? '—'} total members in the system</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/dashboard/admin/members/search"
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
          >
            Advanced Search
          </Link>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl shadow transition-colors"
          >
            <span className="text-lg leading-none">+</span> Add Member
          </button>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => switchTab(tab.value)}
              className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                currentStatus === tab.value
                  ? `${tab.activeColor} bg-gray-50`
                  : `border-transparent ${tab.color} hover:bg-gray-50`
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center pr-4">
            <span className="text-xs text-gray-400">{meta?.total ?? 0} result{meta?.total !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* ── Search Row ── */}
        <div className="flex flex-wrap gap-3 items-center px-4 py-3 bg-gray-50/50 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search name, member ID, mobile…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button onClick={load} className="text-sm text-primary hover:underline">↻ Refresh</button>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div className={`mx-4 mt-3 px-4 py-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {toast.msg}
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      {search ? `No members matching "${search}"` : 'No members found.'}
                    </td>
                  </tr>
                )}
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {m.photo_path
                          ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${m.photo_path}`} alt="" className="w-9 h-9 rounded-full object-cover" />
                          : <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{m.full_name?.[0]}</div>
                        }
                        <div>
                          <p className="font-semibold text-gray-900">{m.full_name}</p>
                          <p className="text-xs text-gray-400">{m.organizational_unit?.name ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{m.member_id ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{m.mobile ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{m.institution ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle[m.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{m.join_year}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <Link to={`/dashboard/admin/members/${m.id}`} className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">View</Link>
                        {m.status === 'pending'   && <button onClick={() => doStatus(m.id, 'approve')} disabled={actionRow === m.id} className="px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium disabled:opacity-50">Approve</button>}
                        {m.status === 'active'    && <button onClick={() => doStatus(m.id, 'suspend')} disabled={actionRow === m.id} className="px-2.5 py-1 text-xs bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-medium disabled:opacity-50">Suspend</button>}
                        {m.status === 'suspended' && <button onClick={() => doStatus(m.id, 'approve')} disabled={actionRow === m.id} className="px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium disabled:opacity-50">Reinstate</button>}
                        {m.status !== 'expelled'  && <button onClick={() => doStatus(m.id, 'expel')}   disabled={actionRow === m.id} className="px-2.5 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium disabled:opacity-50">Expel</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {meta?.last_page > 1 && (
              <div className="flex justify-center gap-2 px-4 py-3 border-t border-gray-100">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Member Slide-Over ── */}
      {showAdd && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-30 transition-opacity"
            onClick={() => !saving && setShowAdd(false)}
          />
          <aside className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-40 flex flex-col">
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
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
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
          </aside>
        </>
      )}
    </div>
  );
};

export default AllMembers;

