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
	central: 'bg-white/10 text-white ring-1 ring-white/20',
	division: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
	district: 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20',
	upazila: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
	union: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
	ward: 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20',
	campus: 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20',
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
		<div className="max-w-7xl mx-auto space-y-8 pb-12">
			<section className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
				<div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
				<div className="relative">
					<p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Organizational Topology</p>
					<h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Infrastructure Units</h1>
					<p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">
						Define and supervise the 5-tier political hierarchy. Maintain structural integrity across central and grassroots operational clusters.
					</p>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{UNIT_TYPES.map((item) => {
					const active = item.type === selectedType;
					return (
						<button
							key={item.type}
							type="button"
							onClick={() => setType(item.type)}
							className={`rounded-[2rem] border p-6 text-left transition-all duration-300 group relative overflow-hidden ${
								active
									? 'border-primary bg-primary/10 shadow-xl shadow-primary-500/10'
									: 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
							}`}
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<div className={`text-sm font-black transition-colors uppercase tracking-tight ${active ? 'text-primary' : 'text-slate-200 group-hover:text-white'}`}>{item.label}</div>
									<p className="mt-2 text-[10px] font-medium leading-relaxed text-slate-500 line-clamp-2">{item.blurb}</p>
								</div>
								<span className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black transition-all ${active ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'}`}>
									{summaryMap[item.type] ?? 0}
								</span>
							</div>
						</button>
					);
				})}
			</section>

			<section className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-white/5 pb-8">
					<div>
						<h2 className="text-xl font-black text-white uppercase tracking-tight">Unit Directory</h2>
						<p className="text-sm font-medium text-slate-500 mt-1">Browse, update, and manage the hierarchy of organizational units.</p>
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={openCreateModal}
							className="rounded-xl bg-primary px-6 py-3 text-sm font-black text-white hover:bg-primary-dark shadow-lg shadow-primary-500/20 transition-all active:scale-95"
						>
							+ Add Unit
						</button>
						<button
							type="button"
							onClick={refreshList}
							className="rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all"
						>
							Refresh
						</button>
					</div>
				</div>

				<form onSubmit={applySearch} className="mt-8 flex flex-col gap-4 sm:flex-row p-6 bg-white/[0.02] rounded-3xl border border-white/5">
					<div className="relative group flex-1">
						<span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by name, code, or description"
							className="w-full bg-white/5 border border-white/5 rounded-xl px-12 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
						/>
					</div>
					<div className="flex gap-3">
						<button type="submit" className="rounded-xl bg-slate-100 px-8 py-3 text-sm font-black text-slate-900 hover:bg-white transition-all active:scale-95 uppercase tracking-widest">
							Search
						</button>
						<button type="button" onClick={resetFilters} className="rounded-xl bg-white/5 border border-white/5 px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-all">
							Reset
						</button>
					</div>
				</form>

				{error && (
					<div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-4 text-sm font-bold text-rose-400 animate-pulse">
						{error}
					</div>
				)}

				<div className="mt-8 overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.01]">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-white/5 text-sm">
							<thead className="bg-white/[0.03] text-left">
								<tr>
									<th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Unit Name</th>
									<th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tier/Type</th>
									<th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Supervisory Unit</th>
									<th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Code</th>
									<th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Depth</th>
									<th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Members</th>
									<th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
									<th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Manage</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/5">
								{loading ? (
									<tr>
										<td colSpan={8} className="px-6 py-16 text-center">
											<div className="flex flex-col items-center gap-4">
												<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
												<p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fetching hierarchy…</p>
											</div>
										</td>
									</tr>
								) : units.length === 0 ? (
									<tr>
										<td colSpan={8} className="px-6 py-16 text-center text-slate-500 italic font-medium">No organizational units found matching your criteria.</td>
									</tr>
								) : (
									units.map((unit) => (
										<tr key={unit.id} className="hover:bg-white/[0.03] transition-colors group">
											<td className="px-6 py-5">
												<div className="font-bold text-slate-100 group-hover:text-primary transition-colors">{unit.name}</div>
												{unit.description && <div className="mt-1 text-[10px] font-medium text-slate-500 line-clamp-1">{unit.description}</div>}
											</td>
											<td className="px-6 py-5">
												<span className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${badgeStyle[unit.type]}`}>
													{unit.type_label}
												</span>
											</td>
											<td className="px-6 py-5 text-slate-400 font-medium">{unit.parent?.name ?? <span className="text-slate-600 italic">Root Level</span>}</td>
											<td className="px-6 py-5 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unit.code ?? '—'}</td>
											<td className="px-6 py-5 text-center font-black text-slate-200">{unit.children_count}</td>
											<td className="px-6 py-5 text-center font-black text-slate-200">{unit.members_count}</td>
											<td className="px-6 py-5">
												<span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${unit.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
													{unit.is_active ? 'Online' : 'Archived'}
												</span>
											</td>
											<td className="px-6 py-5 text-right">
												<div className="flex justify-end gap-2">
													<button
														type="button"
														onClick={() => openEditModal(unit)}
														className="rounded-lg bg-white/5 border border-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all underline decoration-slate-500"
													>
														Edit
													</button>
													<button
														type="button"
														onClick={() => toggleUnit(unit)}
														className={`rounded-lg bg-white/5 border border-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${unit.is_active ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
													>
														{unit.is_active ? 'Archive' : 'Restore'}
													</button>
													<button
														type="button"
														onClick={() => deleteUnit(unit)}
														className="rounded-lg border border-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all font-bold"
													>
														Del
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
					<div className="mt-8 rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-inner">
						<h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Recursive Hierarchy Map</h3>
						<div className="max-h-64 overflow-auto text-xs font-medium text-slate-400 space-y-2 scrollbar-none">
							{tree.map((node) => (
								<div key={node.id} className="pb-2 border-b border-white/[0.02] last:border-0 grow">
									<div className="flex items-center gap-2">
										<span className="text-primary-light font-bold">●</span>
										<span className="text-slate-100 font-bold">{node.name}</span>
										<span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">[{node.type_label ?? node.type}]</span>
									</div>
									{(node.children ?? []).map((child) => (
										<div key={child.id} className="pl-6 mt-1 flex items-center gap-2 border-l border-white/5 ml-1.5 py-0.5">
											<span className="text-slate-700 text-sm">└</span>
											<span className="text-slate-400">{child.name}</span>
											<span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-[9px]">{child.type_label ?? child.type}</span>
										</div>
									))}
								</div>
							))}
						</div>
					</div>
				)}
			</section>

			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeModal} />
					<div className="relative w-full max-w-xl rounded-[2.5rem] bg-slate-900 border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
						<div className="mb-8 flex items-center justify-between">
							<div>
								<h3 className="text-2xl font-black text-white uppercase tracking-tight">
									{editingUnit ? 'Refine Unit' : 'Spawn New Unit'}
								</h3>
								<p className="text-xs font-medium text-slate-500 mt-1">Configure organizational structure parameters.</p>
							</div>
							<button onClick={closeModal} type="button" className="text-slate-500 hover:text-white transition-colors text-2xl font-bold leading-none">✕</button>
						</div>

						{formError && (
							<div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-4 text-sm font-bold text-rose-400">
								{formError}
							</div>
						)}

						<form onSubmit={submitForm} className="space-y-6">
							<div>
								<label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Official Name</label>
								<input
									required
									value={form.name}
									onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
									className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold"
									placeholder="e.g. Dhaka Division"
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tier Category</label>
									<select
										value={form.type}
										onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
										className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold appearance-none cursor-pointer"
									>
										{UNIT_TYPES.map((type) => (
											<option key={type.type} value={type.type} className="bg-slate-900">{type.label}</option>
										))}
									</select>
								</div>

								<div>
									<label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Supervising Unit</label>
									<select
										value={form.parent_id}
										onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
										className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold appearance-none cursor-pointer"
									>
										<option value="" className="bg-slate-900">Root Level (Top Tier)</option>
										{parentOptions.map((option) => (
											<option key={option.id} value={option.id} className="bg-slate-900">{option.name}</option>
										))}
									</select>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Unit Code (Internal)</label>
									<input
										value={form.code}
										onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
										className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono font-bold"
										placeholder="CODE-XYZ"
									/>
								</div>

								<div className="flex items-center pt-5 pl-1">
									<label className="inline-flex items-center gap-3 text-sm text-slate-300 font-bold cursor-pointer group">
										<input
											type="checkbox"
											checked={!!form.is_active}
											onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
											className="w-5 h-5 rounded bg-white/5 border-white/20 text-primary focus:ring-primary/40 outline-none transition-all cursor-pointer"
										/>
										<span className="group-hover:text-white transition-colors">Active Operation</span>
									</label>
								</div>
							</div>

							<div>
								<label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Descriptive Overview</label>
								<textarea
									rows={3}
									value={form.description}
									onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
									className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all leading-relaxed font-medium"
									placeholder="Tell us about this unit..."
								/>
							</div>

							<div className="mt-8 flex justify-end gap-3 pt-4">
								<button type="button" onClick={closeModal} className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all text-xs uppercase tracking-widest">
									Discard
								</button>
								<button disabled={saving} type="submit" className="rounded-xl bg-primary px-10 py-3 text-sm font-black text-white hover:bg-primary-dark shadow-xl shadow-primary-500/20 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-widest">
									{saving ? 'Processing…' : editingUnit ? 'Sync Changes' : 'Launch Unit'}
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
