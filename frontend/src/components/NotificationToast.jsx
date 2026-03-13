import { useSocket } from './SocketContext';

const levelColors = {
  CRITICAL: 'border-red-500/50 bg-red-500/10',
  HIGH: 'border-orange-500/50 bg-orange-500/10',
  MEDIUM: 'border-yellow-500/50 bg-yellow-500/10',
  LOW: 'border-green-500/50 bg-green-500/10',
  INFO: 'border-blue-500/50 bg-blue-500/10',
};

export default function NotificationToast() {
  const { notifications, dismissNotification } = useSocket();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((n) => (
        <div key={n.id}
          className={`glass-card p-4 border ${levelColors[n.level] || levelColors.INFO} animate-slide-in cursor-pointer transition-all hover:scale-[1.02]`}
          onClick={() => dismissNotification(n.id)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-white">{n.title}</p>
              <p className="text-xs text-slate-300 mt-1">{n.message}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
              className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
          <div className="mt-2 h-0.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-progress" />
          </div>
        </div>
      ))}
    </div>
  );
}
