import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const sizeClasses = {
	sm: 'max-w-md',
	md: 'max-w-xl',
	lg: 'max-w-3xl',
	xl: 'max-w-5xl',
};

const Modal = ({
	open,
	onClose,
	title,
	children,
	footer,
	size = 'md',
	closeOnBackdrop = true,
}) => {
	useEffect(() => {
		if (!open) return undefined;

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') onClose?.();
		};

		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.body.style.overflow = '';
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open, onClose]);

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={() => closeOnBackdrop && onClose?.()}
				>
					<motion.div
						initial={{ opacity: 0, y: 18, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 18, scale: 0.98 }}
						transition={{ duration: 0.2 }}
						className={`w-full ${sizeClasses[size] ?? sizeClasses.md} overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl`}
						onClick={(event) => event.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-label={title}
					>
						<div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
							<h2 className="text-lg font-bold text-slate-900">{title}</h2>
							<button onClick={() => onClose?.()} className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700">
								Close
							</button>
						</div>
						<div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
						{footer ? <div className="border-t border-slate-100 px-6 py-4">{footer}</div> : null}
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
};

export default Modal;
