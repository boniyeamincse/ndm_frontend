import React, { useEffect, useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';

const RoleManagement = () => {
	const [roles, setRoles] = useState([]);
	const [permissions, setPermissions] = useState([]);
	const [form, setForm] = useState({ name: '', description: '' });
	const [selectedRoleId, setSelectedRoleId] = useState(null);
	const [selectedPermissions, setSelectedPermissions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');

	const load = async () => {
		setLoading(true);
		try {
			const [rolesRes, permsRes] = await Promise.all([
				api.get('/admin/roles'),
				api.get('/admin/permissions'),
			]);
			setRoles(rolesRes.data.data ?? []);
			setPermissions(permsRes.data.data ?? []);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const handleCreate = async (event) => {
		event.preventDefault();
		setSaving(true);
		setMessage('');
		try {
			await api.post('/admin/roles', form);
			setForm({ name: '', description: '' });
			setMessage('Role created successfully.');
			await load();
		} finally {
			setSaving(false);
		}
	};

	const startEditing = (role) => {
		setSelectedRoleId(role.id);
		setSelectedPermissions((role.permissions ?? []).map((item) => item.id));
	};

	const togglePermission = (permissionId) => {
		setSelectedPermissions((current) => (
			current.includes(permissionId)
				? current.filter((id) => id !== permissionId)
				: [...current, permissionId]
		));
	};

	const savePermissions = async () => {
		if (!selectedRoleId) return;
		setSaving(true);
		setMessage('');
		try {
			await api.post(`/admin/roles/${selectedRoleId}/permissions`, { permission_ids: selectedPermissions });
			setMessage('Role permissions updated successfully.');
			await load();
		} finally {
			setSaving(false);
		}
	};

	const groupedPermissions = permissions.reduce((accumulator, permission) => {
		const key = permission.group || 'General';
		accumulator[key] = accumulator[key] || [];
		accumulator[key].push(permission);
		return accumulator;
	}, {});

	if (loading) {
		return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
	}

	return (
		<div className="max-w-7xl mx-auto p-6 space-y-8">
			<section className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
				<div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
				<div className="relative">
					<p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Access Control Protocol</p>
					<h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Role Management</h1>
					<p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Establish administrative hierarchies and define atomic permission sets for secure dashboard supervision.</p>
				</div>
			</section>

			<div className="grid lg:grid-cols-3 gap-8">
				<form onSubmit={handleCreate} className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-8 space-y-6 self-start">
					<h2 className="text-lg font-black text-white uppercase tracking-tight">Create Role</h2>
					<Input label="Role Name" name="name" placeholder="e.g. Editor" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
					<Input label="Description" name="description" placeholder="Brief role summary" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
					<Button type="submit" className="w-full font-black uppercase tracking-widest text-xs py-4" isLoading={saving}>Create Role</Button>
				</form>

				<div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-lg font-black text-white uppercase tracking-tight">Existing Roles</h2>
						<p className={`text-[10px] font-black uppercase tracking-widest ${message ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>{message || 'Select a role to manage'}</p>
					</div>
					<div className="grid md:grid-cols-2 gap-4">
						{roles.map((role) => (
							<button key={role.id} type="button" onClick={() => startEditing(role)} className={`text-left rounded-2xl border p-5 transition-all duration-300 group ${selectedRoleId === role.id ? 'border-primary bg-primary/10 shadow-lg shadow-primary-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'}`}>
								<p className={`font-bold transition-colors ${selectedRoleId === role.id ? 'text-primary' : 'text-slate-200 group-hover:text-white'}`}>{role.name}</p>
								<p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{role.description || 'No description provided.'}</p>
								<div className="flex items-center justify-between mt-4">
									<span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${selectedRoleId === role.id ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-500'}`}>
										{role.permissions?.length ?? 0} perms
									</span>
									{selectedRoleId === role.id && <span className="text-primary text-xs">● Active</span>}
								</div>
							</button>
						))}
					</div>
				</div>
			</div>

			{selectedRoleId && (
				<div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
						<div>
							<h2 className="text-lg font-black text-white uppercase tracking-tight">Permission Matrix</h2>
							<p className="text-xs font-medium text-slate-500 mt-1">Configure capabilities for <span className="text-primary font-bold">{roles.find(r => r.id === selectedRoleId)?.name}</span> role.</p>
						</div>
						<Button onClick={savePermissions} className="font-black uppercase tracking-widest text-xs px-8" isLoading={saving}>Save Config</Button>
					</div>
					<div className="grid gap-10">
						{Object.entries(groupedPermissions).map(([group, items]) => (
							<div key={group} className="space-y-4">
								<h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{group} Module</h3>
								<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
									{items.map((permission) => (
										<label key={permission.id} className={`flex items-start gap-4 border rounded-2xl p-5 cursor-pointer transition-all duration-300 group ${selectedPermissions.includes(permission.id) ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}>
											<div className="relative flex items-center mt-1">
												<input type="checkbox" className="w-5 h-5 rounded-md bg-white/5 border-white/20 text-primary focus:ring-primary/40 focus:ring-offset-0 transition-all cursor-pointer" checked={selectedPermissions.includes(permission.id)} onChange={() => togglePermission(permission.id)} />
											</div>
											<div className="min-w-0">
												<p className={`text-sm font-bold transition-colors ${selectedPermissions.includes(permission.id) ? 'text-primary' : 'text-slate-300 group-hover:text-white'}`}>{permission.name}</p>
												<p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed">{permission.description}</p>
											</div>
										</label>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default RoleManagement;
