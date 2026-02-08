import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export default function RejectDialog({ isOpen, onClose, onConfirm, isLoading }: RejectDialogProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6 animate-scale-in">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-red-100">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Reject Assessment</h3>
            <p className="mt-1 text-sm text-slate-600">
              Please provide a reason for the rejection.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="input h-auto w-full"
            placeholder="Reason for rejection..."
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={handleClose} className="btn btn-md btn-outline" disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-md btn-danger"
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
