/**
 * components/admin/topbar/Breadcrumb.jsx
 *
 * Auto-generates Shinobi breadcrumb trail from the current URL path.
 */

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { KatanaIcon, DojoIcon } from '@/components/ui/ShinobiIcons';

const SEGMENT_LABELS = {
  admin:        'Command Center',
  users:        'Users Matrix',
  jobs:         'Jobs Board',
  interviews:   'Interviews',
  sessions:     'Sessions',
  resumes:      'ATS Resumes',
  ats:          'ATS Scanner',
  subscription: 'Subscriptions',
  payments:     'Payments & Fees',
  scraper:      'Job Scraper',
  prompts:      'Prompt Studio',
  logs:         'Audit Logs',
  analytics:    'Analytics',
  settings:     'Engine Settings',
};

function buildCrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, index) => {
    const path  = '/' + segments.slice(0, index + 1).join('/');
    const label = SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    return { label, path };
  });
}

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-surface border border-subtle">
        <DojoIcon className="w-3.5 h-3.5 text-brand-400" />
        <span className="text-white text-xs font-mono font-bold tracking-tight">Command Center</span>
      </div>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-subtle">
      <DojoIcon className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.path} className="flex items-center gap-1.5 font-mono text-xs">
            <ChevronRight size={12} className="text-secondary flex-shrink-0" />
            {isLast ? (
              <span className="text-white font-bold text-xs">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-secondary text-xs hover:text-white transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
