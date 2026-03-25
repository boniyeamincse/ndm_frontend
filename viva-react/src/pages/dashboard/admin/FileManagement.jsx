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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-gradient-to-br from-white via-white/95 to-primary-50/20 border border-primary-200/30 p-6">
        <h1 className="text-3xl font-black text-slate-900">File Management</h1>
        <p className="text-sm text-primary-600 font-medium mt-1">Upload, organize, and manage organization files</p>
      </div>

      {/* ── Upload Section ── */}
      <div className="rounded-2xl border border-primary-200/30 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Upload Files</h2>
        <div className="border-2 border-dashed border-primary-300 rounded-lg p-8 text-center bg-primary-50/30 hover:bg-primary-50 transition-colors cursor-pointer">
          <input type="file" className="hidden" id="file-upload" multiple />
          <label htmlFor="file-upload" className="block cursor-pointer">
            <p className="text-4xl mb-3">📁</p>
            <p className="text-lg font-bold text-primary-700">Click to upload files</p>
            <p className="text-sm text-slate-500 mt-1">or drag and drop</p>
            <p className="text-xs text-slate-400 mt-2">Supported: PDF, CSV, XLSX, DOCX, Images up to 50 MB</p>
          </label>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-primary-50 border border-primary-200">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Upload Progress</p>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-primary-600 rounded-full"
            />
          </div>
          <p className="text-xs text-primary-600 mt-2">{uploadProgress > 0 && uploadProgress < 100 ? `Uploading... ${Math.floor(uploadProgress)}%` : ''}</p>
        </div>
      </div>

      {/* ── Storage Stats ── */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-primary-200/30 bg-gradient-to-br from-blue-50 to-blue-100/30 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Total Files</p>
          <p className="text-3xl font-black text-blue-900 mt-2">{files.length}</p>
        </div>
        <div className="rounded-2xl border border-primary-200/30 bg-gradient-to-br from-amber-50 to-amber-100/30 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Total Size</p>
          <p className="text-3xl font-black text-amber-900 mt-2">12.5 MB</p>
        </div>
        <div className="rounded-2xl border border-primary-200/30 bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Storage Used</p>
          <p className="text-3xl font-black text-emerald-900 mt-2">42%</p>
          <div className="h-1.5 bg-emerald-200 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-600" style={{ width: '42%' }} />
          </div>
        </div>
        <div className="rounded-2xl border border-primary-200/30 bg-gradient-to-br from-violet-50 to-violet-100/30 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Shared Files</p>
          <p className="text-3xl font-black text-violet-900 mt-2">1</p>
        </div>
      </div>

      {/* ── File Browser ── */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="rounded-2xl border border-primary-200/30 bg-white p-5 h-fit">
          <h3 className="font-bold text-slate-900 mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-all flex items-center justify-between ${
                  activeFilter === cat.id
                    ? 'bg-primary-50 border border-primary-300 text-primary-700 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* File List */}
        <div className="lg:col-span-3 rounded-2xl border border-primary-200/30 bg-white p-6">
          <h3 className="font-bold text-slate-900 mb-4">Files in {categories.find((c) => c.id === activeFilter)?.label}</h3>
          <div className="space-y-2">
            {files.map((file) => {
              const fileInfo = getFileIcon(file.type);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-primary-200/20 hover:bg-primary-50/30 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${fileInfo.color}`}>
                      {fileInfo.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {file.size} • Uploaded by {file.uploadedBy} • {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        file.access === 'public'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {file.access === 'public' ? '🌐 Public' : '🔒 Private'}
                    </span>
                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                      ⋮
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recently Accessed ── */}
      <div className="rounded-2xl border border-primary-200/30 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recently Accessed</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {files.slice(0, 3).map((file) => {
            const fileInfo = getFileIcon(file.type);
            return (
              <div key={file.id} className="rounded-lg border border-primary-200/20 p-4 hover:bg-primary-50/30 transition-colors cursor-pointer">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${fileInfo.color} mb-3`}>
                  {fileInfo.icon}
                </div>
                <p className="font-bold text-slate-900 text-sm truncate">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{file.size}</p>
                <p className="text-xs text-slate-400 mt-2">Modified: {file.uploadedAt}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default FileManagement;
