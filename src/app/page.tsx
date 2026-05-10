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
    gradient: "linear-gradient(137deg, #FF3D77 0%, #FFB1CE 45%, #FF9D3C 100%)"
  },
  {
    title: "Instant Feedback",
    icon: <Zap size={32} strokeWidth={2.5} className="text-white/90" />,
    delay: 0.2,
    description: "Every answer reveals why it was phishing or legit. Learn the red flags as you play.",
    gradient: "linear-gradient(137deg, #FFFFFF 0%, #7DD3FC 45%, #06B6D4 100%)"
  },
  {
    title: "Global Leaderboard",
    icon: <Trophy size={32} strokeWidth={2.5} className="text-white/90" />,
    delay: 0.3,
    description: "Compete with agents worldwide. Streak bonuses, difficulty tiers and score rankings.",
    gradient: "linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #F72585 100%)"
  }
];

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}

function FeatureCard({ title, description, icon, gradient, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="relative flex flex-col justify-start items-start w-full max-w-[300px] group mx-auto"
    >
      {/* Glow */}
      <div 
        className="absolute w-full h-[260px] opacity-50 rounded-[40px] pointer-events-none blur-[45px]"
        style={{ background: gradient }}
      />
      {/* Foreground */}
      <div 
        className="relative w-full h-[260px] rounded-[40px] z-10 overflow-hidden border-[8px] border-transparent"
        style={{ 
          background: `linear-gradient(#13131f, #13131f) padding-box, ${gradient} border-box`
        }}
      >
        <div className="p-7 flex flex-col justify-between w-full h-full">
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
              <div className="inline-flex items-center gap-2 bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 text-[#ff3b3b] text-[11px] rounded-full px-3 py-1 font-mono">
                🎣 PHISHING AWARENESS TRAINING
              </div>
              <h1 className="text-[42px] md:text-[60px] text-white leading-tight mt-4" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
                Can you spot<br/>the phish?
              </h1>
              <p className="text-[15px] md:text-[16px] text-[#94a3b8] max-w-[480px] mt-3" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                10 challenges. 60 seconds each. Train your instincts against real-world phishing attacks before they train you.
              </p>
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
                  onClick={user ? () => router.push("/play") : handleGoogleSignIn}
                  className="bg-[#ff3b3b] text-white font-bold rounded-full px-8 py-3 text-[15px] transition-colors"
                >
                  {user ? `Continue as ${user.displayName?.split(" ")[0]}` : "Sign in with Google"}
                </motion.button>
              </div>
              {user && (
                <button 
                  onClick={() => signOut(auth)} 
                  className="text-xs text-[#64748b] hover:text-white mt-4 underline underline-offset-2 transition-colors"
                >
                  Sign out
                </button>
              )}
            </motion.div>
          </div>

          {/* FLOATING BOTTOM NAVBAR */}
          <motion.nav
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center bg-white/5 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-white/10"
          >
            <div className="w-9 h-9 rounded-full bg-[#ff3b3b]/20 border border-[#ff3b3b]/30 flex items-center justify-center text-[#ff3b3b] text-lg mr-2 shrink-0">
              🎣
            </div>
            <button className="text-[12px] font-semibold text-slate-400 hover:text-white px-4 py-2 transition-colors shrink-0">
              How it works
            </button>
            <button 
              onClick={() => router.push("/leaderboard")}
              className="text-[12px] font-semibold text-slate-400 hover:text-white px-4 py-2 transition-colors shrink-0 mr-2"
            >
              Leaderboard
            </button>
            <button 
              onClick={user ? () => router.push("/play") : handleGoogleSignIn}
              className="bg-[#ff3b3b] text-white px-5 py-2 rounded-full text-[12px] font-bold hover:bg-[#cc2e2e] transition-all shrink-0"
            >
              {user ? "Play" : "Sign In & Play"} →
            </button>
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
              gradient={feat.gradient}
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
            onClick={user ? () => router.push("/play") : handleGoogleSignIn}
            className="bg-[#ff3b3b] text-white font-bold rounded-full px-10 py-4 text-[15px] transition-colors"
          >
            {user ? `Continue as ${user.displayName?.split(" ")[0]}` : "Sign in with Google"}
          </motion.button>
        </div>
      </section>

    </div>
  );
}
