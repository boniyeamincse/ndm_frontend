import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import AdminSurface from '../../../components/admin/AdminSurface';
import AdminToast from '../../../components/admin/AdminToast';
import AdminLoadingState from '../../../components/admin/AdminLoadingState';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const INIT_FORM = {
  full_name: '', email: '', password: '', mobile: '', institution: '',
  department: '', gender: '', date_of_birth: '', blood_group: '',
  organizational_unit_id: '', status: 'active',
  join_year: new Date().getFullYear(), present_address: '',
};
const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all';
const Lbl = ({ label, required, err, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
      {label}{required && <span className="text-accent ml-1">*</span>}
    </label>
    {children}
    {err && <p className="text-[10px] font-bold text-accent mt-1 ml-1">{err}</p>}
  </div>
);

const STATUS_TABS = [
  { value: '',          label: 'All',       color: 'text-slate-400', activeColor: 'text-slate-100 bg-white/10 border-primary' },
  { value: 'active',    label: 'Active',    color: 'text-slate-400', activeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500' },
  { value: 'pending',   label: 'Pending',   color: 'text-slate-400', activeColor: 'text-amber-400 bg-amber-500/10 border-amber-500' },
  { value: 'suspended', label: 'Suspended', color: 'text-slate-400', activeColor: 'text-orange-400 bg-orange-500/10 border-orange-500' },
  { value: 'expelled',  label: 'Expelled',  color: 'text-slate-400', activeColor: 'text-rose-400 bg-rose-500/10 border-rose-500' },
];

const statusStyle = {
  active:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  pending:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  suspended: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  expelled:  'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

const AllMembers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [meta, setMeta]       = useState(null);
  const [page, setPage]       = useState(1);
  const currentStatus = searchParams.get('status') ?? '';
  const [search, setSearch]   = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);
  const [actionRow, setActionRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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
        params: { 
          page, 
          status: currentStatus || undefined, 
          search: search || undefined,
          organizational_unit_id: unitFilter || undefined 
        },
      });
      setMembers(res.data.data.data);
      setMeta(res.data.data);
      setSelectedIds([]); // Reset selection on load
    } catch {
      showToast('Failed to load members.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, currentStatus, search, unitFilter]);

  useEffect(() => { load(); }, [load]);

  // Reset page when tab, search, or unit changes
  useEffect(() => { setPage(1); }, [currentStatus, search, unitFilter]);

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

  const doBulkAction = async (action) => {
    setSaving(true);
    try {
      await api.post('/admin/members/bulk-status', { ids: selectedIds, action });
      showToast(`${selectedIds.length} members ${action}d.`);
      setSelectedIds([]);
      load();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Bulk action failed.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === members.length) setSelectedIds([]);
    else setSelectedIds(members.map(m => m.id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Population Registry</p>
          <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Member Management</h1>
          <p className="text-sm font-medium text-slate-400 mt-2 max-w-xl">Comprehensive supervision of the NDM Student Movement member clusters and onboarding protocols.</p>
        </div>
        <div className="flex items-center gap-4 shrink-0 relative">
          <Link
            to="/dashboard/admin/members/search"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            Deep Search
          </Link>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-3 px-8 py-3 bg-primary hover:bg-emerald-400 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <span className="text-lg leading-none">+</span> New Member
          </button>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <AdminSurface className="rounded-[2rem] overflow-hidden">
        <div className="flex border-b border-white/5 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => switchTab(tab.value)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all duration-300 ${
                currentStatus === tab.value
                  ? `${tab.activeColor} border-current`
                  : `border-transparent ${tab.color} hover:text-slate-200 hover:bg-white/5`
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center pr-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{meta?.total ?? 0} results</span>
          </div>
        </div>

        {/* ── Search Row ── */}
        <div className="flex flex-wrap gap-4 items-center px-6 py-4 bg-white/[0.02] border-b border-white/5">
          <div className="relative group flex-1 max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search name, member ID, mobile…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-11 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all border-none"
            />
          </div>
          <div className="relative group min-w-[200px]">
            <select
              value={unitFilter}
              onChange={e => setUnitFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Nodes</option>
              {units.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name.toUpperCase()}</option>)}
            </select>
          </div>
          <button onClick={load} className="text-xs font-bold text-primary hover:text-primary-light uppercase tracking-widest transition-colors flex items-center gap-2">
            <span>↻</span> Refresh
          </button>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <AdminToast
            message={toast.msg}
            type={toast.type}
            mode="light"
            className="mx-4 mt-3"
          />
        )}

        {/* ── Table ── */}
        {loading ? (
          <AdminLoadingState text="Synchronizing Data…" className="h-64 text-slate-500" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 w-10 text-center">
                    <input 
                      type="checkbox" 
                      checked={members.length > 0 && selectedIds.length === members.length}
                      onChange={toggleAll}
                      className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/40"
                    />
                  </th>
                  {['Member Identity', 'Cluster ID', 'Uplink', 'Institution', 'Security State', 'Lifecycle', 'Operations'].map(c => (
                    <th key={c} className="text-left px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      {search ? `No members matching "${search}"` : 'No members found.'}
                    </td>
                  </tr>
                )}
                {members.map(m => (
                  <tr key={m.id} className={`hover:bg-white/[0.03] transition-colors group ${selectedIds.includes(m.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-8 py-5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleSelect(m.id)}
                        className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/40"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-5">
                        <div className="relative shrink-0">
                          {m.photo_path
                            ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${m.photo_path}`} alt="" className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/10 group-hover:scale-105 transition-transform" />
                            : <div className="w-12 h-12 rounded-2xl bg-white/5 text-primary flex items-center justify-center text-sm font-black border border-white/10 shadow-inner group-hover:scale-105 transition-transform">{m.full_name?.[0]}</div>
                          }
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${m.status === 'active' ? 'bg-emerald-500' : m.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight truncate">{m.full_name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{m.organizational_unit?.name ?? 'Unassigned Unit'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 font-bold text-[10px] text-slate-500 uppercase tracking-widest">{m.member_id ?? 'PENDING'}</td>
                    <td className="px-4 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">{m.mobile ?? '—'}</td>
                    <td className="px-4 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-[160px] truncate">{m.institution ?? '—'}</td>
                    <td className="px-4 py-5 text-slate-400">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusStyle[m.status] ?? 'bg-white/5 text-slate-400'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest">{m.join_year}</td>
                    <td className="px-8 py-5 text-slate-400">
                      <div className="flex gap-2.5 flex-wrap">
                        <Link to={`/dashboard/admin/members/${m.id}`} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5">View</Link>
                        {m.status === 'pending'   && <button onClick={() => doStatus(m.id, 'approve')} disabled={actionRow === m.id} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-slate-900 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">Approve</button>}
                        {m.status === 'active'    && <button onClick={() => doStatus(m.id, 'suspend')} disabled={actionRow === m.id} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-400 rounded-xl border border-amber-400/20 hover:bg-amber-400/30 transition-all disabled:opacity-50">Suspend</button>}
                        {m.status === 'suspended' && <button onClick={() => doStatus(m.id, 'approve')} disabled={actionRow === m.id} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-slate-900 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50">Reinstate</button>}
                        {m.status !== 'expelled'  && <button onClick={() => doStatus(m.id, 'expel')}   disabled={actionRow === m.id} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all disabled:opacity-50">Expel</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {meta?.last_page > 1 && (
              <div className="flex justify-center gap-2 px-6 py-6 border-t border-white/5 bg-white/[0.01]">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${page === p ? 'bg-primary text-white shadow-lg shadow-primary-500/20' : 'bg-white/5 border border-white/5 text-slate-500 hover:text-slate-100 hover:bg-white/10'}`}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </AdminSurface>

      {/* ── Bulk Action Bar ── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 pl-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs ring-4 ring-primary/5">
                  {selectedIds.length}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Entities Isolated</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Awaiting sector command</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={() => doBulkAction('approve')}
                  disabled={saving}
                  className="px-6 py-3 bg-primary hover:bg-emerald-400 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                >
                  Approve All
                </button>
                <button
                  onClick={() => doBulkAction('suspend')}
                  disabled={saving}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-amber-400 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Suspend
                </button>
                <button
                  onClick={() => doBulkAction('expel')}
                  disabled={saving}
                  className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Expel
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

      {/* ── Add Member Slide-Over ── */}
      {showAdd && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] transition-opacity"
            onClick={() => !saving && setShowAdd(false)}
          />
          <aside className="fixed right-0 top-0 h-full w-full max-w-lg bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[70] flex flex-col border-l border-white/10 animate-slide-in-right">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Add Member Manually</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-colors text-2xl leading-none">✕</button>
            </div>

            <form onSubmit={submitAdd} className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
              <div className="border border-primary/20 bg-primary/5 rounded-2xl p-4 flex gap-3">
                <span className="text-primary text-lg mt-0.5">ℹ</span>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  Admin-created members are set to <strong className="text-primary-light">Active</strong> by default and bypass the registration approval queue.
                </p>
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pt-2 border-b border-white/5 pb-2">Account Credentials</p>
              <div className="grid grid-cols-2 gap-4">
                <Lbl label="Email Address" required err={formErr.email?.[0]}>
                  <input ref={firstRef} type="email" value={form.email} onChange={e => setF('email', e.target.value)} className={inp} required />
                </Lbl>
                <Lbl label="Initial Password" required err={formErr.password?.[0]}>
                  <input type="password" value={form.password} onChange={e => setF('password', e.target.value)} className={inp} required minLength={8} />
                </Lbl>
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pt-4 border-b border-white/5 pb-2">Personal Profile</p>
              <Lbl label="Full Name" required err={formErr.full_name?.[0]}>
                <input type="text" value={form.full_name} onChange={e => setF('full_name', e.target.value)} className={inp} required maxLength={191} />
              </Lbl>
              <div className="grid grid-cols-2 gap-4">
                <Lbl label="Mobile Number" err={formErr.mobile?.[0]}>
                  <input type="tel" value={form.mobile} onChange={e => setF('mobile', e.target.value)} className={inp} />
                </Lbl>
                <Lbl label="Date of Birth" err={formErr.date_of_birth?.[0]}>
                  <input type="date" value={form.date_of_birth} onChange={e => setF('date_of_birth', e.target.value)} className={inp} />
                </Lbl>
                <Lbl label="Gender">
                  <select value={form.gender} onChange={e => setF('gender', e.target.value)} className={inp}>
                    <option value="">Select Option</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Lbl>
                <Lbl label="Blood Group">
                  <select value={form.blood_group} onChange={e => setF('blood_group', e.target.value)} className={inp}>
                    <option value="">Select Option</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Lbl>
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pt-4 border-b border-white/5 pb-2">Academic & Organisational</p>
              <div className="grid grid-cols-2 gap-4">
                <Lbl label="Institution">
                  <input type="text" value={form.institution} onChange={e => setF('institution', e.target.value)} className={inp} maxLength={255} />
                </Lbl>
                <Lbl label="Department">
                  <input type="text" value={form.department} onChange={e => setF('department', e.target.value)} className={inp} maxLength={191} />
                </Lbl>
                <Lbl label="Org. Unit" err={formErr.organizational_unit_id?.[0]}>
                  <select value={form.organizational_unit_id} onChange={e => setF('organizational_unit_id', e.target.value)} className={inp}>
                    <option value="">Not Assigned</option>
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

              <div className="flex gap-4 pt-6 pb-12">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-black rounded-xl text-sm transition-all shadow-xl shadow-primary-500/20 active:scale-95"
                >
                  {saving ? 'Processing…' : 'Finalize & Add Member'}
                </button>
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-6 py-3 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all underline decoration-slate-400"
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

