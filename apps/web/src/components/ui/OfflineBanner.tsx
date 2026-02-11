import { WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStore } from '../../stores/network.store';

export default function OfflineBanner() {
  const { isOnline, pendingSyncCount } = useNetworkStore();

  if (isOnline && pendingSyncCount === 0) return null;

  // Online but syncing pending items
  if (isOnline && pendingSyncCount > 0) {
    return (
      <div className="bg-amber-500 text-white text-sm text-center py-2 px-4 flex items-center justify-center gap-2" role="status" aria-live="polite">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Syncing {pendingSyncCount} pending {pendingSyncCount === 1 ? 'change' : 'changes'}...</span>
      </div>
    );
  }

  // Offline
  return (
    <div className="bg-red-600 text-white text-sm text-center py-2 px-4 flex items-center justify-center gap-2" role="alert" aria-live="assertive">
      <WifiOff className="w-4 h-4" />
      <span>You are offline — viewing cached data</span>
      {pendingSyncCount > 0 && (
        <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs font-medium">
          {pendingSyncCount} pending
        </span>
      )}
    </div>
  );
}
