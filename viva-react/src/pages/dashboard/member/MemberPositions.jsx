import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import MemberCard from '../../../components/member/MemberCard';
import MemberEmptyState from '../../../components/member/MemberEmptyState';
import MemberStatusBadge from '../../../components/member/MemberStatusBadge';

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
					<MemberEmptyState text="No positions found for your profile." className="bg-white border-gray-100 text-gray-400 p-10" />
				)}

				{positions.map((position) => (
					<MemberCard key={position.id} className="bg-white border-gray-100 p-6">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">{position.role?.name ?? 'Unassigned Role'}</h2>
								<p className="text-sm text-gray-500">{position.organizational_unit?.name ?? 'No unit assigned'}</p>
							</div>
							<MemberStatusBadge
								status={position.is_active ? 'active' : 'completed'}
								variant="position"
								className="rounded-full text-xs font-medium tracking-normal px-3"
							/>
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
					</MemberCard>
				))}
			</div>
		</div>
	);
};

export default MemberPositions;
