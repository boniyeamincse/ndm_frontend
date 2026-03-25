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
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
				<p className="text-sm text-gray-500 mt-1">Create roles and manage permission sets for dashboard access.</p>
			</div>

			<div className="grid lg:grid-cols-3 gap-6">
				<form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
					<h2 className="text-base font-semibold text-gray-800">Create Role</h2>
					<Input label="Role Name" name="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
					<Input label="Description" name="description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
					<Button type="submit" className="w-full" isLoading={saving}>Create Role</Button>
				</form>

				<div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-base font-semibold text-gray-800">Existing Roles</h2>
						<p className={`text-sm ${message ? 'text-green-700' : 'text-gray-400'}`}>{message || 'Select a role to manage permissions.'}</p>
					</div>
					<div className="grid md:grid-cols-2 gap-4">
						{roles.map((role) => (
							<button key={role.id} type="button" onClick={() => startEditing(role)} className={`text-left rounded-2xl border p-4 transition-colors ${selectedRoleId === role.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
								<p className="font-semibold text-gray-900">{role.name}</p>
								<p className="text-sm text-gray-500 mt-1">{role.description || 'No description provided.'}</p>
								<p className="text-xs text-gray-400 mt-3">{role.permissions?.length ?? 0} permission(s)</p>
							</button>
						))}
					</div>
				</div>
			</div>

			{selectedRoleId && (
				<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
					<div className="flex items-center justify-between gap-4">
						<h2 className="text-base font-semibold text-gray-800">Permission Matrix</h2>
						<Button onClick={savePermissions} isLoading={saving}>Save Permissions</Button>
					</div>
					<div className="space-y-6">
						{Object.entries(groupedPermissions).map(([group, items]) => (
							<div key={group}>
								<h3 className="text-sm font-semibold text-gray-700 mb-3">{group}</h3>
								<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
									{items.map((permission) => (
										<label key={permission.id} className="flex items-start gap-3 border border-gray-100 rounded-xl p-3 cursor-pointer hover:bg-gray-50">
											<input type="checkbox" className="mt-1" checked={selectedPermissions.includes(permission.id)} onChange={() => togglePermission(permission.id)} />
											<div>
												<p className="text-sm font-medium text-gray-800">{permission.name}</p>
												<p className="text-xs text-gray-500">{permission.description}</p>
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
