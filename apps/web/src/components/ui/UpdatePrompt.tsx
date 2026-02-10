import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm bg-white rounded-lg shadow-lg border border-slate-200 p-4">
      <p className="text-sm text-slate-700 mb-3">
        A new version is available.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="btn btn-sm btn-primary"
        >
          Refresh
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="btn btn-sm btn-ghost text-slate-500"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
