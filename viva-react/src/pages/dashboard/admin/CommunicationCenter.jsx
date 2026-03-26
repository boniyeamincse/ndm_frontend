import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const CommunicationCenter = () => {
  const [messageType, setMessageType] = useState('announcement');
  const [recipientType, setRecipientType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    channel: 'email',
    recipientGroups: [],
    scheduledFor: '',
    priority: 'normal',
  });
  const [drafts, setDrafts] = useState([]);
  const [sent, setSent] = useState([]);
  const fileInputRef = useRef(null);

  const messageTypes = [
    { id: 'announcement', label: 'Announcement', desc: 'Organization-wide message' },
    { id: 'notification', label: 'Notification', desc: 'Targeted alert' },
    { id: 'email', label: 'Email Campaign', desc: 'Formal email message' },
    { id: 'emergency', label: 'Emergency Alert', desc: 'Urgent message' },
  ];

  const channels = [
    { id: 'email', label: 'Email', icon: '✉' },
    { id: 'sms', label: 'SMS', icon: '💬' },
    { id: 'inapp', label: 'In-App', icon: '🔔' },
    { id: 'all', label: 'All Channels', icon: '📢' },
  ];

  const recipientGroups = [
    { id: 'all', label: 'All Members' },
    { id: 'active', label: 'Active Members' },
    { id: 'leaders', label: 'Leaders & Admins' },
    { id: 'unit', label: 'Specific Unit' },
    { id: 'custom', label: 'Custom Selection' },
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
    { id: 'normal', label: 'Normal', color: 'bg-slate-100 text-slate-700' },
    { id: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
    { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
  ];

  const handleSaveDraft = () => {
    const newDraft = {
      id: Date.now(),
      ...formData,
      savedAt: new Date().toLocaleString(),
    };
    setDrafts([...drafts, newDraft]);
    setFormData({
      title: '',
      message: '',
      channel: 'email',
      recipientGroups: [],
      scheduledFor: '',
      priority: 'normal',
    });
  };

  const handleSendMessage = () => {
    const newMessage = {
      id: Date.now(),
      ...formData,
      sentAt: new Date().toLocaleString(),
      recipients: 2547,
    };
    setSent([...sent, newMessage]);
    setFormData({
      title: '',
      message: '',
      channel: 'email',
      recipientGroups: [],
      scheduledFor: '',
      priority: 'normal',
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
      {/* ── Page Header ── */}
      <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Communication Protocol</p>
          <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Broadcast Command</h1>
          <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Orchestrate organization-wide transmissions, targeted alerts, and formal campaigns across the NDM infrastructure.</p>
        </div>
      </div>

      {/* ── Message Composer ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
          
          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 ml-1">Transmission Vector</label>
            <div className="grid grid-cols-2 gap-3">
              {messageTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMessageType(type.id)}
                  className={`rounded-2xl p-5 text-left transition-all border group/btn ${
                    messageType === type.id
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10 scale-105'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className={`text-xs font-black uppercase tracking-tight ${messageType === type.id ? 'text-primary' : 'text-white'}`}>{type.label}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-bold group-hover/btn:text-slate-400 transition-colors uppercase tracking-tight">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Signal Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ENTER BROADCAST ID..."
              className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white font-black uppercase tracking-widest placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner"
            />
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Payload Content</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="CONSTRUCT MESSAGE NARRATIVE..."
              rows={6}
              className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-6 relative">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Relay Channel</label>
              <div className="grid grid-cols-2 gap-2">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setFormData({ ...formData, channel: ch.id })}
                    className={`rounded-xl p-3 text-center transition-all border ${
                      formData.channel === ch.id
                        ? 'bg-primary/20 border-primary text-primary scale-105 shadow-lg shadow-primary/10'
                        : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl block mb-1 opacity-80">{ch.icon}</span>
                    <p className="text-[9px] font-black uppercase tracking-widest">{ch.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Priority Level</label>
              <div className="grid grid-cols-1 gap-2">
                {priorities.slice(1).map((pri) => (
                  <button
                    key={pri.id}
                    onClick={() => setFormData({ ...formData, priority: pri.id })}
                    className={`rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border ${
                      formData.priority === pri.id 
                        ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' 
                        : 'bg-white/5 border-white/10 text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {pri.label} PROTOCOL
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Temporal Sync (Optional)</label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:text-white transition-all shadow-inner"
            />
          </div>
        </div>

        {/* ── Recipients & Preview ── */}
        <div className="space-y-6 relative">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Target Units</h3>
            <div className="space-y-1">
              {recipientGroups.map((group) => (
                <label key={group.id} className="flex items-center gap-4 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all group/label">
                  <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.recipientGroups.includes(group.id)}
                        onChange={(e) => {
                        if (e.target.checked) {
                            setFormData({
                            ...formData,
                            recipientGroups: [...formData.recipientGroups, group.id],
                            });
                        } else {
                            setFormData({
                            ...formData,
                            recipientGroups: formData.recipientGroups.filter((r) => r !== group.id),
                            });
                        }
                        }}
                        className="w-5 h-5 rounded bg-white/10 border-white/20 text-primary focus:ring-primary/40 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/label:text-white transition-colors">{group.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Preview ── */}
          <div className="rounded-[2.5rem] border border-primary/20 bg-primary/5 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 border-b border-primary/10 pb-4">Signal Preview</h3>
            <div className="space-y-5 relative">
              <div>
                <p className="text-[8px] text-primary/60 font-black uppercase tracking-widest mb-1">Broadast ID</p>
                <p className="text-sm text-white font-black uppercase tracking-tight">{formData.title || 'NULL'}</p>
              </div>
              <div>
                <p className="text-[8px] text-primary/60 font-black uppercase tracking-widest mb-1">Target Coordinates</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
                    {formData.recipientGroups.length > 0 
                        ? formData.recipientGroups.map(id => recipientGroups.find(g => g.id === id)?.label).join(' // ') 
                        : 'NO TARGETS SELECTED'}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                   <p className="text-[8px] text-primary/60 font-black uppercase tracking-widest mb-1">Medium</p>
                   <p className="text-[10px] text-slate-200 font-black uppercase tracking-widest">{formData.channel}</p>
                </div>
                <div>
                   <p className="text-[8px] text-primary/60 font-black uppercase tracking-widest mb-1">State</p>
                   <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Validated</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="space-y-4 pt-2">
            <button
              onClick={handleSendMessage}
              className="w-full px-6 py-4 rounded-2xl bg-primary text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Initiate Transmission
            </button>
            <button
              onClick={handleSaveDraft}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-inner"
            >
              Buffer Signal (Draft)
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent Transmissions ── */}
      {(sent.length > 0 || drafts.length > 0) && (
          <div className="grid md:grid-cols-2 gap-8">
              {sent.length > 0 && (
                <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">Transmission Archive</h2>
                    <div className="space-y-4">
                        {sent.slice(-3).map((msg) => (
                        <div key={msg.id} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 group hover:border-white/10 hover:bg-white/[0.04] transition-all">
                            <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{msg.title || 'UNNAMED_SIGNAL'}</p>
                                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{msg.sentAt}</p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-md ring-1 ring-emerald-500/20 shadow-inner">Deployed</span>
                        </div>
                        ))}
                    </div>
                </div>
              )}

              {drafts.length > 0 && (
                <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">Buffered Signals</h2>
                    <div className="space-y-4">
                        {drafts.map((draft) => (
                        <div key={draft.id} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 group hover:border-white/10 hover:bg-white/[0.04] transition-all">
                            <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{draft.title || 'STAGED_SIGNAL'}</p>
                                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">SAVED: {draft.savedAt}</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20">
                                    RESUME
                                </button>
                                <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/20">
                                    WIPE
                                </button>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
              )}
          </div>
      )}
    </motion.div>
  );
};

export default CommunicationCenter;
