import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';

const formatDate = (val) => val ? new Date(val).toLocaleDateString() : '—';

const PositionManagement = () => {
    const [positions, setPositions] = useState([]);
    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ member_id: '', role_id: '', unit_id: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({ unit_id: '', role_id: '' });

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        fetchPositions();
    }, [filter]);

    const loadDropdowns = async () => {
        try {
            const [membersRes, rolesRes, unitsRes] = await Promise.all([
                api.get('/admin/members'),
                api.get('/admin/roles'),
                api.get('/admin/units'),
            ]);
            setMembers(membersRes.data.data?.data || membersRes.data.data || []);
            setRoles(rolesRes.data.data || []);
            setUnits(unitsRes.data.data || []);
        } catch (err) {
            console.error('Failed to load dropdown data', err);
        }
    };

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ is_active: '1' });
            if (filter.unit_id) params.set('unit_id', filter.unit_id);
            if (filter.role_id) params.set('role_id', filter.role_id);
            const res = await api.get(`/admin/positions?${params}`);
            setPositions(res.data.data?.data || res.data.data || []);
        } catch (err) {
            console.error('Failed to load positions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.post('/admin/positions', form);
            setShowModal(false);
            setForm({ member_id: '', role_id: '', unit_id: '', notes: '' });
            fetchPositions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign position.');
        } finally {
            setSaving(false);
        }
    };

    const handleRelieve = async (id) => {
        if (!window.confirm('Relieve this position? The action will be logged to position history.')) return;
        try {
            await api.delete(`/admin/positions/${id}`);
            fetchPositions();
        } catch (err) {
            console.error('Failed to relieve position', err);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Position Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Assign and manage active member positions across all organizational units.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Link to="/dashboard/admin/positions/history" className="text-sm font-medium text-primary hover:underline">
                        View History →
                    </Link>
                    <Button onClick={() => { setError(''); setShowModal(true); }}>
                        + Assign Position
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex-1 min-w-[160px]">
                    <Select
                        label=""
                        options={[{ id: '', name: 'All Units' }, ...units.map(u => ({ id: u.id, name: u.name }))]}
                        value={filter.unit_id}
                        onChange={e => setFilter(f => ({ ...f, unit_id: e.target.value }))}
                    />
                </div>
                <div className="flex-1 min-w-[160px]">
                    <Select
                        label=""
                        options={[{ id: '', name: 'All Roles' }, ...roles.map(r => ({ id: r.id, name: r.name }))]}
                        value={filter.role_id}
                        onChange={e => setFilter(f => ({ ...f, role_id: e.target.value }))}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : positions.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No active positions found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Member</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Role</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Unit</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Assigned On</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Assigned By</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {positions.map((pos) => (
                                    <tr key={pos.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{pos.member?.full_name ?? '—'}</p>
                                            <p className="text-xs text-gray-400">{pos.member?.member_id ?? ''}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{pos.role?.name ?? '—'}</td>
                                        <td className="px-6 py-4 text-gray-700">{pos.unit?.name ?? '—'}</td>
                                        <td className="px-6 py-4 text-gray-500">{formatDate(pos.assigned_at)}</td>
                                        <td className="px-6 py-4 text-gray-500">{pos.assigned_by?.name ?? '—'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRelieve(pos.id)}
                                                className="text-xs font-medium text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                Relieve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Assign Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Assign Position</h2>
                            <p className="text-sm text-gray-500">Assign a member to a role within an organizational unit.</p>
                        </div>
                        <form onSubmit={handleAssign} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{error}</div>
                            )}
                            <Select
                                label="Member"
                                options={[{ id: '', name: 'Select member…' }, ...members.map(m => ({ id: m.id, name: `${m.full_name} (${m.member_id ?? 'Pending'})` }))]}
                                value={form.member_id}
                                onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}
                                required
                            />
                            <Select
                                label="Role / Position"
                                options={[{ id: '', name: 'Select role…' }, ...roles.map(r => ({ id: r.id, name: r.name }))]}
                                value={form.role_id}
                                onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
                                required
                            />
                            <Select
                                label="Organizational Unit"
                                options={[{ id: '', name: 'Select unit…' }, ...units.map(u => ({ id: u.id, name: u.name }))]}
                                value={form.unit_id}
                                onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    rows={3}
                                    value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="Any remarks about this assignment…"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" isLoading={saving}>Assign</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PositionManagement;
