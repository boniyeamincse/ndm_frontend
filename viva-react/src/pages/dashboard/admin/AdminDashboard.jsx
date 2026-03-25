import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const toNumber = (value) => Number(value ?? 0);
const toPercent = (value, total) => {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
};

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '—';
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, activityRes, pendingRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/dashboard/activity'),
          api.get('/admin/members/pending', { params: { per_page: 3 } }),
        ]);

        setStats(statsRes.data?.data ?? {});
        setActivity(activityRes.data?.data ?? []);
        setPendingMembers(pendingRes.data?.data?.data ?? []);
      } catch {
        setError('Failed to load admin dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const members = useMemo(() => stats?.members ?? {}, [stats]);
  const tasks = useMemo(() => stats?.tasks ?? {}, [stats]);
  const units = useMemo(() => stats?.units ?? {}, [stats]);

  const totalMembers = toNumber(members.total);
  const activeMembers = toNumber(members.active);
  const pendingCount = toNumber(members.pending);
  const suspendedCount = toNumber(members.suspended);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh] text-gray-400">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .dash { display: flex; min-height: calc(100vh - 64px); background: #F1F5F9; font-size: 13px; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
        .sidebar { width: 240px; min-width: 240px; background: #0F2B4C; color: #CBD5E1; display: flex; flex-direction: column; overflow-y: auto; }
        .sb-logo { padding: 18px 16px 14px; border-bottom: 1px solid #1E3A5F; }
        .sb-logo .org { font-size: 10px; color: #64748B; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 3px; }
        .sb-logo .title { font-size: 14px; font-weight: 500; color: #F1F5F9; }
        .sb-logo .subtitle { font-size: 10px; color: #94A3B8; margin-top: 2px; }
        .sb-section { padding: 12px 0 4px; }
        .sb-label { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: #475569; padding: 0 16px 6px; }
        .sb-item { display: flex; align-items: center; gap: 9px; padding: 7px 16px; border-left: 3px solid transparent; color: #94A3B8; font-size: 12px; }
        .sb-item.active { background: #1E3A5F; color: #F8FAFC; border-left-color: #D4AF37; }
        .sb-item .ico { font-size: 13px; width: 16px; text-align: center; }
        .sb-badge { margin-left: auto; background: #DC2626; color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 8px; font-weight: 500; }
        .sb-divider { border-top: 1px solid #1E3A5F; margin: 8px 0; }
        .sb-footer { margin-top: auto; padding: 12px 16px; border-top: 1px solid #1E3A5F; display: flex; align-items: center; gap: 10px; }
        .avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: #D4AF37; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #0F2B4C; }
        .sb-footer .name { font-size: 11px; color: #CBD5E1; }
        .sb-footer .role { font-size: 10px; color: #64748B; }

        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .topbar { background: #fff; border-bottom: 1px solid #E2E8F0; padding: 0 24px; min-height: 52px; display: flex; align-items: center; gap: 16px; }
        .topbar-title { font-size: 15px; font-weight: 600; color: #0F172A; flex: 1; }
        .topbar-pill { font-size: 10px; background: #EFF6FF; color: #1D4ED8; padding: 3px 8px; border-radius: 20px; border: 1px solid #BFDBFE; }
        .notif-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center; position: relative; font-size: 14px; background: #F8FAFC; }
        .notif-dot { position: absolute; top: 5px; right: 5px; width: 7px; height: 7px; background: #DC2626; border-radius: 50%; border: 1px solid #fff; }

        .content { flex: 1; overflow-y: auto; padding: 20px 24px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin-bottom: 20px; }
        .kpi-card { background: #fff; border-radius: 10px; border: 1px solid #E2E8F0; padding: 16px; }
        .kpi-label { font-size: 11px; color: #64748B; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .kpi-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .kpi-value { font-size: 26px; font-weight: 600; color: #0F172A; }
        .kpi-delta { font-size: 10px; margin-top: 4px; color: #64748B; }
        .kpi-bar { height: 3px; border-radius: 2px; margin-top: 10px; background: #F1F5F9; overflow: hidden; }
        .kpi-bar-fill { height: 100%; border-radius: 2px; }

        .grid2 { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 12px; margin-bottom: 20px; }
        .grid3 { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,1fr); gap: 12px; margin-bottom: 20px; }
        .card { background: #fff; border-radius: 10px; border: 1px solid #E2E8F0; }
        .card-header { padding: 14px 16px 10px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .card-title { font-size: 13px; font-weight: 600; color: #0F172A; }
        .card-sub { font-size: 10px; color: #94A3B8; }
        .card-body { padding: 14px 16px; }

        .mini-table { width: 100%; border-collapse: collapse; }
        .mini-table th { font-size: 10px; color: #94A3B8; text-align: left; padding: 0 0 8px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
        .mini-table td { padding: 8px 0; border-top: 1px solid #F8FAFC; color: #334155; font-size: 12px; vertical-align: middle; }
        .mini-table tr:first-child td { border-top: none; }

        .status { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 500; }
        .btn-sm { font-size: 10px; padding: 4px 10px; border-radius: 6px; border: 1px solid #E2E8F0; background: #F8FAFC; color: #334155; }
        .btn-gold { background: #D4AF37; border-color: #D4AF37; color: #0F2B4C; font-weight: 600; }

        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #475569; margin-bottom: 6px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .activity-item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid #F8FAFC; align-items: flex-start; }
        .activity-item:last-child { border-bottom: none; }
        .act-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; margin-top: 1px; }
        .act-text { font-size: 11px; color: #334155; line-height: 1.5; }
        .act-time { font-size: 10px; color: #94A3B8; margin-top: 2px; }

        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .grid3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 1024px) {
          .sidebar { display: none; }
          .grid2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash">
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="org">Nationalist Democratic Movement</div>
            <div className="title">NDM Student Wing</div>
            <div className="subtitle">Admin Dashboard · Laravel API</div>
          </div>

          <div className="sb-section">
            <div className="sb-label">Overview</div>
            <div className="sb-item active"><span className="ico">◉</span> Dashboard</div>
          </div>

          <div className="sb-divider" />
          <div className="sb-section">
            <div className="sb-label">Member Management</div>
            <Link className="sb-item" to="/dashboard/admin/members"><span className="ico">👥</span> All Members</Link>
            <Link className="sb-item" to="/dashboard/admin/members/pending"><span className="ico">⏳</span> Pending Approvals <span className="sb-badge">{pendingCount}</span></Link>
          </div>

          <div className="sb-divider" />
          <div className="sb-section">
            <div className="sb-label">Configuration</div>
            <Link className="sb-item" to="/dashboard/admin/roles"><span className="ico">🔐</span> Role Definitions</Link>
            <Link className="sb-item" to="/dashboard/admin/units"><span className="ico">🏛</span> Units</Link>
            <Link className="sb-item" to="/dashboard/admin/positions"><span className="ico">📌</span> Positions</Link>
            <Link className="sb-item" to="/dashboard/admin/positions/history"><span className="ico">🕓</span> Position History</Link>
          </div>

          <div className="sb-footer">
            <div className="avatar-sm">SA</div>
            <div>
              <div className="name">Super Admin</div>
              <div className="role">System Administrator</div>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div className="topbar-title">Dashboard Overview</div>
            <div className="topbar-pill">API: Laravel</div>
            <button className="notif-btn" type="button" aria-label="Notifications">🔔<span className="notif-dot" /></button>
            <button className="notif-btn" type="button" aria-label="Language">🌐</button>
            <div className="avatar-sm">SA</div>
          </div>

          <div className="content">
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-label"><div className="kpi-icon" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>👥</div>Total Members</div>
                <div className="kpi-value">{totalMembers.toLocaleString()}</div>
                <div className="kpi-delta">Current registered members</div>
                <div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: `${toPercent(totalMembers, totalMembers || 1)}%`, background: '#1D4ED8' }} /></div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label"><div className="kpi-icon" style={{ background: '#FEF9C3', color: '#854D0E' }}>⏳</div>Pending Approvals</div>
                <div className="kpi-value" style={{ color: '#CA8A04' }}>{pendingCount.toLocaleString()}</div>
                <div className="kpi-delta">Members waiting for review</div>
                <div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: `${toPercent(pendingCount, totalMembers || 1)}%`, background: '#CA8A04' }} /></div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label"><div className="kpi-icon" style={{ background: '#DCFCE7', color: '#166534' }}>✅</div>Active Members</div>
                <div className="kpi-value" style={{ color: '#16A34A' }}>{activeMembers.toLocaleString()}</div>
                <div className="kpi-delta">Approved and active</div>
                <div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: `${toPercent(activeMembers, totalMembers || 1)}%`, background: '#16A34A' }} /></div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label"><div className="kpi-icon" style={{ background: '#F3F0FF', color: '#6D28D9' }}>🏛</div>Org. Units</div>
                <div className="kpi-value">{toNumber(units.total).toLocaleString()}</div>
                <div className="kpi-delta">Organizational structure coverage</div>
                <div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: '88%', background: '#7C3AED' }} /></div>
              </div>
            </div>

            <div className="grid3">
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Pending Approvals</div>
                    <div className="card-sub">GET /api/admin/members/pending</div>
                  </div>
                  <Link to="/dashboard/admin/members/pending" className="btn-sm btn-gold">Open Queue</Link>
                </div>
                <div className="card-body">
                  <table className="mini-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Phone</th>
                        <th>Unit</th>
                        <th>Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingMembers.length === 0 && (
                        <tr><td colSpan={4} style={{ color: '#94A3B8' }}>No pending records.</td></tr>
                      )}
                      {pendingMembers.map((member) => (
                        <tr key={member.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{member.full_name}</div>
                            <div style={{ color: '#94A3B8', fontSize: 10 }}>{member.member_id || 'Pending ID'}</div>
                          </td>
                          <td style={{ color: '#475569' }}>{member.mobile || member.phone || '—'}</td>
                          <td>
                            <span className="status" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                              {member.organizational_unit?.name || 'Not assigned'}
                            </span>
                          </td>
                          <td style={{ color: '#94A3B8' }}>{formatDateTime(member.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Status Distribution</div>
                    <div className="card-sub">All members breakdown</div>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ marginBottom: 8, fontSize: 24, fontWeight: 700, color: '#0F172A' }}>{totalMembers.toLocaleString()}</div>
                  <div className="legend-item"><span className="legend-dot" style={{ background: '#16A34A' }} />Active — {activeMembers.toLocaleString()}</div>
                  <div className="legend-item"><span className="legend-dot" style={{ background: '#CA8A04' }} />Pending — {pendingCount.toLocaleString()}</div>
                  <div className="legend-item"><span className="legend-dot" style={{ background: '#DC2626' }} />Suspended — {suspendedCount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="grid2">
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Member Growth Snapshot</div>
                    <div className="card-sub">Members by join year</div>
                  </div>
                </div>
                <div className="card-body">
                  {(stats?.members_by_year ?? []).length === 0 && <div style={{ color: '#94A3B8' }}>No yearly member data available.</div>}
                  {(stats?.members_by_year ?? []).map((item) => (
                    <div key={item.year} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                      <span style={{ color: '#64748B' }}>{item.year}</span>
                      <strong style={{ color: '#0F172A' }}>{toNumber(item.count).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Recent Activity</div>
                    <div className="card-sub">Live audit trail</div>
                  </div>
                </div>
                <div className="card-body">
                  {activity.length === 0 && <div style={{ color: '#94A3B8' }}>No recent activity.</div>}
                  {activity.slice(0, 6).map((log) => (
                    <div className="activity-item" key={log.id}>
                      <div className="act-dot" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>•</div>
                      <div>
                        <div className="act-text">{log.action} {log.model_type ? <strong>{log.model_type} #{log.model_id}</strong> : null}</div>
                        <div className="act-time">{formatDateTime(log.performed_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;

