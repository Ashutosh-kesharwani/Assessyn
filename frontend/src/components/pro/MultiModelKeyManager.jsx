import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound, ShieldCheck, Zap, Sparkles, Check, AlertCircle, RefreshCw,
  ExternalLink, ArrowDownUp, Eye, EyeOff, CheckCircle2, Play, Terminal,
  Cpu, Layers, AlertTriangle, HelpCircle, Flame, BookOpen
} from 'lucide-react';
import { useProStore } from '@/store/proStore';
import ApiKeySetupGuideModal from '@/components/pro/ApiKeySetupGuideModal';
import toast from 'react-hot-toast';

export default function MultiModelKeyManager() {
  const {
    isPro,
    models,
    routingLogs,
    autoFailoverEnabled,
    updateModelKey,
    toggleModelActive,
    reorderModels,
    executeAutoRoutedPrompt,
    clearRoutingLogs,
  } = useProStore();

  const [visibleKeys, setVisibleKeys] = useState({});
  const [editingKeys, setEditingKeys] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [simQuotaFail, setSimQuotaFail] = useState(true);
  const [testPrompt, setTestPrompt] = useState('Analyze system scalability for 100k WebSockets.');
  const [simulationResult, setSimulationResult] = useState(null);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guideProvider, setGuideProvider] = useState('gemini-1.5-pro');

  const openGuideFor = (providerId) => {
    setGuideProvider(providerId);
    setGuideModalOpen(true);
  };

  const toggleKeyVisibility = (id) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeySave = (modelId) => {
    const val = editingKeys[modelId];
    if (val !== undefined) {
      updateModelKey(modelId, val.trim());
      toast.success('API Key securely cached for auto-routing! 🗡️');
    }
  };

  const movePriority = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= models.length) return;
    const newModels = [...models];
    const temp = newModels[index];
    newModels[index] = newModels[targetIdx];
    newModels[targetIdx] = temp;
    reorderModels(newModels);
    toast.success('Auto-routing failover priority updated!');
  };

  const handleTestAutoRouting = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const result = await executeAutoRoutedPrompt(testPrompt, simQuotaFail);
      setSimulationResult(result);
      if (result.usedFallback) {
        toast.success(
          `⚡ Auto-Failover Triggered! Switched to ${result.modelUsed.name} seamlessly!`,
          { duration: 4000 }
        );
      } else {
        toast.success(`⚡ Direct Route Success via ${result.modelUsed.name}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Routing failed');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header HUD ─────────────────────────────────────────── */}
      <header className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[10px] font-mono font-black uppercase tracking-wider">
                // 5-MODEL HYBRID MULTI-LLM ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                Smart Auto-Failover Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              Bring Your Own Keys (BYOK) & Auto-Routing
            </h2>
            <p className="text-xs sm:text-sm text-secondary font-mono max-w-2xl">
              Add your own API keys for up to 5 industry-leading AI models. If your primary model hits rate limits (429) or token quotas, Assessyn will <strong className="text-white">auto-cascade</strong> to your next backup key with zero downtime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start lg:self-center">
            {/* Step by Step Setup Guide Trigger */}
            <button
              type="button"
              onClick={() => openGuideFor('gemini-1.5-pro')}
              className="py-3 px-4 rounded-2xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/40 text-brand-300 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Step-by-Step API Key Guide ↗</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-surface border border-subtle text-right">
              <span className="text-[10px] font-mono uppercase text-secondary block font-bold">
                Active BYOK Nodes
              </span>
              <span className="text-xl font-display font-black text-white">
                {models.filter((m) => m.isActive && (m.apiKey || m.id === 'gemini-1.5-pro')).length} / 5
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── 5 Models Configuration Grid ────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-mono font-extrabold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>Configured Model Fallback Hierarchy</span>
          </h3>
          <span className="text-xs font-mono text-secondary">
            Use arrows to reorder routing priority
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {models.map((model, idx) => {
            const isKeyVisible = visibleKeys[model.id];
            const currentInputValue = editingKeys[model.id] !== undefined ? editingKeys[model.id] : model.apiKey;

            return (
              <motion.div
                key={model.id}
                layout
                className={`p-5 sm:p-6 rounded-3xl border transition-all relative overflow-hidden ${
                  model.isActive
                    ? 'bg-surface/90 border-subtle shadow-lg'
                    : 'bg-surface/40 border-subtle/50 opacity-65'
                }`}
              >
                {/* Priority Ribbon */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-subtle">
                  <div className="flex items-center gap-3.5">
                    {/* Priority Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-7 h-7 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 font-mono font-black text-xs flex items-center justify-center">
                        #{model.priority}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-black text-white text-base">
                          {model.name}
                        </h4>
                        <span
                          className="text-[9.5px] font-mono font-extrabold px-2 py-0.5 rounded-md border"
                          style={{
                            color: model.color,
                            backgroundColor: `${model.color}18`,
                            borderColor: `${model.color}40`,
                          }}
                        >
                          {model.tag}
                        </span>
                        <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-surface border border-subtle text-secondary">
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-xs text-secondary font-mono mt-0.5">{model.description}</p>
                    </div>
                  </div>

                  {/* Priority Reorder & Enable Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePriority(idx, -1)}
                      className="p-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Priority Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === models.length - 1}
                      onClick={() => movePriority(idx, 1)}
                      className="p-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Priority Down"
                    >
                      ▼
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleModelActive(model.id)}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        model.isActive
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-surface border-subtle text-secondary hover:text-white'
                      }`}
                    >
                      {model.isActive ? 'Active Node' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* API Key Input Section */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      type={isKeyVisible ? 'text' : 'password'}
                      placeholder={
                        model.id === 'gemini-1.5-pro'
                          ? 'Default Shared Gemini Key Active (or paste custom key)'
                          : `Enter ${model.provider} API Key (${model.placeholder})`
                      }
                      value={currentInputValue}
                      onChange={(e) =>
                        setEditingKeys((prev) => ({ ...prev, [model.id]: e.target.value }))
                      }
                      className="w-full p-3.5 pr-11 rounded-2xl bg-surface border border-subtle text-white text-xs font-mono focus:outline-none focus:border-brand-500/60 placeholder-secondary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility(model.id)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors cursor-pointer"
                    >
                      {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleKeySave(model.id)}
                      className="flex-1 sm:flex-initial px-4 py-3.5 rounded-2xl bg-surface border border-brand-500/40 hover:bg-brand-500/20 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-brand-300" />
                      <span>Save Key</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openGuideFor(model.id)}
                      className="px-3.5 py-3.5 rounded-2xl bg-surface border border-subtle hover:border-brand-400 text-brand-300 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Step-by-Step setup guide on how to get this key"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Guide</span>
                    </button>

                    <a
                      href={model.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-3.5 rounded-2xl bg-surface border border-subtle hover:border-slate-500 text-secondary hover:text-white text-xs font-mono flex items-center justify-center gap-1 transition-all"
                      title="Get API Key from provider console"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between pt-3 text-[10.5px] font-mono text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        model.apiKey || model.id === 'gemini-1.5-pro'
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-slate-600'
                      }`}
                    />
                    <span>
                      {model.apiKey || model.id === 'gemini-1.5-pro'
                        ? 'Key Ready for Auto-Routing'
                        : 'No Key Configured (Standby)'}
                    </span>
                  </span>

                  <span>Total Routed Requests: {model.callsCount || 0}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Auto-Routing Simulator & Live Diagnostic Console ──── */}
      <section aria-label="Auto-Routing Diagnostics" className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">
                Auto-Routing & Failover Simulator
              </h3>
              <p className="text-[10.5px] font-mono text-secondary">
                Test how Assessyn seamlessly switches models if your primary key runs out of quota
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-extrabold text-secondary uppercase">
            // FAILOVER SIMULATOR
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter test prompt to run via auto-routing..."
              className="flex-1 p-3.5 rounded-2xl bg-surface border border-subtle text-white text-xs font-mono focus:outline-none focus:border-brand-500/60"
            />

            {/* Quota Exhaustion Trigger Toggle */}
            <label className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface border border-subtle cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simQuotaFail}
                onChange={(e) => setSimQuotaFail(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
              />
              <span className="text-xs font-mono text-secondary font-bold">
                Simulate Primary Quota Error (429)
              </span>
            </label>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleTestAutoRouting}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 text-white font-display font-black text-xs tracking-wide shadow-lg shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSimulating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Execute Route</span>
            </button>
          </div>

          {/* Simulation Output Card */}
          {simulationResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border ${
                simulationResult.usedFallback
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {simulationResult.usedFallback ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="font-mono font-bold text-xs">
                    {simulationResult.usedFallback
                      ? 'Fallback Triggered: Primary key exhausted → Switched automatically to ' +
                        simulationResult.modelUsed.name
                      : 'Direct Execution Success via ' + simulationResult.modelUsed.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface/80 border border-subtle">
                  Priority #{simulationResult.modelUsed.priority}
                </span>
              </div>
            </motion.div>
          )}

          {/* Real-time Failover Logs */}
          <div className="p-4 rounded-2xl bg-surface border border-subtle space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-subtle">
              <span className="text-[10px] font-mono uppercase text-secondary font-bold">
                Live Cascade Routing Activity Logs
              </span>
              {routingLogs.length > 0 && (
                <button
                  type="button"
                  onClick={clearRoutingLogs}
                  className="text-[10px] font-mono text-secondary hover:text-rose-400 cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {routingLogs.length === 0 ? (
              <p className="text-xs font-mono text-secondary py-2 text-center">
                No recent auto-routing transactions. Click "Execute Route" above to test cascade.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {routingLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-xl bg-surface/60 border border-subtle flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          log.type === 'FAILOVER' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-white font-bold">
                        {log.type === 'FAILOVER'
                          ? `[CASCADE] ${log.fromModel} ➔ ${log.toModel}`
                          : `[DIRECT] ${log.toModel}`}
                      </span>
                      <span className="text-secondary text-[10px] hidden sm:inline">({log.reason})</span>
                    </div>
                    <span className="text-secondary text-[10px]">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Visual Step-by-Step Setup Guide Modal ───────────────── */}
      <ApiKeySetupGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        defaultProvider={guideProvider}
      />
    </div>
  );
}
