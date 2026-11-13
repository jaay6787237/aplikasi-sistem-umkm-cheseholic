import React from 'react';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'order' | 'sync' | 'alert';
  timestamp: string;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let badgeBg = 'bg-[#311309] text-[#FFC700]';
        let icon = 'notifications';
        let borderColor = 'border-[#FFC700]/50';

        if (toast.type === 'order') {
          badgeBg = 'bg-rose-600 text-white';
          icon = 'notifications_active';
          borderColor = 'border-rose-400';
        } else if (toast.type === 'success') {
          badgeBg = 'bg-emerald-600 text-white';
          icon = 'check_circle';
          borderColor = 'border-emerald-400';
        } else if (toast.type === 'sync') {
          badgeBg = 'bg-blue-600 text-white';
          icon = 'cloud_sync';
          borderColor = 'border-blue-400';
        } else if (toast.type === 'alert') {
          badgeBg = 'bg-amber-600 text-white';
          icon = 'warning';
          borderColor = 'border-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border-2 ${borderColor} flex items-start gap-3 animate-in slide-in-from-top-4 duration-200 transition-all hover:scale-[1.02]`}
            role="alert"
          >
            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center font-bold shrink-0 shadow-sm`}>
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-headline font-extrabold text-xs text-[#311309] truncate">{toast.title}</span>
                <span className="text-[10px] text-gray-400 font-mono">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-gray-600 font-medium mt-0.5 line-clamp-2 leading-tight">{toast.message}</p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer transition-colors"
              aria-label="Tutup notifikasi"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
