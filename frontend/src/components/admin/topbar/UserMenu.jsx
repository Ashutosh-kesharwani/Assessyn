/**
 * components/admin/topbar/UserMenu.jsx
 *
 * Admin user menu dropdown with ShinobiAvatar and Shinobi rank tier chips.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Settings, LogOut, ChevronDown, Shield, User } from 'lucide-react';
import { useAdminAuth } from '@/context';
import ShinobiAvatar from '@/components/common/ShinobiAvatar';
import { KatanaIcon } from '@/components/ui/ShinobiIcons';

export default function UserMenu() {
  const [open, setOpen]         = useState(false);
  const [loggingOut, setLogout] = useState(false);
  const dropdownRef             = useRef(null);
  const navigate                = useNavigate();

  const { admin, isSuperAdmin, adminRole, adminLogout } = useAdminAuth();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setLogout(true);
    await adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        id="admin-user-menu-btn"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl
                   bg-surface border border-subtle hover:border-brand-500/40
                   transition-all duration-200 group cursor-pointer"
        aria-label="Admin user menu"
      >
        <ShinobiAvatar user={admin} size="xs" />

        {/* Name + role */}
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-white text-xs font-bold truncate max-w-[100px] font-display">
            {admin?.name ?? 'Admin'}
          </p>
          <p className="text-[9.5px] font-mono font-black text-brand-400 truncate">
            {isSuperAdmin ? 'SHADOW KAGE' : 'ANBU ADMIN'}
          </p>
        </div>

        <ChevronDown
          size={12}
          className={`text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="
          absolute right-0 top-full mt-2 w-64
          bg-surface/98 backdrop-blur-3xl border border-subtle rounded-xl shadow-2xl
          overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150
        ">
          {/* Profile header */}
          <div className="px-4 py-3.5 border-b border-subtle space-y-2">
            <div className="flex items-center gap-3">
              <ShinobiAvatar user={admin} size="sm" />
              <div className="min-w-0">
                <p className="text-white text-xs font-bold font-display truncate">{admin?.name}</p>
                <p className="text-secondary text-[10.5px] font-mono truncate">{admin?.email}</p>
              </div>
            </div>

            {/* Role badge */}
            <div className="pt-1">
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md
                                 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-black uppercase tracking-wider">
                  <KatanaIcon className="w-3 h-3 text-amber-400" />
                  <span>SHADOW KAGE (SUPER ADMIN)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md
                                 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono font-black uppercase tracking-wider">
                  <Shield size={11} className="text-brand-400" />
                  <span>ANBU ADMIN</span>
                </span>
              )}
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5 space-y-1">
            <button
              onClick={() => { navigate('/admin/settings'); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                         text-secondary hover:text-white hover:bg-surface
                         text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Settings size={14} className="text-brand-400" />
              <span>Engine Settings</span>
            </button>

            <div className="border-t border-subtle pt-1">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                           text-secondary hover:text-rose-400 hover:bg-rose-500/10
                           text-xs font-mono font-bold transition-all disabled:opacity-60 cursor-pointer"
              >
                <LogOut size={14} />
                <span>{loggingOut ? 'De-authenticating…' : 'Sign Out Console'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
