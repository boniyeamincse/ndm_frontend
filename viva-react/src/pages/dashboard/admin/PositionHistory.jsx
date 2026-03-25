import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';

const formatDate = (val) => val ? new Date(val).toLocaleString() : '—';

const ACTION_COLORS = {
    assigned:    'bg-green-100 text-green-700',
    relieved:    'bg-amber-100 text-amber-700',
    transferred: 'bg-blue-100 text-blue-700',
};

const PositionHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: '' });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchHistory();
    }, [filter, page]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (filter.action) params.set('action', filter.action);
            const res = await api.get(`/admin/positions/history?${params}`);
            const payload = res.data.data;
            setRecords(payload?.data || payload || []);
            if (payload?.current_page) {
                setPagination({ current_page: payload.current_page, last_page: payload.last_page });
            }
        } catch (err) {
            console.error('Failed to load position history', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (action) => {
        setFilter({ action });
        setPage(1);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Position History</h1>
                    <p className="text-sm text-gray-500 mt-1">Complete audit log of all position assignments, transfers, and reliefs.</p>
                </div>
                <Link to="/dashboard/admin/positions" className="text-sm font-medium text-primary hover:underline shrink-0">
                    ← Active Positions
                </Link>
            </div>

            {/* Filter */}
            <div className="flex gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-52">
                    <Select
                        label=""
                        options={[
                            { id: '', name: 'All Actions' },
                            { id: 'assigned', name: 'Assigned' },
                            { id: 'relieved', name: 'Relieved' },
                            { id: 'transferred', name: 'Transferred' },
                        ]}
                        value={filter.action}
                        onChange={e => handleFilterChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No position history records found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Member</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Role</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Unit</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Action</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Performed By</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Date</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {records.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{rec.member?.full_name ?? '—'}</p>
                                            <p className="text-xs text-gray-400">{rec.member?.member_id ?? ''}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{rec.role?.name ?? '—'}</td>
                                        <td className="px-6 py-4 text-gray-700">{rec.unit?.name ?? '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${ACTION_COLORS[rec.action] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {rec.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{rec.performed_by?.name ?? '—'}</td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(rec.performed_at)}</td>
                                        <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{rec.remarks ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-3 p-4 border-t border-gray-50">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <button
                            disabled={page >= pagination.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PositionHistory;
