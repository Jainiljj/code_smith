import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string>('QUEUED');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const startUpload = () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setProgress(15);
    setStage('Uploading Document to S3 Object Storage...');

    // Simulate async job pipeline stages (Uploading -> Parsing -> Chunking -> Indexing -> Completed)
    setTimeout(() => {
      setProgress(45);
      setStage('PyMuPDF Extracting Pages & Text...');
    }, 800);

    setTimeout(() => {
      setProgress(75);
      setStage('Vector Engine Indexing Chunks...');
    }, 1600);

    setTimeout(() => {
      setProgress(100);
      setStage('Completed');
      setUploading(false);
      setCompleted(true);
      if (onSuccess) onSuccess();
    }, 2400);
  };

  const resetModal = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setStage('QUEUED');
    setCompleted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-6 relative">
        <button
          onClick={resetModal}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-900">Upload Bid / Tender Document</h2>
          <p className="text-xs text-slate-500 mt-1">Upload PDF, DOCX, or XLSX documents for RAG evidence extraction.</p>
        </div>

        {!completed ? (
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 bg-slate-50'
              }`}
            >
              <input
                type="file"
                id="fileInput"
                accept=".pdf,.docx,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="fileInput" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{file.name}</span>
                    <span className="text-xs text-slate-500 block font-mono mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'application/pdf'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">
                      Drag & Drop files here or <span className="text-blue-600 underline">browse</span>
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">Supported formats: PDF, DOCX, XLSX (Max 50MB)</span>
                  </div>
                )}
              </label>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {stage}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={resetModal}
                disabled={uploading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={startUpload}
                disabled={!file || uploading}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition shadow-sm flex items-center gap-2"
              >
                {uploading ? 'Processing...' : 'Upload & Process Ingestion'}
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900">Document Processed Successfully</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Parsed text chunks & PyMuPDF page metadata indexed into RAG vector store.
              </p>
            </div>
            <button
              onClick={resetModal}
              className="bg-emerald-600 text-white text-xs font-semibold px-5 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
