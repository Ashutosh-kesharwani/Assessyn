import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resumeAPI } from '@/services/api';

export const useProCareerStore = create(
  persist(
    (set, get) => ({
      // ── Resume Dossier Context ──────────────────────────────────────────
      resumes: [],
      selectedResumeId: null,
      isLoadingResumes: false,

      fetchResumes: async () => {
        set({ isLoadingResumes: true });
        try {
          const { data } = await resumeAPI.getAll();
          const list =
            data?.data?.resumes ||
            data?.resumes ||
            (Array.isArray(data?.data) ? data.data : []);
          const validList = Array.isArray(list) ? list.filter(Boolean) : [];

          set({ resumes: validList });

          // Auto-select default resume if none selected yet
          const currentId = get().selectedResumeId;
          if (!currentId && validList.length > 0) {
            const defaultResume = validList.find((r) => r.isDefault) || validList[0];
            set({ selectedResumeId: defaultResume._id });
          }
        } catch {
          // Handled gracefully
        } finally {
          set({ isLoadingResumes: false });
        }
      },

      setSelectedResumeId: (id) => {
        set({ selectedResumeId: id });
      },

      getActiveResume: () => {
        const { resumes, selectedResumeId } = get();
        if (!selectedResumeId) return null;
        return resumes.find((r) => r._id === selectedResumeId) || null;
      },

      // ── Tool Configurations ─────────────────────────────────────────────
      durationDays: 30, // 7 | 14 | 30 | 60 | 90
      setDurationDays: (days) => set({ durationDays: days }),

      questionCount: 6, // 5 | 8 | 12 | 15
      setQuestionCount: (count) => set({ questionCount: count }),

      // ── Tool Generated Results ──────────────────────────────────────────
      restructureResult: null,
      setRestructureResult: (data) => set({ restructureResult: data }),

      projectsResult: null,
      setProjectsResult: (data) => set({ projectsResult: data }),

      questionsResult: null,
      setQuestionsResult: (data) => set({ questionsResult: data }),

      roadmapResult: null,
      setRoadmapResult: (data) => set({ roadmapResult: data }),

      // ── Interactive Career Advisor Chat History (per tool) ──────────────
      isChatOpen: false,
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      setChatOpen: (open) => set({ isChatOpen: open }),

      chatHistories: {
        resume_restructure: [],
        projects: [],
        interview_prep: [],
        roadmap: [],
      },

      addChatMessage: (toolKey, message) => {
        set((state) => {
          const current = state.chatHistories[toolKey] || [];
          return {
            chatHistories: {
              ...state.chatHistories,
              [toolKey]: [...current, message],
            },
          };
        });
      },

      clearChatHistory: (toolKey) => {
        set((state) => ({
          chatHistories: {
            ...state.chatHistories,
            [toolKey]: [],
          },
        }));
      },
    }),
    {
      name: 'assessyn-pro-career-suite',
      partialize: (state) => ({
        selectedResumeId: state.selectedResumeId,
        durationDays: state.durationDays,
        questionCount: state.questionCount,
        restructureResult: state.restructureResult,
        projectsResult: state.projectsResult,
        questionsResult: state.questionsResult,
        roadmapResult: state.roadmapResult,
      }),
    }
  )
);

export default useProCareerStore;
