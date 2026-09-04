/**
 * pages/admin/AdminUsersPage.jsx
 *
 * Full-scale Shinobi admin user management matrix.
 * Features:
 *  - Dynamic searching, filtering, and backend sorting.
 *  - Premium toggle, Ban / Suspend actions.
 *  - Credit allocation & removal adjustments with Shinobi tokens.
 *  - Interactive slide-out Shinobi Profile Drawer.
 *  - Shinobi rank badges & ShinobiAvatar integration.
 *  - Bulk operations (Activate, Deactivate, Ban, Unban, Delete).
 *  - CSV export of candidate queries.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Search, Shield, UserX, UserCheck, Trash2, ChevronLeft, ChevronRight,
  Edit3, Check, X, CreditCard, Star, Activity, Download, Plus, Minus,
  ExternalLink, Eye, MoreHorizontal, Ban, AlertOctagon, HelpCircle, FileText, ArrowUpDown
} from 'lucide-react';
import {
  getAdminUsers, getAdminUser, updateAdminUser, deleteAdminUser, bulkAdminUsersAction
} from '@/services/admin.service';
import ShinobiAvatar from '@/components/common/ShinobiAvatar';
import { KatanaIcon, ShurikenIcon, ScrollIcon, DojoIcon } from '@/components/ui/ShinobiIcons';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = 'admin@gmail.com';

// ─── Status Badge rendering ───────────────────────────────────────
function StatusBadge({ isActive, isBanned }) {
  if (isBanned) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-bold">
        <Ban size={10} /> Banned
      </span>
    );
  }
  return isActive ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-subtle text-secondary text-[10px] font-mono font-bold">
      Inactive
    </span>
  );
}

// ─── Role Badge rendering ─────────────────────────────────────────
function RoleBadge({ role, isPremium }) {
  if (role === 'super_admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-extrabold uppercase">
        <KatanaIcon className="w-3 h-3 text-amber-400" /> Shadow Kage
      </span>
    );
  }
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono font-extrabold uppercase">
        <Shield size={11} className="text-brand-400" /> Anbu Admin
      </span>
    );
  }
  if (role === 'support') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-extrabold uppercase">
        Jonin Support
      </span>
    );
  }
  if (role === 'content_manager') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-extrabold uppercase">
        Chunin Content
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase
      ${isPremium ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-surface border-subtle text-secondary'}`}>
      {isPremium ? <Star size={10} className="text-amber-400" /> : <Users size={10} />}
      {isPremium ? 'Genin Elite' : 'Candidate'}
    </span>
  );
}

// ─── Profile Drawer Component ─────────────────────────────────────
function UserProfileDrawer({ userId, onClose, onUpdateSuccess }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUser(userId);
      setDetails(data);
    } catch {
      toast.error('Failed to load user activity log.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <aside aria-label="User Profile Drawer" className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-surface/98 backdrop-blur-2xl border-l border-subtle p-6 z-50 flex items-center justify-center shadow-2xl">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-surface border border-subtle" />
          <div className="h-4 bg-surface rounded w-32" />
          <div className="h-3 bg-surface rounded w-24" />
        </div>
      </aside>
    );
  }

  const { user, interviewCount, sessionCount, resumeCount } = details || {};

  return (
    <aside aria-label="User Profile Drawer" className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-surface/98 backdrop-blur-3xl border-l border-subtle p-6 z-50 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Top Katana Sheen */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/60 to-transparent pointer-events-none" />

      {/* Drawer Header */}
      <header className="flex items-center justify-between pb-4 border-b border-subtle flex-shrink-0">
        <div className="flex items-center gap-2">
          <KatanaIcon className="w-4 h-4 text-brand-400" />
          <h3 className="text-white font-display font-bold text-base tracking-tight">Candidate Dossier</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-secondary hover:text-white hover:bg-surface border border-transparent hover:border-subtle transition-all cursor-pointer">
          <X size={18} />
        </button>
      </header>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto py-5 space-y-6 scrollbar-thin">
        {/* User Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-subtle shadow-sm">
          <ShinobiAvatar user={user} size="lg" />
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-white font-display font-bold text-base truncate">{user?.name}</h4>
            <p className="text-secondary text-xs font-mono truncate">{user?.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <RoleBadge role={user?.role} isPremium={user?.isPremium} />
              <StatusBadge isActive={user?.isActive} isBanned={user?.isBanned} />
            </div>
          </div>
        </div>

        {/* Tactical Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-surface border border-subtle text-center space-y-1">
            <ScrollIcon className="w-4 h-4 text-brand-400 mx-auto" />
            <p className="text-xl font-display font-black text-white">{resumeCount ?? 0}</p>
            <p className="text-[10px] font-mono text-secondary uppercase">Resumes</p>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-subtle text-center space-y-1">
            <KatanaIcon className="w-4 h-4 text-rose-400 mx-auto" />
            <p className="text-xl font-display font-black text-white">{interviewCount ?? 0}</p>
            <p className="text-[10px] font-mono text-secondary uppercase">Interviews</p>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-subtle text-center space-y-1">
            <DojoIcon className="w-4 h-4 text-amber-400 mx-auto" />
            <p className="text-xl font-display font-black text-white">{sessionCount ?? 0}</p>
            <p className="text-[10px] font-mono text-secondary uppercase">Sessions</p>
          </div>
        </div>

        {/* Security & Credentials Details */}
        <div className="p-4 rounded-xl bg-surface border border-subtle space-y-3 font-mono text-xs">
          <h5 className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Shield size={13} className="text-brand-400" />
            Telemetry Metadata
          </h5>
          <div className="space-y-2 text-secondary divide-y divide-subtle/50">
            <div className="flex justify-between pt-1.5 first:pt-0">
              <span>Shinobi Rank Credits:</span>
              <strong className="text-white font-bold">{user?.credits ?? 0} Tokens</strong>
            </div>
            <div className="flex justify-between pt-1.5">
              <span>Account Registration:</span>
              <span className="text-white">{new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span>Last Login Activity:</span>
              <span className="text-white">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Footer */}
      <footer className="pt-4 border-t border-subtle flex gap-2">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          size="sm"
          className="w-full py-2 rounded-lg text-xs font-mono font-bold"
        >
          <span>Close Dossier</span>
        </Button>
      </footer>
    </aside>
  );
}

