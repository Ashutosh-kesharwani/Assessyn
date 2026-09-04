import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemTitle = '',
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  loading = false,
  isLoading = false,
  variant = 'danger',
}) {
  const isBusy = loading || isLoading;

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isBusy) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBusy, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none font-sans">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isBusy ? onClose : undefined}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.article
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-md bg-[#0e0e1a] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative z-10 overflow-hidden space-y-5"
          >
            {/* Top Crimson Edge Highlight */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/80 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              aria-label="Close modal"
              className="absolute top-5 right-5 p-2 rounded-xl text-secondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Title */}
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1 min-w-0 pr-6">
                <span className="text-[10px] font-mono font-extrabold text-rose-400 uppercase tracking-widest block">
                  // DELETION CONFIRMATION
                </span>
                <h2 className="text-xl font-display font-black text-white leading-tight">
                  {title}
                </h2>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-xs sm:text-sm text-secondary leading-relaxed font-sans">
              {message}
            </p>

            {/* Target Item Name Chip */}
            {itemTitle && (
              <div className="p-3 rounded-2xl bg-surface/90 border border-subtle text-xs font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                <span className="truncate font-semibold">{itemTitle}</span>
              </div>
            )}

            {/* Action Buttons */}
            <footer className="grid grid-cols-2 gap-3 pt-2 font-mono">
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
                disabled={isBusy}
                className="w-full font-bold text-xs"
              >
                <span>{cancelText}</span>
              </Button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isBusy}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/20 border border-rose-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBusy ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isBusy ? 'Deleting...' : confirmText}</span>
              </button>
            </footer>
          </motion.article>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDeleteModal;
