import React from "react";

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  durationMs?: number;
}

const typeStyles: Record<ToastType, string> = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  error: 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200',
  info: 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  warning: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
};

const ToastNotificationV2: React.FC<ToastProps> = ({ message, type, onClose, durationMs = 4500 }) => {
  React.useEffect(() => {
    const id = setTimeout(onClose, durationMs);
    return () => clearTimeout(id);
  }, [durationMs, onClose]);

  return (
    <div className={`rounded-lg border px-3 py-2 shadow-sm flex items-start gap-3 ${typeStyles[type]}`}
         role="status" aria-live="polite">
      <div className="text-sm leading-5">{message}</div>
      <button onClick={onClose}
              className="ml-auto text-current/70 hover:text-current/100 text-xs px-1"
              aria-label="Close notification">
        ✕
      </button>
    </div>
  );
};

export default ToastNotificationV2;


