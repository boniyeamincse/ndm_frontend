import React, { useEffect, useState } from 'react';
import api from '../../../services/api';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'Present');

const MemberPositions = () => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const res = await api.get('/profile');
				setProfile(res.data.data ?? null);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	if (loading) {
		return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
	}

	const positions = profile?.positions ?? [];

	return (
		<div className="max-w-5xl mx-auto p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Positions And History</h1>
				<p className="text-sm text-gray-500 mt-1">Track your active and previous organizational responsibilities.</p>
			</div>

			<div className="grid gap-4">
				{positions.length === 0 && (
					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
						No positions found for your profile.
					</div>
				)}

				{positions.map((position) => (
					<div key={position.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">{position.role?.name ?? 'Unassigned Role'}</h2>
								<p className="text-sm text-gray-500">{position.organizational_unit?.name ?? 'No unit assigned'}</p>
							</div>
							<span className={`px-3 py-1 rounded-full text-xs font-medium ${position.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
								{position.is_active ? 'Active' : 'Completed'}
							</span>
						</div>

						<div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
							<div className="bg-gray-50 rounded-xl p-4">
								<p className="text-gray-400 text-xs uppercase tracking-wide">Assigned</p>
								<p className="font-medium text-gray-800 mt-1">{formatDate(position.assigned_at)}</p>
							</div>
							<div className="bg-gray-50 rounded-xl p-4">
								<p className="text-gray-400 text-xs uppercase tracking-wide">Relieved</p>
								<p className="font-medium text-gray-800 mt-1">{formatDate(position.relieved_at)}</p>
							</div>
							<div className="bg-gray-50 rounded-xl p-4">
								<p className="text-gray-400 text-xs uppercase tracking-wide">Notes</p>
								<p className="font-medium text-gray-800 mt-1">{position.notes || 'No notes available'}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default MemberPositions;
