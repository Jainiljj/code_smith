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
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition shadow-md cursor-pointer"
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

      {tenders.map((t) => (
        <div key={t.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-blue-600 text-white px-2.5 py-0.5 rounded font-semibold">{t.tenderNumber}</span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
                  {t.status}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-2">{t.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{t.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase">Est. Value</span>
              <span className="text-2xl font-extrabold text-blue-400">₹{(t.estimatedValue / 10000000).toFixed(2)} Cr</span>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Extracted Compliance Requirements ({t.requirements.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">Code</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Requirement Text</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Threshold</th>
                    <th className="p-3">Mandatory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {t.requirements.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-blue-600">{req.reqCode}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium">{req.category}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-900 max-w-md">{req.rawText}</td>
                      <td className="p-3 text-slate-600">{req.reqType}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        {req.threshold ? `${req.operator || ''} ${req.threshold} ${req.unit || ''}` : 'N/A'}
                      </td>
                      <td className="p-3">
                        {req.isMandatory ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Mandatory
                          </span>
                        ) : 'Optional'}
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
  );
};
