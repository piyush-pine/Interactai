"use client";

interface AIAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  isSpeaking?: boolean;
  isListening?: boolean;
}

export default function AIAvatar({
  size = "md",
  isSpeaking = false,
  isListening = false,
}: AIAvatarProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Glow effect when active */}
      {(isSpeaking || isListening) && (
        <div className="absolute inset-0 -m-2 bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse" />
      )}

      {/* Cute White Robot SVG */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="robotEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="robotEyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        <g className={isSpeaking ? "animate-pulse" : isListening ? "animate-bounce" : ""}>
          {/* Head - White rounded shape */}
          <ellipse cx="100" cy="85" rx="55" ry="50" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="2"/>

          {/* Blue Ear/Headphone Left */}
          <rect x="35" y="60" width="15" height="50" rx="8" fill="url(#robotEarGrad)"/>
          <circle cx="42" cy="55" r="12" fill="url(#robotEarGrad)"/>

          {/* Blue Ear/Headphone Right */}
          <rect x="150" y="60" width="15" height="50" rx="8" fill="url(#robotEarGrad)"/>
          <circle cx="158" cy="55" r="12" fill="url(#robotEarGrad)"/>

          {/* Big Blue Eyes - Left */}
          <ellipse cx="80" cy="85" rx="14" ry="16" fill="#1E293B"/>
          <ellipse cx="80" cy="85" rx="10" ry="12" fill="url(#robotEyeGrad)"/>
          <circle cx="82" cy="82" r="4" fill="white"/>

          {/* Big Blue Eyes - Right */}
          <ellipse cx="120" cy="85" rx="14" ry="16" fill="#1E293B"/>
          <ellipse cx="120" cy="85" rx="10" ry="12" fill="url(#robotEyeGrad)"/>
          <circle cx="122" cy="82" r="4" fill="white"/>

          {/* Smile */}
          <path
            d="M 85 105 Q 100 115 115 105"
            stroke="#64748B"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Body */}
          <rect x="70" y="130" width="60" height="45" rx="12" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="2"/>

          {/* Blue button on chest */}
          <circle cx="100" cy="145" r="6" fill="#3B82F6"/>

          {/* Left Arm - Waving */}
          <g className={isSpeaking || isListening ? "animate-bounce" : ""} style={{ transformOrigin: "75px 140px" }}>
            <rect x="55" y="135" width="15" height="35" rx="7" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5"/>
            <circle cx="62" cy="168" r="8" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5"/>
            {/* Hand */}
            <circle cx="58" cy="175" r="3" fill="#64748B"/>
            <circle cx="52" cy="172" r="3" fill="#64748B"/>
            <circle cx="64" cy="172" r="3" fill="#64748B"/>
          </g>

          {/* Right Arm */}
          <rect x="130" y="135" width="15" height="35" rx="7" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5"/>
          <circle cx="138" cy="168" r="8" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5"/>

          {/* Legs */}
          <rect x="78" y="172" width="14" height="25" rx="7" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5"/>
          <rect x="108" y="172" width="14" height="25" rx="7" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5"/>

          {/* Feet - Blue */}
          <ellipse cx="85" cy="198" rx="12" ry="5" fill="url(#robotEarGrad)"/>
          <ellipse cx="115" cy="198" rx="12" ry="5" fill="url(#robotEarGrad)"/>
        </g>
      </svg>

      {/* Status badge */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-background border rounded-full text-[10px] font-medium whitespace-nowrap">
        {isSpeaking ? "🗣️ Speaking" : isListening ? "👂 Listening" : "🤖 AI Ready"}
      </div>
    </div>
  );
}
