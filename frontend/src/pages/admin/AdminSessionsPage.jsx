/**
 * pages/admin/AdminSessionsPage.jsx
 *
 * Shinobi Candidate Simulation Sessions Auditor.
 * Displays candidate mock sessions, audio STT transcripts, AI ratings, and scores.
 */

import { useState, useEffect, useCallback } from 'react';
import { Trash2, ChevronLeft, ChevronRight, MessageSquare, CheckCircle2, AlertCircle, Clock, Eye, X } from 'lucide-react';
import { getAdminSessions, deleteAdminSession } from '@/services/admin.service';
import ShinobiAvatar from '@/components/common/ShinobiAvatar';
import { KatanaIcon, DojoIcon } from '@/components/ui/ShinobiIcons';
import Button from '@/components/ui/Button';
import { ConfirmDeleteModal } from '@/components/shared';
import toast from 'react-hot-toast';

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return <span className="text-secondary font-mono">—</span>;
  const color =
    score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' :
    score >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' :
    'text-rose-400 bg-rose-500/10 border-rose-500/25';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border font-mono font-bold text-xs ${color}`}>
      {score}%
    </span>
  );
}

function StatusBadge({ status }) {
  const badges = {
    started:     { label: 'Started', css: 'bg-brand-500/15 border-brand-500/30 text-brand-300' },
    in_progress: { label: 'In Progress', css: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
    completed:   { label: 'Completed', css: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
    abandoned:   { label: 'Abandoned', css: 'bg-rose-500/15 border-rose-500/30 text-rose-300' },
  };
  const match = badges[status] || { label: status, css: 'bg-surface border-subtle text-secondary' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase ${match.css}`}>
      {match.label}
    </span>
  );
}

export default function AdminSessionsPage() {
  const [data, setData]       = useState({ sessions: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [delItem, setDelItem] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getAdminSessions({ page, limit: 12 });
      setData(d);
    } catch { toast.error('Failed to load sessions'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleDelete = async (id) => {
    try {
      await deleteAdminSession(id);
      toast.success('Simulation session purged');
      setDelItem(null);
      fetchSessions();
    } catch { toast.error('Delete operation failed'); }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8 font-sans">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
            <KatanaIcon className="w-3 h-3" />
            <span>AI SIMULATION TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">Candidate Sessions</h1>
          <p className="text-secondary text-xs sm:text-sm font-mono mt-0.5">
            Audit live audio transcripts, AI fit scores, and candidate answer evaluations
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-mono font-bold text-white shadow-sm">
          Total: <span className="text-brand-400">{data.total || 0}</span> Runs
        </span>
      </header>

      {/* ── Sessions Table ───────────────────────────────────── */}
      <section aria-label="Sessions Table" className="bg-surface/95 backdrop-blur-2xl rounded-xl border border-subtle shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-subtle bg-surface/80 text-[11px] font-mono font-bold text-secondary uppercase tracking-wider">
                <th className="text-left px-4 py-3">Candidate</th>
                <th className="text-left px-4 py-3">Interview Track</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Fit Score</th>
                <th className="text-left px-4 py-3">Executed At</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/50 font-mono text-xs">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-surface rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-secondary text-xs">
                    No simulation sessions logged yet.
                  </td>
                </tr>
              ) : (
                data.sessions.map((sess) => (
                  <tr key={sess._id} className="hover:bg-surface/80 transition-colors">
                    {/* Candidate */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ShinobiAvatar user={sess.userId} size="xs" />
                        <div className="min-w-0">
                          <p className="text-white font-bold font-display truncate">{sess.userId?.name || 'Anonymous'}</p>
                          <p className="text-secondary text-[11px] truncate">{sess.userId?.email || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Track */}
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {sess.interviewId?.jobTitle || sess.interviewId?.title || 'General Engineering'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={sess.status} />
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3">
                      <ScoreBadge score={sess.overallScore} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-secondary text-[11px]">
                      {new Date(sess.createdAt).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDelItem(sess)}
                        className="p-1.5 rounded-lg text-secondary hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <footer className="flex items-center justify-between p-4 border-t border-subtle font-mono text-xs text-secondary">
          <span>Page {page} of {data.pages || 1}</span>
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

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(delItem)}
        title="Purge Simulation Session?"
        message={`Are you sure you want to permanently delete session for ${delItem?.userId?.name || 'candidate'}? This action cannot be undone.`}
        itemTitle={delItem?.title || `Session ${delItem?._id}`}
        confirmText="Confirm Purge"
        cancelText="Keep Session"
        onConfirm={() => handleDelete(delItem._id)}
        onClose={() => setDelItem(null)}
      />
    </div>
  );
}
