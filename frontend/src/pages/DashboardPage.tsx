import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { apiService } from '../services/api';
import { Tender, ComplianceResult } from '../types/compliance';
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
  Users,
  Lock,
  Plus,
  ShieldCheck,
  FileCheck,
  UploadCloud
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'PROCUREMENT_OFFICER';

  const [tenders, setTenders] = useState<Tender[]>([]);
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
      const t = await apiService.getTenders();
      const r = await apiService.getComplianceResults('BID-A-01').catch(() => []);
      setTenders(t);
      setResults(r);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
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
        <p className="text-sm font-semibold">Loading Role-Specific Dashboard Analytics...</p>
      </div>
    );
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={loadData} />;
  }

  // Render Role-Specific Dashboard Views
  if (role === 'SYSTEM_ADMIN') {
    return (
      <div className="space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">
            <Lock className="w-4 h-4" />
            <span>Platform Security Administration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Administrator Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Global governance control panel managing RBAC permissions, microservice health, seller risk analysis, and full system audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Platform Users</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">5 Demo Roles</div>
            <p className="text-xs text-purple-600 font-semibold mt-1">SYSTEM_ADMIN Active</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Seller Queue</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">7 Datasets</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Databases A – G Verified</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Microservices</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">3 Tier Architecture</div>
            <p className="text-xs text-blue-600 font-semibold mt-1">Spring + FastAPI + Vite</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Tenders</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{tenders.length} Active</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Requirements Indexed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Seller Risk Verification Control</span>
            </h2>
            <p className="text-xs text-slate-600">
              Inspect seller profiles, government connector cross-checks (GST, MCA, Udyam, EPFO), and risk score overrides.
            </p>
            <Link to="/sellers" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-500">
              Manage Seller Verification Queue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Audit Trail & System Security Logs</span>
            </h2>
            <p className="text-xs text-slate-600">
              View immutable audit logs recording all document uploads, compliance overrides, and RBAC logins.
            </p>
            <Link to="/audit" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold text-xs rounded-lg hover:bg-purple-500">
              Open System Audit Trail <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'COMPLIANCE_REVIEWER') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Reviewer Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Review AI compliance evaluations, contradiction flags, and human overrides.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pending Reviews</span>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">1 Bid Review</div>
            <p className="text-xs text-slate-500 mt-1">BID-A-01 Apex Pumps</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Contradictions</span>
            <div className="text-3xl font-extrabold text-rose-600 mt-1">1 Flagged</div>
            <p className="text-xs text-slate-500 mt-1">Turnover Deficit Conflict</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Verification Matrix</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">4 Criteria</div>
            <p className="text-xs text-slate-500 mt-1">5 Compliance States</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <span>Human Review Queue Actions</span>
          </h2>
          <p className="text-xs text-slate-600">
            Submit auditable review notes and overrule AI compliance verdicts with detailed legal or technical justifications.
          </p>
          <Link to="/reviews" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-500">
            Open Human Review Queue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (role === 'VIEWER' || role === 'AUDITOR') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auditor Oversight Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Read-only oversight monitoring procurement integrity, audit trails, and compliance reports.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Audit Events</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">Verified</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Cryptographic Checksums</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Seller Queue</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">Datasets A – G</div>
            <p className="text-xs text-slate-500 mt-1">Read-Only Inspection</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Reports</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">Export Ready</div>
            <p className="text-xs text-slate-500 mt-1">PDF & CSV Logs</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>Audit Trail Logs</span>
          </h2>
          <p className="text-xs text-slate-600">Inspect system action logs, timestamps, and actor role details.</p>
          <Link to="/audit" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-lg hover:bg-amber-500">
            View System Audit Trail <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (role === 'BIDDER_VENDOR' || role === 'BIDDER') {
    return (
      <div className="space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Building2 className="w-4 h-4" />
            <span>GeM Vendor Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vendor Portal Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Welcome, Apex Pumps Representative. View active tender notices, submit proposal documents, and track compliance verification status.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Submitted Bids</span>
            <div className="text-3xl font-extrabold text-cyan-600 mt-1">BID-APEX-2026-01</div>
            <p className="text-xs text-slate-500 mt-1">Status: Evaluation In Progress</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Debarment Check</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">CLEAN</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Not Debarred</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Tenders</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{tenders.length} Available</div>
            <p className="text-xs text-slate-500 mt-1">Central Water Commission</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            <span>Active Tenders & Bid Documents</span>
          </h2>
          <p className="text-xs text-slate-600">Inspect active tender specifications and submit technical proposal PDFs.</p>
          <Link to="/tenders" className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold text-xs rounded-lg hover:bg-cyan-500">
            View Tenders & Submit Proposals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Default Dashboard View for PROCUREMENT_OFFICER
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Procurement Officer Dashboard</h1>
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

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Active Tender Evaluation</h2>
            </div>
            <Link to="/tenders" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
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
                <span>Requirements: <strong className="text-slate-700">{t.requirements ? t.requirements.length : 0}</strong></span>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/compliance"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-500 transition shadow-xs"
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
              <span>Financial Turnover Deficit</span>
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
