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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-gradient-to-br from-white via-white/95 to-primary-50/20 border border-primary-200/30 p-6">
        <h1 className="text-3xl font-black text-slate-900">Communication Center</h1>
        <p className="text-sm text-primary-600 font-medium mt-1">Send announcements, notifications, and campaigns</p>
      </div>

      {/* ── Message Composer ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-primary-200/30 bg-white p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Message Type</label>
            <div className="grid grid-cols-2 gap-2">
              {messageTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMessageType(type.id)}
                  className={`rounded-lg p-3 text-left transition-all border ${
                    messageType === type.id
                      ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                      : 'bg-slate-50 border-slate-200 hover:border-primary-200'
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900">{type.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Message title..."
              className="w-full px-4 py-3 rounded-lg border border-primary-200/30 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Message Body</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your message here..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-primary-200/30 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Channel</label>
              <div className="grid grid-cols-2 gap-2">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setFormData({ ...formData, channel: ch.id })}
                    className={`rounded-lg p-3 text-center transition-all border ${
                      formData.channel === ch.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'bg-slate-50 border-slate-200 hover:border-primary-200'
                    }`}
                  >
                    <span className="text-lg">{ch.icon}</span>
                    <p className="text-[10px] font-bold text-slate-900 mt-1">{ch.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {priorities.slice(1).map((pri) => (
                  <button
                    key={pri.id}
                    onClick={() => setFormData({ ...formData, priority: pri.id })}
                    className={`rounded-lg p-2 text-center text-xs font-bold transition-all ${
                      formData.priority === pri.id ? pri.color + ' ring-2 ring-offset-1' : pri.color + ' opacity-40 hover:opacity-70'
                    }`}
                  >
                    {pri.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Schedule (Optional)</label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-primary-200/30 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>

        {/* ── Recipients & Preview ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary-200/30 bg-white p-5">
            <h3 className="font-bold text-slate-900 mb-3">Recipients</h3>
            <div className="space-y-2">
              {recipientGroups.map((group) => (
                <label key={group.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
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
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">{group.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Preview ── */}
          <div className="rounded-2xl border border-primary-200/30 bg-primary-50/50 p-5">
            <h3 className="font-bold text-slate-900 mb-3">Preview</h3>
            <div className="text-sm space-y-2">
              <div>
                <p className="text-[10px] text-primary-600 font-bold uppercase">Title</p>
                <p className="text-slate-900 font-medium">{formData.title || '(No title)'}</p>
              </div>
              <div>
                <p className="text-[10px] text-primary-600 font-bold uppercase">Recipients</p>
                <p className="text-slate-900">{formData.recipientGroups.length > 0 ? formData.recipientGroups.join(', ') : 'None selected'}</p>
              </div>
              <div>
                <p className="text-[10px] text-primary-600 font-bold uppercase">Channel</p>
                <p className="text-slate-900 capitalize">{formData.channel}</p>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="space-y-2">
            <button
              onClick={handleSendMessage}
              className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors"
            >
              📤 Send Now
            </button>
            <button
              onClick={handleSaveDraft}
              className="w-full px-4 py-3 rounded-lg bg-slate-100 text-slate-900 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              💾 Save as Draft
            </button>
          </div>
        </div>
      </div>

      {/* ── Sent Messages ── */}
      {sent.length > 0 && (
        <div className="rounded-2xl border border-primary-200/30 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Sent Messages</h2>
          <div className="space-y-2">
            {sent.slice(-3).map((msg) => (
              <div key={msg.id} className="flex items-start justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">{msg.title || '(No title)'}</p>
                  <p className="text-xs text-slate-500 mt-1">{msg.sentAt}</p>
                </div>
                <span className="text-xs font-bold capitalize px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded">Sent</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Drafts ── */}
      {drafts.length > 0 && (
        <div className="rounded-2xl border border-primary-200/30 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Saved Drafts</h2>
          <div className="space-y-2">
            {drafts.map((draft) => (
              <div key={draft.id} className="flex items-start justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">{draft.title || '(No title)'}</p>
                  <p className="text-xs text-slate-500 mt-1">Saved: {draft.savedAt}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs px-2.5 py-1 rounded bg-primary-100 text-primary-700 font-bold hover:bg-primary-200">
                    Continue
                  </button>
                  <button className="text-xs px-2.5 py-1 rounded bg-red-100 text-red-700 font-bold hover:bg-red-200">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CommunicationCenter;
