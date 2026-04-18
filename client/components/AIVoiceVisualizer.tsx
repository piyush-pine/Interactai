"use client";

import { useEffect, useState } from "react";
import AIAvatar from "./AIAvatar";

interface AIVoiceVisualizerProps {
  isSpeaking: boolean;
  isListening?: boolean;
}

export default function AIVoiceVisualizer({
  isSpeaking,
  isListening = false,
}: AIVoiceVisualizerProps) {
  const [imageTheme, setImageTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Detect current theme from document class
    const isDark = document.documentElement.classList.contains("dark");
    setImageTheme(isDark ? "dark" : "light");

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      setImageTheme(isDarkNow ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);
  // Colors based on image theme
  const colors =
    imageTheme === "dark"
      ? {
          // Neon colors for dark background
          core: "from-cyan-400/40 via-blue-500/40 to-purple-500/40",
          inner1: "border-cyan-400/70",
          inner1Glow: "shadow-[0_0_30px_rgba(34,211,238,0.6)]",
          inner2: "border-blue-500/50",
          inner2Glow: "shadow-[0_0_40px_rgba(59,130,246,0.5)]",
          middle1: "border-blue-400/40",
          middle1Glow: "shadow-[0_0_50px_rgba(96,165,250,0.4)]",
          middle2: "border-purple-400/30",
          middle2Glow: "shadow-[0_0_60px_rgba(192,132,252,0.3)]",
          outer: "border-cyan-300/20",
          outerGlow: "shadow-[0_0_80px_rgba(103,232,249,0.2)]",
          wave: "border-blue-300/10",
          text: "text-cyan-300",
          pulse: "bg-cyan-400/30",
        }
      : {
          // Dark colors for light background
          core: "from-slate-600/50 via-gray-700/50 to-zinc-600/50",
          inner1: "border-slate-600/80",
          inner1Glow: "shadow-[0_0_30px_rgba(71,85,105,0.7)]",
          inner2: "border-gray-700/60",
          inner2Glow: "shadow-[0_0_40px_rgba(55,65,81,0.6)]",
          middle1: "border-gray-600/50",
          middle1Glow: "shadow-[0_0_50px_rgba(75,85,99,0.5)]",
          middle2: "border-zinc-600/40",
          middle2Glow: "shadow-[0_0_60px_rgba(82,82,91,0.4)]",
          outer: "border-slate-500/30",
          outerGlow: "shadow-[0_0_80px_rgba(100,116,139,0.3)]",
          wave: "border-gray-400/20",
          text: "text-slate-700",
          pulse: "bg-slate-600/40",
        };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      {/* AI Avatar Container - Using the cute robot */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Background glow behind avatar */}
        {isSpeaking && (
          <div
            className={`absolute inset-0 -m-4 rounded-full bg-gradient-to-r ${colors.core} blur-2xl animate-pulse`}
          />
        )}

        {/* Cute Robot Avatar */}
        <AIAvatar size="xl" isSpeaking={isSpeaking} isListening={isListening} />
      </div>

      {/* Voice Modulation Rings - Behind the avatar */}
      {(isSpeaking || isListening) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Core glow */}
          <div
            className={`absolute w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-r ${colors.core} blur-xl animate-pulse`}
          />

          {/* Inner ring 1 */}
          <div
            className={`absolute w-40 h-40 md:w-56 md:h-56 rounded-full border-2 ${colors.inner1} ${colors.inner1Glow} animate-[spin_4s_linear_infinite]`}
          />

          {/* Inner ring 2 */}
          <div
            className={`absolute w-48 h-48 md:w-64 md:h-64 rounded-full border-2 ${colors.inner2} ${colors.inner2Glow} animate-[spin_4s_linear_infinite_reverse]`}
          />

          {/* Middle ring 1 */}
          <div
            className={`absolute w-56 h-56 md:w-72 md:h-72 rounded-full border-2 ${colors.middle1} ${colors.middle1Glow} animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]`}
          />

          {/* Middle ring 2 */}
          <div
            className={`absolute w-64 h-64 md:w-80 md:h-80 rounded-full border ${colors.middle2} ${colors.middle2Glow} animate-[pulse_1.5s_ease-in-out_infinite]`}
          />

          {/* Outer ring */}
          <div
            className={`absolute w-72 h-72 md:w-96 md:h-96 rounded-full border ${colors.outer} ${colors.outerGlow} animate-[spin_8s_linear_infinite]`}
          />

          {/* Sound wave pulses */}
          <div
            className={`absolute w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full border ${colors.wave} animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]`}
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className={`absolute w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full border ${colors.wave} animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]`}
            style={{ animationDelay: "1s" }}
          />
          <div
            className={`absolute w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full border ${colors.wave} animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]`}
            style={{ animationDelay: "1.5s" }}
          />
        </div>
      )}

      {/* Bottom audio bars visualization */}
      {isSpeaking && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full ${colors.pulse} animate-pulse`}
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.5s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
