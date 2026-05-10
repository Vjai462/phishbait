"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Shield, Zap, Trophy } from "lucide-react";

import Image from "next/image";

// LOGOS ARRAY
const logos = [
  { name: "Shopify", src: "https://svgl.app/library/shopify.svg", gradient: "linear-gradient(135deg,#96bf48,#5e8e3e)" },
  { name: "Figma", src: "https://svgl.app/library/figma.svg", gradient: "linear-gradient(135deg,#a259ff,#1abcfe)" },
  { name: "Spotify", src: "https://svgl.app/library/spotify.svg", gradient: "linear-gradient(135deg,#1DB954,#191414)" },
  { name: "Google Cloud", src: "https://svgl.app/library/google_cloud.svg", gradient: "linear-gradient(135deg,#4285F4,#34A853)" },
  { name: "Blender", src: "https://svgl.app/library/blender.svg", gradient: "linear-gradient(135deg,#EA7600,#265787)" },
  { name: "Lottielab", src: "https://svgl.app/library/lottielab.svg", gradient: "linear-gradient(135deg,#FFD700,#7CFC00)" },
  { name: "Vercel", src: "https://svgl.app/library/vercel.svg", gradient: "linear-gradient(135deg,#ffffff,#888888)" },
  { name: "Bing", src: "https://svgl.app/library/bing.svg", gradient: "linear-gradient(135deg,#00B4FF,#008272)" }
];
const marqueeLogos = [...logos, ...logos];

// FEATURE CARDS DATA
const features = [
  {
    title: "Real Scenarios",
    icon: <Shield size={32} strokeWidth={2.5} className="text-white/90" />,
    delay: 0.1,
    description: "Face actual phishing emails, URLs and SMS cloned from real attack patterns used in the wild.",
    glowColor: "rgba(239, 68, 68, 0.35)"
  },
  {
    title: "Instant Feedback",
    icon: <Zap size={32} strokeWidth={2.5} className="text-white/90" />,
    delay: 0.2,
    description: "Every answer reveals why it was phishing or legit. Learn the red flags as you play.",
    glowColor: "rgba(6, 182, 212, 0.35)"
  },
  {
    title: "Global Leaderboard",
    icon: <Trophy size={32} strokeWidth={2.5} className="text-white/90" />,
    delay: 0.3,
    description: "Compete with agents worldwide. Streak bonuses, difficulty tiers and score rankings.",
    glowColor: "rgba(168, 85, 247, 0.35)"
  }
];

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  glowColor: string;
  delay: number;
}

