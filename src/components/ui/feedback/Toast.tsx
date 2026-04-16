import React from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] mx-4 flex max-w-sm flex-col gap-2 sm:mx-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {t.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-600" />}
              {t.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
              {!t.type && <Bell className="h-5 w-5 text-slate-600" />}
            </div>
            <div className="min-w-0 flex-1">
              {t.title && <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</h4>}
              {t.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.description}</p>}
            </div>
            <button
              type="button"
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={() => dismiss(t.id)}
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ToastContainerProps {
  children?: React.ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastViewport />
    </>
  );
};
