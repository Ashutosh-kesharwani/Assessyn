/**
 * layouts/AdminLayout.jsx
 *
 * The root Shinobi shell for all admin pages.
 * Composed of:
 *  - Desktop: collapsible Shinobi sidebar + topbar + page content
 *  - Mobile: mobile drawer overlay + topbar
 */

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import AdminSidebar from '@/components/admin/sidebar/AdminSidebar';
import MobileDrawer from '@/components/admin/sidebar/MobileDrawer';
import AdminTopbar  from '@/components/admin/topbar/AdminTopbar';
import ParticleCanvas from '@/components/ui/ParticleCanvas';

// ─── Persist helpers ──────────────────────────────────────────────
const getStored = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => getStored('admin-sidebar-collapsed', false));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Close mobile drawer on resize to lg+
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const sidebarW = collapsed ? 'w-[74px]' : 'w-[250px]';

  return (
    <div className="flex h-screen overflow-hidden bg-app text-primary select-none font-sans relative">
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside
        className={`
          hidden lg:flex flex-col flex-shrink-0
          ${sidebarW}
          transition-all duration-300 ease-in-out
          bg-surface/95 backdrop-blur-2xl border-r border-subtle
          relative z-30 shadow-2xl
        `}
      >
        {/* Top Katana Edge Sheen Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/60 to-transparent pointer-events-none" />

        {/* Sidebar content */}
        <div className="h-full flex flex-col justify-between">
          <AdminSidebar collapsed={collapsed} onNavClick={() => {}} />
        </div>

        {/* Collapse toggle button — floats on the right edge */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            absolute -right-3 top-20 z-40
            w-6 h-6 rounded-full flex items-center justify-center
            bg-surface border border-subtle text-secondary hover:text-white hover:border-brand-500/50
            transition-all duration-200 shadow-lg cursor-pointer
          "
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* ── Main Content Area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Topbar */}
        <AdminTopbar
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
