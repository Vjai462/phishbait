"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGameStore, type Challenge } from "@/lib/store";
import challengesData from "@/data/challenges.json";
import { ShieldAlert, ShieldX, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

// Type assertion for challengesData since we're loading directly from JSON
const typedChallenges = challengesData as Challenge[];

export default function GamePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Store
  const phase = useGameStore((state) => state.phase);
  const challenges = useGameStore((state) => state.challenges);
  const currentIndex = useGameStore((state) => state.currentIndex);
  const score = useGameStore((state) => state.score);
  const streak = useGameStore((state) => state.streak);
  const submitAnswer = useGameStore((state) => state.submitAnswer);
  const nextChallenge = useGameStore((state) => state.nextChallenge);

  // Local State
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const isPausedRef = useRef(false);
  const answersHistoryRef = useRef<unknown[]>([]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Challenge Context
  const challenge = challenges[currentIndex];

  // Guards
  useEffect(() => {
    const state = useGameStore.getState();
    
    if (state.phase === "playing") return;
    
    if (state.phase === "idle" || state.phase === "result") {
      const { callsign: cs } = useGameStore.getState();
      if (!cs) {
        router.replace("/play");
        return;
      }
      state.loadChallenges(typedChallenges, state.difficulty);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "result") {
      sessionStorage.setItem("phishbait_debrief", JSON.stringify(answersHistoryRef.current));
      router.push("/results");
    }
  }, [phase, router]);

  // Timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (challenge) {
      setIsTyping(true);
      setTimeLeft(challenge.timeLimit);
    }
  }, [challenge, setIsTyping]);

  useEffect(() => {
    if (!challenge || answered || isTyping || showAuthModal) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-answer on timeout, intentionally picking the wrong answer
          handleAnswer("legit", true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [challenge, answered, isTyping, showAuthModal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDismissModal = () => {
    setShowAuthModal(false);
  };

  const handleNextChallenge = () => {
    nextChallenge();
    setAnswered(false);
    setLastCorrect(null);
  };

  const handleAnswer = (choice: "phishing" | "legit", isTimeout = false) => {
    if (answered) return;
    
    // If it's a timeout, forcefully use the wrong answer
    const finalChoice = isTimeout 
      ? (challenge.isPhishing ? "legit" : "phishing") 
      : choice;
      
    setAnswered(true);
    
    const correct = (finalChoice === "phishing" && challenge.isPhishing) || 
                    (finalChoice === "legit" && !challenge.isPhishing);
                    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = challenge.data as Record<string, any>;
    const subject = data.subject || data.url || data.from || "Unknown Threat";

    answersHistoryRef.current.push({
      id: challenge.id || currentIndex.toString(),
      subject,
      isPhishing: challenge.isPhishing,
      userAnswer: finalChoice === "phishing",
      correct,
      redFlags: challenge.redFlags || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      explanation: (challenge as any).explanation || "",
    });
                    
    setLastCorrect(correct);
    submitAnswer(finalChoice);
    
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (!challenge || phase !== "playing") {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="text-[var(--text-muted)] font-mono">Loading...</div>
      </div>
    );
  }

  const timerPercent = (timeLeft / challenge.timeLimit) * 100;

  return (
    <div className="min-h-screen bg-[#0A0A14] relative pb-[100px] overflow-x-hidden">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.85); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      {/* BACKGROUND */}
      <div style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden" }}>
        <Image
          src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=90"
          alt=""
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center",
            opacity: 0.35,
            filter: "contrast(1.1) saturate(0.8) hue-rotate(10deg)",
            pointerEvents: "none"
          }}
          unoptimized
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A14]/80 via-transparent to-[#0A0A14] z-0 pointer-events-none" />

      {/* TOP HUD BAR */}
      <div 
        className="fixed top-0 w-full z-50 bg-[rgba(10,10,20,0.92)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] h-[56px]"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 0.75rem",
          gap: "0.5rem",
          flexWrap: "nowrap",
          overflow: "hidden"
        }}
      >
        {/* LOGO */}
        <div className="flex items-center" style={{ flexShrink: 1, minWidth: 0, overflow: "hidden" }}>
          <ShieldAlert size={18} color="#ff3b3b" style={{ flexShrink: 0 }} />
          <span 
            className="font-mono text-[#ff3b3b] tracking-widest ml-2 font-bold hidden sm:inline"
            style={{ fontSize: "clamp(0.65rem, 2.5vw, 0.85rem)" }}
          >
            PHISHBAIT
          </span>
        </div>

        {/* CENTER: THREAT & SCORE */}
        <div className="flex items-center justify-center gap-3" style={{ flexShrink: 0 }}>
          <div 
            className="font-mono text-[#64748b] tracking-widest"
            style={{ fontSize: "0.7rem" }}
          >
            {currentIndex + 1}/{challenges.length}
          </div>
          <div className="flex items-baseline">
            <span className="font-display font-bold text-[#f59e0b]" style={{ fontSize: "clamp(0.75rem, 2.5vw, 1rem)" }}>{score}</span>
            <span className="text-[#64748b] text-xs ml-1 font-mono">PTS</span>
          </div>
          {streak >= 3 && (
            <div className="anim-pulse bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] font-mono text-xs px-2 py-0.5 rounded-full hidden sm:block">
              🔥 {streak}x
            </div>
          )}
        </div>

        {/* RIGHT: USER & PAUSE */}
        <div className="flex items-center justify-end gap-2" style={{ flexShrink: 0 }}>
          {!user ? (
            <button
              onClick={() => { setShowAuthModal(true); }}
              style={{
                background: "rgba(34, 211, 170, 0.1)",
                border: "1px solid rgba(34, 211, 170, 0.3)",
                color: "#22d3aa",
                fontFamily: "monospace",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                padding: "0.3rem 0.6rem",
                borderRadius: "999px",
                cursor: "pointer",
                textTransform: "uppercase",
                maxWidth: "80px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              ⚡ Sign In
            </button>
          ) : (
            <button
              onClick={() => router.push("/profile")}
              style={{
                background: "none", border: "none",
                fontFamily: "monospace", fontSize: "0.7rem",
                color: "rgba(34,211,170,0.7)", cursor: "pointer",
                letterSpacing: "0.08em", padding: 0,
                textDecoration: "underline", textUnderlineOffset: "3px",
                maxWidth: "80px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {user.displayName?.split(" ")[0]?.toUpperCase()} ↗
            </button>
          )}

          <button
            onClick={() => setIsPaused(true)}
            className="flex items-center justify-center rounded-full bg-[#ffffff10] text-white hover:bg-[#ffffff20] transition-colors border border-[#ffffff15] font-sans text-sm"
            aria-label="Pause game"
            style={{ minWidth: "36px", minHeight: "36px" }}
          >
            ⏸
          </button>
        </div>
      </div>

      {/* TIMER BAR */}
      <div className="fixed top-[56px] w-full h-[3px] bg-[#1a1a2e] z-40">
        <div 
          className="h-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${timerPercent}%`,
            backgroundColor: timerPercent > 60 ? "#3b82f6" : timerPercent > 30 ? "#f59e0b" : "#ff3b3b",
            boxShadow: timerPercent <= 30 ? "0 0 8px #ff3b3b" : "none"
          }}
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="pt-20 pb-32 min-h-screen flex flex-col items-center justify-center relative z-10 w-full">
        
        {/* THREAT CONTEXT LABEL */}
        <div style={{
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          color: "#fca5a5",
          fontFamily: "monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          padding: "0.35rem 1rem",
          borderRadius: "999px",
          animation: "pulse 2s ease-in-out infinite",
          marginBottom: "1rem"
        }}>
          ⚠ INTERCEPTED TRANSMISSION
        </div>

        {/* CHALLENGE CARD */}
        <div className={`w-full max-w-[680px] mx-auto px-4 ${!lastCorrect && answered ? "anim-shake" : ""}`}>
          <div 
            style={{
              background: "rgba(6, 10, 18, 0.95)",
              border: "1px solid rgba(34, 211, 170, 0.25)",
              borderRadius: "12px",
              padding: "0",
              overflow: "hidden",
              boxShadow: "0 0 40px rgba(34, 211, 170, 0.08), 0 4px 24px rgba(0,0,0,0.6)",
              position: "relative"
            }}
          >
            <TerminalCard challenge={challenge} onTypingComplete={handleTypingComplete} />
          </div>
        </div>

        {/* ANSWER FEEDBACK PANEL */}
        {answered && (
          <div className="mt-4 max-w-[680px] mx-auto px-4 w-full">
            <div className={`rounded-2xl p-5 border ${lastCorrect ? "bg-[#052e16]/80 border-[#16a34a]/40" : "bg-[#2d0a0a]/80 border-[#ff3b3b]/40"}`}>
              <div className="flex items-center gap-3">
                {lastCorrect ? <CheckCircle2 size={20} color="#16a34a" /> : <XCircle size={20} color="#ff3b3b" />}
                <span className={`font-display font-bold text-sm tracking-wide ${lastCorrect ? "text-[#16a34a]" : "text-[#ff3b3b]"}`}>
                  {lastCorrect ? "THREAT NEUTRALISED" : "BREACH DETECTED"}
                </span>
              </div>
              
              <div className="mt-2 mb-4">
                <div className="text-[#64748b] font-mono text-xs mb-2">Here&apos;s why:</div>
                <div className="flex flex-col gap-2">
                  {challenge.redFlags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={lastCorrect ? "text-[#16a34a]" : "text-[#ff3b3b]"}>›</span>
                      <span className="text-[#94a3b8] font-body text-sm">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ width: "100%", boxSizing: "border-box", padding: "0 0" }}>
                <button
                  onClick={handleNextChallenge}
                  className={`w-full font-display font-bold text-white rounded-full transition ${lastCorrect ? "bg-[#16a34a] hover:bg-[#15803d]" : "bg-[#ff3b3b] hover:bg-[#e13232]"}`}
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    fontSize: "clamp(0.75rem, 3.5vw, 0.95rem)",
                    padding: "0.85rem 1rem",
                    textAlign: "center"
                  }}
                >
                  NEXT THREAT →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      {!answered && (
        <div className="fixed bottom-0 w-full h-[64px] z-50 flex shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <button 
            onClick={() => handleAnswer("phishing")}
            className="flex-1 flex items-center justify-center bg-[#ff3b3b] text-white font-display font-bold uppercase tracking-widest text-sm transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(255,59,59,0.3)]"
          >
            <ShieldX size={16} className="mr-2" />
            PHISHING
          </button>
          <button 
            onClick={() => handleAnswer("legit")}
            className="flex-1 flex items-center justify-center bg-[#16a34a] text-white font-display font-bold uppercase tracking-widest text-sm transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(22,163,74,0.3)]"
          >
            LEGIT
            <ShieldCheck size={16} className="ml-2" />
          </button>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.85)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "1.5rem"
        }}>
          <h2 style={{ color: "white", fontSize: "2rem", fontWeight: 700, letterSpacing: "0.1em" }} className="font-display">
            PAUSED
          </h2>
          
          <button onClick={() => setIsPaused(false)}
            style={{ background: "#ef4444", color: "white", padding: "0.75rem 2.5rem",
                     borderRadius: "999px", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer" }} className="font-display">
            ▶ RESUME
          </button>

          <button onClick={() => { setIsPaused(false); window.location.reload(); }}
            style={{ background: "transparent", color: "white", padding: "0.75rem 2.5rem",
                     borderRadius: "999px", fontWeight: 700, fontSize: "1rem",
                     border: "2px solid rgba(255,255,255,0.3)", cursor: "pointer" }} className="font-display">
            ↺ RESTART
          </button>

          <button onClick={() => router.push("/")}
            style={{ background: "transparent", color: "#aaa", padding: "0.75rem 2.5rem",
                     borderRadius: "999px", fontWeight: 600, fontSize: "1rem",
                     border: "2px solid rgba(255,255,255,0.15)", cursor: "pointer" }} className="font-display">
            ✕ EXIT TO HOME
          </button>
        </div>
      )}

      {showAuthModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem"
        }}
        onClick={handleDismissModal}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(6, 10, 18, 0.98)",
              border: "1px solid rgba(34, 211, 170, 0.25)",
              borderRadius: "16px",
              padding: "2rem 1.75rem",
              width: "100%",
              maxWidth: "360px",
              boxShadow: "0 0 60px rgba(34,211,170,0.08), 0 24px 48px rgba(0,0,0,0.6)",
              textAlign: "center"
            }}
          >
            {/* Terminal header */}
            <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
            </div>

            {/* Icon */}
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔐</div>

            {/* Title */}
            <h3 style={{
              color: "white", fontSize: "1.1rem", fontWeight: 700,
              marginBottom: "0.5rem", fontFamily: "monospace"
            }}>
              AGENT AUTHENTICATION
            </h3>

            {/* Subtitle */}
            <p style={{
              color: "rgba(255,255,255,0.45)", fontSize: "0.82rem",
              marginBottom: "0.4rem", lineHeight: 1.5
            }}>
              ⏸ Timer paused
            </p>
            <p style={{
              color: "rgba(255,255,255,0.45)", fontSize: "0.82rem",
              marginBottom: "1.5rem", lineHeight: 1.5
            }}>
              Sign in to save your score to the global leaderboard.
              Your progress is safe.
            </p>

            {/* Google Sign In button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              style={{
                width: "100%",
                background: authLoading ? "rgba(255,255,255,0.05)" : "#ffffff",
                color: "#1a1a1a",
                fontWeight: 700,
                fontSize: "0.9rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                border: "none",
                cursor: authLoading ? "not-allowed" : "pointer",
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                opacity: authLoading ? 0.6 : 1
              }}
            >
              {/* Google G icon */}
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              {authLoading ? "Signing in..." : "Continue with Google"}
            </button>

            {/* Dismiss / continue as guest */}
            <button
              onClick={handleDismissModal}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.82rem",
                padding: "0.6rem 1.5rem",
                borderRadius: "999px",
                cursor: "pointer"
              }}
            >
              Continue as Guest → Resume game
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-components

