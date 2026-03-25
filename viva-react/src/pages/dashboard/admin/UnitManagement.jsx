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
	const [search, setSearch] = useState(searchParams.get('search') ?? '');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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
			} catch (err) {
				setError(err.response?.data?.message ?? 'Failed to load organizational units.');
			} finally {
				setLoading(false);
			}
		};

		loadUnits();
	}, [searchParams, selectedType]);

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
						<p className="text-sm text-slate-500">Browse the current organizational hierarchy and filter by unit type.</p>
					</div>

					<form onSubmit={applySearch} className="flex flex-col gap-3 sm:flex-row">
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
				</div>

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
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 bg-white">
								{loading ? (
									<tr>
										<td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading organizational units...</td>
									</tr>
								) : units.length === 0 ? (
									<tr>
										<td colSpan={7} className="px-4 py-10 text-center text-slate-500">No organizational units matched the current filters.</td>
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
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</section>
		</div>
	);
};

export default UnitManagement;
