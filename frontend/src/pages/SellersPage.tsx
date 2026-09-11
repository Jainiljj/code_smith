import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { apiService } from '../services/api';
import { Tender } from '../types/compliance';
import {
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Building2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Filter,
  Users
} from 'lucide-react';

interface SellerItem {
  id: string;
  organizationName: string;
  cinOrPan?: string;
  gstin?: string;
  udyamRegistration?: string;
  category?: string;
  isDebarred?: boolean;
  trustScore?: number;
  verificationStatus: string;
  updatedAt?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const SellersPage: React.FC = () => {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'TENDER_WISE' | 'ALL_SELLERS'>('TENDER_WISE');

  // Expanded Tender Capsules state
  const [expandedTenderIds, setExpandedTenderIds] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Sellers
      const resSellers = await fetch(`${API_BASE_URL}/sellers`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('gem_auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!resSellers.ok) {
        throw new Error(`Failed to load sellers queue: HTTP ${resSellers.status}`);
      }

      const sellersData = await resSellers.json();
      setSellers(sellersData);

      // 2. Fetch Tenders
      try {
        const tendersData = await apiService.getTenders();
        setTenders(tendersData);
        if (tendersData.length > 0) {
          setExpandedTenderIds(new Set([tendersData[0].id]));
        }
      } catch (tErr) {
        console.warn('Could not fetch tenders for tender-wise grouping:', tErr);
      }

    } catch (err: any) {
      setError(err.message || 'Error connecting to seller verification service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleRunVerification = async (sellerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/sellers/${sellerId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('gem_auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to trigger seller verification:', err);
    }
  };

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      const matchesSearch =
        s.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.gstin && s.gstin.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || s.verificationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sellers, searchTerm, statusFilter]);

  // Map sellers to tenders (grouping logic)
  const tenderSellersMap = useMemo(() => {
    const map = new Map<string, SellerItem[]>();
    if (tenders.length === 0) return map;

    tenders.forEach((tender, idx) => {
      const mapped = filteredSellers.filter((s) => {
        if (tenders.length === 1) return true;
        if (s.category && tender.category && s.category.toLowerCase().includes(tender.category.toLowerCase())) {
          return true;
        }
        const sellerIdx = sellers.findIndex(item => item.id === s.id);
        return sellerIdx >= 0 && (sellerIdx % tenders.length === idx);
      });
      map.set(tender.id, mapped);
    });

    return map;
  }, [tenders, filteredSellers, sellers]);

  const toggleTenderExpand = (tenderId: string) => {
    setExpandedTenderIds((prev) => {
      const next = new Set(prev);
      if (next.has(tenderId)) {
        next.delete(tenderId);
      } else {
        next.add(tenderId);
      }
      return next;
    });
  };

  const expandAllTenders = () => {
    setExpandedTenderIds(new Set(tenders.map((t) => t.id)));
  };

  const collapseAllTenders = () => {
    setExpandedTenderIds(new Set());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Verified
          </span>
        );
      case 'HUMAN_OVERRIDDEN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Human Overridden
          </span>
        );
      case 'SUSPECTED_SHELL':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-purple-600" />
            Suspected Shell
          </span>
        );
      case 'HIGH_RISK':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-red-600" />
            High Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-amber-600 animate-spin" />
            Pending
          </span>
        );
    }
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'text-slate-400';
    if (score >= 85) return 'text-emerald-600 font-bold';
    if (score >= 65) return 'text-amber-600 font-bold';
    return 'text-red-600 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <UserCheck className="w-48 h-48 text-emerald-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">
            <Building2 className="w-4 h-4" />
            <span>Phase 2.5 — AI Seller Verification Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Seller Risk & Compliance Queue
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Evidence-first verification analyzing MCA corporate registries, GSTN tax filings, MSME Udyam status, EPFO employee data, and DPIIT startup records to detect shell entities.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-mono">
              Dataset Coverage: <span className="text-emerald-400 font-bold">Datasets A – G (Canonical Demo Included)</span>
            </div>
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-mono">
              Connectors: <span className="text-blue-400 font-bold">GSTN, MCA21, Udyam, DPIIT, BIS, EPFO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, View Mode Toggle & Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company name, GSTIN, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setViewMode('TENDER_WISE')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'TENDER_WISE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Tender-Wise View
              </button>
              <button
                onClick={() => setViewMode('ALL_SELLERS')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'ALL_SELLERS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                All Sellers List
              </button>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED">Verified (Clean)</option>
                <option value="HIGH_RISK">High Risk</option>
                <option value="SUSPECTED_SHELL">Suspected Shell</option>
                <option value="HUMAN_OVERRIDDEN">Human Overridden</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
              </select>
            </div>

            {/* Expand / Collapse Controls (Only active in Tender-Wise view) */}
            {viewMode === 'TENDER_WISE' && (
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs bg-slate-50">
                <button
                  onClick={expandAllTenders}
                  className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 border-r border-slate-200 font-medium transition cursor-pointer"
                  title="Expand all tenders"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAllTenders}
                  className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
                  title="Collapse all tenders"
                >
                  Collapse All
                </button>
              </div>
            )}

            <button
              onClick={fetchData}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading Seller Verification Datasets...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 text-center">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
          <button onClick={fetchData} className="mt-3 px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700">
            Retry Connection
          </button>
        </div>
      ) : viewMode === 'TENDER_WISE' ? (
        /* ==================== TENDER-WISE VIEW ==================== */
        <div className="space-y-4">
          {tenders.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
              No tenders available to categorize sellers.
            </div>
          ) : (
            tenders.map((tender) => {
              const isExpanded = expandedTenderIds.has(tender.id);
              const tenderSellers = tenderSellersMap.get(tender.id) || [];

              return (
                <div
                  key={tender.id}
                  className={`bg-white rounded-xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    isExpanded ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Big Capsule Header (Clickable) */}
                  <div
                    onClick={() => toggleTenderExpand(tender.id)}
                    className="bg-slate-900 text-white p-5 cursor-pointer hover:bg-slate-800 transition flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded font-semibold tracking-wide">
                          {tender.tenderNumber}
                        </span>
                        <span className="text-xs font-medium text-emerald-300 bg-emerald-950 border border-emerald-700/50 px-2.5 py-0.5 rounded-full">
                          {tender.status}
                        </span>
                        {tender.category && (
                          <span className="text-xs font-sans text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                            {tender.category}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-white tracking-tight truncate">
                        {tender.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        {tender.issuingAuthority && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {tender.issuingAuthority}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Capsule Right Side: Participating Bidders Count + Toggle Icon */}
                    <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Participating Bidders
                        </span>
                        <span className="text-xl font-extrabold text-emerald-400 font-mono">
                          {tenderSellers.length} Sellers
                        </span>
                      </div>

                      <button
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        aria-label={isExpanded ? 'Collapse Tender' : 'Expand Tender'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body: Bidders Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/50 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>Participating Bidders / Sellers for {tender.tenderNumber}</span>
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          Showing <strong>{tenderSellers.length}</strong> registered bidders
                        </span>
                      </div>

                      {tenderSellers.length === 0 ? (
                        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-xs">
                          No sellers or bidders registered for this tender yet.
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                  <th className="px-6 py-3">Seller Organization</th>
                                  <th className="px-6 py-3">Government IDs</th>
                                  <th className="px-6 py-3 text-center">Trust Score (0–100)</th>
                                  <th className="px-6 py-3">Verification Status</th>
                                  <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 text-slate-700">
                                {tenderSellers.map((seller) => (
                                  <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                      <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                        {seller.organizationName}
                                      </div>
                                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                                        ID: {seller.id} • Category: {seller.category || 'General Supplier'}
                                      </div>
                                    </td>

                                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                      <div><span className="text-slate-400">GSTIN:</span> {seller.gstin || 'N/A'}</div>
                                      <div><span className="text-slate-400">CIN/PAN:</span> {seller.cinOrPan || 'N/A'}</div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                      <div className={`text-base font-bold ${getScoreColor(seller.trustScore)}`}>
                                        {seller.trustScore !== undefined && seller.trustScore !== null ? `${seller.trustScore}%` : 'N/A'}
                                      </div>
                                      <div className="w-24 bg-slate-200 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                                        <div
                                          className={`h-full ${
                                            (seller.trustScore || 0) >= 80 ? 'bg-emerald-500' : (seller.trustScore || 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${seller.trustScore || 0}%` }}
                                        />
                                      </div>
                                    </td>

                                    <td className="px-6 py-4">
                                      {getStatusBadge(seller.verificationStatus)}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end space-x-2">
                                        <button
                                          onClick={(e) => handleRunVerification(seller.id, e)}
                                          title="Execute AI & Gov Connectors Pipeline"
                                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                        >
                                          <RefreshCw className="w-4 h-4" />
                                        </button>

                                        <Link
                                          to={`/sellers/${seller.id}`}
                                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition shadow-xs cursor-pointer"
                                        >
                                          <span>Inspect Profile</span>
                                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                        </Link>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ==================== FLAT SELLERS LIST VIEW ==================== */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Seller Organization</th>
                  <th className="px-6 py-3.5">Government IDs</th>
                  <th className="px-6 py-3.5 text-center">Trust Score (0–100)</th>
                  <th className="px-6 py-3.5">Verification Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {seller.organizationName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        ID: {seller.id} • Category: {seller.category || 'General Supplier'}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      <div><span className="text-slate-400">GSTIN:</span> {seller.gstin || 'N/A'}</div>
                      <div><span className="text-slate-400">CIN/PAN:</span> {seller.cinOrPan || 'N/A'}</div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className={`text-base font-bold ${getScoreColor(seller.trustScore)}`}>
                        {seller.trustScore !== undefined && seller.trustScore !== null ? `${seller.trustScore}%` : 'N/A'}
                      </div>
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            (seller.trustScore || 0) >= 80 ? 'bg-emerald-500' : (seller.trustScore || 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${seller.trustScore || 0}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(seller.verificationStatus)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => handleRunVerification(seller.id, e)}
                          title="Execute AI & Gov Connectors Pipeline"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/sellers/${seller.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition shadow-xs cursor-pointer"
                        >
                          <span>Inspect Profile</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </div>
                    </td>
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
