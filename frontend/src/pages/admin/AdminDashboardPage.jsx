/**
 * pages/admin/AdminDashboardPage.jsx
 *
 * Shinobi Admin Command Center & Live Telemetry Dashboard.
 * Displays platform-wide statistics, interactive growth & revenue curves,
 * live mock session distributions, user activity logs, and quick actions.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, MessageSquare, FileText,
  TrendingUp, UserCheck, Star, Activity,
  ArrowRight, RefreshCw, DollarSign, AlertCircle,
  Shield, CheckCircle2, UserPlus, Play, Terminal, HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { getAdminStats } from '@/services/admin.service';
import { KatanaIcon, ShurikenIcon, DojoIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';
import toast from 'react-hot-toast';

// ─── Shinobi Stat Card Component ───────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, to }) => {
  return (
    <Link
      to={to || '#'}
      className="block bg-surface/95 backdrop-blur-2xl border border-subtle rounded-xl p-4 sm:p-5 hover:border-brand-500/40 transition-all duration-200 group relative overflow-hidden shadow-lg"
    >
      {/* Top subtle sheen highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 group-hover:scale-105 transition-transform">
          <Icon size={18} />
        </div>
        {to && <ArrowRight size={14} className="text-secondary group-hover:text-white group-hover:translate-x-0.5 transition-all" />}
      </div>

      <p className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight mb-0.5">
        {value !== undefined ? value : <span className="animate-pulse bg-white/10 rounded h-7 w-12 inline-block" />}
      </p>
      <p className="text-secondary text-xs font-mono font-bold uppercase tracking-wider">{label}</p>
      {sub && <p className="text-[10.5px] text-secondary/80 font-mono mt-1">{sub}</p>}
    </Link>
  );
};

// ─── Custom Recharts Tooltip ──────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/98 border border-subtle p-3 rounded-xl shadow-2xl backdrop-blur-2xl font-mono text-xs">
        <p className="text-secondary font-bold mb-1.5">{label}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-white font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color || item.fill }} />
            <span>{item.name}:</span>
            <span className="font-bold text-white">{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {
      toast.error('Failed to load command center stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8 font-sans">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
            <KatanaIcon className="w-3 h-3" />
            <span>ROOT TELEMETRY // AI DOJO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">Command Overview</h1>
          <p className="text-secondary text-xs sm:text-sm font-mono mt-0.5">
            Real-time candidate metrics, transaction receipts, and simulation activity
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface border border-subtle text-secondary text-xs font-mono font-bold hover:text-white hover:border-brand-500/40 disabled:opacity-50 transition-all self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* ── Primary Statistics (8 metrics) ───────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          icon={Users}
          label="Total Candidates"
          value={stats?.totalUsers}
          sub={`${stats?.newUsersThisWeek ?? 0} new registrations`}
          to="/admin/users"
        />
        <StatCard
          icon={Star}
          label="Premium Users"
          value={stats?.premiumUsers}
          sub="Paid subscriptions"
          to="/admin/users"
        />
        <StatCard
          icon={UserCheck}
          label="Free Candidates"
          value={stats?.freeUsers}
          sub="Basic tier plan"
          to="/admin/users"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={stats?.totalRevenue !== undefined ? `₹${stats.totalRevenue}` : '₹0'}
          sub="Verified receipts"
          to="/admin/payments"
        />
        <StatCard
          icon={Activity}
          label="Interviews Today"
          value={stats?.interviewsToday}
          sub="Simulations triggered"
          to="/admin/interviews"
        />
        <StatCard
          icon={KatanaIcon}
          label="Total Interviews"
          value={stats?.totalInterviews}
          sub="All-time generated"
          to="/admin/interviews"
        />
        <StatCard
          icon={Briefcase}
          label="Active Jobs"
          value={stats?.jobsCount}
          sub="Scraped & live listings"
          to="/admin/jobs"
        />
        <StatCard
          icon={ScrollIcon}
          label="Total Resumes"
          value={stats?.applicationsCount}
          sub="Parsed & ATS analyzed"
          to="/admin/resumes"
        />
      </div>

      {/* ── Graphical Trends Section ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* User Growth Chart */}
        <div className="bg-surface/95 backdrop-blur-2xl border border-subtle rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2">
              <Users size={14} className="text-brand-400" />
              Candidate Registrations
            </h3>
            <span className="text-[10px] font-mono text-secondary">Last 6 Months</span>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full w-full bg-surface animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.charts?.userGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="users" name="Candidates" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#userGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform Revenue Chart */}
        <div className="bg-surface/95 backdrop-blur-2xl border border-subtle rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-400" />
              Monthly Revenue Trends
            </h3>
            <span className="text-[10px] font-mono text-secondary">Currency: INR (₹)</span>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full w-full bg-surface animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.charts?.revenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" name="Revenue (₹)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#revGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Total Interviews Chart */}
        <div className="bg-surface/95 backdrop-blur-2xl border border-subtle rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2">
              <KatanaIcon className="w-3.5 h-3.5 text-brand-400" />
              Interview Generation Volume
            </h3>
            <span className="text-[10px] font-mono text-secondary">Monthly Velocity</span>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full w-full bg-surface animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.charts?.interviews} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Interviews" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div className="bg-surface/95 backdrop-blur-2xl border border-subtle rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-rose-400" />
              Weekly Engagement Matrix
            </h3>
            <span className="text-[10px] font-mono text-secondary">Live Simulations</span>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full w-full bg-surface animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.charts?.dailyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="sessions" name="Sessions Run" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="users" name="Active Candidates" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── System Details Section (Activity & Quick Actions) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-surface/95 backdrop-blur-2xl border border-subtle rounded-xl p-5 shadow-lg flex flex-col h-[400px]">
          <h3 className="text-white text-xs font-mono font-extrabold uppercase tracking-wider mb-3 flex items-center justify-between flex-shrink-0">
            <span>Recent Platform Activity</span>
            <span className="text-[10px] text-secondary">Real-Time Streams</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-subtle/50 scrollbar-thin">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 pt-3 first:pt-0">
                  <div className="w-8 h-8 rounded-lg bg-surface animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface animate-pulse rounded w-1/3" />
                    <div className="h-2.5 bg-surface animate-pulse rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : !stats?.activities || stats.activities.length === 0 ? (
              <div className="h-full flex items-center justify-center text-secondary text-xs font-mono py-8">
                No recent activity recorded
              </div>
            ) : (
              stats.activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 pt-3 first:pt-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border
                    ${act.type === 'user' ? 'bg-blue-500/10 border-blue-500/25 text-blue-400' :
                      act.type === 'session' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' :
                        'bg-amber-500/10 border-amber-500/25 text-amber-400'}`}>
                    {act.type === 'user' ? <Users size={14} /> :
                      act.type === 'session' ? <CheckCircle2 size={14} /> :
                        <FileText size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-xs font-bold font-mono truncate">{act.title}</p>
                      <span className="text-[9.5px] text-secondary font-mono whitespace-nowrap">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-secondary text-xs mt-0.5 font-sans leading-snug">{act.message}</p>
                    {act.score !== undefined && act.score !== null && (
                      <span className="inline-block mt-1 text-[9.5px] font-mono font-bold text-brand-300 bg-brand-500/15 border border-brand-500/30 px-1.5 py-0.5 rounded">
                        Score: {act.score}%
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Tactical Actions & Error Warnings */}
        <div className="space-y-5 flex flex-col h-[400px]">
          {/* Quick System Actions */}
          <div className="bg-surface/95 backdrop-blur-2xl border border-subtle rounded-xl p-5 shadow-lg">
            <h3 className="text-white text-xs font-mono font-extrabold uppercase tracking-wider mb-3">
              Quick Tactical Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/admin/users" className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-subtle hover:border-brand-500/40 text-secondary hover:text-white text-xs font-mono font-bold transition-all shadow-xs">
                <UserPlus size={13} className="text-brand-400" />
                <span>Users Matrix</span>
              </Link>
              <Link to="/admin/scraper" className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-subtle hover:border-brand-500/40 text-secondary hover:text-white text-xs font-mono font-bold transition-all shadow-xs">
                <RefreshCw size={13} className="text-emerald-400" />
                <span>Run Scraper</span>
              </Link>
              <Link to="/admin/prompts" className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-subtle hover:border-brand-500/40 text-secondary hover:text-white text-xs font-mono font-bold transition-all shadow-xs">
                <KatanaIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Prompt Studio</span>
              </Link>
              <Link to="/admin/logs" className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-subtle hover:border-brand-500/40 text-secondary hover:text-white text-xs font-mono font-bold transition-all shadow-xs">
                <Terminal size={13} className="text-amber-400" />
                <span>Audit Logs</span>
              </Link>
            </div>
          </div>

          {/* System Warnings & Logs */}
          <div className="bg-surface/95 backdrop-blur-2xl border border-subtle rounded-xl p-5 shadow-lg flex-1 flex flex-col overflow-hidden">
            <h3 className="text-white text-xs font-mono font-extrabold uppercase tracking-wider mb-2.5 flex-shrink-0">
              Recent Warnings & Audits
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-2 rounded-lg bg-surface animate-pulse space-y-1.5">
                    <div className="h-2 bg-surface animate-pulse rounded w-1/4" />
                    <div className="h-2 bg-surface animate-pulse rounded w-3/4" />
                  </div>
                ))
              ) : stats?.recentErrors?.length > 0 ? (
                stats.recentErrors.map((err) => (
                  <div key={err.id} className="p-2 rounded-lg bg-surface border border-subtle flex items-start gap-2">
                    <AlertCircle size={13} className={`flex-shrink-0 mt-0.5
                      ${err.severity === 'error' ? 'text-rose-400' :
                        err.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9.5px] text-secondary font-mono font-bold uppercase">{err.service}</span>
                        <span className="text-[8px] text-secondary font-mono">• {new Date(err.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-300 mt-0.5 font-sans leading-tight break-words">{err.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-secondary text-xs font-mono">
                  All systems operational. No active anomalies.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
