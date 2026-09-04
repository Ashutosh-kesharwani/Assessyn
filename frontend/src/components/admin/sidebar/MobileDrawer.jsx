/**
 * components/admin/sidebar/MobileDrawer.jsx
 *
 * Mobile sidebar drawer — slides in from the left on small screens.
 * Features:
 *  - Animated slide-in with backdrop overlay
 *  - Full sidebar content (via AdminSidebar)
 *  - Close button in header
 *  - Closes on backdrop click
 *  - Body scroll lock while open
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AssessynLogo from '@/components/common/AssessynLogo';

export default function MobileDrawer({ open, onClose }) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="
          fixed left-0 top-0 h-full w-64 z-50 lg:hidden
          bg-surface border-r border-subtle
          shadow-2xl
          animate-in slide-in-from-left duration-200
          flex flex-col justify-between overflow-hidden
        "
      >
        {/* Drawer header with close button */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-subtle">
          <AssessynLogo className="w-7 h-7" showText={true} />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface border border-subtle flex items-center justify-center
                       text-secondary hover:text-white hover:border-brand-500/40 transition-all cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-hidden">
          <AdminSidebar collapsed={false} onNavClick={onClose} />
        </div>
      </aside>
    </>
  );
}
