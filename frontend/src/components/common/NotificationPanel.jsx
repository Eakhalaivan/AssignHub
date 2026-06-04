import React from 'react';
import useNotificationStore from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markAllAsRead, clearNotifications } = useNotificationStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 z-50 border-l border-zinc-800 glass shadow-3xl p-6 flex flex-col animate-[slideIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-wide text-zinc-100">Telemetry</h3>
          <span className="text-xs text-zinc-500">System updates and logs</span>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase mb-4 px-1 text-sky-500">
        <button onClick={markAllAsRead} className="hover:text-sky-400 transition-colors">Mark all sync</button>
        <button onClick={clearNotifications} className="text-zinc-600 hover:text-zinc-400 transition-colors">Purge Logs</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {notifications.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-zinc-600 italic text-sm">
            No recent activity recorded.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={clsx(
                "p-4 rounded-xl border text-sm transition-all duration-300",
                n.read ? "bg-zinc-900/20 border-zinc-800/50 text-zinc-400" : "bg-sky-500/5 border-sky-500/20 text-zinc-200 shadow-[inset_0_0_10px_rgba(14,165,233,0.02)]"
              )}
            >
              <p className="leading-relaxed mb-1 font-medium">{n.message}</p>
              <span className="text-[10px] text-zinc-600 font-bold uppercase">
                {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
