import React, { useState } from 'react';
import { motion } from 'framer-motion';

const BulkOperations = () => {
  const [operationType, setOperationType] = useState('status-change');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [operationHistory, setOperationHistory] = useState([
    { id: 1, type: 'Status Change', membersAffected: 42, status: 'Completed', date: '2026-03-25 14:30', details: 'Activated 42 pending members' },
    { id: 2, type: 'Unit Assignment', membersAffected: 28, status: 'Completed', date: '2026-03-24 10:15', details: 'Assigned members to Dhaka division' },
  ]);

  const operationTypes = [
    { id: 'status-change', label: 'Bulk Status Change', desc: 'Update member status for multiple members' },
    { id: 'unit-assignment', label: 'Bulk Unit Assignment', desc: 'Assign members to organizational units' },
    { id: 'role-assignment', label: 'Bulk Role Assignment', desc: 'Assign roles to multiple members' },
    { id: 'import', label: 'Bulk Import', desc: 'Import new members from CSV file' },
    { id: 'export', label: 'Bulk Export', desc: 'Export member data to CSV' },
    { id: 'email-send', label: 'Bulk Email', desc: 'Send emails to multiple members' },
  ];

  const statuses = ['Active', 'Suspended', 'Pending', 'Expelled'];
  const roles = ['Member', 'Leader', 'Admin', 'SuperAdmin'];
  const units = ['Central Committee', 'Dhaka Division', 'Chittagong Division', 'Khulna Division'];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile({
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        uploadedAt: new Date().toLocaleString(),
      });
    }
  };

  const handleExecuteOperation = (params) => {
    const newOperation = {
      id: operationHistory.length + 1,
      type: operationTypes.find((op) => op.id === operationType)?.label,
      membersAffected: Math.floor(Math.random() * 100 + 10),
      status: 'Completed',
      date: new Date().toLocaleString(),
      details: params || 'Bulk operation executed',
    };
    setOperationHistory([newOperation, ...operationHistory]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
      {/* ── Page Header ── */}
      <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Organizational Logistics</p>
          <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Bulk Operations</h1>
          <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Execute mass state changes, algorithmic assignments, and high-volume registry injections across the NDM cluster.</p>
        </div>
      </div>

      {/* ── Operation Type Selection ── */}
      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 relative">Select Logic Vector</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
          {operationTypes.map((op) => (
            <button
              key={op.id}
              onClick={() => setOperationType(op.id)}
              className={`rounded-2xl border p-6 text-left transition-all group/btn ${
                operationType === op.id
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <p className={`font-black uppercase tracking-tight text-sm ${operationType === op.id ? 'text-primary' : 'text-white'}`}>{op.label}</p>
              <p className="text-[10px] text-slate-500 mt-2 font-bold group-hover/btn:text-slate-400 transition-colors uppercase tracking-widest leading-relaxed">{op.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Operation Configuration ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
          
          <div className="relative">
            {operationType === 'status-change' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Status Protocol</label>
                  <select className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer">
                    <option className="bg-slate-900">Select protocol...</option>
                    {statuses.map((s) => (
                      <option key={s} value={s} className="bg-slate-900">
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Member Registry Selection</label>
                    <div className="border border-white/10 rounded-[1.5rem] p-6 bg-white/[0.02] max-h-64 overflow-y-auto space-y-2 shadow-inner custom-scrollbar">
                    {[...Array(10)].map((_, i) => (
                        <label key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl cursor-pointer group/item transition-all border border-transparent hover:border-white/5">
                        <input type="checkbox" className="w-5 h-5 rounded bg-white/10 border-white/20 text-primary focus:ring-primary/40 cursor-pointer" />
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-300 group-hover/item:text-white uppercase tracking-tight">Member Cluster Alpha-{i + 1}</span>
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">UID: 000{i+1} · Verified</span>
                        </div>
                        </label>
                    ))}
                    </div>
                </div>
                <button
                  onClick={() => handleExecuteOperation(`Status updated for multiple members`)}
                  className="w-full px-6 py-4 rounded-2xl bg-primary text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Apply Status Transformation
                </button>
              </div>
            )}

            {operationType === 'unit-assignment' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Organizational Topology Target</label>
                  <select className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer">
                    <option className="bg-slate-900">Select target unit...</option>
                    {units.map((u) => (
                      <option key={u} value={u} className="bg-slate-900">
                        {u.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handleExecuteOperation(`Members assigned to selected unit`)}
                  className="w-full px-6 py-4 rounded-2xl bg-primary text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Commit Topology Assignment
                </button>
              </div>
            )}

            {operationType === 'import' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Data Ingestion (CSV)</label>
                  <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-10 text-center bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] hover:border-primary/40 transition-all group/upload relative overflow-hidden">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="block cursor-pointer relative z-10">
                      {uploadFile ? (
                        <div className="space-y-2">
                          <p className="text-sm font-black text-primary uppercase tracking-tight">✓ {uploadFile.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Payload Size: {uploadFile.size} KB · Ready for parsing</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-3xl opacity-40 group-hover/upload:opacity-100 transition-opacity">📄</p>
                          <p className="text-xs font-black text-slate-300 uppercase tracking-widest mt-2">Initialize CSV Protocol</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">or drop asset into sector</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => handleExecuteOperation(`Imported members from CSV file`)}
                  className="w-full px-6 py-4 rounded-2xl bg-primary text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                  disabled={!uploadFile}
                >
                  Execute Data Ingestion
                </button>
              </div>
            )}

            {operationType === 'export' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/80 leading-relaxed">
                    Preparing high-fidelity export of the global member registry. All data will be serialized into canonical CSV format for offline analysis.
                  </p>
                </div>
                <button
                  onClick={() => handleExecuteOperation(`Exported members data`)}
                  className="w-full px-6 py-4 rounded-2xl bg-primary text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Drain Cluster Data (Export)
                </button>
              </div>
            )}

            {operationType === 'email-send' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Subject Header</label>
                  <input
                    type="text"
                    placeholder="ENTER BROADCAST SUBJECT..."
                    className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white font-black uppercase tracking-widest placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Message Payload</label>
                  <textarea
                    rows={5}
                    placeholder="CONSTRUCT BROADCAST CONTENT..."
                    className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner resize-none leading-relaxed"
                  />
                </div>
                <button
                  onClick={() => handleExecuteOperation(`Bulk emails sent to members`)}
                  className="w-full px-6 py-4 rounded-2xl bg-primary text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Initiate Mass Transmission
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Preview/Info Panel ── */}
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 h-fit shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Verification Mesh</h3>
          <div className="space-y-4 relative">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 group/stat hover:bg-white/[0.05] transition-all">
              <p className="text-[8px] text-primary/60 font-black uppercase tracking-widest">Logic Vector</p>
              <p className="text-xs font-black text-white mt-1 uppercase tracking-tight">
                {operationTypes.find((op) => op.id === operationType)?.label}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 group/stat hover:bg-white/[0.05] transition-all">
              <p className="text-[8px] text-primary/60 font-black uppercase tracking-widest">Impacted Nodes</p>
              <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-tight">ANALYZING CLUSTER...</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 group/stat hover:bg-white/[0.05] transition-all">
              <p className="text-[8px] text-primary/60 font-black uppercase tracking-widest">Execution State</p>
              <p className="text-xs font-black text-emerald-400 mt-1 uppercase tracking-tight">READY_FOR_HANDSHAKE</p>
            </div>
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 mt-6 relative overflow-hidden group/warn">
              <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl -mr-8 -mt-8" />
              <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest relative">⚠ Operational Hazard</p>
              <p className="text-[10px] text-rose-500/80 font-bold mt-2 leading-relaxed relative uppercase tracking-tight">Bulk mutations are atomic and irreversible within the current block. Verify all parameters before commit.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Operation History ── */}
      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 relative">Event Archive</h2>
        <div className="overflow-x-auto relative rounded-[1.5rem] border border-white/5 shadow-inner">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Operation Vector</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Nodes</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">State</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-bold uppercase tracking-tight text-[11px]">
              {operationHistory.map((op) => (
                <tr key={op.id} className="hover:bg-white/[0.04] transition-all group/row">
                  <td className="px-6 py-4 font-black text-white group-hover/row:text-primary transition-colors">{op.type}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium tabular-nums">{op.date}</td>
                  <td className="px-6 py-4 text-white tabular-nums">{op.membersAffected} Cluster Units</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-black text-[9px] uppercase tracking-widest ring-1 ring-emerald-500/20 shadow-inner">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      {op.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 group-hover/row:text-slate-400 transition-colors">{op.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default BulkOperations;
