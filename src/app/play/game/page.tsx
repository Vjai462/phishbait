"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, type Challenge } from "@/lib/store";
import challengesData from "@/data/challenges.json";
import { ShieldAlert, ShieldX, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

// Type assertion for challengesData since we're loading directly from JSON
const typedChallenges = challengesData as Challenge[];

export default function GamePage() {
  const router = useRouter();
  
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
      router.push("/results");
    }
  }, [phase, router]);

  // Timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (challenge && !answered) {
      setTimeLeft(challenge.timeLimit);
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
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
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [challenge, answered]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* BACKGROUND */}
      <img
        src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=90"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: 0.35,
          filter: "contrast(1.1) saturate(0.8) hue-rotate(10deg)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A14]/80 via-transparent to-[#0A0A14] z-0 pointer-events-none" />

      {/* TOP HUD BAR */}
      <div className="fixed top-0 w-full z-50 bg-[rgba(10,10,20,0.92)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] h-[56px] px-6 flex items-center justify-between">
        <div className="flex items-center">
          <ShieldAlert size={18} color="#ff3b3b" />
          <span className="font-mono text-[#ff3b3b] text-sm tracking-widest ml-2 font-bold">PHISHBAIT</span>
        </div>
        <div className="font-mono text-[#64748b] text-xs tracking-widest absolute left-1/2 -translate-x-1/2">
          THREAT {currentIndex + 1} OF {challenges.length}
        </div>
        <div className="flex items-center">
          <div className="flex items-baseline">
            <span className="font-display font-bold text-[#f59e0b] text-base">{score}</span>
            <span className="text-[#64748b] text-xs ml-1 font-mono">PTS</span>
          </div>
          {streak >= 3 && (
            <div className="anim-pulse bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] font-mono text-xs px-2 py-0.5 rounded-full ml-3">
              🔥 {streak}x
            </div>
          )}
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
        <div className="mb-4 bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 text-[#ff3b3b] font-mono text-[10px] tracking-widest px-3 py-1 rounded-full">
          {challenge.type === "email" ? "⚠ SUSPICIOUS EMAIL INTERCEPTED" : 
           challenge.type === "url" ? "⚠ MALICIOUS LINK DETECTED" : 
           "⚠ SUSPICIOUS SMS RECEIVED"}
        </div>

        {/* CHALLENGE CARD */}
        <div className={`w-full max-w-[680px] mx-auto px-4 ${!lastCorrect && answered ? "anim-shake" : ""}`}>
          <div 
            className="bg-[rgba(15,15,30,0.95)] border border-[rgba(255,255,255,0.08)] rounded-[16px] backdrop-blur-sm border-t-[2px] border-t-[#ff3b3b] overflow-hidden p-[1px]"
            style={{
              boxShadow: (answered && lastCorrect === false) 
                ? "0 0 0 1px rgba(255,59,59,0.4), 0 24px 60px rgba(0,0,0,0.5)" 
                : "0 0 0 1px rgba(255,59,59,0.05), 0 24px 60px rgba(0,0,0,0.5)",
              borderColor: (answered && lastCorrect === false) ? "rgba(255,59,59,0.4)" : "rgba(255,255,255,0.08)"
            }}
          >
            {challenge.type === "email" && <EmailCard challenge={challenge} />}
            {challenge.type === "url" && <UrlCard challenge={challenge} />}
            {challenge.type === "sms" && <SmsCard challenge={challenge} />}
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

              <button
                onClick={handleNextChallenge}
                className={`w-full font-display font-bold text-white rounded-full py-3 transition ${lastCorrect ? "bg-[#16a34a] hover:bg-[#15803d]" : "bg-[#ff3b3b] hover:bg-[#e13232]"}`}
              >
                {lastCorrect ? "NEXT THREAT →" : "UNDERSTOOD — NEXT THREAT →"}
              </button>
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
    </div>
  );
}

// Sub-components

function EmailCard({ challenge }: { challenge: Challenge }) {
  const [showFullLink, setShowFullLink] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = challenge.data as Record<string, any>;
  
  const initials = data.senderName 
    ? data.senderName.substring(0, 2).toUpperCase() 
    : "??";

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 40%)`;
  };

  const paragraphs = data.body ? data.body.split("\n").filter((p: string) => p.trim() !== "") : [];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[8px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
      {/* Header strip */}
      <div className="bg-[#0d0d1a] p-[16px_20px] border-b border-[var(--border-subtle)]">
        <div className="flex gap-4 items-center">
          <div 
            className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: getAvatarColor(data.senderName || "Unknown") }}
          >
            {initials}
          </div>
          <div className="flex flex-col">
            <div className="font-sans font-semibold text-[var(--text-primary)] text-[0.9rem]">
              {data.senderName}
            </div>
            <div className="font-mono text-[var(--text-code)] text-[0.75rem]">
              &lt;{data.senderEmail}&gt;
            </div>
          </div>
        </div>
        <div className="font-sans font-semibold text-[var(--text-primary)] text-[1rem] mt-[8px]">
          {data.subject}
        </div>
      </div>
      
      {/* Body */}
      <div className="p-[20px] font-sans font-normal text-[var(--text-primary)] text-[0.9rem] leading-[1.7]">
        {paragraphs.map((p: string, i: number) => (
          <p key={i} className="mb-4 last:mb-0">{p}</p>
        ))}
        
        {data.linkText && data.linkUrl && (
          <div className="mt-6">
            <button 
              onClick={() => setShowFullLink(!showFullLink)}
              className="inline-block px-4 py-2 bg-[color-mix(in_srgb,var(--bg-surface)_100%,transparent)] border border-[var(--border-subtle)] text-[var(--text-code)] rounded-[16px] font-mono text-[0.8rem] transition-colors hover:border-[var(--accent-info)]"
            >
              🔗 {data.linkText}
            </button>
            {showFullLink && (
              <div className="mt-3 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[4px] font-mono text-[0.8rem] text-[var(--accent-info)] break-all shadow-inner">
                {data.linkUrl}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UrlCard({ challenge }: { challenge: Challenge }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = challenge.data as Record<string, any>;
  return (
    <div className="mt-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
      {data.context && (
        <div className="font-sans italic text-[var(--text-muted)] text-[0.9rem] mb-[16px] text-center px-4">
          {data.context}
        </div>
      )}
      <div className="font-mono text-[var(--text-code)] text-[1.1rem] p-[20px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[6px] break-all text-center">
        {data.url}
      </div>
    </div>
  );
}

function SmsCard({ challenge }: { challenge: Challenge }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = challenge.data as Record<string, any>;
  return (
    <div className="max-w-[320px] mx-auto bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[16px] p-[20px] mt-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
      <div className="font-mono text-[var(--text-muted)] text-[0.75rem] text-center mb-[12px]">
        {data.from}
      </div>
      <div className="bg-[#1e1e32] rounded-[12px_12px_12px_2px] p-[12px_16px] font-sans text-[var(--text-primary)] text-[0.9rem] max-w-[85%] leading-[1.6]">
        {data.body}
      </div>
    </div>
  );
}
