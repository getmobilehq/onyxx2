import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import SyncStatusPanel from './SyncStatusPanel';

export default function SyncStatusIndicator() {
  const { pendingCount, failedCount, isSyncing } = useSyncStatus();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const totalBadge = pendingCount + failedCount;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Hide when nothing to show
  if (totalBadge === 0 && !isSyncing) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-slate-50 transition-colors"
        aria-label="Sync status"
      >
        <RefreshCw
          className={`w-5 h-5 ${
            failedCount > 0
              ? 'text-red-500'
              : isSyncing
                ? 'text-amber-500 animate-spin'
                : 'text-slate-600'
          }`}
        />
        {totalBadge > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1 ${
              failedCount > 0 ? 'bg-red-500' : 'bg-amber-500'
            }`}
          >
            {totalBadge}
          </span>
        )}
      </button>

      {isOpen && <SyncStatusPanel onClose={() => setIsOpen(false)} />}
    </div>
  );
}
