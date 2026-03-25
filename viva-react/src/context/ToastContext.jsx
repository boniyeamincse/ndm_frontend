import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ToastViewport from '../components/ui/Toast';

const ToastContext = createContext(null);

let nextToastId = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((options) => {
    const toast = {
      id: nextToastId++,
      type: options.type ?? 'info',
      title: options.title ?? '',
      message: options.message ?? '',
    };

    setToasts((current) => [...current, toast].slice(-4));
    window.setTimeout(() => removeToast(toast.id), 5000);
    return toast.id;
  }, [removeToast]);

  const api = useMemo(() => ({
    toast: pushToast,
    success: (message, title = 'Success') => pushToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => pushToast({ type: 'error', title, message }),
    info: (message, title = 'Info') => pushToast({ type: 'info', title, message }),
    warning: (message, title = 'Warning') => pushToast({ type: 'warning', title, message }),
    removeToast,
  }), [pushToast, removeToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};