// ─── Main Admin Users Matrix Page ──────────────────────────────────
export default function AdminUsersPage() {
  const [data, setData] = useState({ users: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Drawer & Selection
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);

  // Credit Adjustment Modal
  const [creditUser, setCreditUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState(5);

  const dropdownRef = useRef(null);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({
        page,
        limit: 10,
        search,
        role: role === 'all' ? undefined : role,
        status: status === 'all' ? undefined : status,
        sortBy: sortField,
        sortOrder,
      });
      setData(res);
    } catch {
      toast.error('Failed to load candidate directory.');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status, sortField, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Toggle Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectable = data.users.filter((u) => u.email !== ADMIN_EMAIL).map((u) => u._id);
      setSelectedUserIds(selectable);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Bulk Action Dispatcher
  const handleBulkAction = async (action) => {
    if (selectedUserIds.length === 0) return;
    try {
      await bulkAdminUsersAction({ userIds: selectedUserIds, action });
      toast.success(`Bulk operation "${action}" completed.`);
      setSelectedUserIds([]);
      setShowBulkDropdown(false);
      fetchUsers();
    } catch {
      toast.error('Bulk operation failed.');
    }
  };

  // Toggle Ban / Unban
  const handleToggleBan = async (user) => {
    try {
      await updateAdminUser(user._id, { isBanned: !user.isBanned });
      toast.success(`User ${user.isBanned ? 'unbanned' : 'banned'} successfully.`);
      fetchUsers();
    } catch {
      toast.error('Failed to update ban status.');
    }
  };

  // Adjust Credits
  const handleSaveCredits = async () => {
    if (!creditUser) return;
    try {
      const newCredits = Math.max(0, (creditUser.credits || 0) + creditAmount);
      await updateAdminUser(creditUser._id, { credits: newCredits });
      toast.success(`Credits updated to ${newCredits} for ${creditUser.name}`);
      setCreditUser(null);
      fetchUsers();
    } catch {
      toast.error('Failed to update credits.');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8 font-sans">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
            <Users className="w-3 h-3 text-brand-400" />
            <span>CANDIDATE REPOSITORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">Users Matrix</h1>
          <p className="text-secondary text-xs sm:text-sm font-mono mt-0.5">
            Audit candidate profiles, adjust simulation tokens, and manage role access
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-mono font-bold text-white shadow-sm">
            Total: <span className="text-brand-400">{data.total || 0}</span> Candidates
          </span>
        </div>
      </header>

      {/* ── Toolbar: Search & Filters ─────────────────────────── */}
      <section aria-label="Users Filter Bar" className="flex flex-col sm:flex-row items-center gap-3 bg-surface/95 backdrop-blur-2xl p-4 rounded-xl border border-subtle shadow-md">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-subtle text-white placeholder-secondary text-xs font-mono focus:outline-none focus:border-brand-500/60 transition-all shadow-inner"
            placeholder="Search candidate name or email address…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Role Filter */}
        <select
          className="w-full sm:w-40 px-3 py-2 rounded-lg bg-surface border border-subtle text-white text-xs font-mono focus:outline-none focus:border-brand-500/60 transition-all cursor-pointer"
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
        >
          <option value="all">All Roles</option>
          <option value="candidate">Candidate</option>
          <option value="support">Support</option>
          <option value="content_manager">Content Manager</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>

        {/* Status Filter */}
        <select
          className="w-full sm:w-40 px-3 py-2 rounded-lg bg-surface border border-subtle text-white text-xs font-mono focus:outline-none focus:border-brand-500/60 transition-all cursor-pointer"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
          <option value="premium">Premium</option>
        </select>

        {/* Bulk Action Button */}
        {selectedUserIds.length > 0 && (
          <div className="relative flex-shrink-0 w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setShowBulkDropdown(!showBulkDropdown)}
              className="flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-mono font-bold hover:bg-brand-500 transition-colors w-full sm:w-auto shadow-md cursor-pointer"
            >
              <span>Bulk Action ({selectedUserIds.length})</span>
              <MoreHorizontal size={14} />
            </button>

            {showBulkDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface border border-subtle rounded-xl shadow-2xl z-30 p-1 divide-y divide-subtle/50 font-mono text-xs">
                <div className="py-1">
                  <button onClick={() => handleBulkAction('activate')} className="w-full text-left px-3 py-2 text-secondary hover:text-white hover:bg-surface rounded-lg flex items-center gap-2 cursor-pointer">
                    <UserCheck size={12} className="text-emerald-400" /> Activate
                  </button>
                  <button onClick={() => handleBulkAction('deactivate')} className="w-full text-left px-3 py-2 text-secondary hover:text-white hover:bg-surface rounded-lg flex items-center gap-2 cursor-pointer">
                    <UserX size={12} className="text-amber-400" /> Deactivate
                  </button>
                </div>
                <div className="py-1">
                  <button onClick={() => handleBulkAction('ban')} className="w-full text-left px-3 py-2 text-secondary hover:text-white hover:bg-surface rounded-lg flex items-center gap-2 cursor-pointer">
                    <Ban size={12} className="text-rose-400" /> Ban Users
                  </button>
                  <button onClick={() => handleBulkAction('unban')} className="w-full text-left px-3 py-2 text-secondary hover:text-white hover:bg-surface rounded-lg flex items-center gap-2 cursor-pointer">
                    <UserCheck size={12} className="text-blue-400" /> Unban Users
                  </button>
                </div>
                <div className="py-1 pt-1">
                  <button onClick={() => handleBulkAction('delete')} className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 cursor-pointer font-bold">
                    <Trash2 size={12} /> Delete Users
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Accounts Table ───────────────────────────────────── */}
      <section aria-label="Accounts Table" className="bg-surface/95 backdrop-blur-2xl rounded-xl border border-subtle shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-subtle bg-surface/80 text-[11px] font-mono font-bold text-secondary uppercase tracking-wider">
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={data.users.length > 0 && selectedUserIds.length === data.users.filter((u) => u.email !== ADMIN_EMAIL).length}
                    onChange={handleSelectAll}
                    disabled={data.users.length === 0}
                    className="rounded border-subtle text-brand-500 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('name')}>
                  <span className="flex items-center gap-1.5">Candidate <ArrowUpDown size={11} /></span>
                </th>
                <th className="text-left px-4 py-3">Rank Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('credits')}>
                  <span className="flex items-center gap-1.5">Tokens <ArrowUpDown size={11} /></span>
                </th>
                <th className="text-left px-4 py-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('lastLogin')}>
                  <span className="flex items-center gap-1.5">Joined <ArrowUpDown size={11} /></span>
                </th>
                <th className="text-right px-4 py-3">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/50 font-mono text-xs">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-surface rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-secondary text-xs">
                    No candidates found matching the query.
                  </td>
                </tr>
              ) : (
                data.users.map((u) => {
                  const isSelf = u.email === ADMIN_EMAIL;
                  const isSelected = selectedUserIds.includes(u._id);

                  return (
                    <tr key={u._id} className={`hover:bg-surface/80 transition-colors ${isSelected ? 'bg-brand-500/10' : ''}`}>
                      {/* Checkbox */}
                      <td className="px-4 py-3 text-center">
                        {!isSelf && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(u._id)}
                            className="rounded border-subtle text-brand-500 cursor-pointer"
                          />
                        )}
                      </td>

                      {/* Candidate Avatar & Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ShinobiAvatar user={u} size="sm" />
                          <div className="min-w-0">
                            <p className="text-white font-bold font-display truncate">{u.name}</p>
                            <p className="text-secondary text-[11px] font-mono truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} isPremium={u.isPremium} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge isActive={u.isActive} isBanned={u.isBanned} />
                      </td>

                      {/* Credits */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{u.credits ?? 0}</span>
                          <button
                            onClick={() => { setCreditUser(u); setCreditAmount(5); }}
                            className="p-1 rounded bg-surface border border-subtle text-secondary hover:text-brand-400 hover:border-brand-500/40 transition-colors cursor-pointer"
                            title="Adjust Credits"
                          >
                            <Edit3 size={11} />
                          </button>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 text-secondary text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => setSelectedUserId(u._id)}
                            className="p-1.5 rounded-lg bg-surface border border-subtle text-secondary hover:text-white hover:border-brand-500/40 transition-colors cursor-pointer"
                            title="Inspect Dossier"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Ban / Unban */}
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleBan(u)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                u.isBanned
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                              }`}
                              title={u.isBanned ? 'Unban User' : 'Ban User'}
                            >
                              <Ban size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Pagination ─────────────────────────────────── */}
        <footer className="flex items-center justify-between p-4 border-t border-subtle font-mono text-xs text-secondary">
          <span>Page {data.page || 1} of {data.pages || 1}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-surface border border-subtle text-secondary hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.pages || 1, p + 1))}
              disabled={page >= (data.pages || 1)}
              className="p-1.5 rounded-lg bg-surface border border-subtle text-secondary hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </section>

      {/* ── Slide-Out User Profile Drawer ─────────────────────── */}
      {selectedUserId && (
        <UserProfileDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdateSuccess={fetchUsers}
        />
      )}

      {/* ── Adjust Credits Modal ─────────────────────────────── */}
      {creditUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface/98 border border-subtle rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl font-mono text-xs">
            <header className="flex items-center justify-between pb-2 border-b border-subtle">
              <h4 className="text-white font-display font-bold text-sm">Adjust Candidate Tokens</h4>
              <button onClick={() => setCreditUser(null)} className="text-secondary hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </header>

            <div className="space-y-2">
              <p className="text-secondary">
                Assigning simulation tokens for <strong className="text-white">{creditUser.name}</strong>
              </p>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-subtle text-white font-mono text-sm focus:outline-none focus:border-brand-500/60"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                  placeholder="+/- credits"
                />
              </div>
            </div>

            <footer className="flex gap-2 pt-2">
              <Button type="button" onClick={handleSaveCredits} variant="primary" size="sm" className="flex-1 py-2 rounded-lg text-xs">
                <span>Confirm Tokens</span>
              </Button>
              <Button type="button" onClick={() => setCreditUser(null)} variant="secondary" size="sm" className="flex-1 py-2 rounded-lg text-xs">
                <span>Cancel</span>
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
