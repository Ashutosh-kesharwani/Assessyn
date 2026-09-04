import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileCode, Download, ZoomIn, ZoomOut, Eye, CheckCircle2 } from 'lucide-react';
import UniversalResumeRenderer from './ResumeTemplates';

/**
 * 👁️ Dedicated Rezi-Grade A4 Resume Preview Modal
 * Allows candidates to inspect their exact printed document before downloading.
 */
export default function ResumePreviewModal({
  isOpen,
  onClose,
  templateId,
  data,
  density = 'standard',
  pageCount = 1,
  onDownloadPdf,
  onDownloadWord,
  isDownloadingPdf = false,
  isDownloadingWord = false,
}) {
  const [zoom, setZoom] = useState(100);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex flex-col justify-between bg-black/85 backdrop-blur-md overflow-hidden font-sans select-none animate-in fade-in duration-200">
        {/* Top Control Bar */}
        <header className="px-4 py-3 bg-[#0d0f18]/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-20 shadow-xl">
          {/* Title & Page Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/40">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-display font-black text-white">
                  Document Print & Download Preview
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  {pageCount === 1 ? '1 Page (100% Fit)' : `${pageCount} Pages`}
                </span>
              </div>
              <p className="text-[11px] font-mono text-secondary">
                Exact pixel-perfect representation of your final PDF & Word (.docx) file.
              </p>
            </div>
          </div>

          {/* Center Zoom Controls */}
          <div className="flex items-center gap-1.5 bg-surface border border-subtle rounded-xl p-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(60, z - 10))}
              className="p-1 rounded-lg hover:bg-white/10 text-secondary hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-2 font-bold text-white min-w-[48px] text-center text-[11px]">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(140, z + 10))}
              className="p-1 rounded-lg hover:bg-white/10 text-secondary hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <div className="h-3 w-[1px] bg-white/20 mx-1" />
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="px-2 py-0.5 rounded-md hover:bg-white/10 text-[10px] text-secondary hover:text-white transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Download Word */}
            <button
              type="button"
              disabled={isDownloadingWord}
              onClick={onDownloadWord}
              className="py-2 px-3.5 rounded-xl bg-surface border border-subtle hover:border-blue-400 text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>{isDownloadingWord ? 'Generating...' : 'Download Word'}</span>
            </button>

            {/* Download PDF */}
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={onDownloadPdf}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-display font-black text-xs tracking-wide shadow-lg shadow-brand-500/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-secondary hover:text-white transition-all cursor-pointer"
              title="Close preview (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Preview Viewport Canvas */}
        <main className="flex-1 overflow-auto p-6 sm:p-10 flex justify-center items-start bg-[#05060b]">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full max-w-[794px] bg-white text-slate-900 shadow-[0_25px_80px_rgba(0,0,0,0.95)] rounded-sm overflow-hidden"
          >
            {/* Pristine Document Renderer with no edit handles */}
            <UniversalResumeRenderer
              templateId={templateId}
              data={data}
              density={density}
              readOnly={true}
            />
          </div>
        </main>
      </div>
    </AnimatePresence>,
    document.body
  );
}
