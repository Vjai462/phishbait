"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";

export default function CallsignScreen() {
  const router = useRouter();
  const storeCallsign = useGameStore((state) => state.callsign);
  const storeDifficulty = useGameStore((state) => state.difficulty);
  const setCallsign = useGameStore((state) => state.setCallsign);
  const setDifficulty = useGameStore((state) => state.setDifficulty);

  const [callsign, setLocalCallsign] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  useEffect(() => {
    if (storeCallsign) {
      setLocalCallsign(storeCallsign);
    }
    if (storeDifficulty) {
      setSelectedDifficulty(storeDifficulty);
    }
  }, [storeCallsign, storeDifficulty]);

  const handleCallsignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitized = value.replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 20);
    setLocalCallsign(sanitized);
  };

  const handleDeploy = () => {
    if (callsign.length >= 2) {
      setCallsign(callsign);
      setDifficulty(selectedDifficulty);
      router.push("/play/game");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] p-4">
      <div className="w-full max-w-[480px] p-[48px] bg-[var(--bg-card)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-info)] transition-colors duration-200 shadow-[0_0_40px_rgba(0,0,0,0.4)] relative">
        
        {/* 1. Decorative dots */}
        <div className="flex gap-2 mb-[32px]">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
          <div className="w-3 h-3 rounded-full bg-[#555555]"></div>
        </div>

        {/* 2. Terminal title */}
        <div className="font-mono text-[0.85rem] text-[var(--text-code)] flex items-center gap-1">
          <span>INITIALISING AGENT SESSION...</span>
          <span className="anim-blink">|</span>
        </div>

        {/* 3. Callsign label */}
        <label className="block mt-[32px] font-mono text-[0.75rem] text-[var(--text-muted)] tracking-[0.15em]">
          ENTER CALLSIGN
        </label>

        {/* 4. Text input */}
        <div className="mt-2">
          <input
            type="text"
            value={callsign}
            onChange={handleCallsignChange}
            placeholder="_ _ _ _ _ _ _ _"
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent border-0 border-b border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-safe)] text-[var(--text-code)] font-mono text-2xl py-2 transition-colors duration-200"
            style={{ caretColor: 'var(--accent-safe)' }}
          />
          <span className="block text-right font-mono text-[0.7rem] text-[var(--text-muted)] mt-1">
            {callsign.length} / 20
          </span>
        </div>

        {/* 5. Difficulty selector */}
        <div className="mt-[24px]">
          <label className="block font-mono text-[0.75rem] text-[var(--text-muted)] tracking-[0.15em] mb-3">
            SELECT DIFFICULTY
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDifficulty("easy")}
              className="flex-1 font-bold text-[0.8rem] uppercase py-[10px] px-[16px] transition-all duration-200 border"
              style={{
                fontFamily: 'Syne, sans-serif',
                backgroundColor: selectedDifficulty === "easy" ? "color-mix(in srgb, var(--accent-safe) 15%, transparent)" : "var(--bg-surface)",
                borderColor: selectedDifficulty === "easy" ? "var(--accent-safe)" : "var(--border-subtle)",
                color: selectedDifficulty === "easy" ? "var(--accent-safe)" : "var(--text-muted)"
              }}
            >
              ROOKIE
            </button>
            <button
              onClick={() => setSelectedDifficulty("medium")}
              className="flex-1 font-bold text-[0.8rem] uppercase py-[10px] px-[16px] transition-all duration-200 border"
              style={{
                fontFamily: 'Syne, sans-serif',
                backgroundColor: selectedDifficulty === "medium" ? "color-mix(in srgb, var(--accent-points) 15%, transparent)" : "var(--bg-surface)",
                borderColor: selectedDifficulty === "medium" ? "var(--accent-points)" : "var(--border-subtle)",
                color: selectedDifficulty === "medium" ? "var(--accent-points)" : "var(--text-muted)"
              }}
            >
              AGENT
            </button>
            <button
              onClick={() => setSelectedDifficulty("hard")}
              className="flex-1 font-bold text-[0.8rem] uppercase py-[10px] px-[16px] transition-all duration-200 border"
              style={{
                fontFamily: 'Syne, sans-serif',
                backgroundColor: selectedDifficulty === "hard" ? "color-mix(in srgb, var(--accent-danger) 15%, transparent)" : "var(--bg-surface)",
                borderColor: selectedDifficulty === "hard" ? "var(--accent-danger)" : "var(--border-subtle)",
                color: selectedDifficulty === "hard" ? "var(--accent-danger)" : "var(--text-muted)"
              }}
            >
              ELITE
            </button>
          </div>
        </div>

        {/* 6. DEPLOY button */}
        <button
          onClick={handleDeploy}
          disabled={callsign.length < 2}
          className="w-full h-[52px] mt-[32px] bg-[var(--accent-danger)] text-white font-bold uppercase tracking-[0.08em] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          DEPLOY
        </button>

      </div>
    </div>
  );
}
