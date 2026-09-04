import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, ArrowLeft, Clock, Zap, Home } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function RateLimitPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract retry-after from query params or location state, default 60s
  const queryParams = new URLSearchParams(location.search);
  const initialRetryAfter = parseInt(queryParams.get('retryAfter') || location.state?.retryAfter || '60', 10);
  const returnPath = location.state?.from || queryParams.get('from') || '/dashboard';

  const [countdown, setCountdown] = useState(initialRetryAfter);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const progressPercent = Math.max(0, Math.min(100, ((initialRetryAfter - countdown) / initialRetryAfter) * 100));

  const handleManualRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      navigate(returnPath, { replace: true });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between p-6 relative overflow-hidden bg-mesh">
      {/* Background glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-gradient-brand rounded-xl shadow-brand group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">Assessyn</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="max-w-xl mx-auto w-full z-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 sm:p-10 text-center relative overflow-hidden backdrop-blur-xl border border-surface-border shadow-2xl"
        >
          {/* Neon Alert Icon */}
          <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping opacity-50" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShieldAlert className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          <span className="badge badge-warning mb-3">
            <Clock className="w-3 h-3" /> Rate Limit Protection Active
          </span>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
            Slow down, speed racer!
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            You have triggered multiple requests in a short time window. Our AI systems are cooling down to ensure smooth service for everyone.
          </p>

          {/* Countdown & Progress Meter */}
          <div className="p-5 rounded-2xl bg-surface/80 border border-surface-border mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
              <span>Cooldown Status</span>
              <span className="font-mono text-brand-400 text-sm">
                {countdown > 0 ? `${countdown}s remaining` : 'Ready to proceed!'}
              </span>
            </div>

            <div className="progress-bar h-3 bg-surface-border/80">
              <motion.div
                className="progress-fill h-full"
                style={{ width: `${progressPercent}%` }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <p className="text-[11px] text-slate-500 mt-2.5">
              {countdown > 0
                ? 'Your rate limit window will automatically reset once the timer reaches zero.'
                : 'Cooldown complete! You can now safely retry your request.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              type="button"
              onClick={handleManualRetry}
              disabled={countdown > 0 || isRetrying}
              className="btn-primary w-full sm:w-auto px-7 py-3 text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {countdown > 0 ? `Wait ${countdown}s` : 'Retry Action Now'}
            </button>

            <Link
              to="/dashboard"
              className="btn-secondary w-full sm:w-auto px-6 py-3 text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-500 z-10">
        Assessyn Intelligent Rate Limiter &bull; Powered by Upstash Redis &bull; Error 429
      </div>
    </div>
  );
}