function FeatureCard({ title, description, icon, glowColor, delay }: FeatureCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="relative flex flex-col justify-start items-start w-full max-w-[300px] mx-auto"
    >
      <div 
        className="relative w-full h-[260px] rounded-[40px] z-10 overflow-hidden flex flex-col justify-between p-7"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          background: isHovered ? "rgba(255,255,255,0.05)" : "rgba(255, 255, 255, 0.03)",
          border: isHovered ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: isHovered ? `0 0 32px ${glowColor}` : "none",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 300ms ease"
        }}
      >
        <div>{icon}</div>
        <div>
          <h3 className="text-xl text-white tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
            {title}
          </h3>
          <p className="text-[14px] text-[#94a3b8] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/play");
    } catch (err) {
      console.error("Sign in failed", err);
    }
  };

  const handleGuestPlay = () => {
    router.push("/play?guest=true");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] overflow-x-hidden pt-8 pb-12">
      
      {/* SECTION 1: HERO */}
      <section className="px-4">
        <div className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-[#0d0d1a] border border-slate-800/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden h-[600px] flex flex-col">
          
          {/* Background Video */}
          <div className="absolute inset-0 z-0">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4"
              className="w-full h-full object-cover scale-105 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1a]/30 to-[#0d0d1a]/80 z-10" />
          </div>

          {/* Hero Text */}
          <div className="relative z-20 flex-1 px-8 md:px-16 pt-12 md:pt-16 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div 
                className="inline-flex items-center gap-2 font-mono"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "0.7rem",
                  letterSpacing: "0.12em",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  fontWeight: 600
                }}
              >
                <span className="text-white/80">🎣</span> PHISHING AWARENESS TRAINING
              </div>
              <h1 className="text-[42px] md:text-[60px] text-white leading-tight mt-4" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
                Can you spot<br/>the phish?
              </h1>
              <p className="text-[15px] md:text-[16px] text-[#94a3b8] max-w-[480px] mt-3" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                10 challenges. 60 seconds each. Train your instincts against real-world phishing attacks before they train you.
              </p>
              {user ? (
                <div style={{
                  display: "flex", flexDirection: "column", gap: "0.75rem",
                  alignItems: "flex-start", marginTop: "2rem"
                }}>
                  {/* User info row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "rgba(239,68,68,0.2)",
                      border: "1px solid rgba(239,68,68,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#ef4444", fontWeight: 700, fontSize: "0.9rem"
                    }}>
                      {user.displayName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color: "white", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>
                        Welcome back, {user.displayName?.split(" ")[0]}
                      </p>
                      <button
                        onClick={() => signOut(auth)}
                        style={{
                          background: "none", border: "none", padding: 0,
                          color: "rgba(255,255,255,0.35)", fontSize: "0.75rem",
                          cursor: "pointer", textDecoration: "underline",
                          textUnderlineOffset: "2px"
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>

                  {/* Play button */}
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(255,59,59,0.4)" }}
                    onClick={() => router.push("/play")}
                    style={{
                      background: "#ef4444", color: "white",
                      fontWeight: 700, fontSize: "0.95rem",
                      padding: "0.75rem 2rem", borderRadius: "999px",
                      border: "none", cursor: "pointer",
                      marginTop: "0.5rem"
                    }}
                  >
                    ▶ Continue Training
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-4 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.05)" }}
                      onClick={handleGuestPlay}
                      className="bg-transparent border border-white/20 text-white font-bold rounded-full px-8 py-3 text-[15px] transition-colors"
                    >
                      Play as Guest
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(255,59,59,0.4)" }}
                      onClick={handleGoogleSignIn}
                      className="bg-[#ff3b3b] text-white font-bold rounded-full px-8 py-3 text-[15px] transition-colors"
                    >
                      Sign in with Google
                    </motion.button>
                  </div>
                  <p style={{
                    marginTop: "1.25rem",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.35)"
                  }}>
                    Already have an account?{" "}
                    <button
                      onClick={handleGoogleSignIn}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        padding: 0
                      }}
                    >
                      Log in here →
                    </button>
                  </p>
                </>
              )}
            </motion.div>
          </div>

          {/* FLOATING BOTTOM NAVBAR */}
          <motion.nav
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center"
            style={{
              background: "rgba(15, 15, 15, 0.75)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              padding: "0.5rem 0.75rem",
              gap: "0.25rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
            }}
          >
            <div className="w-9 h-9 rounded-full bg-[#ff3b3b]/20 border border-[#ff3b3b]/30 flex items-center justify-center text-[#ff3b3b] text-lg mr-2 shrink-0">
              🎣
            </div>
            <button 
              className="text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all duration-150 ease shrink-0"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                backgroundColor: "transparent"
              }}
            >
              How it works
            </button>
            <button 
              onClick={() => router.push("/leaderboard")}
              className="text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all duration-150 ease shrink-0"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                backgroundColor: "transparent"
              }}
            >
              Leaderboard
            </button>
            
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.15)", margin: "0 0.25rem" }} />

            {user ? (
              <button
                onClick={() => router.push("/play")}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white transition-colors shrink-0"
                style={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "999px",
                  border: "none",
                  boxShadow: "none"
                }}
              >
                ▶ Play Now
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white transition-colors shrink-0"
                style={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "999px",
                  border: "none",
                  boxShadow: "none"
                }}
              >
                Sign in & Play →
              </button>
            )}
          </motion.nav>

        </div>
      </section>

      {/* SECTION 2: MARQUEE LOGO SCROLLER */}
      <section className="mt-10 overflow-hidden w-full relative">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
          .marquee-mask {
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          }
        `}} />
        <div className="marquee-mask w-full max-w-[1400px] mx-auto overflow-hidden">
          <div className="flex w-max animate-marquee">
            {marqueeLogos.map((logo, i) => (
              <div 
                key={i} 
                className="group relative h-20 w-36 shrink-0 flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-sm hover:border-white/20 transition-all overflow-hidden mx-3"
              >
                <div 
                  className="absolute inset-0 opacity-0 scale-150 group-hover:opacity-20 group-hover:scale-100 transition-all duration-500"
                  style={{ background: logo.gradient }}
                />
                <Image 
                  src={logo.src} 
                  alt={logo.name} 
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain filter brightness-0 invert opacity-60 group-hover:opacity-100 transition-all relative z-10"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURE CARDS */}
      <section className="mt-20 mb-20 px-6">
        <div className="text-center mb-12">
          <h2 className="text-[32px] md:text-[40px] text-white" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
            Why PhishBait?
          </h2>
          <p className="text-[15px] text-[#64748b] mt-3" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
            Built for security awareness, not boring quizzes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[936px] mx-auto">
          {features.map((feat, i) => (
            <FeatureCard 
              key={i}
              title={feat.title}
              description={feat.description}
              icon={feat.icon}
              glowColor={feat.glowColor}
              delay={feat.delay}
            />
          ))}
        </div>
      </section>

      {/* SECTION 4: FINAL CTA STRIP */}
      <section className="py-20 text-center px-4 border-t border-white/5">
        <h2 className="text-[28px] text-white" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
          Ready to test yourself?
        </h2>
        <p className="text-[15px] text-[#64748b] mt-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
          It takes 60 seconds. No signup.
        </p>
        {user ? (
          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(255,59,59,0.4)" }}
              onClick={() => router.push("/play")}
              className="bg-[#ff3b3b] text-white font-bold rounded-full px-10 py-4 text-[15px] transition-colors"
            >
              ▶ Continue Training
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.05)" }}
              onClick={handleGuestPlay}
              className="bg-transparent border border-white/20 text-white font-bold rounded-full px-10 py-4 text-[15px] transition-colors"
            >
              Play as Guest
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(255,59,59,0.4)" }}
              onClick={handleGoogleSignIn}
              className="bg-[#ff3b3b] text-white font-bold rounded-full px-10 py-4 text-[15px] transition-colors"
            >
              Sign in with Google
            </motion.button>
          </div>
        )}
      </section>

    </div>
  );
}
