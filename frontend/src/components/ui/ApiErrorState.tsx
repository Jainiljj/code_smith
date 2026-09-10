import React from 'react';
import { AlertTriangle, RefreshCw, ServerCrash } from 'lucide-react';

interface ApiErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ApiErrorState: React.FC<ApiErrorStateProps> = ({
  title = "Backend Service Unavailable",
  message = "Unable to connect to the GeM Compliance Verification API. Please check backend service status or try again.",
  onRetry
}) => {
  return (
    <div className="p-8 bg-rose-50/70 border border-rose-200 rounded-xl text-center max-w-xl mx-auto my-8 space-y-4 shadow-sm">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
        <ServerCrash className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-rose-900">{title}</h3>
        <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
        </button>
      )}
    </div>
  );
};