function TerminalCard({ challenge, onTypingComplete }: { challenge: Challenge; onTypingComplete: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = challenge.data as Record<string, any>;
  let sender = "UNKNOWN";
  let fullText = "";

  if (challenge.type === "email") {
    sender = data.senderName || "EMAIL";
    fullText = `FROM: ${data.senderName} <${data.senderEmail}>\nSUBJECT: ${data.subject}\n----------------------------------------\n\n${data.body}`;
    if (data.linkUrl) {
      fullText += `\n\n[LINK DETECTED]: ${data.linkUrl}`;
    }
  } else if (challenge.type === "url") {
    sender = "WEB_SCANNER";
    fullText = `CONTEXT: ${data.context}\n----------------------------------------\n\n[TARGET URL]: ${data.url}`;
  } else if (challenge.type === "sms") {
    sender = data.from || "SMS";
    fullText = data.body;
  }

  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCharIndex(0);
  }, [challenge]);

  useEffect(() => {
    if (charIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 18);
      return () => clearTimeout(timer);
    } else {
      onTypingComplete();
    }
  }, [charIndex, fullText, onTypingComplete]);

  return (
    <>
      <div style={{
        background: "rgba(34, 211, 170, 0.06)",
        borderBottom: "1px solid rgba(34, 211, 170, 0.15)",
        padding: "0.5rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.5rem"
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
        </div>

        <span style={{
          fontFamily: "monospace",
          fontSize: "0.7rem",
          color: "rgba(34, 211, 170, 0.7)",
          letterSpacing: "0.12em",
          textTransform: "uppercase"
        }}>
          INTERCEPT // {sender}
        </span>

        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#22d3aa",
          display: "inline-block",
          animation: "pulse 1.5s ease-in-out infinite"
        }} />
      </div>

      <div style={{ padding: "1.25rem 1.25rem 1.5rem" }}>
        <div style={{
          fontFamily: "monospace",
          fontSize: "0.95rem",
          lineHeight: 1.7,
          color: "#e2e8f0",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        }}>
          {displayedText}
          <span style={{
            display: "inline-block", width: "2px", height: "1em",
            background: "#22d3aa", marginLeft: "2px",
            animation: "blink 1s step-end infinite",
            verticalAlign: "text-bottom"
          }} />
        </div>
      </div>
      
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,170,0.015) 2px, rgba(34,211,170,0.015) 4px)",
        pointerEvents: "none",
        borderRadius: "12px"
      }} />
    </>
  );
}
