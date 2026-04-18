"use client";

import { Trophy, Star, Target } from "lucide-react";
import EnhancedCard from "./EnhancedCard";

interface ReadinessScoreProps {
  score: number;
}

export default function ReadinessScore({ score }: ReadinessScoreProps) {
  return (
    <EnhancedCard variant="glass" className="p-6 relative overflow-hidden group">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold uppercase tracking-wider italic text-primary">Interview Readiness</h3>
          </div>
          <p className="text-muted-foreground text-sm max-w-md">
            Your readiness is calculated based on your recent mock interviews, 
            coding challenges, and profile completeness. Keep practicing!
          </p>
        </div>

        <div className="flex items-center gap-8 px-4">
          <div className="relative flex items-center justify-center">
            {/* Outer Circle Progress */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted/20"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                className="text-primary transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black italic">{score}%</span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-500/10">
                <Target className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Current Level</p>
                <p className="text-sm font-black italic uppercase">Intermediate</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/10">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Streaks</p>
                <p className="text-sm font-black italic uppercase">5 Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Gradient */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
    </EnhancedCard>
  );
}
