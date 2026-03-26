import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'events', label: 'Events' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'reports', label: 'Reports' },
];

const STATUS = {
  draft: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  pending_approval: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  completed: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  cancelled: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  planned: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

const listFrom = (res) => {
  const data = res?.data?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const toLocalDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const defaultEventForm = {
  title: '',
  description: '',
  event_type: 'meeting',
  status: 'draft',
  visibility: 'members_only',
  venue: '',
  capacity: '',
  starts_at: '',
  ends_at: '',
  requires_approval: true,
};

const defaultCampaignForm = {
  title: '',
  summary: '',
  campaign_type: 'field',
  status: 'draft',
  objective: '',
  starts_on: '',
  ends_on: '',
  resource_plan_text: '',
  messaging_tracks_text: '',
  checkpoints: [{ title: '', notes: '', due_date: '' }],
};

const defaultReportForm = {
  summary: '',
  outcomes: '',
  attendance_insights: '',
  budget_effort_notes: '',
  approval_status: 'pending',
  moderation_notes: '',
  media: [],
};

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold">{label}</p>
    <p className="mt-2 text-3xl font-black text-white">{value}</p>
    {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
  </div>
);

const EventCampaignOperationsDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);

  const [eventForm, setEventForm] = useState(defaultEventForm);
  const [campaignForm, setCampaignForm] = useState(defaultCampaignForm);
  const [reportForm, setReportForm] = useState(defaultReportForm);

  const [eventMessage, setEventMessage] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  const selectedEvent = useMemo(
    () => events.find((item) => Number(item.id) === Number(selectedEventId)) || null,
    [events, selectedEventId]
  );
  const selectedCampaign = useMemo(
    () => campaigns.find((item) => Number(item.id) === Number(selectedCampaignId)) || null,
    [campaigns, selectedCampaignId]
  );

  const counts = useMemo(() => ({
    events: events.length,
    publishedEvents: events.filter((item) => item.status === 'published').length,
    campaigns: campaigns.length,
    activeCampaigns: campaigns.filter((item) => item.status === 'active').length,
  }), [events, campaigns]);

  useEffect(() => {
    const sections = MENU_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.2, 0.45, 0.7] });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [events.length, campaigns.length, selectedEventId, selectedCampaignId]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const loadCore = async () => {
    const [eventsRes, campaignsRes] = await Promise.all([
      api.get('/admin/events'),
      api.get('/admin/campaigns'),
    ]);

    const eventList = listFrom(eventsRes);
    const campaignList = listFrom(campaignsRes);

    setEvents(eventList);
    setCampaigns(campaignList);

    if (eventList.length && !selectedEventId) setSelectedEventId(eventList[0].id);
    if (campaignList.length && !selectedCampaignId) setSelectedCampaignId(campaignList[0].id);
  };

  const loadEvent = async (id) => {
    if (!id) {
      setEventDetail(null);
      setAttendance(null);
      return;
    }

    const [detailRes, attendanceRes] = await Promise.all([
      api.get(`/admin/events/${id}`),
      api.get(`/admin/events/${id}/attendance-summary`).catch(() => null),
    ]);

    setEventDetail(detailRes?.data?.data || null);
    setAttendance(attendanceRes?.data?.data || null);
  };

  const loadCampaign = async (id) => {
    if (!id) {
      setCampaignDetail(null);
      return;
    }

    const detailRes = await api.get(`/admin/campaigns/${id}`);
    setCampaignDetail(detailRes?.data?.data || null);
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadCore();
      await Promise.all([loadEvent(selectedEventId), loadCampaign(selectedCampaignId)]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await loadCore();
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    loadEvent(selectedEventId).catch(() => null);
  }, [selectedEventId]);

  useEffect(() => {
    loadCampaign(selectedCampaignId).catch(() => null);
  }, [selectedCampaignId]);

  useEffect(() => {
    if (!selectedEvent) {
      setEventForm(defaultEventForm);
      return;
    }

    setEventForm({
      title: selectedEvent.title || '',
      description: selectedEvent.description || '',
      event_type: selectedEvent.event_type || 'meeting',
      status: selectedEvent.status || 'draft',
      visibility: selectedEvent.visibility || 'members_only',
      venue: selectedEvent.venue || '',
      capacity: selectedEvent.capacity || '',
      starts_at: toLocalDateTimeInput(selectedEvent.starts_at),
      ends_at: toLocalDateTimeInput(selectedEvent.ends_at),
      requires_approval: selectedEvent.requires_approval ?? true,
    });
  }, [selectedEventId, selectedEvent]);

  useEffect(() => {
    if (!selectedCampaign) {
      setCampaignForm(defaultCampaignForm);
      return;
    }

    const checkpoints = (campaignDetail?.checkpoints || []).map((item) => ({
      title: item.title || '',
      notes: item.notes || '',
      due_date: item.due_date || '',
    }));

    setCampaignForm({
      title: selectedCampaign.title || '',
      summary: selectedCampaign.summary || '',
      campaign_type: selectedCampaign.campaign_type || 'field',
      status: selectedCampaign.status || 'draft',
      objective: selectedCampaign.objective || '',
      starts_on: selectedCampaign.starts_on || '',
      ends_on: selectedCampaign.ends_on || '',
      resource_plan_text: Array.isArray(selectedCampaign.resource_plan) ? selectedCampaign.resource_plan.join('\n') : '',
      messaging_tracks_text: Array.isArray(selectedCampaign.messaging_tracks) ? selectedCampaign.messaging_tracks.join('\n') : '',
      checkpoints: checkpoints.length ? checkpoints : [{ title: '', notes: '', due_date: '' }],
    });
  }, [selectedCampaignId, selectedCampaign, campaignDetail]);

  useEffect(() => {
    const report = eventDetail?.report;
    if (!report) {
      setReportForm(defaultReportForm);
      return;
    }

    setReportForm({
      summary: report.summary || '',
      outcomes: report.outcomes || '',
      attendance_insights: report.attendance_insights || '',
      budget_effort_notes: report.budget_effort_notes || '',
      approval_status: report.approval_status || 'pending',
      moderation_notes: report.moderation_notes || '',
      media: (report.media || []).map((item) => ({
        media_type: item.media_type || 'image',
        title: item.title || '',
        file_path: item.file_path || '',
        caption: item.caption || '',
        is_public: !!item.is_public,
        moderation_status: item.moderation_status || 'pending',
      })),
    });
  }, [eventDetail]);

  const advanceEvent = async () => {
    if (!selectedEventId) return;
    setEventMessage('');

    try {
      const res = await api.post(`/admin/events/${selectedEventId}/approve`);
      setEventMessage(res?.data?.message || 'Event workflow updated.');
      await refresh();
    } catch (error) {
      setEventMessage(error?.response?.data?.message || 'Unable to update event workflow.');
    }
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setEventMessage('');

    try {
      const payload = {
        ...eventForm,
        capacity: eventForm.capacity ? Number(eventForm.capacity) : null,
      };
      const res = await api.post('/admin/events', payload);
      const createdId = res?.data?.data?.id;
      setEventMessage(res?.data?.message || 'Event created successfully.');
      await loadCore();
      if (createdId) setSelectedEventId(createdId);
    } catch (error) {
      setEventMessage(error?.response?.data?.message || 'Failed to create event.');
    }
  };

  const handleUpdateEvent = async (event) => {
    event.preventDefault();
    if (!selectedEventId) {
      setEventMessage('Select an event first to edit.');
      return;
    }

    setEventMessage('');
    try {
      const payload = {
        ...eventForm,
        capacity: eventForm.capacity ? Number(eventForm.capacity) : null,
      };
      const res = await api.put(`/admin/events/${selectedEventId}`, payload);
      setEventMessage(res?.data?.message || 'Event updated successfully.');
      await refresh();
    } catch (error) {
      setEventMessage(error?.response?.data?.message || 'Failed to update event.');
    }
  };

  const handleCreateCampaign = async (event) => {
    event.preventDefault();
    setCampaignMessage('');

    try {
      const payload = {
        ...campaignForm,
        resource_plan: campaignForm.resource_plan_text.split('\n').map((item) => item.trim()).filter(Boolean),
        messaging_tracks: campaignForm.messaging_tracks_text.split('\n').map((item) => item.trim()).filter(Boolean),
        checkpoints: campaignForm.checkpoints.filter((item) => item.title.trim()),
      };
      delete payload.resource_plan_text;
      delete payload.messaging_tracks_text;

      const res = await api.post('/admin/campaigns', payload);
      const createdId = res?.data?.data?.id;
      setCampaignMessage(res?.data?.message || 'Campaign created successfully.');
      await loadCore();
      if (createdId) setSelectedCampaignId(createdId);
    } catch (error) {
      setCampaignMessage(error?.response?.data?.message || 'Failed to create campaign.');
    }
  };

  const handleUpdateCampaign = async (event) => {
    event.preventDefault();
    if (!selectedCampaignId) {
      setCampaignMessage('Select a campaign first to edit.');
      return;
    }

    setCampaignMessage('');

    try {
      const payload = {
        ...campaignForm,
        resource_plan: campaignForm.resource_plan_text.split('\n').map((item) => item.trim()).filter(Boolean),
        messaging_tracks: campaignForm.messaging_tracks_text.split('\n').map((item) => item.trim()).filter(Boolean),
        checkpoints: campaignForm.checkpoints.filter((item) => item.title.trim()),
      };
      delete payload.resource_plan_text;
      delete payload.messaging_tracks_text;

      const res = await api.put(`/admin/campaigns/${selectedCampaignId}`, payload);
      setCampaignMessage(res?.data?.message || 'Campaign updated successfully.');
      await refresh();
    } catch (error) {
      setCampaignMessage(error?.response?.data?.message || 'Failed to update campaign.');
    }
  };

  const handleSaveReport = async (event) => {
    event.preventDefault();
    if (!selectedEventId) {
      setReportMessage('Select an event first to save a report.');
      return;
    }

    setReportMessage('');
    try {
      const payload = {
        ...reportForm,
        media: reportForm.media.filter((item) => item.file_path.trim()),
      };
      const res = await api.post(`/admin/events/${selectedEventId}/report`, payload);
      setReportMessage(res?.data?.message || 'Event report saved successfully.');
      await loadEvent(selectedEventId);
    } catch (error) {
      setReportMessage(error?.response?.data?.message || 'Failed to save report.');
    }
  };

  const updateCheckpoint = (index, field, value) => {
    setCampaignForm((prev) => ({
      ...prev,
      checkpoints: prev.checkpoints.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addCheckpoint = () => {
    setCampaignForm((prev) => ({
      ...prev,
      checkpoints: [...prev.checkpoints, { title: '', notes: '', due_date: '' }],
    }));
  };

  const removeCheckpoint = (index) => {
    setCampaignForm((prev) => ({
      ...prev,
      checkpoints: prev.checkpoints.filter((_, idx) => idx !== index),
    }));
  };

  const addMedia = () => {
    setReportForm((prev) => ({
      ...prev,
      media: [...prev.media, { media_type: 'image', title: '', file_path: '', caption: '', is_public: false, moderation_status: 'pending' }],
    }));
  };

  const updateMedia = (index, field, value) => {
    setReportForm((prev) => ({
      ...prev,
      media: prev.media.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    }));
  };

  const removeMedia = (index) => {
    setReportForm((prev) => ({
      ...prev,
      media: prev.media.filter((_, idx) => idx !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[55vh]">
        <div className="h-10 w-10 rounded-full border-b-2 border-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-1 lg:p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Operations</p>
          <h1 className="mt-2 text-3xl font-black text-white">Event & Campaign Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-3xl">Operational workspace for event publishing, RSVP and attendance, campaign planning, member task execution, and post-event reporting.</p>
        </div>
        <button onClick={refresh} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold">
          {refreshing ? 'Refreshing…' : 'Refresh Data'}
        </button>
      </div>

      <div className="sticky top-4 z-20 rounded-2xl border border-white/10 bg-slate-950/75 backdrop-blur-xl shadow-2xl overflow-x-auto">
        <div className="flex min-w-max items-center gap-2 p-3">
          {MENU_ITEMS.map((item) => (
            <button key={item.id} type="button" onClick={() => scrollToSection(item.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeSection === item.id ? 'bg-primary text-slate-950 shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div id="overview" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 scroll-mt-32">
        <StatCard label="Events" value={counts.events} sub="All configured programs" />
        <StatCard label="Published Events" value={counts.publishedEvents} sub="Visible operational calendar" />
        <StatCard label="Campaigns" value={counts.campaigns} sub="Digital, field, hybrid" />
        <StatCard label="Active Campaigns" value={counts.activeCampaigns} sub="Execution in progress" />
      </div>

      <div id="events" className="grid grid-cols-1 xl:grid-cols-2 gap-4 scroll-mt-32">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 170-171</p>
              <h3 className="text-lg font-black text-white">Event Operations</h3>
            </div>
            <select value={selectedEventId || ''} onChange={(e) => setSelectedEventId(Number(e.target.value))} className="lg:ml-auto bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-w-[260px]">
              {events.length === 0 ? <option value="">No events found</option> : null}
              {events.map((item) => (
                <option key={item.id} value={item.id}>#{item.id} · {item.title}</option>
              ))}
            </select>
          </div>

          {selectedEvent ? (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-semibold ${STATUS[selectedEvent.status] || STATUS.draft}`}>
                  {selectedEvent.status_label || selectedEvent.status}
                </span>
                <span className="text-xs text-slate-400">{selectedEvent.event_type}</span>
                <span className="text-xs text-slate-400">{selectedEvent.venue || 'Venue pending'}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>RSVP Count: <span className="text-white font-semibold">{eventDetail?.event?.rsvp_count ?? 0}</span></p>
                <p>Attendance Count: <span className="text-white font-semibold">{eventDetail?.event?.attendance_count ?? 0}</span></p>
                <p>Visibility: <span className="text-white font-semibold">{selectedEvent.visibility}</span></p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={advanceEvent} className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-sm font-semibold">Advance Approval / Publish</button>
              </div>
            </>
          ) : (
            <p className="mt-4 text-slate-400 text-sm">No event available.</p>
          )}
          {eventMessage ? <p className="mt-3 text-xs text-slate-300">{eventMessage}</p> : null}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 171</p>
            <h3 className="text-lg font-black text-white">Attendance Summary</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/5 p-3"><span className="text-slate-400">RSVP Total</span><p className="text-white font-bold">{attendance?.overview?.rsvp_total ?? 0}</p></div>
              <div className="rounded-xl bg-emerald-500/10 p-3"><span className="text-emerald-300">Checked In</span><p className="text-white font-bold">{attendance?.overview?.checked_in ?? 0}</p></div>
              <div className="rounded-xl bg-blue-500/10 p-3"><span className="text-blue-300">Going</span><p className="text-white font-bold">{attendance?.overview?.going ?? 0}</p></div>
              <div className="rounded-xl bg-rose-500/10 p-3"><span className="text-rose-300">No Show</span><p className="text-white font-bold">{attendance?.overview?.no_show ?? 0}</p></div>
            </div>
            <div className="max-h-56 overflow-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-white/10">
                    <th className="text-left py-2 px-3">Member</th>
                    <th className="text-left py-2 px-3">RSVP</th>
                    <th className="text-left py-2 px-3">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {(attendance?.records || []).length === 0 ? (
                    <tr><td colSpan={3} className="py-5 px-3 text-slate-400">No attendance records yet.</td></tr>
                  ) : (attendance?.records || []).map((row) => (
                    <tr key={row.id} className="border-b border-white/5 text-slate-200">
                      <td className="py-2 px-3">{row?.member?.full_name || `Member #${row.member_id}`}</td>
                      <td className="py-2 px-3">{row.rsvp_status}</td>
                      <td className="py-2 px-3">{row.attendance_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Event Create / Edit Form</p>
        <form onSubmit={handleCreateEvent} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={eventForm.title} onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Event title" required />
          <select value={eventForm.event_type} onChange={(e) => setEventForm((prev) => ({ ...prev, event_type: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
            <option value="seminar">Seminar</option>
            <option value="rally">Rally</option>
            <option value="meeting">Meeting</option>
            <option value="campus_program">Campus Program</option>
            <option value="training">Training</option>
            <option value="other">Other</option>
          </select>
          <input value={eventForm.venue} onChange={(e) => setEventForm((prev) => ({ ...prev, venue: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Venue" />
          <input type="number" min="1" value={eventForm.capacity} onChange={(e) => setEventForm((prev) => ({ ...prev, capacity: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Capacity" />
          <input type="datetime-local" value={eventForm.starts_at} onChange={(e) => setEventForm((prev) => ({ ...prev, starts_at: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" required />
          <input type="datetime-local" value={eventForm.ends_at} onChange={(e) => setEventForm((prev) => ({ ...prev, ends_at: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
          <select value={eventForm.status} onChange={(e) => setEventForm((prev) => ({ ...prev, status: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={eventForm.visibility} onChange={(e) => setEventForm((prev) => ({ ...prev, visibility: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
            <option value="public">Public</option>
            <option value="members_only">Members Only</option>
            <option value="private">Private</option>
          </select>
          <textarea value={eventForm.description} onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))} className="md:col-span-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[90px]" placeholder="Event description" />
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button type="submit" className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 text-sm font-semibold">Create Event</button>
            <button type="button" onClick={handleUpdateEvent} className="px-3 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-200 text-sm font-semibold">Update Selected Event</button>
          </div>
        </form>
      </div>

      <div id="campaigns" className="grid grid-cols-1 xl:grid-cols-2 gap-4 scroll-mt-32">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 172-173</p>
              <h3 className="text-lg font-black text-white">Campaign Planner</h3>
            </div>
            <select value={selectedCampaignId || ''} onChange={(e) => setSelectedCampaignId(Number(e.target.value))} className="lg:ml-auto bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-w-[260px]">
              {campaigns.length === 0 ? <option value="">No campaigns found</option> : null}
              {campaigns.map((item) => (
                <option key={item.id} value={item.id}>#{item.id} · {item.title}</option>
              ))}
            </select>
          </div>

          {selectedCampaign ? (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-semibold ${STATUS[selectedCampaign.status] || STATUS.draft}`}>
                  {selectedCampaign.status_label || selectedCampaign.status}
                </span>
                <span className="text-xs text-slate-400">{selectedCampaign.campaign_type}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Checkpoints: <span className="text-white font-semibold">{(campaignDetail?.checkpoints || []).length}</span></p>
                <p>Task Summary: <span className="text-white font-semibold">{campaignDetail?.task_summary?.total ?? 0}</span> total, {campaignDetail?.task_summary?.completed ?? 0} completed, {campaignDetail?.task_summary?.overdue ?? 0} overdue</p>
                <p>Timeline: <span className="text-white font-semibold">{selectedCampaign.starts_on || 'TBD'} to {selectedCampaign.ends_on || 'TBD'}</span></p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-slate-400 text-sm">No campaign available.</p>
          )}
          {campaignMessage ? <p className="mt-3 text-xs text-slate-300">{campaignMessage}</p> : null}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 172-173</p>
            <h3 className="text-lg font-black text-white">Execution Checkpoints & Tasks</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Checkpoints</p>
              <div className="space-y-2 max-h-40 overflow-auto">
                {(campaignDetail?.checkpoints || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No checkpoints configured.</p>
                ) : (campaignDetail?.checkpoints || []).map((checkpoint) => (
                  <div key={checkpoint.id} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <span>{checkpoint.title}</span>
                      <span className="text-xs text-slate-400">{checkpoint.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Campaign Tasks</p>
              <div className="space-y-2 max-h-40 overflow-auto">
                {(campaignDetail?.tasks || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No campaign-linked tasks assigned yet.</p>
                ) : (campaignDetail?.tasks || []).map((task) => (
                  <div key={task.id} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <span>{task.title}</span>
                      <span className="text-xs text-slate-400">{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Campaign Create / Edit Form</p>
        <form onSubmit={handleCreateCampaign} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={campaignForm.title} onChange={(e) => setCampaignForm((prev) => ({ ...prev, title: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Campaign title" required />
          <select value={campaignForm.campaign_type} onChange={(e) => setCampaignForm((prev) => ({ ...prev, campaign_type: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
            <option value="digital">Digital</option>
            <option value="field">Field</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <select value={campaignForm.status} onChange={(e) => setCampaignForm((prev) => ({ ...prev, status: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
            <option value="draft">Draft</option>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" value={campaignForm.starts_on} onChange={(e) => setCampaignForm((prev) => ({ ...prev, starts_on: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
          <input type="date" value={campaignForm.ends_on} onChange={(e) => setCampaignForm((prev) => ({ ...prev, ends_on: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
          <textarea value={campaignForm.summary} onChange={(e) => setCampaignForm((prev) => ({ ...prev, summary: e.target.value }))} className="md:col-span-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[80px]" placeholder="Campaign summary" />
          <textarea value={campaignForm.objective} onChange={(e) => setCampaignForm((prev) => ({ ...prev, objective: e.target.value }))} className="md:col-span-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[80px]" placeholder="Campaign objective" />
          <textarea value={campaignForm.resource_plan_text} onChange={(e) => setCampaignForm((prev) => ({ ...prev, resource_plan_text: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[80px]" placeholder="Resource plan (one line per item)" />
          <textarea value={campaignForm.messaging_tracks_text} onChange={(e) => setCampaignForm((prev) => ({ ...prev, messaging_tracks_text: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[80px]" placeholder="Messaging tracks (one line per item)" />

          <div className="md:col-span-2 rounded-xl border border-white/10 p-3">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Checkpoints</p>
            <div className="space-y-2">
              {campaignForm.checkpoints.map((checkpoint, index) => (
                <div key={`checkpoint-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input value={checkpoint.title} onChange={(e) => updateCheckpoint(index, 'title', e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Checkpoint title" />
                  <input value={checkpoint.notes} onChange={(e) => updateCheckpoint(index, 'notes', e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Notes" />
                  <div className="flex gap-2">
                    <input type="date" value={checkpoint.due_date} onChange={(e) => updateCheckpoint(index, 'due_date', e.target.value)} className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
                    <button type="button" onClick={() => removeCheckpoint(index)} className="px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm">✕</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addCheckpoint} className="mt-3 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold">Add Checkpoint</button>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button type="submit" className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 text-sm font-semibold">Create Campaign</button>
            <button type="button" onClick={handleUpdateCampaign} className="px-3 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-200 text-sm font-semibold">Update Selected Campaign</button>
          </div>
        </form>
      </div>

      <div id="reports" className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden scroll-mt-32">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 174</p>
          <h3 className="text-lg font-black text-white">Event Report & Media Workflow</h3>
        </div>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Report Status</p>
            <p className="mt-3 text-sm text-slate-300">Approval: <span className="text-white font-semibold">{eventDetail?.report?.approval_status || 'Not submitted'}</span></p>
            <p className="mt-2 text-sm text-slate-300">Summary: <span className="text-white font-semibold">{eventDetail?.report?.summary || 'No report summary available.'}</span></p>
            <p className="mt-2 text-sm text-slate-300">Outcomes: <span className="text-white font-semibold">{eventDetail?.report?.outcomes || 'No outcomes recorded.'}</span></p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Media Queue</p>
            <div className="mt-3 space-y-2 max-h-56 overflow-auto">
              {(eventDetail?.report?.media || []).length === 0 ? (
                <p className="text-sm text-slate-400">No media attached to the current event report.</p>
              ) : (eventDetail?.report?.media || []).map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2 text-sm text-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <span>{item.title || item.file_path}</span>
                    <span className="text-xs text-slate-400">{item.moderation_status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Event Report Create / Edit Form</p>
        <form onSubmit={handleSaveReport} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <textarea value={reportForm.summary} onChange={(e) => setReportForm((prev) => ({ ...prev, summary: e.target.value }))} className="md:col-span-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[90px]" placeholder="Report summary" required />
          <textarea value={reportForm.outcomes} onChange={(e) => setReportForm((prev) => ({ ...prev, outcomes: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[80px]" placeholder="Outcomes" />
          <textarea value={reportForm.attendance_insights} onChange={(e) => setReportForm((prev) => ({ ...prev, attendance_insights: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[80px]" placeholder="Attendance insights" />
          <textarea value={reportForm.budget_effort_notes} onChange={(e) => setReportForm((prev) => ({ ...prev, budget_effort_notes: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[80px]" placeholder="Budget / effort notes" />
          <textarea value={reportForm.moderation_notes} onChange={(e) => setReportForm((prev) => ({ ...prev, moderation_notes: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[80px]" placeholder="Moderation notes" />
          <select value={reportForm.approval_status} onChange={(e) => setReportForm((prev) => ({ ...prev, approval_status: e.target.value }))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <div className="md:col-span-2 rounded-xl border border-white/10 p-3">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Media Items</p>
            <div className="space-y-2">
              {reportForm.media.map((media, index) => (
                <div key={`media-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select value={media.media_type} onChange={(e) => updateMedia(index, 'media_type', e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                  <input value={media.title} onChange={(e) => updateMedia(index, 'title', e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Title" />
                  <input value={media.file_path} onChange={(e) => updateMedia(index, 'file_path', e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="File path" />
                  <input value={media.caption} onChange={(e) => updateMedia(index, 'caption', e.target.value)} className="md:col-span-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Caption" />
                  <div className="flex gap-2">
                    <select value={media.moderation_status} onChange={(e) => updateMedia(index, 'moderation_status', e.target.value)} className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <label className="flex items-center gap-2 text-xs text-slate-300 px-2">
                      <input type="checkbox" checked={media.is_public} onChange={(e) => updateMedia(index, 'is_public', e.target.checked)} /> Public
                    </label>
                    <button type="button" onClick={() => removeMedia(index)} className="px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm">✕</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addMedia} className="mt-3 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold">Add Media</button>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button type="submit" className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-sm font-semibold">Save Event Report</button>
          </div>
          {reportMessage ? <p className="md:col-span-2 text-xs text-slate-300">{reportMessage}</p> : null}
        </form>
      </div>
    </div>
  );
};

export default EventCampaignOperationsDashboard;
