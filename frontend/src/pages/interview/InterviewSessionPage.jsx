import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, SkipForward, CheckCircle2,
  Clock, Mic, Send, Loader2, AlertCircle, BrainCircuit,
  Volume2, VolumeX, MessageSquare, Lightbulb, ChevronDown,
  Sparkles, Check, HelpCircle, ShieldCheck
} from 'lucide-react';
import { io } from 'socket.io-client';
import { interviewAPI, sessionAPI } from '@/services/api';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ShinobiLoader from '@/components/ui/ShinobiLoader';
import { KatanaIcon, DojoIcon, ShurikenIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';

const DIFFICULTY_CLR = {
  easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

const CATEGORY_CLR = {
  technical: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  behavioral: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  situational: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  hr: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  culture_fit: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export default function InterviewSessionPage() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [savedAnswers, setSavedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Hidden-by-default Hint toggle requested by user
  const [showHints, setShowHints] = useState(false);

  // Synchronous ref to prevent state-race conditions during fast navigation
  const answersRef = useRef({});
  const baseTranscriptRef = useRef('');

  // Live WebSocket AI Flow
  const [socket, setSocket] = useState(null);
  const [liveFeedback, setLiveFeedback] = useState('');
  const [isReceivingFeedback, setIsReceivingFeedback] = useState(false);

  useEffect(() => {
    const s = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', { withCredentials: true });
    setSocket(s);

    s.on('ai_chunk', (chunk) => {
      setLiveFeedback((prev) => prev + chunk);
    });

    s.on('ai_complete', () => {
      setIsReceivingFeedback(false);
    });

    s.on('ai_error', () => {
      setIsReceivingFeedback(false);
      toast.error('Live AI follow-up connection disrupted.');
    });

    return () => s.disconnect();
  }, []);

  const handleLiveAIFeedback = () => {
    if (!answerText.trim()) return toast.error('Please type or speak your thoughts first!');
    setLiveFeedback('');
    setIsReceivingFeedback(true);
    socket?.emit('live_answer', {
      questionText: currentQuestion?.questionText,
      expectedKeywords: currentQuestion?.expectedKeywords,
      answerText: answerText.trim(),
    });
  };

  // Text-To-Speech
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeakQuestion = () => {
    if (!window.speechSynthesis) return toast.error('Text-to-speech not supported.');
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = currentQuestion?.questionText;
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Speech Recognition (Voice Input)
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0]?.transcript || '';
          if (e.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          const prev = baseTranscriptRef.current.trim();
          baseTranscriptRef.current = (prev ? prev + ' ' : '') + finalTranscript.trim();
        }

        const base = baseTranscriptRef.current.trim();
        const live = interimTranscript.trim();
        const combined = base + (live ? (base ? ' ' : '') + live : '');
        setAnswerText(combined);
      };

      rec.onerror = (e) => {
        setIsListening(false);
        if (e.error !== 'no-speech') {
          toast.error('Microphone error: ' + e.error);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return toast.error('Voice typing not supported in this browser.');
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      baseTranscriptRef.current = answerText;
      try {
        recognition.start();
        setIsListening(true);
        toast.success('Listening... Start answering now.', { icon: '🎙️' });
      } catch {
        recognition.stop();
        setTimeout(() => {
          recognition.start();
          setIsListening(true);
        }, 100);
      }
    }
  };

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        const { data: intData } = await interviewAPI.getById(interviewId);
        setInterview(intData?.data?.interview || intData?.interview);

        const { data: sessData } = await sessionAPI.start(interviewId);
        const currentSession = sessData?.data?.session || sessData?.session;
        setSession(currentSession);

        // Pre-populate any existing answers from session
        const existingMap = {};
        (currentSession?.answers || []).forEach((a) => {
          existingMap[a.questionId] = {
            answerText: a.answerText || '',
            skipped: a.skipped || false,
          };
        });
        answersRef.current = existingMap;
        setSavedAnswers(existingMap);

        const firstQId = intData.interview?.questions?.[0]?._id;
        if (firstQId && existingMap[firstQId]) {
          setAnswerText(existingMap[firstQId].answerText || '');
          baseTranscriptRef.current = existingMap[firstQId].answerText || '';
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to start simulation arena');
        navigate('/interviews');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [interviewId, navigate]);

  const currentQuestion = interview?.questions?.[currentIdx];
  const totalQuestions = interview?.questions?.length || 0;
  const progress = totalQuestions ? ((currentIdx + 1) / totalQuestions) * 100 : 0;

  // Auto-Save current question with synchronous local state commit
  const saveCurrentAnswer = useCallback(async (skipped = false) => {
    if (!session || !currentQuestion) return;

    const currentText = answerText.trim();
    const timeTaken = Math.max(1, Math.floor((Date.now() - startTime) / 1000));

    // Update synchronous ref immediately
    answersRef.current[currentQuestion._id] = {
      answerText: skipped ? '' : currentText,
      skipped,
    };
    setSavedAnswers({ ...answersRef.current });

    // Submit to backend asynchronously
    try {
      await sessionAPI.submitAnswer(session._id, {
        questionId: currentQuestion._id,
        answerText: skipped ? '' : currentText,
        timeTaken,
        skipped,
      });
    } catch {
      // Background retry silently
    }
  }, [session, currentQuestion, answerText, startTime]);

  // Jump to specific question index
  const jumpToQuestion = async (targetIdx) => {
    if (targetIdx === currentIdx || targetIdx < 0 || targetIdx >= totalQuestions) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    setSubmitting(true);
    await saveCurrentAnswer(false);
    setSubmitting(false);

    const targetQId = interview?.questions?.[targetIdx]?._id;
    const targetData = answersRef.current[targetQId] || { answerText: '', skipped: false };

    setCurrentIdx(targetIdx);
    setAnswerText(targetData.answerText || '');
    baseTranscriptRef.current = targetData.answerText || '';
    setShowHints(false);
    setLiveFeedback('');
    setIsReceivingFeedback(false);
    setStartTime(Date.now());
  };

  // Next Question
  const handleNext = async (skip = false) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    setSubmitting(true);
    await saveCurrentAnswer(skip);
    setSubmitting(false);

    const nextIdx = currentIdx + 1;
    if (nextIdx < totalQuestions) {
      const nextQId = interview?.questions?.[nextIdx]?._id;
      const nextData = answersRef.current[nextQId] || { answerText: '', skipped: false };

      setCurrentIdx(nextIdx);
      setAnswerText(nextData.answerText || '');
      baseTranscriptRef.current = nextData.answerText || '';
      setShowHints(false);
      setLiveFeedback('');
      setIsReceivingFeedback(false);
      setStartTime(Date.now());
    }
  };

  // Previous Question
  const handlePrev = async () => {
    if (currentIdx === 0) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    setSubmitting(true);
    await saveCurrentAnswer(false);
    setSubmitting(false);

    const prevIdx = currentIdx - 1;
    const prevQId = interview?.questions?.[prevIdx]?._id;
    const prevData = answersRef.current[prevQId] || { answerText: '', skipped: false };

    setCurrentIdx(prevIdx);
    setAnswerText(prevData.answerText || '');
    baseTranscriptRef.current = prevData.answerText || '';
    setShowHints(false);
    setLiveFeedback('');
    setIsReceivingFeedback(false);
    setStartTime(Date.now());
  };

  // Complete and Grade Interview
  const handleComplete = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    setCompleting(true);
    try {
      // 1. Save final question
      await saveCurrentAnswer(false);

      // 2. Complete session with resilient grading
      const { data } = await sessionAPI.complete(session._id);
      toast.success('Simulation completed! Compiling comprehensive score...');
      navigate(`/sessions/${session._id}/results`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete session evaluation.');
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <ShinobiLoader
        tag="NEURAL SIMULATOR // INITIALIZING"
        title="Constructing Simulation Arena..."
        subtitle="Calibrating interview domain heuristics, question matrices, and real-time audio channels..."
      />
    );
  }

  if (completing) {
    return (
      <ShinobiLoader
        tag="EVALUATION TELEMETRY // AI SYNTHESIS"
        title="Synthesizing Your Final Performance..."
        subtitle="Grading answers against domain keywords, technical correctness, and STAR response vectors..."
      />
    );
  }

  if (!interview || !session) return null;

  const currentQSaved = savedAnswers[currentQuestion?._id];
  const isCurrentAnswered = currentQSaved?.answerText?.trim()?.length > 0;
  const isCurrentSkipped = currentQSaved?.skipped;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-32 px-2 sm:px-4 animate-fade-in select-none">
      {/* ── 1. Top Mission Telemetry Bar ──────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
            <KatanaIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-display font-black text-white leading-tight">
              {interview.jobTitle}
            </h2>
            <p className="text-xs font-mono text-secondary capitalize">
              {interview.experienceLevel} Tier &bull; {totalQuestions} Combat Scenarios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-mono text-white shadow-inner">
            <Clock className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span className="font-bold">{formatTime(elapsed)}</span>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-surface border border-subtle text-secondary">
            Scenario <span className="text-white">{currentIdx + 1}</span> / {totalQuestions}
          </span>
        </div>
      </div>

      {/* ── 2. Clickable Question Progress Matrix ──────────────── */}
      <div className="p-3 rounded-2xl bg-surface/70 backdrop-blur-md border border-subtle space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono px-1">
          <span className="text-secondary text-[11px] font-bold uppercase tracking-wider">Mission Matrix</span>
          <span className="text-emerald-400 font-bold">{Math.round(progress)}% Calibrated</span>
        </div>

        {/* Question Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {interview.questions.map((q, idx) => {
            const qState = savedAnswers[q._id];
            const isAnswered = qState?.answerText?.trim()?.length > 0;
            const isSkipped = qState?.skipped;
            const isCurrent = idx === currentIdx;

            return (
              <button
                key={q._id}
                type="button"
                onClick={() => jumpToQuestion(idx)}
                className={`min-w-[40px] h-9 px-2.5 rounded-xl text-xs font-mono font-black flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 border ${
                  isCurrent
                    ? 'bg-brand-500/25 border-brand-400 text-white shadow-md shadow-brand-500/20 scale-105'
                    : isAnswered
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                    : isSkipped
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                    : 'bg-surface border-subtle text-secondary hover:text-white hover:border-brand-500/30'
                }`}
                title={`Scenario ${idx + 1}: ${q.questionText?.slice(0, 40)}...`}
              >
                <span>Q{idx + 1}</span>
                {isAnswered && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Active Scenario Card ───────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="p-6 sm:p-8 rounded-2xl bg-surface/90 backdrop-blur-2xl border border-subtle shadow-2xl space-y-6"
        >
          {/* Metadata Badges & Audio Pronunciation */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                SCENARIO {currentIdx + 1}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border ${DIFFICULTY_CLR[currentQuestion?.difficulty] || 'bg-slate-500/10 text-slate-300 border-subtle'}`}>
                {currentQuestion?.difficulty}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border ${CATEGORY_CLR[currentQuestion?.category] || 'bg-slate-500/10 text-slate-300 border-subtle'}`}>
                {currentQuestion?.category?.replace('_', ' ')}
              </span>

              {isCurrentAnswered && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Answered
                </span>
              )}
              {isCurrentSkipped && !isCurrentAnswered && (
                <span className="text-[11px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30">
                  Skipped
                </span>
              )}
            </div>

            {/* Read Aloud Button */}
            <button
              type="button"
              onClick={toggleSpeakQuestion}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/50 animate-pulse'
                  : 'bg-surface hover:bg-surface-hover text-secondary hover:text-white border-subtle'
              }`}
              title="Speak Question Aloud"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
              <span>{isSpeaking ? 'Mute Audio' : 'Play Audio'}</span>
            </button>
          </div>

          {/* Question Text */}
          <div className="p-4 rounded-xl bg-surface/50 border border-subtle/60">
            <p className="text-white text-base sm:text-lg font-display font-medium leading-relaxed">
              {currentQuestion?.questionText}
            </p>
          </div>

          {/* ── Hidden-by-default Topic Hints Accordion ────────── */}
          {currentQuestion?.expectedKeywords?.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>{showHints ? 'Hide Topic Hints' : 'Reveal Topic Hints'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showHints ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showHints && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 font-mono space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Core Competencies & Keywords to Hit:</span>
                      </div>
                      <p className="text-amber-100/90 pl-5">
                        {currentQuestion.expectedKeywords.join(' • ')}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Answer Input Area ─────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-extrabold uppercase tracking-wider text-secondary flex items-center gap-2">
                <span>Your Response</span>
              </label>

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse shadow-sm shadow-rose-500/20'
                    : 'bg-surface hover:bg-surface-hover text-secondary hover:text-white border-subtle'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-brand-400" />
                <span>{isListening ? 'Listening (Speaking)...' : 'Voice Dictation'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={7}
                className={`w-full p-4 rounded-xl bg-surface border text-sm font-sans text-white placeholder-slate-500 leading-relaxed outline-none transition-all resize-y ${
                  isListening
                    ? 'border-rose-500/50 ring-2 ring-rose-500/20'
                    : 'border-subtle focus:border-brand-400 focus:ring-1 focus:ring-brand-400/50'
                }`}
                placeholder="Type your answer here, or click 'Voice Dictation' to dictate. For technical answers, cite specific architecture, tools, and tradeoffs. For behavioral questions, utilize the STAR method (Situation, Task, Action, Result)..."
                value={answerText}
                onChange={(e) => {
                  setAnswerText(e.target.value);
                  baseTranscriptRef.current = e.target.value;
                }}
              />
              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-[11px] font-mono text-secondary">
                  {answerText.length} characters &bull; {answerText.trim() ? `${answerText.trim().split(/\s+/).length} words` : '0 words'}
                </span>
                <span className="text-[11px] font-mono text-secondary">
                  Auto-saves on navigation
                </span>
              </div>
            </div>
          </div>

          {/* ── Live AI Interviewer Follow-up Stream ─────────── */}
          <div className="pt-2 border-t border-subtle/70 space-y-3">
            <button
              type="button"
              onClick={handleLiveAIFeedback}
              disabled={isReceivingFeedback || !answerText.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-surface border border-subtle hover:border-brand-400 text-xs font-mono font-bold text-brand-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              {isReceivingFeedback ? (
                <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
              ) : (
                <MessageSquare className="w-4 h-4 text-brand-400" />
              )}
              <span>{isReceivingFeedback ? 'Interviewer is thinking...' : 'Ask AI Interviewer for Real-Time Feedback'}</span>
            </button>

            {(liveFeedback || isReceivingFeedback) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-surface border border-brand-500/30 font-mono text-xs text-brand-100 space-y-2"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-brand-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-brand-300 font-bold uppercase tracking-wider text-[10px]">
                    Interviewer Live Feedback
                  </span>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{liveFeedback}</div>
                {isReceivingFeedback && <span className="inline-block w-1.5 h-3 ml-1 bg-brand-400 animate-pulse" />}
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── 4. Dedicated Bottom Action Bar (Rock Solid & Symmetrical) ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface/95 backdrop-blur-2xl border border-subtle shadow-2xl flex items-center justify-between gap-3">
        {/* Previous Button */}
        <Button
          variant="secondary"
          size="md"
          icon={ChevronLeft}
          onClick={handlePrev}
          disabled={currentIdx === 0 || submitting}
          className="font-bold text-xs"
        >
          <span>Previous</span>
        </Button>

        {/* Center & Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Skip Button */}
          <button
            type="button"
            onClick={() => handleNext(true)}
            disabled={submitting}
            className="px-3 py-2 rounded-xl text-xs font-mono font-bold text-secondary hover:text-white hover:bg-surface border border-transparent hover:border-subtle transition-all cursor-pointer flex items-center gap-1.5"
            title="Skip this scenario"
          >
            <SkipForward className="w-3.5 h-3.5 text-secondary" />
            <span>Skip</span>
          </button>

          {/* Save & Next OR Finish & Get Results */}
          {currentIdx < totalQuestions - 1 ? (
            <Button
              variant="primary"
              size="md"
              icon={submitting ? Loader2 : Send}
              onClick={() => handleNext(false)}
              disabled={submitting}
              className="font-bold text-xs"
            >
              <span>{submitting ? 'Saving...' : 'Save & Next'}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={completing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-display font-black shadow-lg shadow-emerald-600/30 hover:scale-102 transition-all cursor-pointer flex items-center gap-2"
            >
              {completing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              )}
              <span>{completing ? 'Evaluating Session...' : 'Finish & Get Results'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Final Question Alert */}
      {currentIdx === totalQuestions - 1 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-200 text-xs font-sans leading-relaxed">
            <strong>Final Combat Scenario:</strong> Clicking <strong>"Finish & Get Results"</strong> will lock your answers and compile comprehensive AI evaluations, competency radars, and improvement tips.
          </p>
        </div>
      )}
    </div>
  );
}
