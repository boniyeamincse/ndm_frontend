import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FileManagement = () => {
  const [files, setFiles] = useState([
    { id: 1, name: 'Member_List_2026.csv', type: 'csv', size: '2.4 MB', uploadedBy: 'Admin User', uploadedAt: '2026-03-20', access: 'private' },
    { id: 2, name: 'Constitution_Draft.pdf', type: 'pdf', size: '1.8 MB', uploadedBy: 'System', uploadedAt: '2026-03-15', access: 'public' },
    { id: 3, name: 'Annual_Report_2025.xlsx', type: 'xlsx', size: '3.2 MB', uploadedBy: 'Finance Team', uploadedAt: '2026-03-10', access: 'private' },
    { id: 4, name: 'ID_Card_Template.psd', type: 'psd', size: '5.6 MB', uploadedBy: 'Design Team', uploadedAt: '2026-03-01', access: 'private' },
  ]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const fileTypes = [
    { ext: 'pdf', icon: '📄', color: 'bg-red-100 text-red-700' },
    { ext: 'csv', icon: '📊', color: 'bg-blue-100 text-blue-700' },
    { ext: 'xlsx', icon: '📈', color: 'bg-green-100 text-green-700' },
    { ext: 'psd', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
    { ext: 'docx', icon: '📝', color: 'bg-slate-100 text-slate-700' },
  ];

  const categories = [
    { id: 'all', label: 'All Files', count: files.length },
    { id: 'documents', label: 'Documents', count: 5 },
    { id: 'reports', label: 'Reports', count: 3 },
    { id: 'forms', label: 'Forms & Templates', count: 2 },
    { id: 'media', label: 'Media', count: 1 },
  ];

  const getFileIcon = (fileType) => {
    const match = fileTypes.find((ft) => ft.ext === fileType?.toLowerCase());
    return match || fileTypes[4];
  };

  const handleUploadFile = () => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 300);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
      {/* ── Page Header ── */}
      <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Storage Governance</p>
          <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Data Vault Protocol</h1>
          <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Manage organizational assets, canonical documentation, and encrypted registry exports within the NDM secure storage cluster.</p>
        </div>
      </div>

      {/* ── Upload Section ── */}
      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 relative">Ingest New Assets</h2>
        <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group/upload cursor-pointer relative z-10">
          <input type="file" className="hidden" id="file-upload" multiple />
          <label htmlFor="file-upload" className="block cursor-pointer">
            <p className="text-4xl mb-4 group-hover/upload:scale-110 transition-transform">📁</p>
            <p className="text-sm font-black text-white uppercase tracking-widest">Initialize Asset Transfer</p>
            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">or drop entities into the buffer</p>
            <p className="text-[9px] text-slate-600 mt-4 font-black uppercase tracking-[0.15em]">Limit: 50MB per cluster unit · PDF, CSV, XLSX, DOCX</p>
          </label>
        </div>
        <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner relative z-10">
          <div className="flex justify-between items-end mb-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-primary">Transfer Synchronicity</p>
            <p className="text-xs font-black text-white tabular-nums">{uploadProgress > 0 && uploadProgress < 100 ? `${Math.floor(uploadProgress)}%` : uploadProgress === 100 ? 'SUCCESS' : 'STANDBY'}</p>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
            />
          </div>
        </div>
      </div>

      {/* ── Storage Stats ── */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Total Assets', val: files.length, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
          { label: 'Cluster Load', val: '12.5 MB', color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
          { label: 'Quota Usage', val: '42%', color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', bar: 42 },
          { label: 'Shared Nodes', val: '01', color: 'text-violet-400', bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-[2rem] border ${stat.border} ${stat.bg} p-8 backdrop-blur-xl shadow-xl transition-all hover:scale-[1.02]`}>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
            <p className={`text-3xl font-black mt-3 uppercase tracking-tighter ${stat.color}`}>{stat.val}</p>
            {stat.bar && (
              <div className="h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${stat.bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── File Browser ── */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 h-fit shadow-2xl space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Sectors</h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`w-full text-left px-5 py-4 rounded-2xl transition-all flex items-center justify-between group/cat ${
                  activeFilter === cat.id
                    ? 'bg-primary text-slate-900 font-black shadow-lg shadow-primary/20'
                    : 'bg-white/5 border border-transparent hover:border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] uppercase tracking-widest leading-none">{cat.label}</span>
                <span className={`text-[9px] font-black px-2 py-1 rounded-md ${activeFilter === cat.id ? 'bg-slate-900 text-primary' : 'bg-white/10 text-slate-500'}`}>
                  {cat.count < 10 ? `0${cat.count}` : cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* File List */}
        <div className="lg:col-span-3 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 relative">
            Sector Content: {categories.find((c) => c.id === activeFilter)?.label.toUpperCase()}
          </h3>
          <div className="space-y-4 relative">
            {files.map((file) => {
              const fileInfo = getFileIcon(file.type);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group/file"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${fileInfo.color.replace('bg-', 'bg-').replace('-100', '/10').replace('text-', 'text-').replace('-700', '-400')}`}>
                      {fileInfo.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-white text-sm uppercase tracking-tight group-hover/file:text-primary transition-colors">{file.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest flex items-center gap-3">
                        {file.size} <span className="w-1 h-1 rounded-full bg-slate-800" /> 
                        BY {file.uploadedBy.toUpperCase()} <span className="w-1 h-1 rounded-full bg-slate-800" /> 
                        {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md ring-1 ${
                        file.access === 'public'
                          ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
                      }`}
                    >
                      {file.access.toUpperCase()} PROTOCOL
                    </span>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recently Accessed ── */}
      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 relative">Cache Manifest (Recent)</h2>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {files.slice(0, 3).map((file) => {
            const fileInfo = getFileIcon(file.type);
            return (
              <div key={file.id} className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 hover:bg-white/5 hover:border-white/10 hover:scale-[1.02] transition-all cursor-pointer group/card">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner mb-6 ${fileInfo.color.replace('bg-', 'bg-').replace('-100', '/10').replace('text-', 'text-').replace('-700', '-400')}`}>
                  {fileInfo.icon}
                </div>
                <p className="font-black text-white text-sm uppercase tracking-tight group-hover/card:text-primary transition-colors truncate">{file.name}</p>
                <div className="mt-4 flex flex-col gap-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        {file.size}
                    </p>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">MODIFIED: {file.uploadedAt}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default FileManagement;
