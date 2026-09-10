import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { ComplianceResult, Tender } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { Download, FileText, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [tender, setTender] = useState<Tender | null>(null);
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
      const t = await apiService.getTenderById('TND-001');
      const r = await apiService.getComplianceResults('BID-A-01');
      setTender(t);
      setResults(r);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report preview');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Generating compliance report preview...</div>;
  if (error || !tender) return <ApiErrorState message={error || 'Tender data unavailable'} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GeM Official Compliance Verification Report</h1>
          <p className="text-sm text-slate-500 mt-1">Audit-ready structured summary separating AI reasoning from Procurement Officer decisions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 text-sm font-medium px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-200 transition">
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button onClick={() => alert('Exporting Official PDF Report...')} className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm">
            <Download className="w-4 h-4" /> Export GeM PDF
          </button>
        </div>
      </div>

      {/* Official Report Card */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-md p-8 space-y-6 max-w-4xl mx-auto">
        {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
          <div>
            <div className="inline-block bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded mb-2">GOVERNMENT E-MARKETPLACE (GeM)</div>
            <h2 className="text-xl font-extrabold text-slate-900">BID COMPLIANCE VERIFICATION SUMMARY REPORT</h2>
            <p className="text-xs text-slate-500 mt-1">Tender No: <strong className="font-mono text-slate-800">{tender.tenderNumber}</strong></p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Report Date: <strong className="text-slate-800">10-Sep-2026</strong></p>
            <p>Verification Mode: <strong className="text-slate-800">Evidence-First Deterministic</strong></p>
          </div>
        </div>

        {/* Tender & Bidder Metadata */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Tender Title</span>
            <span className="font-bold text-slate-900">{tender.title}</span>
            <span className="text-slate-500 block mt-1">Authority: {tender.issuingAuthority}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Bidder Details</span>
            <span className="font-bold text-slate-900">Apex Pumps & Motors Pvt Ltd</span>
            <span className="text-slate-500 block mt-1">GSTIN: 07AAAAA0000A1Z5 | PAN: AAACA1234F</span>
          </div>
        </div>

        {/* Results Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase">Itemized Compliance Verification</h3>
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                <th className="p-2.5 border-r">Req Code</th>
                <th className="p-2.5 border-r">Category</th>
                <th className="p-2.5 border-r">Requirement</th>
                <th className="p-2.5 border-r">Evaluation Status</th>
                <th className="p-2.5">Evidence Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.map((r) => (
                <tr key={r.id}>
                  <td className="p-2.5 font-mono font-bold text-blue-700 border-r">{r.requirementCode}</td>
                  <td className="p-2.5 border-r">{r.category}</td>
                  <td className="p-2.5 max-w-xs border-r">{r.requirementText}</td>
                  <td className="p-2.5 font-bold border-r">{r.status}</td>
                  <td className="p-2.5 text-slate-600 font-mono">Financial_Statements.pdf (p.37)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900">Rajesh Kumar</p>
            <p>Procurement Officer Signature</p>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> Digitally Verified Audit Trail Active
          </div>
        </div>
      </div>
    </div>
  );
};
