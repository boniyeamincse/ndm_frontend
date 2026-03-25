import React, { useState, useCallback, useRef } from 'react';
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
  });

  const [results,   setResults]   = useState(null);
  const [meta,      setMeta]      = useState(null);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);
  const [error,     setError]     = useState(null);

  const abortRef = useRef(null);

  const run = useCallback(async (p = 1) => {
    const params = { page: p };
    if (form.search)      params.search      = form.search.trim();
    if (form.member_id)   params.member_id   = form.member_id.trim();
    if (form.mobile)      params.mobile      = form.mobile.trim();
    if (form.institution) params.institution = form.institution.trim();
    if (form.status)      params.status      = form.status;

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
    setForm({ search: '', member_id: '', mobile: '', institution: '', status: '' });
    setResults(null);
    setMeta(null);
    setSearched(false);
    setError(null);
  };

  const hasFilters = Object.values(form).some(v => v !== '');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Member Search</h1>
            <p className="text-sm text-gray-500 mt-1">Find any member by name, ID, mobile, or institution</p>
          </div>
          <Link to="/dashboard/admin/members" className="text-sm text-primary hover:underline">
            ← All Members
          </Link>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Full-text search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Name / Email / NID
            </label>
            <input
              type="text"
              value={form.search}
              onChange={e => setForm(f => ({ ...f, search: e.target.value }))}
              placeholder="Search by name, email or NID…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Member ID */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Member ID
            </label>
            <input
              type="text"
              value={form.member_id}
              onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}
              placeholder="e.g. NDM-2024-001"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Mobile Number
            </label>
            <input
              type="tel"
              value={form.mobile}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
              placeholder="e.g. 017XXXXXXXX"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Institution
            </label>
            <input
              type="text"
              value={form.institution}
              onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
              placeholder="School / College / University…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || !hasFilters}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
          {hasFilters && (
            <button type="button" onClick={handleReset} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Clear
            </button>
          )}
          {meta && (
            <span className="text-xs text-gray-400 ml-auto">
              {meta.total} result{meta.total !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">{error}</div>
      )}

      {/* Results */}
      {searched && !loading && (
        results?.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-gray-900">No members found</h3>
            <p className="text-sm text-gray-500 mt-1">Try different search terms or clear filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Member', 'Member ID', 'Mobile', 'Institution', 'Unit', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {m.photo_path
                            ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${m.photo_path}`} alt="" className="w-9 h-9 rounded-full object-cover" />
                            : <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{m.full_name?.[0]}</div>
                          }
                          <div>
                            <p className="font-semibold text-gray-900">{m.full_name}</p>
                            <p className="text-xs text-gray-400">{m.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{m.member_id ?? '—'}</td>
                      <td className="px-4 py-3.5 text-gray-600">{m.mobile ?? '—'}</td>
                      <td className="px-4 py-3.5 text-gray-600 max-w-[180px] truncate">{m.institution ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          {m.organizational_unit?.name ?? 'Not assigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[m.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {m.status ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/dashboard/admin/members/${m.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta?.last_page > 1 && (
              <div className="flex justify-center gap-2 px-4 py-3 border-t border-gray-100">
                <button
                  onClick={() => run(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  Page {page} of {meta.last_page}
                </span>
                <button
                  onClick={() => run(page + 1)}
                  disabled={page >= meta.last_page}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next →
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
