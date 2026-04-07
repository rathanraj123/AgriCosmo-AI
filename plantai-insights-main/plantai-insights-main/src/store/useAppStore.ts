import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export type UserRole = 'farmer' | 'scientist' | 'admin';

export interface ScanResult {
  id: string;
  imageUrl: string;
  diseaseName: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  treatments: string[];
  cosmeticInsights: { compound: string; useCase: string }[];
  explanation: string;
  createdAt: string;
  cropType?: string;
  region?: string;
  farmerTreatments?: {
    homeRemedies: string[];
    fertilizers: { name: string; dosage: string; cost: string }[];
    pesticides: { name: string; dosage: string; cost: string }[];
    urgency: 'immediate' | 'soon' | 'monitor';
    recoveryTime: string;
  };
  scientistData?: {
    probabilities: { label: string; value: number }[];
    featureImportance: { feature: string; importance: number }[];
    classificationHierarchy: string[];
    datasetRef: string;
    chemicalComposition: { compound: string; percentage: number }[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ChatThread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface AppState {
  isDark: boolean;
  toggleTheme: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  scanHistory: ScanResult[];
  addScan: (scan: ScanResult) => void;
  fetchHistory: () => Promise<void>;
  currentScan: ScanResult | null;
  setCurrentScan: (scan: ScanResult | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Chat History State
  chatThreads: ChatThread[];
  currentChatThreadId: string | null;
  setChatThreads: (threads: ChatThread[]) => void;
  setCurrentChatThreadId: (id: string | null) => void;
  fetchChatThreads: () => Promise<void>;
  deleteChatThread: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggleTheme: () => set((s) => {
        const next = !s.isDark;
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', next);
        }
        return { isDark: next };
      }),
      userRole: 'farmer',
      setUserRole: (role) => set({ userRole: role }),
      scanHistory: [],
      addScan: (scan) => set((s) => ({ scanHistory: [scan, ...s.scanHistory] })),
      fetchHistory: async () => {
        if (!get().token) return;
        set({ isLoading: true });
        try {
          const history = await api.get<any[]>('/detection/history');
          const mappedHistory: ScanResult[] = history.map(item => ({
            id: item.id,
            imageUrl: item.image_url 
              ? (item.image_url.startsWith('http') ? item.image_url : `http://127.0.0.1:8000${item.image_url}`)
              : 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80',
            diseaseName: item.detected_disease,
            confidence: item.confidence * 100,
            severity: item.severity?.toLowerCase() as any || 'low',
            treatments: item.treatments || [],
            cosmeticInsights: [],
            explanation: item.explanation || '',
            createdAt: item.created_at,
            farmerTreatments: item.farmer_treatments ? {
              homeRemedies: item.farmer_treatments.home_remedies,
              fertilizers: item.farmer_treatments.fertilizers,
              pesticides: item.farmer_treatments.pesticides,
              urgency: item.farmer_treatments.urgency,
              recoveryTime: item.farmer_treatments.recovery_time,
            } : undefined,
            scientistData: item.scientist_data ? {
              probabilities: item.scientist_data.probabilities,
              featureImportance: item.scientist_data.feature_importance,
              classificationHierarchy: item.scientist_data.classification_hierarchy,
              datasetRef: item.scientist_data.dataset_ref,
              chemicalComposition: item.scientist_data.chemical_composition,
            } : undefined,
          }));
          set({ scanHistory: mappedHistory });
        } catch (error) {
          console.error('Failed to fetch history:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      currentScan: null,
      setCurrentScan: (scan) => set({ currentScan: scan }),
      userName: 'Researcher',
      setUserName: (name) => set({ userName: name }),
      language: 'English',
      setLanguage: (lang) => set({ language: lang }),
      token: typeof window !== 'undefined' ? localStorage.getItem('agricosmo-token') : null,
      setToken: (token) => {
        if (token) localStorage.setItem('agricosmo-token', token);
        else localStorage.removeItem('agricosmo-token');
        set({ token });
      },
      isLoading: false,
      isHydrated: false,

      // Chat History Actions
      chatThreads: [],
      currentChatThreadId: null,
      setChatThreads: (threads) => set({ chatThreads: threads }),
      setCurrentChatThreadId: (id) => set({ currentChatThreadId: id }),
      fetchChatThreads: async () => {
        if (!get().token) return;
        try {
          const threads = await api.get<ChatThread[]>('/chatbot/threads');
          set({ chatThreads: threads });
        } catch (error) {
          console.error('Failed to fetch chat threads:', error);
        }
      },
      deleteChatThread: async (id) => {
        try {
          await api.delete(`/chatbot/threads/${id}`);
          set((s) => ({
            chatThreads: s.chatThreads.filter((t) => t.id !== id),
            currentChatThreadId: s.currentChatThreadId === id ? null : s.currentChatThreadId
          }));
        } catch (error) {
          console.error('Failed to delete chat thread:', error);
        }
      }
    }),
    {
      name: 'agricosmo-store',
      partialize: (state) => ({ 
        isDark: state.isDark, 
        userRole: state.userRole, 
        userName: state.userName, 
        language: state.language,
        token: state.token,
        currentChatThreadId: state.currentChatThreadId,
        chatThreads: state.chatThreads
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      }
    }
  )
);
