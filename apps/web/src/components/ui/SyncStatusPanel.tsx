import { CheckCircle2, XCircle, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { useSyncStatus } from '../../hooks/useSyncStatus';

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
    case 'failed':
      return <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
    case 'processing':
      return <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin flex-shrink-0" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
  }
}

interface SyncStatusPanelProps {
  onClose: () => void;
}

export default function SyncStatusPanel(_props: SyncStatusPanelProps) {
  const { recentItems, failedCount, retryFailed, clearCompleted } = useSyncStatus();

  const hasCompleted = recentItems.some((item) => item.status === 'completed');

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-dropdown">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">Sync Queue</h3>
        {failedCount > 0 && (
          <button
            onClick={() => retryFailed()}
            className="text-xs text-onyx-600 hover:text-onyx-700 font-medium"
          >
            Retry failed
          </button>
        )}
      </div>

      {/* Items */}
      <div className="max-h-64 overflow-y-auto">
        {recentItems.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">All changes synced</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentItems.map((item) => (
              <li key={item.id} className="px-4 py-2.5 flex items-center gap-3">
                <StatusIcon status={item.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {item.operation.toUpperCase()} {item.entityType}
                  </p>
                  {item.lastError && (
                    <p className="text-[10px] text-red-500 truncate">{item.lastError}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">
                  {formatRelativeTime(new Date(item.createdAt))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {hasCompleted && (
        <div className="border-t border-slate-200 px-4 py-2">
          <button
            onClick={() => clearCompleted()}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
          >
            <Trash2 className="w-3 h-3" />
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
}
