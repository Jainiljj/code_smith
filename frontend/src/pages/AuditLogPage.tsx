import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AuditLog } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { ShieldCheck, User, Clock, Key } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading audit trail...</div>;
  if (error) return <ApiErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Immutable Audit Trail</h1>
        <p className="text-sm text-slate-500 mt-1">Append-only security and human compliance override event log.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between font-bold text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> Security Audit Log ({logs.length})
          </div>
          <span className="text-xs text-slate-400 font-mono">Append-Only Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">Audit ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor / Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-blue-600">{log.id}</td>
                  <td className="p-3 text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{log.actorId}</span>
                    <span className="text-slate-500 text-[11px] uppercase">{log.actorRole}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">{log.action}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">{log.resourceType}: {log.resourceId}</td>
                  <td className="p-3 text-slate-700 max-w-sm">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
