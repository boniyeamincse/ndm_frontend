import React from 'react';

export const InlineSpinner = ({ className = 'h-4 w-4' }) => (
	<span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} aria-hidden="true" />
);

export const Skeleton = ({ className = '' }) => (
	<div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`.trim()} aria-hidden="true" />
);

export const CardSkeleton = ({ lines = 3 }) => (
	<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
		<Skeleton className="h-40 w-full" />
		<Skeleton className="mt-4 h-4 w-24" />
		<Skeleton className="mt-3 h-6 w-3/4" />
		<div className="mt-4 space-y-2">
			{Array.from({ length: lines }).map((_, index) => (
				<Skeleton key={index} className={`h-4 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`} />
			))}
		</div>
	</div>
);

export const PageLoader = ({ label = 'Loading...' }) => (
	<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm">
		<div className="rounded-3xl border border-white/10 bg-slate-900/90 px-8 py-7 text-center shadow-2xl">
			<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xl font-black text-white shadow-lg">
				N
			</div>
			<p className="mt-4 text-sm font-semibold text-white">{label}</p>
			<div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
				<div className="h-full w-2/3 animate-pulse rounded-full bg-amber-400" />
			</div>
		</div>
	</div>
);

export default PageLoader;
