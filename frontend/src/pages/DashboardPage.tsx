import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { apiService } from '../services/api';
import { Tender, ComplianceResult, AuditLog } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Building2,
  ShieldCheck,
  Server,
  Users,
  Activity,
  Upload,
  Lock
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = user?.role || 'PROCUREMENT_OFFICER';

  useEffect(() => {
    loadData();
  }, [role]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const t = await apiService.getTenders();
      setTenders(t);

      if (role !== 'BIDDER_VENDOR') {
        const r = await apiService.getComplianceResults('BID-A-01');
        setResults(r);
      }

      if (role === 'SYSTEM_ADMIN' || role === 'VIEWER' || role === 'AUDITOR') {
        const a = await apiService.getAuditLogs();
        setAudits(a);
      }
    } catch (err: any) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const counts = {
    compliant: results.filter(r => r.status === 'COMPLIANT').length,
    partial: results.filter(r => r.status === 'PARTIALLY_COMPLIANT').length,
    nonCompliant: results.filter(r => r.status === 'NON_COMPLIANT').length,
    unverified: results.filter(r => r.status === 'UNVERIFIED').length,
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3"></div>
        <p className="text-sm font-medium">Loading {role} Dashboard Workspace...</p>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 1. SYSTEM ADMIN DASHBOARD                                                  */
  /* -------------------------------------------------------------------------- */
  if (role === 'SYSTEM_ADMIN') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">
            <Server className="w-4 h-4" />
            <span>System Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-bold">Platform Governance & Security Operations</h1>
          <p className="text-xs text-slate-400 mt-1">Manage RBAC roles, audit logs, service health, and global compliance overrides.</p>
        </div>

        {/* Admin KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
              <span>Active System Roles</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">5 Roles</div>
            <p className="text-[11px] text-purple-600 font-mono mt-1">ADMIN, OFFICER, REVIEWER, AUDITOR, BIDDER</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
              <span>Spring Boot Backend</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-2">HEALTHY</div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Port 8080 • JWT Auth Active</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
              <span>FastAPI AI Microservice</span>
              <Server className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600 mt-2">HEALTHY</div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Port 8000 • Vector RAG Online</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
              <span>Verified Seller Datasets</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">7 Datasets</div>
            <p className="text-[11px] text-emerald-600 font-mono mt-1">Datasets A–G Loaded</p>
          </div>
        </div>

        {/* Quick Shortcuts & Recent Audit Log Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>System Administration Actions</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/sellers" className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl block transition">
                <span className="font-bold text-slate-900 text-sm block">Seller Risk Queue</span>
                <span className="text-xs text-slate-500 block mt-1">Inspect seller trust scores, government connectors, and perform risk overrides.</span>
              </Link>
              <Link to="/audit" className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl block transition">
                <span className="font-bold text-slate-900 text-sm block">Platform Audit Log Stream</span>
                <span className="text-xs text-slate-500 block mt-1">Review tamper-proof audit trail for all system actions and reviewer overrides.</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">Active RBAC Demo Session</h2>
            <div className="text-xs space-y-2">
              <div><span className="text-slate-400">Logged User:</span> <strong className="text-slate-800">{user?.fullName}</strong></div>
              <div><span className="text-slate-400">Email:</span> <strong className="text-slate-800">{user?.email}</strong></div>
              <div><span className="text-slate-400">Role Authority:</span> <span className="font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-bold">{user?.role}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 2. COMPLIANCE REVIEWER DASHBOARD                                           */
  /* -------------------------------------------------------------------------- */
  if (role === 'COMPLIANCE_REVIEWER') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 uppercase tracking-widest mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Compliance Reviewer Queue</span>
          </div>
          <h1 className="text-2xl font-bold">Review & Human Risk Override Center</h1>
          <p className="text-xs text-slate-400 mt-1">Review AI evaluation outputs, evaluate contradictory evidence, and submit auditable overrides.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-400 font-semibold uppercase">Pending Human Overrides</span>
            <div className="text-3xl font-bold text-amber-600 mt-2">2 Items</div>
            <p className="text-xs text-amber-600 mt-1">Action required by Reviewer</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-400 font-semibold uppercase">Contradiction Flags</span>
            <div className="text-3xl font-bold text-rose-600 mt-2">1 Flag</div>
            <p className="text-xs text-rose-600 mt-1">Turnover deficit mismatch</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-400 font-semibold uppercase">Approved Reviews</span>
            <div className="text-3xl font-bold text-emerald-600 mt-2">2 Approved</div>
            <p className="text-xs text-emerald-600 mt-1">Passed compliance criteria</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-slate-900">Pending Review Worklist</h2>
            <Link to="/reviews" className="text-xs font-bold text-blue-600 flex items-center">
              Open Review Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {results.filter(r => r.status !== 'COMPLIANT').map((r) => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-700">{r.requirementCode}</span>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">{r.requirementText}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{r.reasoning}</p>
                </div>
                <Link
                  to="/reviews"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shrink-0 text-center"
                >
                  Review Item
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 3. AUDITOR / VIEWER DASHBOARD                                             */
  /* -------------------------------------------------------------------------- */
  if (role === 'VIEWER' || role === 'AUDITOR') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditor Oversight Portal</span>
          </div>
          <h1 className="text-2xl font-bold">Independent Compliance Audit & Inspection</h1>
          <p className="text-xs text-slate-400 mt-1">Read-only oversight monitoring tender compliance, evidence snippets, and statutory audit trails.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 text-base border-b pb-2">Active Tender Summary</h2>
            {tenders.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>{t.title}</span>
                  <span className="font-mono text-blue-600">{t.tenderNumber}</span>
                </div>
                <div className="text-slate-500">Authority: {t.issuingAuthority} • Value: ₹{(t.estimatedValue / 10000000).toFixed(2)} Cr</div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 text-base border-b pb-2">Recent Audit Logs</h2>
            <div className="space-y-2 text-xs">
              {audits.slice(0, 4).map((a) => (
                <div key={a.id} className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{a.action}</span>
                    <p className="text-[11px] text-slate-500">{a.details}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{a.timestamp?.substring(11, 16)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 4. BIDDER / VENDOR DASHBOARD                                               */
  /* -------------------------------------------------------------------------- */
  if (role === 'BIDDER_VENDOR' || role === 'BIDDER') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Building2 className="w-4 h-4" />
            <span>Bidder Vendor Self-Service Portal</span>
          </div>
          <h1 className="text-2xl font-bold">Apex Pumps & Motors Vendor Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Submit bids, upload technical/financial documents, and check verification progress.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-900 text-base border-b pb-2">Active Tender Submissions</h2>
          {tenders.map((t) => (
            <div key={t.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-blue-600 font-bold">{t.tenderNumber}</span>
                <h3 className="font-semibold text-slate-900 text-sm mt-0.5">{t.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Status: <strong className="text-emerald-600">Submitted • Under Evaluation</strong></p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  Bid Registered
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 5. DEFAULT PROCUREMENT OFFICER DASHBOARD                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Procurement Compliance Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time deterministic & AI evidence verification for active GeM tenders.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliant</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{counts.compliant}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">✓ Clearly satisfies requirement</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Non-Compliant</span>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{counts.nonCompliant}</div>
          <p className="text-xs text-rose-600 font-medium mt-1">! Fails numeric or document threshold</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unverified</span>
            <HelpCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{counts.unverified}</div>
          <p className="text-xs text-amber-600 font-medium mt-1">? Missing evidence snippet</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partially Compliant</span>
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{counts.partial}</div>
          <p className="text-xs text-blue-600 font-medium mt-1">◐ Partial condition satisfied</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Active Tender Evaluation</h2>
            </div>
            <Link to="/tenders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All Tenders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tenders.map((t) => (
            <div key={t.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">{t.tenderNumber}</span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {t.status}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">{t.title}</h3>
              <div className="flex flex-wrap text-xs text-slate-500 gap-4 pt-1">
                <span>Authority: <strong className="text-slate-700">{t.issuingAuthority}</strong></span>
                <span>Est. Value: <strong className="text-slate-700">₹{(t.estimatedValue / 10000000).toFixed(2)} Cr</strong></span>
                <span>Requirements: <strong className="text-slate-700">{t.requirements.length}</strong></span>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/compliance"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-500 transition shadow-xs"
            >
              Open Compliance Verification Matrix
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Bidder Risk Analysis</h2>
          </div>

          <div className="text-center py-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Transparent Risk Score</span>
            <div className="text-4xl font-extrabold text-amber-900 mt-1">65 / 100</div>
            <span className="text-xs text-amber-700 mt-1 block">Medium Compliance Risk Level</span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-900 mb-2">Primary Risk Contributors:</p>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
              <span>Financial Turnover Deficit (FY25: ₹94 Cr &lt; ₹100 Cr)</span>
              <span className="font-semibold text-rose-600">+35 Risk</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
              <span>Unverified Government Experience Snippet</span>
              <span className="font-semibold text-amber-600">+20 Risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
