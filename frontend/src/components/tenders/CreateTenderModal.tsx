import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, PlusCircle, Building2 } from 'lucide-react';

interface CreateTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTenderModal: React.FC<CreateTenderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('Central Water Commission');
  const [category, setCategory] = useState('Industrial Equipment');
  const [estimatedValueCr, setEstimatedValueCr] = useState('5.00');
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Tender Title is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage('Creating Tender Record in Database...');

    try {
      const estimatedValue = parseFloat(estimatedValueCr || '5') * 10000000;
      
      // 1. Create Tender in DB
      const createdTender = await apiService.createTender({
        title,
        description,
        issuingAuthority,
        category,
        estimatedValue,
      });

      setStatusMessage('Tender created. Uploading Document & Running OCR Parsing Engine...');

      // 2. Upload Document & Run OCR Ingestion
      if (file) {
        await apiService.uploadDocument(file, createdTender.id);
      }

      setStatusMessage('Extracted OCR Requirements & Document Persisted Successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to create tender and upload document.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create Tender & Process OCR Document</h2>
            <p className="text-xs text-slate-500">Upload tender specification to extract compliance requirements into DB.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && isSubmitting && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tender Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Procurement of High-Capacity Centrifugal Water Pumps"
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Authority</label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="Central Water Commission"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Industrial Equipment"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Value (₹ Crores)</label>
            <input
              type="number"
              step="0.01"
              value={estimatedValueCr}
              onChange={(e) => setEstimatedValueCr(e.target.value)}
              placeholder="5.00"
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tender Specification PDF Document</label>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 rounded-xl p-4 text-center cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center space-y-1">
                <Upload className="w-6 h-6 text-slate-400" />
                {file ? (
                  <span className="text-xs font-bold text-emerald-600">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                ) : (
                  <span className="text-xs text-slate-600">Click or drag & drop Tender Document PDF for OCR parsing</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Tender & Document...' : 'Create Tender & Run OCR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
