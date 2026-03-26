import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const STATUS_STYLES = {
  draft: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  nomination_open: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  nomination_closed: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  voting_open: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  voting_closed: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  result_published: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  cancelled: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

const listFrom = (res) => {
  const d = res?.data?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const objFrom = (res) => {
  const d = res?.data?.data;
  if (d && typeof d === 'object' && !Array.isArray(d)) return d;
  if (res?.data && typeof res.data === 'object') return res.data;
  return {};
};

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold">{label}</p>
    <p className="mt-2 text-3xl font-black text-white">{value}</p>
    {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
  </div>
);

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'control', label: 'Control' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'results', label: 'Results' },
  { id: 'analytics', label: 'Analytics' },
];

const ElectionOperationsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);

  const [summary, setSummary] = useState(null);
  const [candidatePerformance, setCandidatePerformance] = useState([]);
  const [unitParticipation, setUnitParticipation] = useState([]);
  const [results, setResults] = useState([]);
  const [nominations, setNominations] = useState([]);

  const selectedElection = useMemo(
    () => elections.find((e) => Number(e.id) === Number(selectedElectionId)) || null,
    [elections, selectedElectionId]
  );

  const electionCounts = useMemo(() => {
    return {
      total: elections.length,
      active: elections.filter((e) => ['nomination_open', 'nomination_closed', 'voting_open', 'voting_closed'].includes(e.status)).length,
      votingOpen: elections.filter((e) => e.status === 'voting_open').length,
      published: elections.filter((e) => e.status === 'result_published').length,
    };
  }, [elections]);

  const nominationCounts = useMemo(() => {
    return {
      total: nominations.length,
      pending: nominations.filter((n) => n.status === 'pending').length,
      approved: nominations.filter((n) => n.status === 'approved').length,
      rejected: nominations.filter((n) => n.status === 'rejected').length,
      withdrawn: nominations.filter((n) => n.status === 'withdrawn').length,
    };
  }, [nominations]);

  const loadElections = async () => {
    const res = await api.get('/admin/elections');
    const list = listFrom(res);
    setElections(list);
    if (list.length && !selectedElectionId) {
      setSelectedElectionId(list[0].id);
    }
    if (!list.length) {
      setSelectedElectionId(null);
    }
  };

  const loadElectionDetails = async (electionId) => {
    if (!electionId) return;

    const [summaryRes, performanceRes, unitsRes, resultsRes, nominationsRes] = await Promise.all([
      api.get(`/admin/elections/${electionId}/analytics/summary`).catch(() => null),
      api.get(`/admin/elections/${electionId}/analytics/candidate-performance`).catch(() => null),
      api.get(`/admin/elections/${electionId}/analytics/unit-participation`).catch(() => null),
      api.get(`/admin/elections/${electionId}/results`).catch(() => null),
      api.get(`/admin/elections/${electionId}/nominations`).catch(() => null),
    ]);

    setSummary(summaryRes ? objFrom(summaryRes) : null);
    setCandidatePerformance(performanceRes ? listFrom(performanceRes) : []);
    setUnitParticipation(unitsRes ? listFrom(unitsRes) : []);
    setResults(resultsRes ? listFrom(resultsRes) : []);
    setNominations(nominationsRes ? listFrom(nominationsRes) : []);
  };

  const initialLoad = async () => {
    setLoading(true);
    setError('');
    try {
      await loadElections();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load election operations dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const refreshDetails = async () => {
    if (!selectedElectionId) return;
    setRefreshing(true);
    try {
      await Promise.all([loadElections(), loadElectionDetails(selectedElectionId)]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    initialLoad();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadElectionDetails(selectedElectionId).catch(() => null);
    } else {
      setSummary(null);
      setCandidatePerformance([]);
      setUnitParticipation([]);
      setResults([]);
      setNominations([]);
    }
  }, [selectedElectionId]);

  useEffect(() => {
    const sections = MENU_ITEMS
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: '-25% 0px -55% 0px',
        threshold: [0.2, 0.4, 0.7],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [selectedElectionId, elections.length, nominations.length, results.length, candidatePerformance.length, unitParticipation.length]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }

    const top = element.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const doAction = async (handler) => {
    setActionMessage('');
    try {
      const message = await handler();
      setActionMessage(message || 'Action completed.');
      await refreshDetails();
    } catch (err) {
      setActionMessage(err?.response?.data?.message || 'Action failed.');
    }
  };

  const tallyResults = () => doAction(async () => {
    const res = await api.post(`/admin/elections/${selectedElectionId}/results/tally`);
    return res?.data?.message;
  });

  const declareTopWinners = () => doAction(async () => {
    if (!results.length) {
      throw new Error('No result rows found. Tally results first.');
    }
    const topRank = Math.min(...results.map((r) => Number(r.rank || 999)));
    const winnerResultIds = results.filter((r) => Number(r.rank) === topRank).map((r) => r.id);

    const res = await api.post(`/admin/elections/${selectedElectionId}/results/declare-winners`, {
      winner_result_ids: winnerResultIds,
      tie_break_method: winnerResultIds.length > 1 ? 're_vote' : null,
    });
    return res?.data?.message;
  });

  const publishResults = () => doAction(async () => {
    const res = await api.post(`/admin/elections/${selectedElectionId}/results/publish`);
    return res?.data?.message;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[55vh]">
        <div className="h-10 w-10 rounded-full border-b-2 border-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-1 lg:p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Operations</p>
          <h1 className="mt-2 text-3xl font-black text-white">Election & Voting Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            End-to-end operational control for election framework, nomination workflow, secure voting, automated results, and analytics.
          </p>
        </div>
        <button
          onClick={refreshDetails}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold"
        >
          {refreshing ? 'Refreshing…' : 'Refresh Data'}
        </button>
      </div>

      <div className="sticky top-4 z-20 rounded-2xl border border-white/10 bg-slate-950/75 backdrop-blur-xl shadow-2xl overflow-x-auto">
        <div className="flex min-w-max items-center gap-2 p-3">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeSection === item.id
                  ? 'bg-primary text-slate-950 shadow-lg shadow-primary/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div id="overview" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 scroll-mt-32">
        <StatCard label="Total Elections" value={electionCounts.total} sub="All configured cycles" />
        <StatCard label="Active Elections" value={electionCounts.active} sub="Nomination/Voting stages" />
        <StatCard label="Voting Open" value={electionCounts.votingOpen} sub="Live ballot windows" />
        <StatCard label="Results Published" value={electionCounts.published} sub="Completed cycles" />
      </div>

      <div id="control" className="bg-white/5 border border-white/10 rounded-2xl p-5 scroll-mt-32">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Select Election</label>
          <select
            value={selectedElectionId || ''}
            onChange={(e) => setSelectedElectionId(Number(e.target.value))}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-w-[280px]"
          >
            {elections.length === 0 ? <option value="">No elections yet</option> : null}
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                #{e.id} · {e.title}
              </option>
            ))}
          </select>
          {selectedElection ? (
            <span className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-semibold ${STATUS_STYLES[selectedElection.status] || STATUS_STYLES.draft}`}>
              {selectedElection.status_label || selectedElection.status}
            </span>
          ) : null}
          <div className="lg:ml-auto text-xs text-slate-400">
            <Link to="/dashboard/admin/elections" className="text-primary hover:underline">Election module</Link>
          </div>
        </div>
      </div>

      {!selectedElection ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-slate-300">Create at least one election from the admin API/module to use this dashboard.</div>
      ) : (
        <>
          <div id="pipeline" className="grid grid-cols-1 lg:grid-cols-3 gap-4 scroll-mt-32">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 166 · Nominations</p>
              <h3 className="mt-2 text-lg font-black text-white">Nomination Pipeline</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/5 p-3"><span className="text-slate-400">Total</span><p className="text-white font-bold">{nominationCounts.total}</p></div>
                <div className="rounded-xl bg-amber-500/10 p-3"><span className="text-amber-300">Pending</span><p className="text-white font-bold">{nominationCounts.pending}</p></div>
                <div className="rounded-xl bg-emerald-500/10 p-3"><span className="text-emerald-300">Approved</span><p className="text-white font-bold">{nominationCounts.approved}</p></div>
                <div className="rounded-xl bg-rose-500/10 p-3"><span className="text-rose-300">Rejected/Withdrawn</span><p className="text-white font-bold">{nominationCounts.rejected + nominationCounts.withdrawn}</p></div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 167 · Voting Engine</p>
              <h3 className="mt-2 text-lg font-black text-white">Secure Voting Metrics</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Votes Cast: <span className="text-white font-semibold">{summary?.total_votes_cast ?? 0}</span></p>
                <p>Eligible Voters: <span className="text-white font-semibold">{summary?.total_eligible ?? 0}</span></p>
                <p>Turnout: <span className="text-white font-semibold">{summary?.turnout_pct ?? 0}%</span></p>
                <p className="text-xs text-slate-400">One-member-one-vote enforced by voter receipt + ballot token split.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 168 · Result Ops</p>
              <h3 className="mt-2 text-lg font-black text-white">Operational Actions</h3>
              <div className="mt-4 grid grid-cols-1 gap-2">
                <button onClick={tallyResults} className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 text-sm font-semibold">Tally Results</button>
                <button onClick={declareTopWinners} className="px-3 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-200 text-sm font-semibold">Declare Top Rank Winner(s)</button>
                <button onClick={publishResults} className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-sm font-semibold">Publish Results</button>
              </div>
              {actionMessage ? <p className="mt-3 text-xs text-slate-300">{actionMessage}</p> : null}
            </div>
          </div>

          <div id="results" className="grid grid-cols-1 xl:grid-cols-2 gap-4 scroll-mt-32">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 168</p>
                <h3 className="text-lg font-black text-white">Result Table</h3>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-white/10">
                      <th className="text-left py-2">Rank</th>
                      <th className="text-left py-2">Candidate</th>
                      <th className="text-left py-2">Votes</th>
                      <th className="text-left py-2">Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr><td colSpan={4} className="py-6 text-slate-400">No tally rows yet.</td></tr>
                    ) : results.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 text-slate-200">
                        <td className="py-2">#{row.rank}</td>
                        <td className="py-2">{row?.nomination?.candidate?.full_name || '—'}</td>
                        <td className="py-2">{row.vote_count}</td>
                        <td className="py-2">{row.is_winner ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 169</p>
                <h3 className="text-lg font-black text-white">Candidate Performance</h3>
              </div>
              <div className="p-4 space-y-3">
                {candidatePerformance.length === 0 ? (
                  <p className="text-slate-400 text-sm">No candidate performance data yet.</p>
                ) : candidatePerformance.map((p) => (
                  <div key={p.nomination_id}>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>{p?.candidate?.full_name || 'Unknown Candidate'}</span>
                      <span>{p.vote_count} votes · {p.vote_share_pct}%</span>
                    </div>
                    <div className="h-2 rounded bg-white/10 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, Number(p.vote_share_pct || 0))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="analytics" className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden scroll-mt-32">
            <div className="px-5 py-4 border-b border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Task 169</p>
              <h3 className="text-lg font-black text-white">Unit-wise Participation</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {unitParticipation.length === 0 ? (
                <p className="text-slate-400 text-sm">No participation records yet.</p>
              ) : unitParticipation.map((u) => (
                <div key={u.unit_id} className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-sm font-semibold text-white">{u.unit_name}</p>
                  <p className="text-xs text-slate-400 mt-1">Votes Cast</p>
                  <p className="text-xl font-black text-primary mt-1">{u.votes_cast}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ElectionOperationsDashboard;
