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
  Check,
  UserCheck,
  Cpu,
  Building2,
  Filter,
  Grid,
  List,
  ChevronRight,
  Users
} from 'lucide-react';

interface GroupedRequirement {
  reqCode: string;
  requirementText: string;
  category: string;
  reqType?: string;
  expectedValue?: string;
  isMandatory?: boolean;
  bidderResults: ComplianceResult[];
  compliantCount: number;
  nonCompliantCount: number;
  unverifiedCount: number;
  partiallyCompliantCount: number;
}

export const ComplianceMatrixPage: React.FC = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [viewMode, setViewMode] = useState<'REQUIREMENT_LIST' | 'MATRIX_GRID'>('REQUIREMENT_LIST');
  const [filter, setFilter] = useState<string>('ALL');

  // Selected Requirement for Drawer comparison
  const [selectedReqCode, setSelectedReqCode] = useState<string | null>(null);

  // Override Form state for a specific bidder result inside drawer
  const [selectedResult, setSelectedResult] = useState<ComplianceResult | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus>('COMPLIANT');
  const [overrideNote, setOverrideNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setSelectedReqCode(data[0].requirementCode);
        setSelectedResult(data[0]);
        setOverrideStatus(data[0].status);
      } else {
        setSelectedReqCode(null);
        setSelectedResult(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance matrix for selected tender');
    } finally {
      setLoading(false);
    }
  }

  // Group compliance results by unique Requirement Code
  const groupedRequirements = useMemo<GroupedRequirement[]>(() => {
    const map = new Map<string, ComplianceResult[]>();
    results.forEach((r) => {
      const code = r.requirementCode || 'REQ-001';
      if (!map.has(code)) map.set(code, []);
      map.get(code)!.push(r);
    });

    const groups: GroupedRequirement[] = [];
    map.forEach((bResults, code) => {
      const first = bResults[0];
      groups.push({
        reqCode: code,
        requirementText: first.requirementText,
        category: first.category,
        reqType: first.reqType,
        expectedValue: first.expectedValue,
        isMandatory: first.isMandatory,
        bidderResults: bResults,
        compliantCount: bResults.filter((b) => b.status === 'COMPLIANT').length,
        nonCompliantCount: bResults.filter((b) => b.status === 'NON_COMPLIANT').length,
        unverifiedCount: bResults.filter((b) => b.status === 'UNVERIFIED').length,
        partiallyCompliantCount: bResults.filter((b) => b.status === 'PARTIALLY_COMPLIANT').length,
      });
    });

    return groups;
  }, [results]);

  // Extract unique bidders participating in the tender
  const uniqueBidders = useMemo(() => {
    const bMap = new Map<string, string>();
    results.forEach((r) => {
      if (r.bidId) {
        bMap.set(r.bidId, r.bidderName || `Bidder ${r.bidId}`);
      }
    });
    return Array.from(bMap.entries()).map(([bidId, name]) => ({ bidId, name }));
  }, [results]);

  // Filtered grouped requirements
  const filteredGroupedRequirements = useMemo(() => {
    return groupedRequirements.filter((g) => {
      if (filter === 'ALL') return true;
      if (filter === 'NON_COMPLIANT') return g.nonCompliantCount > 0;
      if (filter === 'COMPLIANT') return g.compliantCount > 0;
      if (filter === 'UNVERIFIED') return g.unverifiedCount > 0;
      if (filter === 'CONTRADICTIONS') {
        return g.bidderResults.some((b) => b.contradictionFlag || b.status === 'NON_COMPLIANT');
      }
      return true;
    });
  }, [groupedRequirements, filter]);

  const activeReqGroup = useMemo(() => {
    return groupedRequirements.find((g) => g.reqCode === selectedReqCode);
  }, [groupedRequirements, selectedReqCode]);

  const activeTender = useMemo(() => {
    return tenders.find((t) => t.id === selectedTenderId);
  }, [tenders, selectedTenderId]);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResult) return;
    setSubmitting(true);
    try {
      const updated = await apiService.submitHumanReview({
        complianceResultId: selectedResult.id,
        reviewerId: user?.id || 'USR-PROC-01',
        finalStatus: overrideStatus,
        reviewerNote: overrideNote,
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

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Compliant
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Non-Compliant
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Unverified
          </span>
        );
      case 'PARTIALLY_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Partially Compliant
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <MinusCircle className="w-3.5 h-3.5 text-slate-500" /> N/A
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-sm font-medium text-slate-500">Building scalable requirement comparison matrix...</p>
      </div>
    );
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={() => selectedTenderId && loadResults(selectedTenderId)} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bid Compliance Evaluation Matrix
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Scalable requirement-centric comparison matrix evaluating all bidders side-by-side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('REQUIREMENT_LIST')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'REQUIREMENT_LIST'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Requirements View
            </button>
            <button
              onClick={() => setViewMode('MATRIX_GRID')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'MATRIX_GRID'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Bidder Matrix Grid
            </button>
          </div>

          {/* Per-Tender Selector */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Tender:</span>
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
      </div>

      {/* Tender Banner Summary */}
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
              <span className="text-xs font-sans text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                {groupedRequirements.length} Specifications
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">{activeTender.title}</h2>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-center">
              <span className="text-xs font-bold text-emerald-400 block">{uniqueBidders.length}</span>
              <span className="text-[10px] uppercase tracking-wider block">Bidders Compared</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
        </span>
        {[
          { key: 'ALL', label: `ALL (${groupedRequirements.length} Criteria)` },
          { key: 'NON_COMPLIANT', label: `NON-COMPLIANT EXCEPTIONS` },
          { key: 'COMPLIANT', label: `FULLY COMPLIANT` },
          { key: 'UNVERIFIED', label: `UNVERIFIED` },
          { key: 'CONTRADICTIONS', label: `⚠️ CONTRADICTIONS` },
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

      {/* ==================== VIEW MODE 1: REQUIREMENT-CENTRIC LIST + BIDDER COMPARISON DRAWER ==================== */}
      {viewMode === 'REQUIREMENT_LIST' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distinct Requirements List (Left Pane) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Distinct Tender Specifications ({filteredGroupedRequirements.length})
              </h2>
              <span className="text-xs text-slate-400 font-mono">Click to compare all bidders</span>
            </div>

            {filteredGroupedRequirements.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No specifications match the selected filter.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredGroupedRequirements.map((reqGroup) => {
                  const isSelected = selectedReqCode === reqGroup.reqCode;
                  return (
                    <div
                      key={reqGroup.reqCode}
                      onClick={() => {
                        setSelectedReqCode(reqGroup.reqCode);
                        if (reqGroup.bidderResults.length > 0) {
                          setSelectedResult(reqGroup.bidderResults[0]);
                          setOverrideStatus(reqGroup.bidderResults[0].status);
                        }
                      }}
                      className={`p-4 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-700">{reqGroup.reqCode}</span>
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                            {reqGroup.category}
                          </span>
                          {reqGroup.expectedValue && (
                            <span className="text-xs font-mono text-slate-500">
                              Criteria: <strong className="text-slate-800">{reqGroup.expectedValue}</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-900 leading-snug">{reqGroup.requirementText}</p>
                      </div>

                      {/* Bidder Comparison Counter Pills */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs">
                          {reqGroup.compliantCount > 0 && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                              {reqGroup.compliantCount} Compliant
                            </span>
                          )}
                          {reqGroup.nonCompliantCount > 0 && (
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full font-bold">
                              {reqGroup.nonCompliantCount} Non-Compliant
                            </span>
                          )}
                          {reqGroup.unverifiedCount > 0 && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                              {reqGroup.unverifiedCount} Unverified
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Pane: All Bidders Evaluation Drawer for Selected Requirement */}
          {activeReqGroup ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 flex flex-col">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600">{activeReqGroup.reqCode}</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                    {activeReqGroup.category}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug">{activeReqGroup.requirementText}</h2>
                <div className="mt-2 text-xs text-slate-500 font-mono">
                  Expected Requirement Threshold: <strong className="text-slate-900 font-sans">{activeReqGroup.expectedValue || 'Document Required'}</strong>
                </div>
              </div>

              {/* Bidders Comparison Matrix Cards */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" /> Bidders Evaluation Comparison ({activeReqGroup.bidderResults.length})
                </h3>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {activeReqGroup.bidderResults.map((bResult) => {
                    const isResultSelected = selectedResult?.id === bResult.id;
                    return (
                      <div
                        key={bResult.id}
                        onClick={() => {
                          setSelectedResult(bResult);
                          setOverrideStatus(bResult.status);
                        }}
                        className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                          isResultSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-400/30'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">
                            {bResult.bidderName || `Bidder ${bResult.bidId}`}
                          </span>
                          {getStatusBadge(bResult.status)}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <div>
                            <span className="text-slate-400">Actual Extracted:</span>{' '}
                            <strong className={`font-mono ${bResult.status === 'NON_COMPLIANT' ? 'text-rose-600' : 'text-emerald-700'}`}>
                              {bResult.actualValue || 'Unverified'}
                            </strong>
                          </div>
                          <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 leading-relaxed">
                            {bResult.reasoning}
                          </p>
                          <div className="text-[10px] text-slate-400 font-mono pt-1">
                            Source: {bResult.sourceDocument} (Page {bResult.sourcePage})
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Human Decision Form for Selected Bidder Result */}
              {selectedResult && (
                <Can role={['PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'COMPLIANCE_REVIEWER']}>
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3 mt-auto">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" /> Human Override Decision
                      </span>
                      <span className="text-[10px] font-mono text-emerald-800">
                        Target: {selectedResult.bidderName}
                      </span>
                    </div>

                    <form onSubmit={handleOverrideSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Set Decision Status:</label>
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
                          rows={2}
                          value={overrideNote}
                          onChange={(e) => setOverrideNote(e.target.value)}
                          placeholder="Justification for approving or overriding..."
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
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              Select a specification from the list to compare all bidders side-by-side.
            </div>
          )}
        </div>
      ) : (
        /* ==================== VIEW MODE 2: BIDDER MATRIX GRID (Requirements x Bidders) ==================== */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Grid className="w-4 h-4 text-blue-400" /> Cross-Bidder Evaluation Matrix Grid (Requirements × Bidders)
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {groupedRequirements.length} Requirements × {uniqueBidders.length} Bidders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4 min-w-[220px]">Specification Code & Category</th>
                  <th className="p-4 min-w-[180px]">Required Threshold</th>
                  {uniqueBidders.map((b) => (
                    <th key={b.bidId} className="p-4 min-w-[220px] text-center border-l border-slate-200 bg-slate-50">
                      <div className="font-bold text-slate-900">{b.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal">Bid: {b.bidId}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {groupedRequirements.map((reqGroup) => (
                  <tr key={reqGroup.reqCode} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold font-mono text-blue-600">{reqGroup.reqCode}</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{reqGroup.requirementText}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">{reqGroup.category}</div>
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-800">
                      {reqGroup.expectedValue || 'Document Required'}
                    </td>

                    {uniqueBidders.map((b) => {
                      const bResult = reqGroup.bidderResults.find((r) => r.bidId === b.bidId);
                      return (
                        <td key={b.bidId} className="p-4 text-center border-l border-slate-200 align-top">
                          {bResult ? (
                            <div
                              onClick={() => {
                                setSelectedReqCode(reqGroup.reqCode);
                                setSelectedResult(bResult);
                                setOverrideStatus(bResult.status);
                                setViewMode('REQUIREMENT_LIST');
                              }}
                              className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition cursor-pointer space-y-1 text-left"
                            >
                              <div className="flex items-center justify-between">
                                {getStatusBadge(bResult.status)}
                              </div>
                              <div className="text-[11px] font-mono font-bold text-slate-800 pt-1">
                                Extracted: {bResult.actualValue || 'Unverified'}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {bResult.sourceDocument} (Pg {bResult.sourcePage})
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
