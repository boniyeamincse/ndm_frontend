import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const STATUS_OPTS = [
  { value: '',          label: 'All Statuses' },
  { value: 'active',    label: 'Active' },
  { value: 'pending',   label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'expelled',  label: 'Expelled' },
];

const STATUS_BADGE = {
  active:    'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  suspended: 'bg-orange-100 text-orange-700',
  expelled:  'bg-red-100 text-red-700',
};

const MemberSearch = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    search:      '',
    member_id:   '',
    mobile:      '',
    institution: '',
    status:      '',
    organizational_unit_id: '',
  });

  const [units,    setUnits]     = useState([]);

  const [results,   setResults]   = useState(null);
  const [meta,      setMeta]      = useState(null);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);
  const [error,     setError]     = useState(null);

  const abortRef = useRef(null);

  useEffect(() => {
    api.get('/units/campus').then(r => setUnits(r.data?.data ?? r.data ?? [])).catch(() => {});
  }, []);

  const run = useCallback(async (p = 1) => {
    const params = { page: p };
    if (form.search)      params.search      = form.search.trim();
    if (form.member_id)   params.member_id   = form.member_id.trim();
    if (form.mobile)      params.mobile      = form.mobile.trim();
    if (form.institution) params.institution = form.institution.trim();
    if (form.status)      params.status      = form.status;
    if (form.organizational_unit_id) params.organizational_unit_id = form.organizational_unit_id;

    if (Object.keys(params).length === 1) return; // only page key → nothing entered

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/members', {
        params,
        signal: abortRef.current.signal,
      });
      const data = res.data.data;
      setResults(data.data);
      setMeta(data);
      setPage(p);
      setSearched(true);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        setError('Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleSubmit = (e) => {
    e.preventDefault();
    run(1);
  };

  const handleReset = () => {
    setForm({ search: '', member_id: '', mobile: '', institution: '', status: '', organizational_unit_id: '' });
    setResults(null);
    setMeta(null);
    setSearched(false);
    setError(null);
  };

  const hasFilters = Object.values(form).some(v => v !== '');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
      {/* ── Page Header ── */}
      <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Registry Intelligence</p>
            <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Registry Scan Protocol</h1>
            <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Execute deep-vector queries across the NDM membership database. Identify entities by name, ID, mobile, or institutional affiliation.</p>
          </div>
          <Link to="/dashboard/admin/members" className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl">
            ← Global Registry
          </Link>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {/* Full-text search */}
          <div className="lg:col-span-2 space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Universal Identifier (Name / Email / NID)</label>
            <input
              type="text"
              value={form.search}
              onChange={e => setForm(f => ({ ...f, search: e.target.value }))}
              placeholder="ENTER SEARCH QUERY..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-slate-800 shadow-inner"
            />
          </div>

          {/* Status */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Operational State</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer hover:bg-white/[0.08] transition-all shadow-inner"
            >
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value} className="bg-slate-900">{o.label.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Member ID */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Canonical Member-ID</label>
            <input
              type="text"
              value={form.member_id}
              onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}
              placeholder="NDM-XXXX-XXX"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-slate-800 shadow-inner"
            />
          </div>

          {/* Mobile */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Comms Vector (Mobile)</label>
            <input
              type="tel"
              value={form.mobile}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
              placeholder="+8801XXXXXXXXX"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-slate-800 shadow-inner"
            />
          </div>

          {/* Institution */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Institutional Node</label>
            <input
              type="text"
              value={form.institution}
              onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
              placeholder="UNIVERSITY / COLLEGE"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-slate-800 shadow-inner"
            />
          </div>

          {/* Unit Filter */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Organizational Cluster</label>
            <select
              value={form.organizational_unit_id}
              onChange={e => setForm(f => ({ ...f, organizational_unit_id: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer hover:bg-white/[0.08] transition-all shadow-inner"
            >
              <option value="" className="bg-slate-900">ALL NODES</option>
              {units.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-8 mt-8 border-t border-white/5 relative">
          <button
            type="submit"
            disabled={loading || !hasFilters}
            className="px-10 py-5 bg-primary text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            {loading ? 'Executing Scan...' : 'Initiate Scan'}
          </button>
          {hasFilters && (
            <button type="button" onClick={handleReset} className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
              Reset Protocol
            </button>
          )}
          {meta && (
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] ml-auto">
              {meta.total} ENTIT{meta.total !== 1 ? 'IES' : 'Y'} ISOLATED
            </span>
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="px-8 py-5 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-rose-400 animate-in fade-in slide-in-from-top-2 duration-300">
          ⚠ PROTOCOL_ERROR: {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        results?.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-24 text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-30 blur-3xl" />
            <div className="relative">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform cursor-default">🔍</div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Zero Matches Isolated</h3>
              <p className="text-[10px] text-slate-500 mt-4 max-w-sm mx-auto font-black uppercase tracking-widest leading-relaxed">The scan returned no results for the specified criteria. Adjust query coordinates and re-initiate.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
            <div className="overflow-x-auto relative">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    {['Member Entity', 'ID_Vector', 'Mobile', 'Node', 'Level', 'State', ''].map(h => (
                      <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.04] transition-all group/row">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {m.photo_path
                            ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${m.photo_path}`} alt="" className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10 shadow-lg" />
                            : <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-primary flex items-center justify-center text-xs font-black">{m.full_name?.[0]}</div>
                          }
                          <div>
                            <p className="font-black text-white uppercase tracking-tight group-hover/row:text-primary transition-colors">{m.full_name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{m.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-[10px] text-primary font-black uppercase tracking-widest">{m.member_id ?? 'PENDING'}</td>
                      <td className="px-6 py-5 text-slate-400 font-bold tabular-nums">{m.mobile ?? '—'}</td>
                      <td className="px-6 py-5 text-slate-300 font-black uppercase tracking-tight max-w-[180px] truncate">{m.institution ?? '—'}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest shadow-inner group-hover/row:border-primary/20 transition-colors">
                          {m.organizational_unit?.name || 'ROOT'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-black text-[9px] uppercase tracking-widest ring-1 shadow-inner ${m.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : m.status === 'pending' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' : 'bg-rose-500/10 text-rose-400 ring-rose-500/20'}`}>
                          <span className={`w-1 h-1 rounded-full ${m.status === 'active' ? 'bg-emerald-400 animate-pulse' : m.status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                          {m.status ?? 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/dashboard/admin/members/${m.id}`}
                          className="inline-flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 text-primary rounded-xl hover:bg-primary hover:text-slate-900 hover:scale-105 transition-all shadow-lg active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta?.last_page > 1 && (
              <div className="flex justify-center items-center gap-6 px-10 py-8 bg-white/5 border-t border-white/10 relative">
                <button
                  onClick={() => run(page - 1)}
                  disabled={page <= 1}
                  className="px-6 py-3 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                >
                  ← PREV_PAGE
                </button>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                  BLOCK {page} OF {meta.last_page}
                </span>
                <button
                  onClick={() => run(page + 1)}
                  disabled={page >= meta.last_page}
                  className="px-6 py-3 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                >
                  NEXT_PAGE →
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default MemberSearch;
