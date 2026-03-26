import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const downloadBlob = (data, filename, mimeType) => {
  const blob = new Blob([data], { type: mimeType });
  const url  = window.URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.style.display = 'none';
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 1000);
};

const MemberReports = () => {
  const [filters, setFilters] = useState({ status: '', unit_id: '', year: '' });
  const [units, setUnits]     = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [error, setError]     = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    api.get('/units/campus').then(r => setUnits(r.data?.data ?? r.data ?? [])).catch(() => {});
  }, []);

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const buildParams = () => {
    const p = {};
    if (filters.status)  p.status  = filters.status;
    if (filters.unit_id) p.unit_id = filters.unit_id;
    if (filters.year)    p.year    = filters.year;
    return p;
  };

  const downloadPdf = async () => {
    setLoadingPdf(true);
    setError(null);
    try {
      const res = await api.get('/admin/members/export/pdf', {
        params: buildParams(),
        responseType: 'blob',
      });
      const filename = `NDM_Members_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      const contentType = res.headers['content-type'] ?? '';
      if (!contentType.includes('pdf')) {
        const text = await res.data.text();
        throw new Error(text || 'Server did not return a PDF.');
      }
      downloadBlob(res.data, filename, 'application/pdf');
      showSuccess('PDF report downloaded successfully.');
    } catch {
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setLoadingPdf(false);
    }
  };

  const downloadCsv = async () => {
    setLoadingCsv(true);
    setError(null);
    try {
      const res = await api.get('/admin/members/export/csv', {
        params: buildParams(),
        responseType: 'blob',
      });
      const filename = `NDM_Members_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadBlob(res.data, filename, 'text/csv;charset=utf-8');
      showSuccess('Excel/CSV report downloaded successfully.');
    } catch {
      setError('Failed to generate CSV report. Please try again.');
    } finally {
      setLoadingCsv(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      {/* ── Page Header ── */}
      <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Data Extraction</p>
          <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Intelligence Harvesting</h1>
          <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Execute high-fidelity data exports from the core member registry. Generate canonical documentation and analytical manifests.</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-4 animate-in fade-in duration-500">
        {error && (
          <div className="px-6 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-3">
            <span className="text-lg">⚠</span> {error}
          </div>
        )}
        {successMsg && (
          <div className="px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-3">
            <span className="text-lg">✓</span> {successMsg}
          </div>
        )}
      </div>

      {/* Filter card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
        <div className="flex justify-between items-start mb-10 relative">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Export Parameters</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Define vector coordinates for data extraction.</p>
          </div>
          <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {filters.status || filters.unit_id || filters.year ? 'FILTER_ACTIVE' : 'GLOBAL_DUMP'}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 relative">
          {[
            { label: 'Member Status', key: 'status', options: [
              { val: '', label: 'ALL_STATUSES' },
              { val: 'active', label: 'ACTIVE' },
              { val: 'pending', label: 'PENDING' },
              { val: 'suspended', label: 'SUSPENDED' },
              { val: 'expelled', label: 'EXPELLED' }
            ]},
            { label: 'Org Unit', key: 'unit_id', options: [
              { val: '', label: 'ALL_UNITS' },
              ...units.map(u => ({ val: u.id, label: u.name.toUpperCase() }))
            ]},
            { label: 'Join Cycle', key: 'year', options: [
              { val: '', label: 'ALL_CYCLES' },
              ...YEARS.map(y => ({ val: y, label: y }))
            ]}
          ].map((field, i) => (
            <div key={i} className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{field.label}</label>
              <select
                value={filters[field.key]}
                onChange={e => setF(field.key, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer hover:bg-white/[0.08] transition-all shadow-inner"
              >
                {field.options.map((opt, j) => (
                  <option key={j} value={opt.val} className="bg-slate-900">{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Download cards */}
      <div className="grid sm:grid-cols-2 gap-8">
        {/* PDF */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden group/pdf transition-all hover:bg-white/[0.07]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover/pdf:opacity-100 transition-opacity" />
          <div className="flex items-start gap-6 relative">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-3xl shadow-inner group-hover/pdf:scale-110 transition-transform">
              📄
            </div>
            <div>
              <h3 className="font-black text-white text-xl uppercase tracking-tight">Canonical PDF</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">A4 Standard · Print Ready</p>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em] bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 space-y-2 relative">
            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-rose-500" /> NDM IDENTITY HEADER</p>
            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-rose-500" /> CLUSTER ANALYTICS SUMMARY</p>
            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-rose-500" /> 11-VECTOR DATA MATRIX</p>
          </div>
          <button
            onClick={downloadPdf}
            disabled={loadingPdf}
            className="w-full py-5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] transition-all shadow-xl shadow-rose-900/20 flex items-center justify-center gap-3 relative z-10 active:scale-95"
          >
            {loadingPdf ? (
              <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> SYNCHRONIZING...</>
            ) : (
              <>↓ INITIATE PDF DOWNLOAD</>
            )}
          </button>
        </div>

        {/* Excel / CSV */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden group/csv transition-all hover:bg-white/[0.07]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover/csv:opacity-100 transition-opacity" />
          <div className="flex items-start gap-6 relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl shadow-inner group-hover/csv:scale-110 transition-transform">
              📊
            </div>
            <div>
              <h3 className="font-black text-white text-xl uppercase tracking-tight">Binary CSV/XLSX</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">UTF-8 BOM · Pivot Ready</p>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em] bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 space-y-2 relative">
            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" /> 18-VECTOR EXTENDED SCHEMA</p>
            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" /> CROSS-SYSTEM COMPATIBILITY</p>
            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" /> ANALYTICS PRE-FORMATTED</p>
          </div>
          <button
            onClick={downloadCsv}
            disabled={loadingCsv}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 relative z-10 active:scale-95"
          >
            {loadingCsv ? (
              <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> SYNCHRONIZING...</>
            ) : (
              <>↓ INITIATE CSV HARVEST</>
            )}
          </button>
        </div>
      </div>

      <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] text-center pt-8">
        Harvested entities are ephemeral snapshots of the core registry. Periodic re-extraction advised.
      </p>
    </div>
  );
};

export default MemberReports;
