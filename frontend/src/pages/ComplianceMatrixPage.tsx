import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { ComplianceResult, ComplianceStatus } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  MinusCircle,
  FileText,
  Eye,
  Check,
  RotateCcw,
  UserCheck,
  Cpu
} from 'lucide-react';

export const ComplianceMatrixPage: React.FC = () => {
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Override Form State
  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus>('COMPLIANT');
  const [overrideNote, setOverrideNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getComplianceResults('BID-A-01');
      setResults(data);
      if (data.length > 0) setSelectedResult(data[0]);
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance matrix');
    } finally {
      setLoading(false);
    }
  }

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResult) return;
    setSubmitting(true);
    try {
      const updated = await apiService.submitHumanReview({
        complianceResultId: selectedResult.id,
        reviewerId: 'USR-PROC-01',
        finalStatus: overrideStatus,
        reviewerNote: overrideNote
      });
      setSelectedResult(updated);
      await loadResults();
    } catch (err) {
      alert('Failed to submit human review override');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredResults = filter === 'CONTRADICTIONS' 
    ? results.filter(r => r.status === 'NON_COMPLIANT' || r.status === 'UNVERIFIED')
    : (filter === 'ALL' ? results : results.filter(r => r.status === filter));

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ✓ Compliant
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> ! Non-Compliant
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> ? Unverified
          </span>
        );
      case 'PARTIALLY_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> ◐ Partially Compliant
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <MinusCircle className="w-3.5 h-3.5 text-slate-500" /> — Not Applicable
          </span>
        );
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading compliance matrix...</div>;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={loadResults} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bid Compliance Matrix</h1>
          <p className="text-sm text-slate-500 mt-1">
            Bidder: <strong className="text-slate-800">Apex Pumps & Motors Pvt Ltd</strong> | Bid ID: <strong className="font-mono text-slate-800">BID-A-01</strong>
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          {['ALL', 'COMPLIANT', 'NON_COMPLIANT', 'UNVERIFIED', 'CONTRADICTIONS'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filter === st ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'CONTRADICTIONS' ? '⚠️ Contradiction Flags' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Requirements vs Verification Status
            </h2>
            <span className="text-xs text-slate-400 font-mono">{filteredResults.length} Items</span>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredResults.map((r) => {
              const isSelected = selectedResult?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedResult(r);
                    setOverrideStatus(r.status);
                  }}
                  className={`p-4 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700">{r.requirementCode}</span>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{r.category}</span>
                      <span className="text-xs text-slate-400 uppercase font-mono">({r.verificationMethod})</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{r.requirementText}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(r.status)}
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-full hover:bg-white shadow-sm">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence & Human Review Drawer Panel */}
        {selectedResult && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 flex flex-col">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-mono font-bold text-blue-600">{selectedResult.requirementCode}</span>
              <h2 className="text-base font-bold text-slate-900 mt-1">{selectedResult.requirementText}</h2>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block uppercase">Current Status</span>
                  <div className="mt-1">{getStatusBadge(selectedResult.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block uppercase">Confidence</span>
                  <span className="text-sm font-extrabold text-slate-900">{(selectedResult.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* AI Recommendation Container */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-blue-600" /> AI Recommendation & Reasoning
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{selectedResult.reasoning}</p>
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 font-mono">
                Source Document: <strong className="text-slate-800 font-sans">Financial_Statements.pdf (Page 37)</strong>
              </div>
            </div>

            {/* Human Decision Override Form */}
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-blue-600" /> Procurement Officer Human Review
              </div>

              <form onSubmit={handleOverrideSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Set Decision Status:</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value as ComplianceStatus)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="COMPLIANT">✓ COMPLIANT</option>
                    <option value="NON_COMPLIANT">! NON_COMPLIANT</option>
                    <option value="UNVERIFIED">? UNVERIFIED</option>
                    <option value="PARTIALLY_COMPLIANT">◐ PARTIALLY_COMPLIANT</option>
                    <option value="NOT_APPLICABLE">— NOT_APPLICABLE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reviewer Note (Auditable):</label>
                  <textarea
                    rows={3}
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder="Enter justification for approving or overriding AI recommendation..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-md transition shadow-sm flex items-center justify-center gap-2"
                >
                  {submitting ? 'Recording Review...' : 'Submit Auditable Override'}
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
