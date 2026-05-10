"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { submitScore, auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup } from "firebase/auth";

type AnswerRecord = {
  subject: string;
  isPhishing: boolean;
  userAnswer: boolean;
  correct: boolean;
  redFlags: string[];
  explanation: string;
};

export default function ResultsPage() {
  const router = useRouter();
  
  const score = useGameStore((state) => state.score);
  const answers = useGameStore((state) => state.answers);
  const callsign = useGameStore((state) => state.callsign);
  const difficulty = useGameStore((state) => state.difficulty);
  const resetGame = useGameStore((state) => state.resetGame);
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [debrief, setDebrief] = useState<AnswerRecord[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("phishbait_debrief");
    if (raw) {
      try {
        setDebrief(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse debrief", e);
      }
      sessionStorage.removeItem("phishbait_debrief");
    }
  }, []);

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
    <div style={{
      background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "4rem 1rem"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        padding: "2.5rem 2rem",
        width: "100%",
        maxWidth: "640px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        margin: "auto"
      }}>
        
        {/* TOP SECTION */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            color: "#22c55e",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            marginBottom: "0.5rem",
            fontFamily: "monospace",
            fontWeight: 700
          }}>
            MISSION COMPLETE
          </div>
          <div style={{
            color: "white",
            fontSize: "0.95rem",
            opacity: 0.6,
            fontFamily: "monospace"
          }}>
            Agent {callsign || "Unknown"}
          </div>
        </div>

        {/* SCORE */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <span style={{
            fontSize: "clamp(3rem, 8vw, 5rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Syne', sans-serif"
          }}>
            {score}
          </span>
          <span style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "1.5rem",
            marginLeft: "0.5rem",
            fontWeight: 600
          }}>
            pts
          </span>
        </div>

        {/* STATS ROW */}
        <div style={{ display: "flex", gap: "1rem", margin: "1.5rem 0", justifyContent: "center" }}>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "0.75rem 1.25rem",
            flex: 1,
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "0.7rem", color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: "0.25rem", fontFamily: "monospace"
            }}>
              Accuracy
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
              {accuracy}%
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "0.75rem 1.25rem",
            flex: 1,
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "0.7rem", color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: "0.25rem", fontFamily: "monospace"
            }}>
              Correct
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
              {correctCount} / {totalQuestions}
            </div>
          </div>
        </div>

        {/* SIGN IN BANNER */}
        {!user && (
          <div style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px", padding: "1rem 1.25rem",
            marginTop: "1.5rem", textAlign: "center"
          }}>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.75rem" }}>
              Want to save your score and track your progress?
            </p>
            <button
              onClick={async () => {
                await signInWithPopup(auth, googleProvider);
              }}
              style={{
                background: "#ef4444", color: "white", padding: "0.6rem 1.5rem",
                borderRadius: "999px", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.9rem"
              }}>
              Sign in with Google to Save Score
            </button>
          </div>
        )}

        {/* SAVED BADGE */}
        {user && isSaved && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <span style={{
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
              color: "#86efac", fontSize: "0.8rem", padding: "0.4rem 1rem", borderRadius: "999px",
              display: "inline-block"
            }}>
              ✓ Score saved to leaderboard
            </span>
          </div>
        )}

        {/* ACTION BUTTONS ROW */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button 
            onClick={handlePlayAgain}
            style={{
              background: "#ef4444", color: "white", fontWeight: 700,
              padding: "0.75rem 2rem", borderRadius: "999px", flex: 1,
              border: "none", cursor: "pointer", fontFamily: "'Syne', sans-serif"
            }}
          >
            Play Again
          </button>
          
          <button 
            onClick={handleBackToHome}
            style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.6)", padding: "0.75rem 2rem", borderRadius: "999px", flex: 1,
              cursor: "pointer", fontWeight: 600, fontFamily: "'Syne', sans-serif"
            }}
          >
            Back to Home
          </button>
        </div>

        {/* MISSION DEBRIEF */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "2.5rem 0 1.5rem 0" }} />
        
        <h2 style={{
          color: "white", fontSize: "0.75rem", fontWeight: 700,
          letterSpacing: "0.12em", marginBottom: "1rem",
          textTransform: "uppercase"
        }}>
          📋 MISSION DEBRIEF
        </h2>

        {debrief.map((item, i) => (
          <div key={i} style={{
            background: item.correct
              ? "rgba(34, 197, 94, 0.06)"
              : "rgba(239, 68, 68, 0.06)",
            border: `1px solid ${item.correct
              ? "rgba(34, 197, 94, 0.2)"
              : "rgba(239, 68, 68, 0.2)"}`,
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "0.75rem",
          }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1rem" }}>{item.correct ? "✅" : "❌"}</span>
              <p style={{
                color: "white", fontWeight: 600, fontSize: "0.9rem",
                lineHeight: 1.4, margin: 0
              }}>
                {item.subject}
              </p>
            </div>

            {/* Answer vs correct */}
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>
              Your answer:{" "}
              <span style={{ color: item.userAnswer ? "#f87171" : "#86efac" }}>
                {item.userAnswer ? "PHISHING" : "LEGIT"}
              </span>
              {"  •  "}Correct:{" "}
              <span style={{ color: item.isPhishing ? "#f87171" : "#86efac" }}>
                {item.isPhishing ? "PHISHING" : "LEGIT"}
              </span>
            </p>

            {/* Explanation */}
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", marginBottom: item.redFlags?.length ? "0.5rem" : 0 }}>
              {item.explanation}
            </p>

            {/* Red flags — only for phishing */}
            {item.redFlags?.length > 0 && (
              <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
                {item.redFlags.map((flag, j) => (
                  <li key={j} style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "0.2rem"
                  }}>
                    {flag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {debrief.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", textAlign: "center" }}>
            No debrief data available. Play a game first.
          </p>
        )}

      </div>
    </div>
  );
}
