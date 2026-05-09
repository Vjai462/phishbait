"use client";

import { useRouter } from "next/navigation";

export default function DailyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] p-4">
      <div className="w-full max-w-[480px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] p-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.4)] text-center sm:text-left">
        <h1 className="font-[Syne] font-bold text-[1.5rem] text-[var(--text-primary)]">
          Daily Challenge
        </h1>
        <p className="font-mono text-[var(--text-muted)] text-[0.9rem] mt-[8px]">
          Coming Soon — check back tomorrow.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-[24px] bg-[var(--accent-danger)] text-white font-[Syne] font-bold py-[12px] px-[24px] rounded-full transition-all hover:brightness-110"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
