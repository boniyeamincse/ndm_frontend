import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../services/api';

const UNIT_TYPES = [
	{ type: 'central', label: 'Central Committee', blurb: 'National executive and policy leadership.' },
	{ type: 'division', label: 'Division Committees', blurb: 'Regional leadership across divisions.' },
	{ type: 'district', label: 'District Committees', blurb: 'District-level coordination and expansion.' },
	{ type: 'upazila', label: 'Upazila Committees', blurb: 'Local upazila organizing structure.' },
	{ type: 'union', label: 'Union Committees', blurb: 'Union-level grassroots committees.' },
	{ type: 'ward', label: 'Ward Committees', blurb: 'Ward-based neighborhood organizing teams.' },
	{ type: 'campus', label: 'Campus / Institutions', blurb: 'Campuses, colleges, and institutional units.' },
];

const badgeStyle = {
	central: 'bg-slate-900 text-white',
	division: 'bg-blue-100 text-blue-700',
	district: 'bg-cyan-100 text-cyan-700',
	upazila: 'bg-emerald-100 text-emerald-700',
	union: 'bg-amber-100 text-amber-700',
	ward: 'bg-orange-100 text-orange-700',
	campus: 'bg-violet-100 text-violet-700',
};

const UnitManagement = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [units, setUnits] = useState([]);
	const [summary, setSummary] = useState([]);
	const [tree, setTree] = useState([]);
	const [search, setSearch] = useState(searchParams.get('search') ?? '');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [reloadKey, setReloadKey] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [editingUnit, setEditingUnit] = useState(null);
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState('');
	const [form, setForm] = useState({
		name: '',
		type: 'central',
		parent_id: '',
		code: '',
		description: '',
		is_active: true,
	});

	const selectedType = searchParams.get('type') ?? '';

	useEffect(() => {
		setSearch(searchParams.get('search') ?? '');
	}, [searchParams]);

	useEffect(() => {
		const loadUnits = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.get('/admin/units', {
					params: {
						type: selectedType || undefined,
						search: searchParams.get('search') || undefined,
					},
				});

				setUnits(res.data?.data ?? []);
				setSummary(res.data?.summary ?? []);
				setTree(res.data?.tree ?? []);
			} catch (err) {
				setError(err.response?.data?.message ?? 'Failed to load organizational units.');
			} finally {
				setLoading(false);
			}
		};

		loadUnits();
	}, [searchParams, selectedType, reloadKey]);

	const summaryMap = useMemo(
		() => Object.fromEntries(summary.map(item => [item.type, item.total])),
		[summary],
	);

	const selectedLabel = UNIT_TYPES.find(item => item.type === selectedType)?.label ?? 'All Organizational Units';

	const setType = (type) => {
		const next = new URLSearchParams(searchParams);
		if (type) next.set('type', type); else next.delete('type');
		setSearchParams(next);
	};

	const applySearch = (e) => {
		e.preventDefault();
		const next = new URLSearchParams(searchParams);
		if (search.trim()) next.set('search', search.trim()); else next.delete('search');
		setSearchParams(next);
	};

	const resetFilters = () => {
		setSearch('');
		setSearchParams({});
	};

	const openCreateModal = () => {
		setEditingUnit(null);
		setFormError('');
		setForm({
			name: '',
			type: selectedType || 'central',
			parent_id: '',
			code: '',
			description: '',
			is_active: true,
		});
		setShowModal(true);
	};

	const openEditModal = (unit) => {
		setEditingUnit(unit);
		setFormError('');
		setForm({
			name: unit.name ?? '',
			type: unit.type ?? 'central',
			parent_id: unit.parent?.id ? String(unit.parent.id) : '',
			code: unit.code ?? '',
			description: unit.description ?? '',
			is_active: !!unit.is_active,
		});
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingUnit(null);
		setFormError('');
	};

	const submitForm = async (e) => {
		e.preventDefault();
		setSaving(true);
		setFormError('');

		const payload = {
			name: form.name.trim(),
			type: form.type,
			parent_id: form.parent_id ? Number(form.parent_id) : null,
			code: form.code.trim() || null,
			description: form.description.trim() || null,
			is_active: !!form.is_active,
		};

		try {
			if (editingUnit) {
				await api.put(`/admin/units/${editingUnit.id}`, payload);
			} else {
				await api.post('/admin/units', payload);
			}

			closeModal();
			setReloadKey(key => key + 1);
		} catch (err) {
			if (err.response?.data?.errors) {
				const firstError = Object.values(err.response.data.errors)?.[0]?.[0];
				setFormError(firstError || 'Failed to save unit.');
			} else {
				setFormError(err.response?.data?.message ?? 'Failed to save unit.');
			}
		} finally {
			setSaving(false);
		}
	};

	const toggleUnit = async (unit) => {
		const actionLabel = unit.is_active ? 'archive' : 'activate';
		if (!window.confirm(`Are you sure you want to ${actionLabel} this unit?`)) return;

		try {
			await api.patch(`/admin/units/${unit.id}/toggle`);
			setReloadKey(key => key + 1);
		} catch (err) {
			alert(err.response?.data?.message ?? `Failed to ${actionLabel} unit.`);
		}
	};

	const deleteUnit = async (unit) => {
		if (!window.confirm(`Delete ${unit.name}? This cannot be undone.`)) return;

		try {
			await api.delete(`/admin/units/${unit.id}`);
			setReloadKey(key => key + 1);
		} catch (err) {
			alert(err.response?.data?.message ?? 'Failed to delete unit.');
		}
	};

	const parentOptions = useMemo(() => {
		return units
			.filter((unit) => !editingUnit || unit.id !== editingUnit.id)
			.map((unit) => ({
				id: String(unit.id),
				name: `${unit.name} (${unit.type_label})`,
			}));
	}, [units, editingUnit]);

	const refreshList = () => {
		setReloadKey(key => key + 1);
	};

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-8 text-white shadow-xl">
				<p className="text-xs uppercase tracking-[0.22em] text-blue-200">Admin Control</p>
				<div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<h1 className="text-3xl font-bold">Organizational Units</h1>
						<p className="mt-2 max-w-2xl text-sm text-slate-200">
							Central Committee, Division Committees, District Committees, Upazila Committees,
							Union Committees, Ward Committees, and Campus / Institutions are grouped here.
						</p>
					</div>
					<div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100 backdrop-blur">
						<div className="text-slate-300">Current View</div>
						<div className="mt-1 text-lg font-semibold">{selectedLabel}</div>
					</div>
				</div>
			</section>

			<section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				{UNIT_TYPES.map((item) => {
					const active = item.type === selectedType;
					return (
						<button
							key={item.type}
							type="button"
							onClick={() => setType(item.type)}
							className={`rounded-2xl border px-4 py-4 text-left transition ${
								active
									? 'border-blue-600 bg-blue-50 shadow-md'
									: 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
							}`}
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="text-sm font-semibold text-slate-900">{item.label}</div>
									<p className="mt-1 text-xs leading-5 text-slate-500">{item.blurb}</p>
								</div>
								<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyle[item.type]}`}>
									{summaryMap[item.type] ?? 0}
								</span>
							</div>
						</button>
					);
				})}
			</section>

			<section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<h2 className="text-lg font-semibold text-slate-900">Unit Directory</h2>
						<p className="text-sm text-slate-500">Browse, create, update, archive, and manage organizational units.</p>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={openCreateModal}
							className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
						>
							+ Add Unit
						</button>
						<button
							type="button"
							onClick={refreshList}
							className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						>
							Refresh
						</button>
					</div>
				</div>

				<form onSubmit={applySearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name, code, or description"
						className="w-full min-w-[260px] rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
					/>
					<div className="flex gap-2">
						<button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
							Search
						</button>
						<button type="button" onClick={resetFilters} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
							Reset
						</button>
					</div>
				</form>

				{error && (
					<div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{error}
					</div>
				)}

				<div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200 text-sm">
							<thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
								<tr>
									<th className="px-4 py-3">Unit</th>
									<th className="px-4 py-3">Type</th>
									<th className="px-4 py-3">Parent</th>
									<th className="px-4 py-3">Code</th>
									<th className="px-4 py-3 text-center">Children</th>
									<th className="px-4 py-3 text-center">Members</th>
									<th className="px-4 py-3">Status</th>
									<th className="px-4 py-3 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 bg-white">
								{loading ? (
									<tr>
										<td colSpan={8} className="px-4 py-10 text-center text-slate-500">Loading organizational units...</td>
									</tr>
								) : units.length === 0 ? (
									<tr>
										<td colSpan={8} className="px-4 py-10 text-center text-slate-500">No organizational units matched the current filters.</td>
									</tr>
								) : (
									units.map((unit) => (
										<tr key={unit.id} className="hover:bg-slate-50/80">
											<td className="px-4 py-3">
												<div className="font-semibold text-slate-900">{unit.name}</div>
												{unit.description && <div className="mt-1 text-xs text-slate-500">{unit.description}</div>}
											</td>
											<td className="px-4 py-3">
												<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyle[unit.type]}`}>
													{unit.type_label}
												</span>
											</td>
											<td className="px-4 py-3 text-slate-600">{unit.parent?.name ?? 'Root level'}</td>
											<td className="px-4 py-3 font-mono text-xs text-slate-600">{unit.code ?? '—'}</td>
											<td className="px-4 py-3 text-center font-semibold text-slate-700">{unit.children_count}</td>
											<td className="px-4 py-3 text-center font-semibold text-slate-700">{unit.members_count}</td>
											<td className="px-4 py-3">
												<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${unit.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
													{unit.is_active ? 'Active' : 'Inactive'}
												</span>
											</td>
											<td className="px-4 py-3 text-right">
												<div className="flex justify-end gap-2">
													<button
														type="button"
														onClick={() => openEditModal(unit)}
														className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
													>
														Edit
													</button>
													<button
														type="button"
														onClick={() => toggleUnit(unit)}
														className="rounded-lg border border-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
													>
														{unit.is_active ? 'Archive' : 'Activate'}
													</button>
													<button
														type="button"
														onClick={() => deleteUnit(unit)}
														className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
													>
														Delete
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				{tree.length > 0 && (
					<div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<h3 className="text-sm font-semibold text-slate-800">Hierarchy Preview</h3>
						<div className="mt-2 max-h-48 overflow-auto text-xs text-slate-700">
							{tree.map((node) => (
								<div key={node.id} className="mb-1">
									<div>• {node.name} ({node.type_label ?? node.type})</div>
									{(node.children ?? []).map((child) => (
										<div key={child.id} className="pl-4">↳ {child.name} ({child.type_label ?? child.type})</div>
									))}
								</div>
							))}
						</div>
					</div>
				)}
			</section>

			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-lg font-semibold text-slate-900">
								{editingUnit ? 'Edit Organizational Unit' : 'Create Organizational Unit'}
							</h3>
							<button onClick={closeModal} type="button" className="text-slate-500 hover:text-slate-700">✕</button>
						</div>

						{formError && (
							<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
								{formError}
							</div>
						)}

						<form onSubmit={submitForm} className="space-y-3">
							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
								<input
									required
									value={form.name}
									onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
								/>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
									<select
										value={form.type}
										onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
										className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
									>
										{UNIT_TYPES.map((type) => (
											<option key={type.type} value={type.type}>{type.label}</option>
										))}
									</select>
								</div>

								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Parent Unit</label>
									<select
										value={form.parent_id}
										onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
										className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
									>
										<option value="">Root level</option>
										{parentOptions.map((option) => (
											<option key={option.id} value={option.id}>{option.name}</option>
										))}
									</select>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Code (optional)</label>
									<input
										value={form.code}
										onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
										className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
									/>
								</div>

								<div className="flex items-end">
									<label className="inline-flex items-center gap-2 text-sm text-slate-700">
										<input
											type="checkbox"
											checked={!!form.is_active}
											onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
										/>
										Active
									</label>
								</div>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
								<textarea
									rows={3}
									value={form.description}
									onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
								/>
							</div>

							<div className="mt-4 flex justify-end gap-2">
								<button type="button" onClick={closeModal} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
									Cancel
								</button>
								<button disabled={saving} type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70">
									{saving ? 'Saving...' : editingUnit ? 'Update Unit' : 'Create Unit'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default UnitManagement;
