import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';

const MemberSettings = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logout();
		navigate('/login', { replace: true });
	};

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Settings</h1>
				<p className="text-sm text-gray-500 mt-1">Account-level actions and guidance for your dashboard access.</p>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
					<h2 className="text-base font-semibold text-gray-800">Account Summary</h2>
					<div className="text-sm space-y-2">
						<p><span className="text-gray-500 inline-block w-24">Email</span>{user?.email ?? '—'}</p>
						<p><span className="text-gray-500 inline-block w-24">User Type</span>{user?.user_type ?? 'member'}</p>
					</div>
					<Link to="/dashboard/member/profile" className="text-sm text-primary hover:underline">Update profile information →</Link>
				</div>

				<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
					<h2 className="text-base font-semibold text-gray-800">Session Controls</h2>
					<p className="text-sm text-gray-600">Use logout when you finish on a shared device. Password management can be added once the backend password update flow is exposed.</p>
					<div className="flex gap-3">
						<Button variant="outline" onClick={() => navigate('/dashboard/member')}>Back To Dashboard</Button>
						<Button variant="accent" onClick={handleLogout}>Log Out</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MemberSettings;
