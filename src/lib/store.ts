import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Challenge = {
  id: string;
  type: "email" | "url" | "sms";
  difficulty: "easy" | "medium" | "hard";
  isPhishing: boolean;
  points: number;
  timeLimit: number;
  redFlags: string[];
  explanation: string;
  educationTip: string;
  data: Record<string, unknown>;
};

export type AnswerRecord = {
  id: string;
  isPhishing: boolean;
  userChoice: "phishing" | "legit";
  correct: boolean;
  pointsAwarded: number;
};

export type Phase = "idle" | "playing" | "result";

type GameState = {
  callsign: string;
  difficulty: "easy" | "medium" | "hard";
  challenges: Challenge[];
  currentIndex: number;
  score: number;
  streak: number;
  answers: AnswerRecord[];
  phase: Phase;
};

type GameActions = {
  setCallsign: (value: string) => void;
  setDifficulty: (value: "easy" | "medium" | "hard") => void;
  loadChallenges: (allChallenges: Challenge[], difficulty: "easy" | "medium" | "hard") => void;
  submitAnswer: (choice: "phishing" | "legit") => void;
  resetGame: () => void;
};

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      callsign: "",
      difficulty: "medium",
      challenges: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      answers: [],
      phase: "idle",

      setCallsign: (value: string) => {
        const sanitized = value.replace(/[^a-zA-Z0-9\-_]/g, '');
        set({ callsign: sanitized.trim().slice(0, 20) });
      },

      setDifficulty: (value: "easy" | "medium" | "hard") => set({ difficulty: value }),

      loadChallenges: (allChallenges: Challenge[], difficulty: "easy" | "medium" | "hard") => {
        const filtered = allChallenges.filter((c) => c.difficulty === difficulty);
        
        // Fisher-Yates shuffle
        const shuffled = [...filtered];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        const selected = shuffled.slice(0, 10);
        
        set({
          currentIndex: 0,
          score: 0,
          streak: 0,
          answers: [],
          phase: "playing",
          challenges: selected,
        });
      },

      submitAnswer: (choice: "phishing" | "legit") => {
        const state = get();
        if (state.phase !== "playing") return;

        const current = state.challenges[state.currentIndex];
        if (!current) return;

        const correct = (choice === "phishing" && current.isPhishing) || (choice === "legit" && !current.isPhishing);
        const basePoints = current.points;
        
        const newStreak = correct ? state.streak + 1 : 0;
        
        let multiplier = 1;
        if (newStreak >= 5) {
          multiplier = 2;
        } else if (newStreak >= 3) {
          multiplier = 1.5;
        }

        const pointsAwarded = correct ? Math.round(basePoints * multiplier) : 0;
        
        const answerRecord: AnswerRecord = {
          id: current.id,
          isPhishing: current.isPhishing,
          userChoice: choice,
          correct,
          pointsAwarded,
        };

        const isLast = state.currentIndex === state.challenges.length - 1;

        if (isLast) {
          set({
            score: state.score + pointsAwarded,
            answers: [...state.answers, answerRecord],
            phase: "result",
          });
        } else {
          set({
            score: state.score + pointsAwarded,
            answers: [...state.answers, answerRecord],
            currentIndex: state.currentIndex + 1,
            streak: newStreak,
          });
        }
      },

      resetGame: () => {
        set({
          phase: "idle",
          challenges: [],
          currentIndex: 0,
          score: 0,
          streak: 0,
          answers: [],
        });
      },
    }),
    {
      name: 'phishbait-game',
      partialize: (state) => ({
        callsign: state.callsign,
        difficulty: state.difficulty,
      }),
    }
  )
);
