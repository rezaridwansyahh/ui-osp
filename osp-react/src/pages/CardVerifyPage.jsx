import { useState, useRef } from 'react';
import {
  Download,
  UploadCloud,
  CheckCircle,
  FileSpreadsheet,
  Send,
  Trash2,
  Check,
  FileCheck,
  X,
} from 'lucide-react';
import { useShowToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import StepProgress from '../components/ui/StepProgress';
import { formatBytes } from '../utils/helpers';

const STEPS = [
  { label: 'Download Template', icon: Download },
  { label: 'Upload File', icon: UploadCloud },
  { label: 'Submit', icon: CheckCircle },
];

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPT_EXT = ['.csv', '.xlsx', '.xls'];

const TEMPLATE_HEADERS = ['MemberID', 'CardNumber', 'IssueDate', 'ExpiryDate'];

function downloadCsvTemplate() {
  const headerLine = TEMPLATE_HEADERS.map((h) => `"${h}"`).join(',');
  const csv = `${headerLine}\n"","","",""\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'card_verify_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function fileLooksAllowed(file) {
  const name = file.name.toLowerCase();
  return ACCEPT_EXT.some((ext) => name.endsWith(ext));
}

export default function CardVerifyPage() {
  const showToast = useShowToast();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  /** Key buat replay animasi progress bar tiap ganti file */
  const [progressAnimKey, setProgressAnimKey] = useState(0);

  const assignFile = (next) => {
    if (!next) return;
    if (!fileLooksAllowed(next)) {
      showToast('File must be .csv, .xlsx, or .xls.', 'error');
      return;
    }
    if (next.size > MAX_FILE_BYTES) {
      showToast('Maximum file size is 10MB.', 'error');
      return;
    }
    setFile(next);
    setCurrentStep(2);
    setProgressAnimKey((k) => k + 1);
  };

  const clearFile = () => {
    setFile(null);
    setCurrentStep(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    assignFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    assignFile(f);
  };

  const onDownloadTemplate = () => {
    downloadCsvTemplate();
    showToast('Template downloaded.', 'success');
  };

  const openConfirm = () => {
    if (!file) {
      showToast('Please choose a file first.', 'error');
      return;
    }
    setConfirmOpen(true);
  };

  const closeConfirm = () => setConfirmOpen(false);

  const handleConfirmSubmit = () => {
    closeConfirm();
    setCurrentStep(3);
    showToast('File submitted successfully!', 'success');
    // Reset alur setelah feedback step 3 (seperti versi HTML)
    window.setTimeout(() => {
      clearFile();
    }, 1500);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Stepper alur: unduh → upload → submit */}
      <StepProgress steps={STEPS} currentStep={currentStep} />

      {/* Kartu unduh template CSV */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900">Download Format Template</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Download template CSV terlebih dahulu, isi datanya, lalu upload file yang sudah lengkap.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TEMPLATE_HEADERS.map((col) => (
                <span
                  key={col}
                  className="text-[10px] font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
          <Button
            type="button"
            variant="success"
            icon={Download}
            className="flex-shrink-0"
            onClick={onDownloadTemplate}
          >
            Download Template
          </Button>
        </div>
      </div>

      {/* Zona upload + pratinjau file */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Upload Card Verify File</h3>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={onInputChange}
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`upload-area border-2 border-dashed border-gray-200 rounded-xl p-8 sm:p-12 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 ${
            dragOver ? 'drag-over' : ''
          }`}
        >
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-7 h-7 text-violet-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            Click to choose a file, or drag &amp; drop here
          </p>
          <p className="text-xs text-gray-400 mt-1.5 mb-3">Maximum file size: 10MB</p>
          <div className="flex justify-center gap-2">
            {['.xlsx', '.xls', '.csv'].map((ext) => (
              <span
                key={ext}
                className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full"
              >
                {ext}
              </span>
            ))}
          </div>
        </div>

        <div className={`file-card ${file ? 'visible' : ''}`}>
          {file && (
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    <Check className="w-3 h-3" />
                    Ready
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{formatBytes(file.size)}</p>
                <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    key={progressAnimKey}
                    className="h-full bg-emerald-500 rounded-full progress-fill"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-5">
          <Button
            type="button"
            icon={Send}
            disabled={!file}
            onClick={openConfirm}
          >
            Submit File
          </Button>
          <Button
            type="button"
            variant="outline"
            icon={Trash2}
            disabled={!file}
            onClick={clearFile}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Modal konfirmasi sebelum kirim */}
      <div
        className={`confirm-overlay fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4 ${
          confirmOpen ? 'open' : ''
        }`}
        id="confirmModal"
        aria-hidden={!confirmOpen}
      >
        <div className="confirm-box bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-7 h-7 text-violet-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Confirm Submission</h3>
          <p className="text-sm text-gray-500 mt-1.5">
            Are you sure you want to submit this file for card verification?
          </p>
          {file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-2.5 justify-center">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-800 truncate">{file.name}</span>
            </div>
          )}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={closeConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors shadow-sm"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
