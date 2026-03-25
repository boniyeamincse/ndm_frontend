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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Member Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Export member data as a formatted PDF or Excel-compatible CSV.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}
      {successMsg && (
        <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">{successMsg}</div>
      )}

      {/* Filter card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-800">Filter Report Data</h2>
        <p className="text-xs text-slate-500">Leave all filters blank to export all members.</p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Member Status</label>
            <select
              value={filters.status}
              onChange={e => setF('status', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="expelled">Expelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Organizational Unit</label>
            <select
              value={filters.unit_id}
              onChange={e => setF('unit_id', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">All Units</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Join Year</label>
            <select
              value={filters.year}
              onChange={e => setF('year', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Download cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* PDF */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl flex-shrink-0">
              📄
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">PDF Report</h3>
              <p className="text-xs text-slate-500 mt-1">
                Formatted A4 landscape report with summary stats, status badges, and a print-ready table.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 space-y-0.5">
            <p>• NDM header + generation timestamp</p>
            <p>• Summary totals by status</p>
            <p>• Full member table (11 columns)</p>
          </div>
          <button
            onClick={downloadPdf}
            disabled={loadingPdf}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loadingPdf ? (
              <><span className="animate-spin">⟳</span> Generating…</>
            ) : (
              <><span>↓</span> Download PDF</>
            )}
          </button>
        </div>

        {/* Excel / CSV */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl flex-shrink-0">
              📊
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Excel / CSV Report</h3>
              <p className="text-xs text-slate-500 mt-1">
                CSV file with UTF-8 BOM — opens directly in Microsoft Excel and Google Sheets.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 space-y-0.5">
            <p>• 18 data columns including all fields</p>
            <p>• Compatible with Excel, Sheets, LibreOffice</p>
            <p>• Sortable, filterable, pivot-ready</p>
          </div>
          <button
            onClick={downloadCsv}
            disabled={loadingCsv}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loadingCsv ? (
              <><span className="animate-spin">⟳</span> Generating…</>
            ) : (
              <><span>↓</span> Download Excel / CSV</>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Reports are generated live from the database. Large datasets may take a moment.
      </p>
    </div>
  );
};

export default MemberReports;
