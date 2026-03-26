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
		<div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
			{/* ── Page Header ── */}
			<div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
				<div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
				<div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div>
						<p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Intelligence</p>
						<h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">{member.full_name}</h1>
						<p className="text-sm font-medium text-slate-400 mt-2 flex items-center gap-3">
							<span className="text-primary font-black uppercase tracking-widest">{member.member_id || 'ID_PENDING'}</span>
							<span className="w-1 h-1 rounded-full bg-slate-700" />
							<span className={`px-3 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
								{member.status}
							</span>
						</p>
					</div>
					<div className="flex gap-4">
						<Button variant="outline" onClick={() => navigate('/dashboard/admin/members')} className="font-black uppercase tracking-widest text-[10px] px-8 border-white/10 hover:bg-white/10">Return to Registry</Button>
						<Link to="/dashboard/admin/members/pending" className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl">Pending Queue</Link>
				    </div>
				</div>
			</div>

			<div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
				{/* Overview Card */}
				<div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:bg-primary/10 transition-all" />
					<h2 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 relative">Profile Manifest</h2>
					<div className="space-y-4 relative">
						{[
							['Email_Addr', member.user?.email],
							['Mobile_Comms', member.mobile],
							['Institution', member.institution],
							['Dept_Cluster', member.department],
							['Org_Unit', member.organizational_unit?.name],
						].map(([label, val], i) => (
							<div key={i} className="flex flex-col gap-1">
								<span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">{label}</span>
								<span className="text-sm font-black text-slate-300 uppercase tracking-tight truncate">{val || '—'}</span>
							</div>
						))}
					</div>
				</div>

				{/* Actions Card */}
				<div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:bg-primary/10 transition-all" />
					<h2 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 relative">Privilege Controls</h2>
					
					<div className="space-y-6 relative">
						<div className="space-y-2">
							<label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assigned Designation</label>
							<select
								value={selectedRole}
								onChange={(e) => setSelectedRole(e.target.value)}
								className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
							>
								{roleOptions.map(opt => (
									<option key={opt.id} value={opt.id} className="bg-slate-900">{opt.name.toUpperCase()}</option>
								))}
							</select>
						</div>
						
						<Button className="w-full font-black uppercase tracking-widest text-[10px] py-4 shadow-lg shadow-primary/20" onClick={handlePromote} isLoading={acting}>Update Role Protocol</Button>
						
						<div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
							{member.status === 'pending' && <Button variant="primary" onClick={() => runAction('approve')} isLoading={acting} className="font-black uppercase tracking-widest text-[9px] py-3">Approve</Button>}
							{member.status === 'pending' && <Button variant="accent" onClick={() => runAction('reject')} isLoading={acting} className="font-black uppercase tracking-widest text-[9px] py-3">Reject</Button>}
							{member.status === 'active' && <Button variant="gold" onClick={() => runAction('suspend')} isLoading={acting} className="font-black uppercase tracking-widest text-[9px] py-3">Suspend</Button>}
							{member.status !== 'expelled' && <Button variant="accent" onClick={() => runAction('expel')} isLoading={acting} className="font-black uppercase tracking-widest text-[9px] py-3">Expel</Button>}
						</div>
						
						<p className={`text-[10px] font-bold uppercase tracking-widest text-center ${message ? 'text-emerald-400' : 'text-slate-600'}`}>
							{message || 'Operational state changes are audited.'}
						</p>
					</div>
				</div>

				{/* Documents Card */}
				<div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:bg-primary/10 transition-all" />
					<h2 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 relative">Digital Assets</h2>
					<div className="space-y-3 relative">
						{[
							['Profile Image', documents.photo_url],
							['NID/Identity Doc', documents.nid_doc_url],
							['Institutional ID', documents.student_id_url],
						].map(([label, url], i) => (
							<a 
								key={i} 
								href={url || '#'} 
								target="_blank" 
								rel="noreferrer"
								className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group/link"
							>
								<span className="text-[10px] font-black text-slate-400 group-hover/link:text-white uppercase tracking-widest">{label}</span>
								<span className="text-primary text-sm opacity-0 group-hover/link:opacity-100 transition-all translate-x-1 group-hover/link:translate-x-0">→</span>
							</a>
						))}
						<a 
							href={`${import.meta.env.VITE_API_URL}/admin/members/${id}/id-card`} 
							target="_blank" 
							rel="noreferrer"
							className="mt-4 flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-500/20 transition-all group/dl"
						>
							<span className="group-hover/dl:animate-bounce">⬇</span> Export PDF Card
						</a>
					</div>
				</div>
			</div>

			<div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8 relative overflow-hidden group">
				<div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
				<h2 className="text-xl font-black text-white uppercase tracking-tight relative">Organizational Placement</h2>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
					{(member.positions ?? []).length === 0 && (
						<div className="col-span-full py-16 text-center bg-white/[0.02] border border-white/5 rounded-[2rem]">
							<p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">No position nodes assigned to this member-id.</p>
						</div>
					)}
					{(member.positions ?? []).map((position) => (
						<div key={position.id} className="flex flex-col gap-4 bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 hover:bg-white/[0.07] hover:border-white/20 transition-all group/pos">
							<div className="flex justify-between items-start">
								<div className="space-y-1">
									<p className="text-base font-black text-white uppercase tracking-tight group-hover/pos:text-primary transition-colors">{position.role?.name || 'UNDESIGNATED'}</p>
									<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{position.unit?.name || position.organizational_unit?.name || 'UNASSIGNED_UNIT'}</p>
								</div>
								<span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ${position.is_active ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-slate-500/10 text-slate-500 ring-slate-500/20'}`}>
									{position.is_active ? 'ACTIVE_STATION' : 'HISTORICAL'}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default MemberDetail;
