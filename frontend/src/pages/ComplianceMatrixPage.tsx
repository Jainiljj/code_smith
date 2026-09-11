import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/api';
import { ComplianceResult, ComplianceStatus, Tender } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { useAuth } from '../context/AuthProvider';
import { Can } from '../components/auth/Can';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  MinusCircle,
  FileText,
  Eye,
  Check,
  UserCheck,
  Cpu,
  Building2,
  FileSearch,
  Filter,
  Layers,
  X
} from 'lucide-react';

export const ComplianceMatrixPage: React.FC = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
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
    loadTenders();
  }, []);

  useEffect(() => {
    if (selectedTenderId) {
      loadResults(selectedTenderId);
    }
  }, [selectedTenderId]);

  async function loadTenders() {
    try {
      const tendersList = await apiService.getTenders();
      setTenders(tendersList);
      if (tendersList.length > 0) {
        setSelectedTenderId(tendersList[0].id);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tenders list');
      setLoading(false);
    }
  }

  async function loadResults(tenderId: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getComplianceByTender(tenderId);
      setResults(data);
      if (data.length > 0) {
        setSelectedResult(data[0]);
        setOverrideStatus(data[0].status);
      } else {
        setSelectedResult(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance matrix for selected tender');
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
        reviewerId: user?.id || 'USR-PROC-01',
        finalStatus: overrideStatus,
        reviewerNote: overrideNote
      });
      setSelectedResult(updated);
      setOverrideNote('');
      await loadResults(selectedTenderId);
    } catch (err) {
      alert('Failed to submit human review override');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Counts derived from live dataset
  const counts = useMemo(() => {
    return {
      ALL: results.length,
      COMPLIANT: results.filter(r => r.status === 'COMPLIANT').length,
      NON_COMPLIANT: results.filter(r => r.status === 'NON_COMPLIANT').length,
      UNVERIFIED: results.filter(r => r.status === 'UNVERIFIED').length,
      CONTRADICTIONS: results.filter(r => r.contradictionFlag || r.status === 'NON_COMPLIANT').length,
    };
  }, [results]);

  const filteredResults = useMemo(() => {
    if (filter === 'CONTRADICTIONS') {
      return results.filter(r => r.contradictionFlag || r.status === 'NON_COMPLIANT');
    }
    if (filter === 'ALL') return results;
    return results.filter(r => r.status === filter);
  }, [results, filter]);

  const activeTender = useMemo(() => {
    return tenders.find(t => t.id === selectedTenderId);
  }, [tenders, selectedTenderId]);

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Compliant
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Non-Compliant
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Unverified
          </span>
        );
      case 'PARTIALLY_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Partially Compliant
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <MinusCircle className="w-3.5 h-3.5 text-slate-500" /> Not Applicable
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-sm font-medium text-slate-500">Evaluating tender compliance matrix...</p>
      </div>
    );
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={() => selectedTenderId && loadResults(selectedTenderId)} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bid Compliance Matrix</h1>
          <p className="text-sm text-slate-500 mt-1">
            Deterministic & AI requirement evaluation matrix per procurement tender.
          </p>
        </div>

        {/* Per-Tender Selection Toolbar */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Select Tender:</span>
          <select
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer max-w-xs truncate"
          >
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tenderNumber} — {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tender Info Banner */}
      {activeTender && (
        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded font-semibold">
                {activeTender.tenderNumber}
              </span>
              <span className="text-xs font-medium text-emerald-300 bg-emerald-950 border border-emerald-700/50 px-2.5 py-0.5 rounded-full">
                {activeTender.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">{activeTender.title}</h2>
          </div>
          <div className="text-right text-xs text-slate-400">
            <span>Issuing Authority: <strong className="text-slate-200">{activeTender.issuingAuthority}</strong></span>
          </div>
        </div>
      )}

      {/* Filter Tabs Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
        </span>
        {[
          { key: 'ALL', label: `ALL (${counts.ALL})` },
          { key: 'COMPLIANT', label: `COMPLIANT (${counts.COMPLIANT})` },
          { key: 'NON_COMPLIANT', label: `NON_COMPLIANT (${counts.NON_COMPLIANT})` },
          { key: 'UNVERIFIED', label: `UNVERIFIED (${counts.UNVERIFIED})` },
          { key: 'CONTRADICTIONS', label: `⚠️ CONTRADICTION FLAGS (${counts.CONTRADICTIONS})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Compliance Table + Evidence Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirements Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Tender Requirements vs Verification Matrix
            </h2>
            <span className="text-xs text-slate-400 font-mono">{filteredResults.length} Items Loaded</span>
          </div>

          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No compliance results match the selected filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
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
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="space-y-1 max-w-lg">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-700">{r.requirementCode}</span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                          {r.category}
                        </span>
                        <span className="text-xs text-slate-400 uppercase font-mono">({r.verificationMethod})</span>
                        {r.bidderName && (
                          <span className="text-[11px] font-sans text-slate-500">
                            Bidder: <strong>{r.bidderName}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{r.requirementText}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(r.status)}
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-full hover:bg-white shadow-xs">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Evidence & Human Decision Panel */}
        {selectedResult ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 flex flex-col">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-600">{selectedResult.requirementCode}</span>
                <span className="text-xs text-slate-400 font-mono">Bid: {selectedResult.bidId}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug">{selectedResult.requirementText}</h2>

              <div className="mt-4 grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Verification Status</span>
                  <div className="mt-1">{getStatusBadge(selectedResult.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Confidence</span>
                  <span className="text-sm font-extrabold text-slate-900">{(selectedResult.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Expected vs Actual Comparison Box */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <FileSearch className="w-4 h-4 text-blue-600" /> Expected vs Actual Deterministic Comparison
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Expected Criteria</span>
                  <span className="font-mono font-bold text-slate-800">{selectedResult.expectedValue || 'N/A'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Actual Extracted Value</span>
                  <span className={`font-mono font-bold ${selectedResult.status === 'NON_COMPLIANT' ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {selectedResult.actualValue || 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Citation & Source Document */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-blue-600" /> AI Recommendation & Citation Evidence
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{selectedResult.reasoning}</p>

              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 font-mono space-y-1">
                <div>Source File: <strong className="text-slate-900 font-sans">{selectedResult.sourceDocument || 'Document.pdf'}</strong></div>
                <div>Page Reference: <strong className="text-blue-600 font-sans">Page {selectedResult.sourcePage || 1}</strong></div>
              </div>

              {selectedResult.evidenceList && selectedResult.evidenceList.length > 0 && (
                <div className="mt-3 bg-white p-3 rounded border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Extracted Citation Snippet:</span>
                  <p className="italic text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                    "{selectedResult.evidenceList[0].rawSnippet}"
                  </p>
                </div>
              )}
            </div>

            {/* Procurement Officer Human Review Form */}
            <Can role={['PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'COMPLIANCE_REVIEWER']}>
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Procurement Officer Auditable Override
                </div>

                <form onSubmit={handleOverrideSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Set Final Status:</label>
                    <select
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value as ComplianceStatus)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="COMPLIANT">✓ COMPLIANT</option>
                      <option value="NON_COMPLIANT">! NON_COMPLIANT</option>
                      <option value="UNVERIFIED">? UNVERIFIED</option>
                      <option value="PARTIALLY_COMPLIANT">◐ PARTIALLY_COMPLIANT</option>
                      <option value="NOT_APPLICABLE">— NOT_APPLICABLE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Auditable Reviewer Note:</label>
                    <textarea
                      required
                      rows={3}
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      placeholder="Enter justification for overriding or approving AI compliance evaluation..."
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-md transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? 'Recording Decision...' : 'Submit Auditable Override'}
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </Can>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            Select a requirement from the table to inspect evidence citations and submit human decisions.
          </div>
        )}
      </div>
    </div>
  );
};
