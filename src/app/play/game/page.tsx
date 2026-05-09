"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, type Challenge } from "@/lib/store";
import challengesData from "@/data/challenges.json";

// Type assertion for challengesData since we're loading directly from JSON
const typedChallenges = challengesData as Challenge[];

export default function GamePage() {
  const router = useRouter();
  
  // Store
  const phase = useGameStore((state) => state.phase);
  const callsign = useGameStore((state) => state.callsign);
  const difficulty = useGameStore((state) => state.difficulty);
  const challenges = useGameStore((state) => state.challenges);
  const currentIndex = useGameStore((state) => state.currentIndex);
  const score = useGameStore((state) => state.score);
  const streak = useGameStore((state) => state.streak);
  const loadChallenges = useGameStore((state) => state.loadChallenges);
  const submitAnswer = useGameStore((state) => state.submitAnswer);

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

    setTimeout(() => {
      setAnswered(false);
      setLastCorrect(null);
    }, 1800);
  };

  if (!challenge || phase !== "playing") {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="text-[var(--text-muted)] font-mono">Loading...</div>
      </div>
    );
  }

  const timerPercent = (timeLeft / challenge.timeLimit) * 100;
  const isTimeLow = timerPercent <= 30;

  return (
    <div className="min-h-screen bg-[var(--bg-void)] relative pb-[100px]">
      {/* 1. TOP BAR */}
      <div className="fixed top-0 w-full z-50 bg-[rgba(10,10,20,0.95)] px-[24px] py-[12px] flex items-center justify-between border-b border-[var(--border-subtle)] backdrop-blur-md">
        <div className="font-mono text-[var(--accent-danger)] text-[1.2rem]">
          🎣 PHISHBAIT
        </div>
        <div className="font-mono text-[var(--text-muted)] absolute left-1/2 -translate-x-1/2">
          {currentIndex + 1} / 10
        </div>
        <div className="flex items-center gap-3">
          {streak >= 3 && (
            <div className="font-mono text-[var(--accent-points)] text-[0.85rem] bg-[color-mix(in_srgb,var(--accent-points)_15%,transparent)] px-2 py-0.5 rounded border border-[color-mix(in_srgb,var(--accent-points)_30%,transparent)]">
              🔥 {streak}streak
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="font-[Syne] font-bold text-[var(--accent-points)] text-[1.1rem]">
              {score}
            </span>
            <span className="text-[var(--text-muted)] font-mono text-xs">PTS</span>
          </div>
        </div>
      </div>

      {/* 2. TIMER BAR */}
      <div className="fixed top-[52px] w-full h-[4px] bg-[var(--border-subtle)] z-40">
        <div 
          className="h-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${timerPercent}%`,
            backgroundColor: isTimeLow ? "var(--accent-danger)" : "var(--accent-info)"
          }}
        />
      </div>

      {/* 3. CHALLENGE CARD */}
      <div className={`mt-[80px] max-w-[680px] mx-auto px-[16px] relative ${!lastCorrect && answered ? "anim-shake" : ""}`}>
        {challenge.type === "email" && <EmailCard challenge={challenge} />}
        {challenge.type === "url" && <UrlCard challenge={challenge} />}
        {challenge.type === "sms" && <SmsCard challenge={challenge} />}

        {/* FEEDBACK OVERLAY */}
        {answered && (
          <div 
            className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-[8px] p-6 backdrop-blur-[2px] transition-all duration-300"
            style={{ 
              backgroundColor: lastCorrect 
                ? "rgba(40,200,64,0.15)" // Safe green tint
                : "rgba(255,59,59,0.15)" // Danger red tint
            }}
          >
            <div 
              className={`font-[Syne] font-extrabold text-[2rem] text-center drop-shadow-lg ${
                lastCorrect ? "text-[var(--accent-safe)]" : "text-[var(--accent-danger)]"
              }`}
            >
              {lastCorrect ? "NICE CATCH ✓" : "CAUGHT! ✗"}
            </div>
            
            {!lastCorrect && challenge.redFlags.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-[90%]">
                {challenge.redFlags.map((flag, i) => (
                  <div 
                    key={i} 
                    className="bg-[rgba(255,59,59,0.15)] border border-[var(--accent-danger)] text-[var(--text-primary)] text-[0.75rem] px-[10px] py-[4px] rounded-[4px] font-mono text-center shadow-sm"
                  >
                    {flag}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. DECISION BUTTONS */}
      <div className="fixed bottom-0 w-full flex h-[64px] z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button 
          disabled={answered}
          onClick={() => handleAnswer("phishing")}
          className="flex-1 bg-[var(--accent-danger)] text-white font-[Syne] font-bold uppercase disabled:opacity-50 transition-all hover:brightness-110 hover:shadow-[inset_0_0_20px_var(--glow-danger)]"
        >
          PHISHING
        </button>
        <button 
          disabled={answered}
          onClick={() => handleAnswer("legit")}
          className="flex-1 bg-[var(--accent-safe)] text-[#0A0A14] font-[Syne] font-bold uppercase disabled:opacity-50 transition-all hover:brightness-110 hover:shadow-[inset_0_0_20px_var(--glow-safe)]"
        >
          LEGIT
        </button>
      </div>
    </div>
  );
}

// Sub-components

function EmailCard({ challenge }: { challenge: Challenge }) {
  const [showFullLink, setShowFullLink] = useState(false);
  const data = challenge.data;
  
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
  const data = challenge.data;
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
  const data = challenge.data;
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
