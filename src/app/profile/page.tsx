"use client";

import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type HistoryEntry = {
  score: number;
  accuracy: number;
  correct: number;
  total: number;
  playedAt: number;
};

type ProfileData = {
  bestScore: number;
  avgAccuracy: number;
  gamesPlayed: number;
  history: HistoryEntry[];
};

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    getUserProfile(user.uid).then(data => {
      setProfile(data as ProfileData | null);
      setLoading(false);
    });
  }, [user, router]);

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 100%)",
      color: "white",
      fontFamily: "monospace",
      padding: "2rem 1rem"
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Back link */}
        <button onClick={() => router.push("/")} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.4)",
          fontFamily: "monospace", fontSize: "0.8rem", cursor: "pointer",
          marginBottom: "2rem", padding: 0, letterSpacing: "0.05em"
        }}>
          ← BACK TO BASE
        </button>

        {/* Agent header */}
        <div style={{
          display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem"
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem", fontWeight: 700, color: "#ef4444"
          }}>
            {user?.displayName?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(34,211,170,0.7)", letterSpacing: "0.15em" }}>
              AGENT PROFILE
            </p>
            <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "white" }}>
              {user?.displayName?.toUpperCase() || "UNKNOWN AGENT"}
            </h1>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
              {user?.email}
            </p>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>
            LOADING MISSION DATA...
          </p>
        ) : !profile ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", marginBottom: "1rem" }}>
              No missions completed yet.
            </p>
            <button onClick={() => router.push("/play")} style={{
              background: "#ef4444", color: "white", fontWeight: 700,
              padding: "0.75rem 2rem", borderRadius: "999px", border: "none", cursor: "pointer"
            }}>
              Start First Mission
            </button>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
              {[
                { label: "BEST SCORE", value: profile.bestScore.toLocaleString(), color: "#fbbf24" },
                { label: "AVG ACCURACY", value: `${profile.avgAccuracy}%`, color: "#22d3aa" },
                { label: "MISSIONS", value: profile.gamesPlayed, color: "#a78bfa" },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px", padding: "1rem 0.75rem", textAlign: "center"
                }}>
                  <p style={{ margin: 0, fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
                    {stat.label}
                  </p>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* History */}
            <div>
              <p style={{ fontSize: "0.7rem", color: "rgba(34,211,170,0.7)", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>
                📋 MISSION HISTORY
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {profile.history.map((entry, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                        {new Date(entry.playedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
                        {entry.correct}/{entry.total} correct
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fbbf24" }}>
                        {entry.score.toLocaleString()}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#22d3aa" }}>
                        {entry.accuracy}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Play again */}
            <button onClick={() => router.push("/play")} style={{
              marginTop: "2rem", width: "100%",
              background: "#ef4444", color: "white", fontWeight: 700,
              fontSize: "1rem", padding: "0.85rem", borderRadius: "999px",
              border: "none", cursor: "pointer", letterSpacing: "0.05em"
            }}>
              ▶ RUN ANOTHER MISSION
            </button>
          </>
        )}
      </div>
    </main>
  );
}
