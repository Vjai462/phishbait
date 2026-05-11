"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { submitScore, auth, googleProvider, saveGameHistory } from "@/lib/firebase";
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
  const [copied, setCopied] = useState(false);

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
    }).then(async () => {
      setIsSaved(true);
      await saveGameHistory(user.uid, {
        score: score,
        accuracy: accuracy,
        correct: correctCount,
        total: totalQuestions,
        playedAt: Date.now()
      });
    }).catch(() => {});
  }, [answers.length, score, accuracy, difficulty, callsign, user, correctCount, totalQuestions]);

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

  const shareUrl = `https://phishbait-hazel.vercel.app/share?score=${score}&accuracy=${accuracy}&name=${encodeURIComponent(user?.displayName?.split(" ")[0] || "Someone")}`;
  const shareText = `🎣 I scored ${score} pts on PhishBait with ${accuracy}% accuracy!\nCan you spot the phish? Try it: ${shareUrl}`;

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* SHARE SECTION */}
        <div style={{
          marginTop: "1.5rem",
          padding: "1.25rem",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          textAlign: "center"
        }}>

          {/* Label */}
          <p style={{
            margin: "0 0 0.25rem 0",
            fontSize: "0.7rem",
            color: "rgba(34,211,170,0.7)",
            letterSpacing: "0.15em",
            fontFamily: "monospace"
          }}>
            TRANSMIT RESULTS
          </p>
          <p style={{
            margin: "0 0 1rem 0",
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.4)"
          }}>
            Challenge your network — can they spot the phish?
          </p>

          {/* Share buttons row */}
          <div style={{
            display: "flex",
            gap: "0.6rem",
            justifyContent: "center",
            flexWrap: "wrap"
          }}>

            {/* Twitter / X */}
            <button
              onClick={shareOnTwitter}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: "#000000",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                fontSize: "0.82rem", fontWeight: 600,
                padding: "0.55rem 1.1rem",
                borderRadius: "999px",
                cursor: "pointer"
              }}
            >
              {/* X logo */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on X
            </button>

            {/* WhatsApp */}
            <button
              onClick={shareOnWhatsApp}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: "#25D366",
                border: "none",
                color: "white",
                fontSize: "0.82rem", fontWeight: 600,
                padding: "0.55rem 1.1rem",
                borderRadius: "999px",
                cursor: "pointer"
              }}
            >
              {/* WhatsApp icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>

            {/* Copy link */}
            <button
              onClick={copyToClipboard}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.12)"}`,
                color: copied ? "#86efac" : "rgba(255,255,255,0.7)",
                fontSize: "0.82rem", fontWeight: 600,
                padding: "0.55rem 1.1rem",
                borderRadius: "999px",
                cursor: "pointer",
                transition: "all 200ms ease"
              }}
            >
              {copied ? "✓ Copied!" : "⎘ Copy link"}
            </button>

          </div>

          {/* Preview of share text */}
          <p style={{
            marginTop: "0.85rem",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.2)",
            fontStyle: "italic",
            lineHeight: 1.5
          }}>
            &ldquo;{shareText.split('\n')[0]}&rdquo;
          </p>

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
