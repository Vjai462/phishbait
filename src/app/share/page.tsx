"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ShareContent() {
  const params = useSearchParams();
  const score = params.get("score") || "0";
  const accuracy = params.get("accuracy") || "0";
  const name = params.get("name") || "An Agent";

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1.5rem", fontFamily: "monospace"
    }}>
      <div style={{
        maxWidth: 420, width: "100%", textAlign: "center"
      }}>
        {/* Badge */}
        <p style={{
          fontSize: "0.7rem", color: "rgba(34,211,170,0.7)",
          letterSpacing: "0.15em", marginBottom: "1.5rem"
        }}>
          🎣 PHISHBAIT — MISSION RESULT
        </p>

        {/* Agent name */}
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
          Agent <span style={{ color: "white", fontWeight: 700 }}>{name}</span> scored
        </p>

        {/* Score */}
        <p style={{
          fontSize: "clamp(3.5rem, 15vw, 5.5rem)",
          fontWeight: 800,
          margin: "0.25rem 0",
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          {parseInt(score).toLocaleString()}
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem", marginBottom: "2rem" }}>
          pts &nbsp;·&nbsp; {accuracy}% accuracy
        </p>

        {/* Challenge text */}
        <p style={{
          color: "rgba(255,255,255,0.5)", fontSize: "0.9rem",
          marginBottom: "1.5rem", lineHeight: 1.6
        }}>
          Can you beat them? Test your phishing detection skills.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => { window.location.href = "/play"; }}
            style={{
              background: "#ef4444", color: "white", fontWeight: 700,
              fontSize: "1rem", padding: "0.85rem",
              borderRadius: "999px", border: "none", cursor: "pointer",
              letterSpacing: "0.05em"
            }}
          >
            ▶ ACCEPT THE CHALLENGE
          </button>
          <button
            onClick={() => { window.location.href = "/"; }}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.45)", fontSize: "0.85rem",
              padding: "0.7rem", borderRadius: "999px", cursor: "pointer"
            }}
          >
            Learn more about PhishBait
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SharePage() {
  return (
    <Suspense>
      <ShareContent />
    </Suspense>
  );
}
