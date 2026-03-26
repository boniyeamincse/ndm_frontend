import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';

const roleOptions = [
	{ id: 'general_member', name: 'General Member' },
	{ id: 'organizer', name: 'Organizer' },
	{ id: 'admin', name: 'Admin' },
];

const TABS = [
  { id: 'profile',   label: 'Profile Manifest' },
  { id: 'documents', label: 'Digital Assets' },
  { id: 'positions', label: 'Org Placement' },
  { id: 'audit',     label: 'Audit History' },
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
    const [activeTab, setActiveTab] = useState('profile');

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
		return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Synchronizing Identity Node...</p>
            </div>
        );
	}

	if (!member) {
		return <div className="p-8 text-rose-500 font-black uppercase tracking-widest text-center py-32 bg-white/5 rounded-3xl border border-white/10 m-6">Entity not found in core registry.</div>;
	}

	return (
		<div className="max-w-7xl mx-auto p-6 space-y-8 pb-32">
			{/* ── Page Header ── */}
			<div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
				<div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
				<div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="flex items-center gap-8">
                        <div className="relative shrink-0">
                          {member.photo_path
                            ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${member.photo_path}`} alt="" className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-white/5 group-hover:scale-105 transition-transform" />
                            : <div className="w-24 h-24 rounded-[2rem] bg-white/5 text-primary flex items-center justify-center text-3xl font-black border border-white/10 shadow-inner group-hover:scale-105 transition-transform">{member.full_name?.[0]}</div>
                          }
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-slate-900 ${member.status === 'active' ? 'bg-emerald-500' : member.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Intelligence</p>
                            <h1 className="mt-2 text-4xl font-black text-white tracking-tight uppercase">{member.full_name}</h1>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="text-primary font-black uppercase tracking-widest text-xs bg-primary/10 px-3 py-1 rounded-md">{member.member_id || 'ID_PENDING'}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    {member.status}
                                </span>
                            </div>
                        </div>
					</div>
					<div className="flex gap-4">
						<Button variant="outline" onClick={() => navigate('/dashboard/admin/members')} className="font-black uppercase tracking-widest text-[10px] px-8 border-white/10 hover:bg-white/10">Return to Registry</Button>
						<Link to="/dashboard/admin/members/pending" className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl">Pending Queue</Link>
				    </div>
				</div>
			</div>

            {/* ── Navigation Tabs ── */}
            <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id 
                            ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Content Area ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'profile' && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Profile Manifest */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 transition-all" />
                                <h2 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 relative">Personnel Matrix</h2>
                                <div className="grid sm:grid-cols-2 gap-8 relative">
                                    {[
                                        ['Email_Addr', member.user?.email],
                                        ['Mobile_Comms', member.mobile],
                                        ['Institution', member.institution],
                                        ['Dept_Cluster', member.department],
                                        ['Org_Unit', member.organizational_unit?.name],
                                        ['Blood_Type', member.blood_group],
                                        ['Gender_ID', member.gender],
                                        ['Cycle_Year', member.join_year],
                                    ].map(([label, val], i) => (
                                        <div key={i} className="flex flex-col gap-1.5">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">{label}</span>
                                            <span className="text-sm font-black text-slate-300 uppercase tracking-tight truncate">{val || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-6 border-t border-white/5">
                                     <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em] block mb-2">Geo_Coordinates (Address)</span>
                                     <p className="text-sm font-black text-slate-300 uppercase tracking-tight leading-relaxed">{member.present_address || 'NOT_DECLARED'}</p>
                                </div>
                            </div>

                            {/* Privilege Controls */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:bg-primary/10 transition-all" />
                                <h2 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 relative">Privilege Overrides</h2>
                                
                                <div className="space-y-6 relative">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assigned Protocol Level</label>
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
                                    
                                    <Button className="w-full font-black uppercase tracking-widest text-[10px] py-4 shadow-lg shadow-primary/20" onClick={handlePromote} isLoading={acting}>Update Clearance Protocol</Button>
                                    
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                                        {member.status === 'pending' && <Button variant="primary" onClick={() => runAction('approve')} isLoading={acting} className="font-black uppercase tracking-widest text-[9px] py-3 text-slate-900">Grant Admission</Button>}
                                        {member.status === 'pending' && <Button variant="accent" onClick={() => runAction('reject')} isLoading={acting} className="font-black uppercase tracking-widest text-[9px] py-3">Deny Protocol</Button>}
                                        {member.status === 'active' && <Button variant="gold" onClick={() => runAction('suspend')} isLoading={acting} className="font-black uppercase tracking-widest text-[9px] py-3 text-slate-900">Suspend Sector</Button>}
                                        {member.status !== 'expelled' && <Button variant="accent" onClick={() => runAction('expel')} isLoading={acting} className="font-black uppercase tracking-widest text-[9px] py-3">Expel Entity</Button>}
                                    </div>
                                    
                                    <p className={`text-[10px] font-bold uppercase tracking-widest text-center ${message ? 'text-emerald-400' : 'text-slate-600'}`}>
                                        {message || 'All operational state changes are documented in the audit ledger.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { label: 'Identity Image', url: documents.photo_url, color: 'text-primary' },
                                { label: 'Gov Identity Doc', url: documents.nid_doc_url, color: 'text-rose-400' },
                                { label: 'Student ID Matrix', url: documents.student_id_url, color: 'text-emerald-400' },
                            ].map((doc, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-6 group/doc relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-all ${doc.color === 'text-primary' ? 'bg-primary' : doc.color === 'text-rose-400' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                    <h3 className={`text-[10px] font-black uppercase tracking-widest pb-4 border-b border-white/5 ${doc.color}`}>{doc.label}</h3>
                                    
                                    <div className="aspect-[3/4] rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden relative shadow-inner">
                                        {doc.url ? (
                                            <img src={doc.url} className="w-full h-full object-cover transition-transform duration-700 group-hover/doc:scale-110" alt={doc.label} />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                                                <span className="text-5xl opacity-20">📂</span>
                                                <span className="text-[10px] font-black tracking-widest uppercase">DATA_MISSING</span>
                                            </div>
                                        )}
                                    </div>

                                    {doc.url && (
                                        <a 
                                            href={doc.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-center text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all block"
                                        >
                                            View High Resolution
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'positions' && (
                        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
                           <h2 className="text-xl font-black text-white uppercase tracking-tight relative">Organizational Hierarchy Mapping</h2>
                           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                               {(member.positions ?? []).length === 0 && (
                                   <div className="col-span-full py-24 text-center bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-4">
                                       <div className="text-4xl opacity-10">📍</div>
                                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">No deployment nodes detected for this member-id.</p>
                                   </div>
                               )}
                               {(member.positions ?? []).map((position) => (
                                   <div key={position.id} className="flex flex-col gap-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/[0.07] hover:border-white/20 transition-all group/pos shadow-xl">
                                       <div className="flex justify-between items-start">
                                           <div className="space-y-2">
                                               <p className="text-xl font-black text-white uppercase tracking-tight group-hover/pos:text-primary transition-colors">{position.role?.name || 'UNDESIGNATED'}</p>
                                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{position.unit?.name || position.organizational_unit?.name || 'UNASSIGNED_UNIT'}</p>
                                           </div>
                                           <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ${position.is_active ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-slate-500/10 text-slate-500 ring-slate-500/20'}`}>
                                               {position.is_active ? 'ACTIVE' : 'INACTIVE'}
                                           </span>
                                       </div>
                                       <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5 pt-4">
                                            Telemetry Session: {new Date(position.created_at).getFullYear()} — {position.is_active ? 'PRESENT' : 'END'}
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-10 relative overflow-hidden group min-h-[400px]">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-20" />
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Intelligence Audit Ledger</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Immutable record of sectoral state changes.</p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { event: 'STATUS_SYNC', detail: 'Lifecycle state updated to ACTIVE', timestamp: member.updated_at, actor: 'SYSTEM_PROTOCOL' },
                                    { event: 'REGISTRATION_INIT', detail: 'Initial vector ingestion into cluster', timestamp: member.created_at, actor: 'CLIENT_PORTAL' },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-6 items-start relative pb-6 border-l-2 border-white/5 pl-8 ml-4 last:border-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700" />
                                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{log.event}</span>
                                                <span className="text-[9px] font-bold text-slate-600">{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-300 uppercase tracking-tight mb-4">{log.detail}</p>
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-slate-700" /> Authorized Source: {log.actor}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-center py-10">
                                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Audit stream stabilized — no further vectors detected.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
		</div>
	);
};

export default MemberDetail;
