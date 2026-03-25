import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';

const roleOptions = [
	{ id: 'general_member', name: 'General Member' },
	{ id: 'organizer', name: 'Organizer' },
	{ id: 'admin', name: 'Admin' },
];

const MemberDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [member, setMember] = useState(null);
	const [documents, setDocuments] = useState({});
	const [loading, setLoading] = useState(true);
	const [acting, setActing] = useState(false);
	const [selectedRole, setSelectedRole] = useState('');
	const [message, setMessage] = useState('');

	useEffect(() => {
		const load = async () => {
			try {
				const [memberRes, docsRes] = await Promise.all([
					api.get(`/admin/members/${id}`),
					api.get(`/admin/members/${id}/documents`),
				]);
				const nextMember = memberRes.data.data;
				setMember(nextMember);
				setSelectedRole(nextMember.member_role?.role ?? '');
				setDocuments(docsRes.data.data ?? {});
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [id]);

	const reloadMember = async () => {
		const memberRes = await api.get(`/admin/members/${id}`);
		const nextMember = memberRes.data.data;
		setMember(nextMember);
		setSelectedRole(nextMember.member_role?.role ?? selectedRole);
	};

	const runAction = async (action) => {
		setActing(true);
		setMessage('');
		try {
			await api.post(`/admin/members/${id}/${action}`);
			await reloadMember();
			setMessage(`Member ${action} action completed.`);
		} finally {
			setActing(false);
		}
	};

	const handlePromote = async () => {
		if (!selectedRole) return;
		setActing(true);
		setMessage('');
		try {
			await api.post('/admin/members/promote-role', { member_id: Number(id), role: selectedRole });
			await reloadMember();
			setMessage('Member role updated successfully.');
		} finally {
			setActing(false);
		}
	};

	if (loading) {
		return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
	}

	if (!member) {
		return <div className="p-8 text-red-600">Member not found.</div>;
	}

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{member.full_name}</h1>
					<p className="text-sm text-gray-500 mt-1">{member.member_id || 'Pending member ID'} • {member.status}</p>
				</div>
				<div className="flex gap-3">
					<Button variant="outline" onClick={() => navigate('/dashboard/admin/members')}>Back</Button>
					<Link to="/dashboard/admin/members/pending" className="px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">Pending Queue</Link>
				</div>
			</div>

			<div className="grid lg:grid-cols-3 gap-6">
				<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
					<h2 className="text-base font-semibold text-gray-800">Member Overview</h2>
					<div className="space-y-2 text-sm text-gray-700">
						<p><span className="text-gray-500 inline-block w-28">Email</span>{member.user?.email ?? '—'}</p>
						<p><span className="text-gray-500 inline-block w-28">Mobile</span>{member.mobile ?? '—'}</p>
						<p><span className="text-gray-500 inline-block w-28">Institution</span>{member.institution ?? '—'}</p>
						<p><span className="text-gray-500 inline-block w-28">Department</span>{member.department ?? '—'}</p>
						<p><span className="text-gray-500 inline-block w-28">Unit</span>{member.organizational_unit?.name ?? '—'}</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
					<h2 className="text-base font-semibold text-gray-800">Role And Actions</h2>
					<Select label="Member Role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} options={roleOptions} />
					<Button className="w-full" onClick={handlePromote} isLoading={acting}>Update Role</Button>
					<div className="grid grid-cols-2 gap-3">
						{member.status === 'pending' && <Button variant="primary" onClick={() => runAction('approve')} isLoading={acting}>Approve</Button>}
						{member.status === 'pending' && <Button variant="accent" onClick={() => runAction('reject')} isLoading={acting}>Reject</Button>}
						{member.status === 'active' && <Button variant="gold" onClick={() => runAction('suspend')} isLoading={acting}>Suspend</Button>}
						{member.status !== 'expelled' && <Button variant="accent" onClick={() => runAction('expel')} isLoading={acting}>Expel</Button>}
					</div>
					<p className={`text-sm ${message ? 'text-green-700' : 'text-gray-400'}`}>{message || 'Role and status changes are audited automatically.'}</p>
				</div>

				<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
					<h2 className="text-base font-semibold text-gray-800">Documents</h2>
					<a className="block text-sm text-primary hover:underline" href={documents.photo_url || '#'} target="_blank" rel="noreferrer">Open photo</a>
					<a className="block text-sm text-primary hover:underline" href={documents.nid_doc_url || '#'} target="_blank" rel="noreferrer">Open NID document</a>
					<a className="block text-sm text-primary hover:underline" href={documents.student_id_url || '#'} target="_blank" rel="noreferrer">Open student ID document</a>
					<a className="block text-sm text-primary hover:underline" href={`${import.meta.env.VITE_API_URL}/admin/members/${id}/id-card`} target="_blank" rel="noreferrer">Download ID card PDF</a>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
				<h2 className="text-base font-semibold text-gray-800 mb-4">Positions</h2>
				<div className="space-y-3">
					{(member.positions ?? []).length === 0 && <p className="text-sm text-gray-400">No positions assigned.</p>}
					{(member.positions ?? []).map((position) => (
						<div key={position.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-gray-50 rounded-xl p-4 text-sm">
							<div>
								<p className="font-medium text-gray-900">{position.role?.name ?? 'Role'}</p>
								<p className="text-gray-500">{position.unit?.name ?? position.organizational_unit?.name ?? 'No unit'}</p>
							</div>
							<span className={`px-3 py-1 rounded-full text-xs font-medium ${position.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
								{position.is_active ? 'Active' : 'Inactive'}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default MemberDetail;
