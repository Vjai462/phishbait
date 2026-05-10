"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard } from "@/lib/firebase";
import { ArrowLeft } from "lucide-react";

type LeaderboardEntry = {
  id: string;
  callsign: string;
  score: number;
  accuracy: number;
  difficulty: string;
  createdAt: number;
};

type FilterType = "ALL" | "ROOKIE" | "ELITE";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("ALL");

  useEffect(() => {
    getLeaderboard()
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load leaderboard");
        setLoading(false);
      });
  }, []);

  const filteredEntries = entries.filter((entry) => {
    if (filter === "ROOKIE") return entry.difficulty === "easy";
    if (filter === "ELITE") return entry.difficulty === "hard";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0A14] text-white font-display">
      <div className="pt-16 pb-8 text-center relative max-w-4xl mx-auto px-4">
        <Link href="/" className="absolute top-16 left-4 text-[#ff3b3b] flex items-center gap-2 hover:brightness-110 transition-all">
          <ArrowLeft size={24} />
        </Link>
        
        <h1 className="font-display font-bold text-white text-4xl tracking-widest">
          TOP AGENTS
        </h1>
        <p className="text-[#64748b] text-sm tracking-wide mt-2">
          Global threat neutralisation rankings
        </p>

        <div className="flex gap-3 justify-center mt-6">
          {(["ALL", "ROOKIE", "ELITE"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-display font-semibold transition-all ${
                filter === f
                  ? "bg-[#ff3b3b] text-white"
                  : "bg-[#ffffff10] text-[#64748b] border border-[#ffffff10] hover:bg-[#ffffff15]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 pb-20">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-[#ffffff08] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-[#ff3b3b] text-center py-10 font-display font-bold">
            {error}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-[#64748b] text-center py-10 font-display">
            No agents on the board yet. Be the first.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEntries.map((entry, index) => {
              const rank = index + 1;
              let rankStyle = "text-[#475569] text-sm";
              let rowStyle = "bg-[#ffffff05] border border-[#ffffff08]";
              
              if (rank === 1) {
                rankStyle = "text-[#f59e0b] text-xl font-bold";
                rowStyle = "bg-[#f59e0b]/5 border border-[#f59e0b]/20";
              } else if (rank === 2) {
                rankStyle = "text-[#94a3b8] text-xl font-bold";
                rowStyle = "bg-[#94a3b8]/5 border border-[#94a3b8]/10";
              } else if (rank === 3) {
                rankStyle = "text-[#cd7c2f] text-xl font-bold";
                rowStyle = "bg-[#cd7c2f]/5 border border-[#cd7c2f]/10";
              }

              return (
                <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-xl ${rowStyle}`}>
                  <div className={`w-8 text-center ${rankStyle}`}>
                    {rank}
                  </div>
                  
                  <div className="text-white font-display font-bold text-sm flex-1">
                    {entry.callsign}
                  </div>

                  <div className={`text-[10px] px-2 py-0.5 rounded-full ${
                    entry.difficulty === "easy" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                    entry.difficulty === "medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {entry.difficulty.toUpperCase()}
                  </div>

                  <div className="text-[#64748b] text-xs w-12 text-right">
                    {entry.accuracy}%
                  </div>

                  <div className="text-[#f59e0b] font-display font-bold text-base ml-auto w-16 text-right">
                    {entry.score}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
