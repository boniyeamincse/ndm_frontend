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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-gradient-to-br from-white via-white/95 to-primary-50/20 border border-primary-200/30 p-6">
        <h1 className="text-3xl font-black text-slate-900">Bulk Operations</h1>
        <p className="text-sm text-primary-600 font-medium mt-1">Perform actions on multiple members at once</p>
      </div>

      {/* ── Operation Type Selection ── */}
      <div className="rounded-2xl border border-primary-200/30 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Select Operation Type</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {operationTypes.map((op) => (
            <button
              key={op.id}
              onClick={() => setOperationType(op.id)}
              className={`rounded-lg border p-4 text-left transition-all ${
                operationType === op.id
                  ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                  : 'bg-slate-50 border-slate-200 hover:border-primary-200'
              }`}
            >
              <p className="font-bold text-slate-900 text-sm">{op.label}</p>
              <p className="text-[10px] text-slate-500 mt-1">{op.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Operation Configuration ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-primary-200/30 bg-white p-6 space-y-5">
          {operationType === 'status-change' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">New Status</label>
                <select className="w-full px-4 py-3 rounded-lg border border-primary-200/30 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-300">
                  <option>Select status...</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Members to Update</label>
                <div className="border border-primary-200/30 rounded-lg p-4 bg-slate-50 max-h-48 overflow-y-auto">
                  {[...Array(10)].map((_, i) => (
                    <label key={i} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" onChange={() => {}} />
                      <span className="text-sm text-slate-700">Member {i + 1} - member{i + 1}@example.com</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleExecuteOperation(`Status updated for multiple members`)}
                className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors"
              >
                Execute Status Change
              </button>
            </>
          )}

          {operationType === 'unit-assignment' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Target Unit</label>
                <select className="w-full px-4 py-3 rounded-lg border border-primary-200/30 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-300">
                  <option>Select unit...</option>
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handleExecuteOperation(`Members assigned to selected unit`)}
                className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors"
              >
                Assign to Unit
              </button>
            </>
          )}

          {operationType === 'import' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-3">Upload CSV File</label>
                <div className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center bg-primary-50/30 cursor-pointer hover:bg-primary-50 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="block cursor-pointer">
                    {uploadFile ? (
                      <>
                        <p className="text-sm font-bold text-primary-700">✓ {uploadFile.name}</p>
                        <p className="text-xs text-primary-600 mt-1">Size: {uploadFile.size} KB</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg">📄</p>
                        <p className="text-sm font-bold text-primary-700 mt-2">Click to upload CSV</p>
                        <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <button
                onClick={() => handleExecuteOperation(`Imported members from CSV file`)}
                className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
                disabled={!uploadFile}
              >
                Import Members
              </button>
            </>
          )}

          {operationType === 'export' && (
            <>
              <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
                <p className="text-sm text-slate-700">Export all member data to CSV format for analysis or backup.</p>
              </div>
              <button
                onClick={() => handleExecuteOperation(`Exported members data`)}
                className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors"
              >
                📥 Export to CSV
              </button>
            </>
          )}

          {operationType === 'email-send' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Email Subject</label>
                <input
                  type="text"
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-3 rounded-lg border border-primary-200/30 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Email Body</label>
                <textarea
                  rows={5}
                  placeholder="Enter email message..."
                  className="w-full px-4 py-3 rounded-lg border border-primary-200/30 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                />
              </div>
              <button
                onClick={() => handleExecuteOperation(`Bulk emails sent to members`)}
                className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors"
              >
                Send Emails
              </button>
            </>
          )}
        </div>

        {/* ── Preview/Info Panel ── */}
        <div className="rounded-2xl border border-primary-200/30 bg-primary-50/50 p-6 h-fit">
          <h3 className="font-bold text-slate-900 mb-4">Operation Summary</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white border border-primary-200/50">
              <p className="text-[10px] text-primary-600 font-bold uppercase">Type</p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {operationTypes.find((op) => op.id === operationType)?.label}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-primary-200/50">
              <p className="text-[10px] text-primary-600 font-bold uppercase">Members Affected</p>
              <p className="text-sm font-bold text-slate-900 mt-1">To be determined</p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-primary-200/50">
              <p className="text-[10px] text-primary-600 font-bold uppercase">Status</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Ready to execute</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mt-4">
              <p className="text-[10px] text-amber-600 font-bold uppercase">⚠ Warning</p>
              <p className="text-xs text-amber-700 mt-1">Bulk operations cannot be undone. Please verify before executing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Operation History ── */}
      <div className="rounded-2xl border border-primary-200/30 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Operation History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-primary-200/30">
              <tr className="text-left text-[10px] uppercase tracking-wider text-primary-600 font-bold">
                <th className="px-4 py-3">Operation Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Members Affected</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100/50">
              {operationHistory.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{op.type}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{op.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{op.membersAffected}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                      ✓ {op.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{op.details}</td>
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
