import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Tender } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { CreateTenderModal } from '../components/tenders/CreateTenderModal';
import { FileText, Plus, CheckCircle, ShieldCheck } from 'lucide-react';

export const TendersPage: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTenders();
      setTenders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenders list');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading tenders list...</div>;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GeM Tenders & Requirements</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active tender specifications and extracted requirement criteria.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-500 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create / Upload Tender Document
        </button>
      </div>

      <CreateTenderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />

      <div className="space-y-6">
        {tenders.map((tender) => (
          <div key={tender.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded font-semibold">
                    {tender.tenderNumber}
                  </span>
                  <span className="text-xs font-medium text-emerald-300 bg-emerald-950 border border-emerald-700/50 px-2.5 py-0.5 rounded-full">
                    {tender.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-2">{tender.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{tender.description}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. Value</span>
                <span className="text-2xl font-extrabold text-white">
                  ₹{(tender.estimatedValue / 10000000).toFixed(2)} Cr
                </span>
              </div>
            </div>

            {/* Extracted Requirements List */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Extracted Compliance Requirements ({tender.requirements ? tender.requirements.length : 0})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Requirement Text</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Threshold</th>
                      <th className="py-3 px-4">Mandatory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {tender.requirements && tender.requirements.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-blue-600">{req.reqCode}</td>
                        <td className="py-3 px-4 font-sans">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium">
                            {req.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans max-w-md">{req.rawText}</td>
                        <td className="py-3 px-4 text-slate-500">{req.reqType}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {req.threshold !== undefined && req.threshold !== null ? `${req.operator || ''} ${req.threshold} ${req.unit || ''}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {req.isMandatory ? (
                            <span className="text-emerald-700 font-sans font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Mandatory
                            </span>
                          ) : (
                            <span className="text-slate-400 font-sans">Optional</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
