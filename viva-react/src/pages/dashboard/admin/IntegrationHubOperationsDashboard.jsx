import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'connectors', label: 'Connectors' },
  { id: 'segments', label: 'Segments' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'governance', label: 'Governance' },
];

const listFrom = (res) => {
  const data = res?.data?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const StatCard = ({ label, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold">{label}</p>
    <p className="mt-2 text-3xl font-black text-white">{value}</p>
  </div>
);

const IntegrationHubOperationsDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [connectors, setConnectors] = useState([]);
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [consentReport, setConsentReport] = useState(null);

  const [connectorForm, setConnectorForm] = useState({ name: '', channel: 'sms', provider: '', is_active: true });
  const [segmentForm, setSegmentForm] = useState({
    name: '', slug: '', segment_type: 'all_members', filters: '{}', is_active: true,
  });
  const [campaignForm, setCampaignForm] = useState({
    title: '', subject: '', message_body: '', channel: 'sms', audience_segment_id: '', requires_approval: true,
  });

  const [connectorMsg, setConnectorMsg] = useState('');
  const [segmentMsg, setSegmentMsg] = useState('');
  const [campaignMsg, setCampaignMsg] = useState('');

  const stats = useMemo(() => ({
    connectors: connectors.length,
    healthyConnectors: connectors.filter((item) => item.health_status === 'healthy').length,
    segments: segments.length,
    campaigns: campaigns.length,
    sentCampaigns: campaigns.filter((item) => item.status === 'sent').length,
    failedDeliveries: deliveryLogs.filter((item) => item.status === 'failed').length,
  }), [connectors, segments, campaigns, deliveryLogs]);

  useEffect(() => {
    const sections = MENU_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.2, 0.45, 0.7] });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [connectors.length, segments.length, campaigns.length, deliveryLogs.length]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const loadData = async () => {
    const [connectorsRes, segmentsRes, campaignsRes, logsRes, consentRes] = await Promise.all([
      api.get('/admin/integration/connectors'),
      api.get('/admin/integration/segments'),
      api.get('/admin/integration/campaigns'),
      api.get('/admin/integration/delivery/logs'),
      api.get('/admin/integration/governance/consent-report').catch(() => null),
    ]);

    setConnectors(listFrom(connectorsRes));
    setSegments(listFrom(segmentsRes));
    setCampaigns(listFrom(campaignsRes));
    setDeliveryLogs(listFrom(logsRes));
    setConsentReport(consentRes?.data?.data || null);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await loadData();
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const submitConnector = async (event) => {
    event.preventDefault();
    setConnectorMsg('');
    try {
      await api.post('/admin/integration/connectors', connectorForm);
      setConnectorForm({ name: '', channel: 'sms', provider: '', is_active: true });
      setConnectorMsg('Connector saved successfully.');
      await loadData();
    } catch (error) {
      setConnectorMsg(error?.response?.data?.message || 'Failed to save connector.');
    }
  };

  const submitSegment = async (event) => {
    event.preventDefault();
    setSegmentMsg('');
    try {
      const payload = { ...segmentForm, filters: JSON.parse(segmentForm.filters || '{}') };
      await api.post('/admin/integration/segments', payload);
      setSegmentForm({ name: '', slug: '', segment_type: 'all_members', filters: '{}', is_active: true });
      setSegmentMsg('Audience segment saved successfully.');
      await loadData();
    } catch (error) {
      setSegmentMsg(error?.response?.data?.message || 'Failed to save segment.');
    }
  };

  const submitCampaign = async (event) => {
    event.preventDefault();
    setCampaignMsg('');
    try {
      await api.post('/admin/integration/campaigns', {
        ...campaignForm,
        audience_segment_id: campaignForm.audience_segment_id ? Number(campaignForm.audience_segment_id) : null,
      });
      setCampaignForm({ title: '', subject: '', message_body: '', channel: 'sms', audience_segment_id: '', requires_approval: true });
      setCampaignMsg('Outreach campaign created successfully.');
      await loadData();
    } catch (error) {
      setCampaignMsg(error?.response?.data?.message || 'Failed to create campaign.');
    }
  };

  const approveCampaign = async (id) => {
    await api.post(`/admin/integration/campaigns/${id}/approve`);
    await loadData();
  };

  const sendCampaignNow = async (id) => {
    await api.post(`/admin/integration/campaigns/${id}/send-now`);
    await loadData();
  };

  const retryFailed = async () => {
    await api.post('/admin/integration/delivery/retry', {});
    await loadData();
  };

  if (loading) {
    return <div className="text-slate-300 text-sm">Loading integration hub operations...</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Integration Hub & Outreach Ops</h1>
          <p className="text-sm text-slate-300 mt-1">Connector hub, segmentation, mass campaigns, delivery retries, and compliance controls.</p>
        </div>
        <button onClick={refresh} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold">
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="sticky top-20 z-30 rounded-2xl border border-white/15 bg-slate-950/70 backdrop-blur px-3 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap border transition ${
                activeSection === item.id
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section id="overview" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Connectors" value={stats.connectors} />
          <StatCard label="Healthy" value={stats.healthyConnectors} />
          <StatCard label="Segments" value={stats.segments} />
          <StatCard label="Campaigns" value={stats.campaigns} />
          <StatCard label="Sent" value={stats.sentCampaigns} />
          <StatCard label="Failed Logs" value={stats.failedDeliveries} />
        </div>
      </section>

      <section id="connectors" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Connector Hub</h2>
        <form onSubmit={submitConnector} className="grid gap-3 md:grid-cols-4 bg-white/5 border border-white/10 rounded-2xl p-4">
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Connector name" value={connectorForm.name} onChange={(e) => setConnectorForm((p) => ({ ...p, name: e.target.value }))} required />
          <select className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" value={connectorForm.channel} onChange={(e) => setConnectorForm((p) => ({ ...p, channel: e.target.value }))}>
            <option value="sms">sms</option>
            <option value="whatsapp">whatsapp</option>
            <option value="email">email</option>
          </select>
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Provider" value={connectorForm.provider} onChange={(e) => setConnectorForm((p) => ({ ...p, provider: e.target.value }))} required />
          <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold" type="submit">Save Connector</button>
          <p className="md:col-span-4 text-xs text-slate-300">{connectorMsg}</p>
        </form>
      </section>

      <section id="segments" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Audience Segmentation</h2>
        <form onSubmit={submitSegment} className="grid gap-3 md:grid-cols-2 bg-white/5 border border-white/10 rounded-2xl p-4">
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Segment name" value={segmentForm.name} onChange={(e) => setSegmentForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Slug" value={segmentForm.slug} onChange={(e) => setSegmentForm((p) => ({ ...p, slug: e.target.value }))} required />
          <select className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" value={segmentForm.segment_type} onChange={(e) => setSegmentForm((p) => ({ ...p, segment_type: e.target.value }))}>
            <option value="all_members">all_members</option>
            <option value="role_based">role_based</option>
            <option value="unit_based">unit_based</option>
            <option value="status_based">status_based</option>
            <option value="custom">custom</option>
          </select>
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder='Filters JSON e.g. {"roles":["organizer"]}' value={segmentForm.filters} onChange={(e) => setSegmentForm((p) => ({ ...p, filters: e.target.value }))} />
          <div className="md:col-span-2 flex items-center justify-between">
            <p className="text-xs text-slate-300">{segmentMsg}</p>
            <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold" type="submit">Save Segment</button>
          </div>
        </form>
      </section>

      <section id="campaigns" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Mass Campaigns</h2>
        <form onSubmit={submitCampaign} className="grid gap-3 md:grid-cols-2 bg-white/5 border border-white/10 rounded-2xl p-4">
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Campaign title" value={campaignForm.title} onChange={(e) => setCampaignForm((p) => ({ ...p, title: e.target.value }))} required />
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Subject" value={campaignForm.subject} onChange={(e) => setCampaignForm((p) => ({ ...p, subject: e.target.value }))} />
          <select className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" value={campaignForm.channel} onChange={(e) => setCampaignForm((p) => ({ ...p, channel: e.target.value }))}>
            <option value="sms">sms</option>
            <option value="whatsapp">whatsapp</option>
            <option value="email">email</option>
          </select>
          <select className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" value={campaignForm.audience_segment_id} onChange={(e) => setCampaignForm((p) => ({ ...p, audience_segment_id: e.target.value }))}>
            <option value="">No segment (custom/all)</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
          </select>
          <textarea className="md:col-span-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" rows={3} placeholder="Message body" value={campaignForm.message_body} onChange={(e) => setCampaignForm((p) => ({ ...p, message_body: e.target.value }))} required />
          <div className="md:col-span-2 flex items-center justify-between">
            <p className="text-xs text-slate-300">{campaignMsg}</p>
            <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold" type="submit">Create Campaign</button>
          </div>
        </form>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-x-auto">
          <table className="min-w-full text-sm text-slate-200">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Recipients</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 12).map((row) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="py-2 pr-4">{row.title}</td>
                  <td className="py-2 pr-4">{row.channel}</td>
                  <td className="py-2 pr-4">{row.status}</td>
                  <td className="py-2 pr-4">{row.recipient_estimate}</td>
                  <td className="py-2 pr-4 flex gap-2">
                    <button onClick={() => approveCampaign(row.id)} className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold">Approve</button>
                    <button onClick={() => sendCampaignNow(row.id)} className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold">Send</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="delivery" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Delivery Logs & Retry</h2>
        <div className="flex justify-end">
          <button onClick={retryFailed} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold">Retry Failed</button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-x-auto">
          <table className="min-w-full text-sm text-slate-200">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="py-2 pr-4">Campaign</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Attempts</th>
                <th className="py-2 pr-4">Failure</th>
              </tr>
            </thead>
            <tbody>
              {deliveryLogs.slice(0, 12).map((row) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="py-2 pr-4">{row.outreach_campaign_id}</td>
                  <td className="py-2 pr-4">{row.channel}</td>
                  <td className="py-2 pr-4">{row.status}</td>
                  <td className="py-2 pr-4">{row.attempt_count}</td>
                  <td className="py-2 pr-4">{row.failure_reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="governance" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Compliance & Governance</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-200">
          <p>Total preference records: <span className="font-semibold text-white">{consentReport?.total_preferences ?? 0}</span></p>
          <p className="mt-1">Global unsubscribed: <span className="font-semibold text-white">{consentReport?.global_unsubscribed ?? 0}</span></p>
          <p className="mt-1">SMS opt-out: <span className="font-semibold text-white">{consentReport?.sms_opt_out ?? 0}</span> • WhatsApp opt-out: <span className="font-semibold text-white">{consentReport?.whatsapp_opt_out ?? 0}</span> • Email opt-out: <span className="font-semibold text-white">{consentReport?.email_opt_out ?? 0}</span></p>
        </div>
      </section>
    </div>
  );
};

export default IntegrationHubOperationsDashboard;