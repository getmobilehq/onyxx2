import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8" role="status" aria-label={message || 'Loading'}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-onyx-600`} aria-hidden="true" />
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}
