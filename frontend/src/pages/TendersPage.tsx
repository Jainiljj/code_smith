import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/api';
import { Tender } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { CreateTenderModal } from '../components/tenders/CreateTenderModal';
import {
  FileText,
  Plus,
  CheckCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  Tag,
  Calendar,
  Layers,
  X,
} from 'lucide-react';

export const TendersPage: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Expanded Capsules state (set of expanded tender IDs)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTenders();
      setTenders(data);
      // Expand the first tender by default if available
      if (data.length > 0) {
        setExpandedIds(new Set([data[0].id]));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tenders list');
    } finally {
      setLoading(false);
    }
  }

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>();
    tenders.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats);
  }, [tenders]);

  // Extract unique statuses for filter
  const statuses = useMemo(() => {
    const st = new Set<string>();
    tenders.forEach((t) => {
      if (t.status) st.add(t.status);
    });
    return Array.from(st);
  }, [tenders]);

  // Filtered Tenders
  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      const matchesSearch =
        searchTerm === '' ||
        t.tenderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.issuingAuthority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || t.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'ALL' || t.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tenders, searchTerm, selectedCategory, selectedStatus]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredTenders.map((t) => t.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        <p className="text-sm font-medium text-slate-500">Loading tenders repository...</p>
      </div>
    );
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            GeM Tenders & Compliance Specifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse active procurement tenders, view extracted criteria matrix, and manage bid evaluation specifications.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-500 active:bg-emerald-700 transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
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

      {/* Toolbar: Search, Filters, Stats & Expand Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tender #, title, authority or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-slate-900 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All Statuses</option>
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Expand / Collapse All Controls */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs bg-slate-50">
              <button
                onClick={expandAll}
                className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 border-r border-slate-200 font-medium transition cursor-pointer"
                title="Expand all capsules"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
                title="Collapse all capsules"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filters Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900">{filteredTenders.length}</strong> of{' '}
            <strong className="text-slate-900">{tenders.length}</strong> tenders
          </span>
          {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tenders Capsule List */}
      {filteredTenders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No tenders match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filter selections, or create a new tender.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTenders.map((tender) => {
            const isExpanded = expandedIds.has(tender.id);
            const reqCount = tender.requirements ? tender.requirements.length : 0;
            const mandatoryCount = tender.requirements
              ? tender.requirements.filter((r) => r.isMandatory).length
              : 0;

            return (
              <div
                key={tender.id}
                className={`bg-white rounded-xl border transition-all duration-200 shadow-sm overflow-hidden ${
                  isExpanded ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Big Capsule Header (Clickable) */}
                <div
                  onClick={() => toggleExpand(tender.id)}
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
                      {tender.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          Created {new Date(tender.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Capsule Right Side: Est Value + Req Badge + Toggle Icon */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Est. Value
                      </span>
                      <span className="text-xl font-extrabold text-white font-mono">
                        ₹{(tender.estimatedValue / 10000000).toFixed(2)} Cr
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-center">
                        <span className="text-xs font-bold text-emerald-400 block">{reqCount}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Criteria</span>
                      </div>

                      <button
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        aria-label={isExpanded ? 'Collapse Tender' : 'Expand Tender'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50">
                    {/* Description Summary Bar */}
                    {tender.description && (
                      <div className="p-4 bg-white border-b border-slate-200 text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900 font-semibold uppercase tracking-wider text-[11px] block mb-1">
                          Tender Scope & Description:
                        </strong>
                        {tender.description}
                      </div>
                    )}

                    {/* Requirements Matrix Header & Quick Stats */}
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Extracted Compliance Requirements Matrix
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                            Mandatory: <strong>{mandatoryCount}</strong>
                          </span>
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-medium">
                            Optional: <strong>{reqCount - mandatoryCount}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Matrix Table */}
                      {reqCount === 0 ? (
                        <div className="p-8 bg-white rounded-lg border border-slate-200 text-center text-slate-500 text-xs">
                          No compliance criteria extracted for this tender document yet.
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                                <tr>
                                  <th className="py-3 px-4 w-28">Code</th>
                                  <th className="py-3 px-4 w-36">Category</th>
                                  <th className="py-3 px-4">Requirement Specification</th>
                                  <th className="py-3 px-4 w-28">Type</th>
                                  <th className="py-3 px-4 w-40">Threshold / Value</th>
                                  <th className="py-3 px-4 w-28 text-center">Mandatory</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                                {tender.requirements.map((req) => (
                                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-4 font-bold text-blue-600 whitespace-nowrap">
                                      {req.reqCode}
                                    </td>
                                    <td className="py-3 px-4 font-sans">
                                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px] border border-slate-200">
                                        {req.category}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 font-sans text-slate-800 leading-relaxed max-w-md">
                                      {req.rawText}
                                    </td>
                                    <td className="py-3 px-4 text-slate-500 uppercase text-[11px]">
                                      {req.reqType}
                                    </td>
                                    <td className="py-3 px-4 font-bold text-slate-900">
                                      {req.threshold !== undefined && req.threshold !== null ? (
                                        <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-200">
                                          {req.operator || ''} {req.threshold} {req.unit || ''}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 font-sans font-normal">—</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      {req.isMandatory ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-sans font-semibold text-[11px]">
                                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Mandatory
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 font-sans text-[11px]">Optional</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
