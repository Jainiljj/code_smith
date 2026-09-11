import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/api';
import { ComplianceResult, ComplianceStatus, Tender } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { useAuth } from '../context/AuthProvider';
import { Can } from '../components/auth/Can';
import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Building2,
  Filter,
  FileSearch,
  Check,
  X,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('ALL');
  const [queue, setQueue] = useState<ComplianceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Detail Modal state
  const [selectedCase, setSelectedCase] = useState<ComplianceResult | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<ComplianceStatus>('COMPLIANT');
  const [decisionNote, setDecisionNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadTenders();
  }, []);

  useEffect(() => {
    loadQueue(selectedTenderId);
  }, [selectedTenderId]);

  async function loadTenders() {
    try {
      const data = await apiService.getTenders();
      setTenders(data);
    } catch (err) {
      console.warn('Could not load tenders list:', err);
    }
  }

  async function loadQueue(tenderId: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getReviewQueue(tenderId);
      setQueue(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load procurement review queue');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCase = (item: ComplianceResult) => {
    setSelectedCase(item);
    setDecisionStatus(item.status);
    setDecisionNote('');
  };

  const handleCloseCase = () => {
    setSelectedCase(null);
  };

  const handleSubmitDecision = async (statusToSet?: ComplianceStatus) => {
    if (!selectedCase) return;
    const finalStatus = statusToSet || decisionStatus;

    setIsSubmitting(true);
    try {
      await apiService.submitHumanReview({
        complianceResultId: selectedCase.id,
        reviewerId: user?.id || 'USR-PROC-01',
        finalStatus: finalStatus,
        reviewerNote: decisionNote.trim() || 'Procurement officer reviewed and confirmed decision.'
      });
      handleCloseCase();
      await loadQueue(selectedTenderId);
    } catch (err) {
      alert('Failed to record human procurement decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (riskLevel?: string, contradiction?: boolean) => {
    if (riskLevel === 'HIGH' || contradiction) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-red-600" />
          HIGH PRIORITY
        </span>
      );
    }
    if (riskLevel === 'MEDIUM') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
          MEDIUM PRIORITY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
        <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
        LOW PRIORITY
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
        <p className="text-sm font-medium text-slate-500">Loading prioritized procurement review queue...</p>
      </div>
    );
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={() => loadQueue(selectedTenderId)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Per-Tender Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Procurement Officer Review & Overrides Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Prioritized human decision queue for compliance exceptions, contradiction flags, and risk overrides.
          </p>
        </div>

        {/* Tender Selector */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <Building2 className="w-4 h-4 text-amber-600 shrink-0 ml-1" />
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Tender Filter:</span>
          <select
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer max-w-xs truncate"
          >
            <option value="ALL">All Tenders Combined</option>
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tenderNumber} — {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Review Queue Card Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 font-bold text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Pending Human Verification Queue ({queue.length} Cases)</span>
          </div>
          <span className="text-xs bg-slate-800 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-mono">
            Verification Priority (Not Bidder Ranking)
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-800">0 cases require human procurement review</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All compliance criteria for the selected tender have been verified cleanly or approved.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {getPriorityBadge(item.riskLevel, item.contradictionFlag)}
                    <span className="text-xs font-mono font-bold text-blue-700">{item.requirementCode}</span>
                    {item.tenderNumber && (
                      <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {item.tenderNumber}
                      </span>
                    )}
                    {item.bidderName && (
                      <span className="text-xs font-semibold text-slate-800">
                        Bidder: {item.bidderName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{item.requirementText}</h3>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong className="text-slate-800 uppercase tracking-wider text-[10px] block mb-0.5">AI Exception Rationale:</strong>
                    {item.reasoning}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                    <span>Expected: <strong className="text-slate-800">{item.expectedValue || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Actual: <strong className="text-rose-600">{item.actualValue || 'Unverified'}</strong></span>
                    <span>•</span>
                    <span>Source: <strong className="text-slate-700">{item.sourceDocument} (Pg {item.sourcePage})</strong></span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => handleOpenCase(item)}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-xs cursor-pointer"
                  >
                    <span>Inspect Case & Decide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Procurement Officer Case Review</h3>
              </div>
              <button onClick={handleCloseCase} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Case Details Summary */}
            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-300 font-bold">{selectedCase.requirementCode}</span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-sans">
                    {selectedCase.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">{selectedCase.requirementText}</h4>
                <div className="text-slate-400 font-mono text-[11px] pt-1">
                  Bidder: <strong className="text-emerald-400">{selectedCase.bidderName}</strong> | Tender: <strong className="text-slate-200">{selectedCase.tenderNumber}</strong>
                </div>
              </div>

              {/* Comparison Box */}
              <div className="grid grid-cols-2 gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Expected Criteria</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{selectedCase.expectedValue || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Actual Extracted</span>
                  <span className="font-mono font-bold text-rose-600 text-xs">{selectedCase.actualValue || 'Unverified'}</span>
                </div>
              </div>

              {/* AI Recommendation & Citation */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 uppercase text-[11px]">
                  <Cpu className="w-4 h-4 text-blue-600" /> AI Recommendation & Citation
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">{selectedCase.reasoning}</p>

                <div className="pt-2 border-t border-slate-200 font-mono text-slate-600 flex justify-between">
                  <span>Document: <strong>{selectedCase.sourceDocument}</strong></span>
                  <span>Citation Page: <strong className="text-blue-600">Page {selectedCase.sourcePage}</strong></span>
                </div>
              </div>
            </div>

            {/* Human Decision Controls */}
            <Can role={['PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'COMPLIANCE_REVIEWER']}>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-4">
                <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-xs flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Human Procurement Decision
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handleSubmitDecision('COMPLIANT')}
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Accept AI Recommendation (Approve)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitDecision('NON_COMPLIANT')}
                    disabled={isSubmitting}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2.5 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Mark Non-Compliant
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-emerald-200">
                  <label className="block text-xs font-semibold text-slate-700">Or Set Custom Status with Rationale:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={decisionStatus}
                      onChange={(e) => setDecisionStatus(e.target.value as ComplianceStatus)}
                      className="text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="COMPLIANT">✓ COMPLIANT</option>
                      <option value="NON_COMPLIANT">! NON_COMPLIANT</option>
                      <option value="UNVERIFIED">? UNVERIFIED</option>
                      <option value="PARTIALLY_COMPLIANT">◐ PARTIALLY_COMPLIANT</option>
                      <option value="NOT_APPLICABLE">— NOT_APPLICABLE</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleSubmitDecision()}
                      disabled={isSubmitting}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg transition cursor-pointer"
                    >
                      Submit Custom Decision
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder="Enter mandatory auditable procurement rationale for human decision..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                  />
                </div>
              </div>
            </Can>
          </div>
        </div>
      )}
    </div>
  );
};
