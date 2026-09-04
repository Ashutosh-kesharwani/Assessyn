import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Sparkles, RefreshCw, Trash2, Bot, User,
  Copy, Check, ChevronDown, ChevronUp, Zap, HelpCircle
} from 'lucide-react';
import { useProCareerStore } from '@/store/proCareerStore';
import { proAPI } from '@/services/api';
import toast from 'react-hot-toast';

const QUICK_CHIPS = {
  resume_restructure: [
    'Add quantifiable AWS & Kafka metrics to bullets',
    'Shorten summary to 3 high-impact lines',
    'Highlight concurrency & distributed systems skills',
    'How should I explain this job change in interviews?',
  ],
  projects: [
    'Generate complete SQL table schema for Project 1',
    'Provide REST / gRPC API endpoint specifications',
    'What are the primary failure modes & bottlenecks?',
    'Give me a 60-second elevator pitch for recruiters',
  ],
  interview_prep: [
    'Give me a step-by-step STAR answer for Question 1',
    'What deep follow-up questions will the interviewer ask?',
    'Explain the trade-offs between these two architectures',
    'How do I answer this if I lack direct Kafka experience?',
  ],
  roadmap: [
    'Break Phase 1 into daily 2-hour study blocks',
    'Recommend the best free tutorials and docs for this',
    'How do I balance this roadmap with a full-time job?',
    'What GitHub repositories should I study this week?',
  ],
};

const TOOL_TITLES = {
  resume_restructure: 'Resume Restructuring Advisor',
  projects: 'Portfolio Architecture Advisor',
  interview_prep: 'Interview Simulation Advisor',
  roadmap: 'Sprint Strategy & Career Mentor',
};

export default function ProToolChatDrawer({ toolKey, contextData }) {
  const {
    chatHistories,
    addChatMessage,
    clearChatHistory,
    selectedResumeId,
  } = useProCareerStore();

  const [isOpen, setIsOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const messages = chatHistories[toolKey] || [];
  const quickChips = QUICK_CHIPS[toolKey] || QUICK_CHIPS.resume_restructure;
  const toolTitle = TOOL_TITLES[toolKey] || 'AI Career Advisor';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (msgText) => {
    const text = (msgText || inputMessage).trim();
    if (!text || isSending) return;

    setInputMessage('');
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    addChatMessage(toolKey, userMsg);
    setIsSending(true);

    try {
      const payload = {
        toolContext: toolKey,
        userMessage: text,
        contextData: contextData || null,
        resumeId: selectedResumeId || null,
        chatHistory: messages.slice(-8), // Keep recent conversational context
      };

      const { data } = await proAPI.chatAdvisor(payload);
      const replyText =
        data?.data?.reply ||
        data?.reply ||
        'I am analyzing your target role and resume context. Please ask any specific questions to drill down further.';

      addChatMessage(toolKey, {
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        'Our Central AI advisor encountered high network demand. Please try again in a moment.';
      addChatMessage(toolKey, {
        role: 'assistant',
        content: `⚠️ ${errorMsg}`,
        timestamp: new Date().toISOString(),
      });
      toast.error('Career Advisor response delayed. Please retry.');
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success('Advisor response copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="mt-8 rounded-3xl bg-surface/95 border border-brand-500/40 shadow-2xl backdrop-blur-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-500/15 via-surface to-brand-500/10 border-b border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 shadow-glow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-black text-white text-sm sm:text-base">
                {toolTitle}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Central AI Active</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-secondary">
              Context-grounded follow-ups & customized drill-downs for your generated output
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearChatHistory(toolKey);
                toast.success('Advisor conversation reset.');
              }}
              title="Clear chat history"
              className="p-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-rose-400 hover:border-rose-500/40 text-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-white text-xs transition-all cursor-pointer flex items-center gap-1"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="text-[11px] font-mono hidden sm:inline">{isOpen ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
          >
            {/* Messages Container */}
            <div className="p-4 sm:p-6 max-h-[380px] overflow-y-auto space-y-4 font-mono text-xs">
              {messages.length === 0 ? (
                <div className="p-6 rounded-2xl bg-surface/60 border border-dashed border-subtle text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white">Have questions about this result?</p>
                    <p className="text-secondary text-[11px] max-w-md mx-auto">
                      Ask your Central AI Advisor to refine these bullet points, generate full SQL schemas, write mock answers, or adapt this roadmap to your exact schedule.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                          isUser
                            ? 'bg-brand-500 text-white'
                            : 'bg-surface border border-brand-500/40 text-brand-300'
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl space-y-2 relative group ${
                          isUser
                            ? 'bg-brand-600/90 text-white rounded-tr-none'
                            : 'bg-surface border border-subtle text-slate-200 rounded-tl-none'
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </div>

                        {!isUser && (
                          <div className="flex items-center justify-between pt-1 border-t border-subtle/40 text-[10px] text-secondary">
                            <span>Central AI Advisor</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(msg.content, idx)}
                              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {isSending && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-surface border border-brand-500/40 text-brand-300 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-surface border border-subtle rounded-tl-none flex items-center gap-2 text-secondary text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
                    <span>Advisor is analyzing JD & output context...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-4 sm:px-6 py-2 border-t border-subtle/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-mono text-secondary uppercase font-bold flex-shrink-0 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-brand-400" />
                <span>Quick Prompt:</span>
              </span>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isSending}
                  onClick={() => handleSendMessage(chip)}
                  className="px-3 py-1 rounded-xl bg-surface border border-subtle hover:border-brand-500/40 text-secondary hover:text-white text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 sm:p-5 bg-surface/80 border-t border-subtle flex items-center gap-2 sm:gap-3"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${toolTitle} for drill-downs, refinements, or tips...`}
                disabled={isSending}
                className="flex-1 px-4 py-3 rounded-2xl bg-surface border border-subtle text-white text-xs font-mono focus:outline-none focus:border-brand-500/60 transition-all placeholder:text-secondary/60 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="p-3 sm:px-5 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 text-white font-display font-black text-xs shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask Advisor</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
