"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { submitScore, auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup } from "firebase/auth";

export default function ResultsPage() {
  const router = useRouter();
  
  const score = useGameStore((state) => state.score);
  const answers = useGameStore((state) => state.answers);
  const callsign = useGameStore((state) => state.callsign);
  const difficulty = useGameStore((state) => state.difficulty);
  const resetGame = useGameStore((state) => state.resetGame);
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const totalQuestions = answers.length;
  const correctCount = answers.filter((a) => a.correct).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (answers.length === 0) {
      router.replace("/play");
    }
  }, [answers.length, router]);

  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!answers.length) return;
    if (!user) return; // guest - don't submit
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const diff = difficulty || "easy";
    const agentCallsign = callsign || "Unknown";

    submitScore({
      callsign: agentCallsign,
      score,
      accuracy,
      difficulty: diff,
      createdAt: Date.now()
    }).then(() => {
      setIsSaved(true);
    }).catch(() => {});
  }, [answers.length, score, accuracy, difficulty, callsign, user]);

  if (answers.length === 0) {
    return null; // Prevents NaN flashing while redirecting
  }

  const handlePlayAgain = () => {
    hasSubmittedRef.current = false;
    resetGame();
    router.push("/play");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] p-4">
      <div className="w-full max-w-[480px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] p-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        
        <h1 className="font-[Syne] font-bold text-[1.5rem] text-[var(--text-primary)]">
          Mission Report
        </h1>
        
        <div className="font-mono text-[var(--text-muted)] mb-[16px] text-[0.85rem]">
          Agent {callsign || "Unknown"}
        </div>
        
        <div className="mt-[8px] space-y-2">
          <div className="text-[var(--accent-points)] text-[1.2rem] font-bold font-[Syne]">
            Score: {score} pts
          </div>
          
          <div className="text-[var(--text-primary)] font-sans font-medium">
            Accuracy: {accuracy}%
          </div>
          
          <div className="text-[var(--text-muted)] font-mono text-[0.85rem]">
            {correctCount} / {totalQuestions} correct
          </div>
        </div>

        {!user && (
          <div style={{
            marginTop: "1.5rem",
            padding: "1rem 1.5rem",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center"
          }}>
            <p style={{ color: "#aaa", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
              Want to save your score and track your progress?
            </p>
            <button
              onClick={async () => {
                await signInWithPopup(auth, googleProvider);
              }}
              style={{
                background: "#ef4444",
                color: "white",
                padding: "0.6rem 1.5rem",
                borderRadius: "999px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}>
              Sign in with Google to Save Score
            </button>
          </div>
        )}

        {user && isSaved && (
          <div className="mt-4 text-center text-[#16a34a] font-mono text-sm">
            Saved to leaderboard ✓
          </div>
        )}

        <div className="mt-[32px] flex gap-3">
          <button 
            onClick={handlePlayAgain}
            className="flex-1 bg-[var(--accent-danger)] text-white py-[12px] px-[16px] rounded-full font-[Syne] font-bold transition-all hover:brightness-110"
          >
            Play Again
          </button>
          
          <button 
            onClick={handleBackToHome}
            className="flex-1 bg-transparent border border-[var(--border-subtle)] text-[var(--text-muted)] py-[12px] px-[16px] rounded-full font-[Syne] font-bold transition-all hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
