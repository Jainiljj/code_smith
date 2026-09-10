import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { ComplianceResult } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { AlertTriangle, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReviewsPage: React.FC = () => {
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getComplianceResults('BID-A-01');
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  }

  const pendingQueue = results.filter(r => r.reviewStatus === 'PENDING' || r.status === 'NON_COMPLIANT' || r.status === 'UNVERIFIED');

  if (loading) return <div className="p-8 text-center text-slate-500">Loading review queue...</div>;
  if (error) return <ApiErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Procurement Officer Review Queue</h1>
        <p className="text-sm text-slate-500 mt-1">High-priority compliance exceptions requiring human decision approval.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-amber-500 text-slate-950 flex items-center justify-between font-bold text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Pending Verification Queue ({pendingQueue.length})
          </div>
          <span className="text-xs bg-amber-950 text-amber-200 px-2 py-0.5 rounded font-mono">Requires Action</span>
        </div>

        <div className="divide-y divide-slate-200">
          {pendingQueue.map((item) => (
            <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700">{item.requirementCode}</span>
                  <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded border border-rose-200">
                    {item.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900">{item.requirementText}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.reasoning}</p>
              </div>

              <Link
                to="/compliance"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-sm self-start md:self-center"
              >
                Inspect Evidence & Review
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
