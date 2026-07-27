import { CircleAlert, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'We could not load this data. Please try again.', onRetry }) {
  return (
    <div className="card flex min-h-52 flex-col items-center justify-center p-8 text-center" role="alert">
      <CircleAlert className="mb-3 text-brandRed" />
      <p className="text-sm text-muted">{message}</p>
      {onRetry && <button className="btn-secondary mt-4" onClick={onRetry}><RefreshCw size={16} />Retry</button>}
    </div>
  );
}
