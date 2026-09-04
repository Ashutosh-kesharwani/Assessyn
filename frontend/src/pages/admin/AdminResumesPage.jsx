/**
 * pages/admin/AdminResumesPage.jsx
 *
 * Shinobi Candidate Resume & ATS Parser Auditor.
 */

import { useState, useEffect, useCallback } from 'react';
import { Trash2, ChevronLeft, ChevronRight, FileText, ExternalLink, Download, Eye, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { getAdminResumes, deleteAdminResume } from '@/services/admin.service';
import ShinobiAvatar from '@/components/common/ShinobiAvatar';
import { ScrollIcon, KatanaIcon } from '@/components/ui/ShinobiIcons';
import Button from '@/components/ui/Button';
import { ConfirmDeleteModal } from '@/components/shared';
import toast from 'react-hot-toast';

function ParseBadge({ status }) {
  const map = {
    parsed:     { label: 'ATS Parsed', css: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
    processing: { label: 'Analyzing',  css: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
    failed:     { label: 'Failed',     css: 'bg-rose-500/15 border-rose-500/30 text-rose-300' },
    pending:    { label: 'Pending',    css: 'bg-surface border-subtle text-secondary' },
  };
  const match = map[status] || { label: status, css: 'bg-surface border-subtle text-secondary' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase ${match.css}`}>
      {match.label}
    </span>
  );
}

export default function AdminResumesPage() {
  const [data, setData]       = useState({ resumes: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [delItem, setDelItem] = useState(null);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getAdminResumes({ page, limit: 12 });
      setData(d);
    } catch { toast.error('Failed to load resumes'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const handleDelete = async (id) => {
    try {
      await deleteAdminResume(id);
      toast.success('Candidate resume removed');
      setDelItem(null);
      fetchResumes();
    } catch { toast.error('Delete operation failed'); }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8 font-sans">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
            <ScrollIcon className="w-3.5 h-3.5 text-brand-400" />
            <span>ATS PARSING VAULT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">Candidate Resumes</h1>
          <p className="text-secondary text-xs sm:text-sm font-mono mt-0.5">
            Audit uploaded resumes, skill extractions, and neural ATS parse diagnostics
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-mono font-bold text-white shadow-sm">
          Total: <span className="text-brand-400">{data.total || 0}</span> Resumes
        </span>
      </header>

      {/* ── Resumes Table ─────────────────────────────────────── */}
      <section aria-label="Resumes Table" className="bg-surface/95 backdrop-blur-2xl rounded-xl border border-subtle shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-subtle bg-surface/80 text-[11px] font-mono font-bold text-secondary uppercase tracking-wider">
                <th className="text-left px-4 py-3">Candidate</th>
                <th className="text-left px-4 py-3">Resume Document</th>
                <th className="text-left px-4 py-3">ATS State</th>
                <th className="text-left px-4 py-3">Skills Detected</th>
                <th className="text-left px-4 py-3">Uploaded At</th>
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
              ) : data.resumes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-secondary text-xs">
                    No uploaded resumes found.
                  </td>
                </tr>
              ) : (
                data.resumes.map((res) => (
                  <tr key={res._id} className="hover:bg-surface/80 transition-colors">
                    {/* Candidate */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ShinobiAvatar user={res.userId} size="xs" />
                        <div className="min-w-0">
                          <p className="text-white font-bold font-display truncate">{res.userId?.name || 'Anonymous'}</p>
                          <p className="text-secondary text-[11px] truncate">{res.userId?.email || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* File info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-brand-400 flex-shrink-0" />
                        <span className="text-slate-200 truncate max-w-[180px]">{res.originalName || 'Resume.pdf'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <ParseBadge status={res.parseStatus || (res.extractedData ? 'parsed' : 'pending')} />
                    </td>

                    {/* Skills count */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-white">
                        {res.extractedData?.skills?.length || 0} Skills
                      </span>
                    </td>

                    {/* Upload date */}
                    <td className="px-4 py-3 text-secondary text-[11px]">
                      {new Date(res.createdAt).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.fileUrl && (
                          <a
                            href={res.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-surface border border-subtle text-secondary hover:text-white hover:border-brand-500/40 transition-colors"
                            title="Inspect PDF File"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                        <button
                          onClick={() => setDelItem(res)}
                          className="p-1.5 rounded-lg text-secondary hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                          title="Purge Resume"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
        title="Purge Candidate Resume Dossier?"
        message={`Are you sure you want to permanently delete resume "${delItem?.originalName || 'document'}" for candidate ${delItem?.userId?.name || ''}? This action cannot be undone.`}
        itemTitle={delItem?.originalName}
        confirmText="Confirm Purge"
        cancelText="Keep Resume"
        onConfirm={() => handleDelete(delItem._id)}
        onClose={() => setDelItem(null)}
      />
    </div>
  );
}
