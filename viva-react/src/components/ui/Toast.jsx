import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const toastStyles = {
	success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
	error: 'border-rose-200 bg-rose-50 text-rose-800',
	info: 'border-blue-200 bg-blue-50 text-blue-800',
	warning: 'border-amber-200 bg-amber-50 text-amber-800',
};

export const ToastItem = ({ toast, onClose }) => (
	<motion.div
		layout
		initial={{ opacity: 0, x: 30, scale: 0.98 }}
		animate={{ opacity: 1, x: 0, scale: 1 }}
		exit={{ opacity: 0, x: 30, scale: 0.98 }}
		transition={{ duration: 0.2 }}
		className={`pointer-events-auto w-full rounded-2xl border px-4 py-3 shadow-lg ${toastStyles[toast.type] ?? toastStyles.info}`}
		role="status"
	>
		<div className="flex items-start gap-3">
			<div className="min-w-0 flex-1">
				{toast.title ? <p className="text-sm font-bold leading-tight">{toast.title}</p> : null}
				<p className="text-sm leading-5">{toast.message}</p>
			</div>
			<button onClick={() => onClose(toast.id)} className="text-xs font-semibold opacity-70 hover:opacity-100">
				Close
			</button>
		</div>
	</motion.div>
);

export const ToastViewport = ({ toasts, onClose }) => (
	<div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-3">
		<AnimatePresence initial={false}>
			{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onClose={onClose} />)}
		</AnimatePresence>
	</div>
);

export default ToastViewport;
