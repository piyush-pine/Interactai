"use client";

import React from "react";
import EnhancedCard from "./EnhancedCard";
import { Trophy, Medal, Star, Flame, ArrowUpRight } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Avesh Pathak", score: 985, streak: 12, status: "Expert", isTeam: true },
  { rank: 2, name: "Lucky Badge", score: 942, streak: 8, status: "Expert", isTeam: true },
  { rank: 3, name: "Sarah Connor", score: 890, streak: 15, status: "Advanced", isTeam: false },
  { rank: 4, name: "Piyush Pine", score: 875, streak: 5, status: "Advanced", isTeam: true },
  { rank: 5, name: "Bruce Wayne", score: 820, streak: 21, status: "Professional", isTeam: false },
];

import Link from "next/link";

interface LeaderboardSectionProps {
  isPreview?: boolean;
}

const LeaderboardSection = ({ isPreview = false }: LeaderboardSectionProps) => {
  const displayedData = isPreview ? leaderboardData.slice(0, 3) : leaderboardData;

  return (
    <EnhancedCard variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Global Leaderboard
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Top candidates ready for hire this week.</p>
        </div>
        <Link href="/leaderboard">
          <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        {displayedData.map((user, idx) => (
          <div 
            key={idx} 
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              user.isTeam ? "bg-primary/5 border border-primary/20 shadow-sm" : "hover:bg-muted"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center">
                {user.rank === 1 ? (
                  <Trophy className="w-5 h-5 text-yellow-500" />
                ) : user.rank === 2 ? (
                  <Medal className="w-5 h-5 text-slate-400" />
                ) : user.rank === 3 ? (
                  <Medal className="w-5 h-5 text-amber-600" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{user.rank}</span>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="font-bold text-foreground flex items-center gap-2">
                  {user.name}
                  {user.isTeam && (
                    <span className="text-[8px] bg-primary text-black px-1.5 py-0.5 rounded font-black tracking-tighter uppercase">
                      Invincibles
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{user.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-sm font-black text-foreground">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  {user.score}
                </div>
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Points</span>
              </div>
              
              <div className="flex flex-col items-end min-w-[60px]">
                <div className="flex items-center gap-1 text-sm font-black text-orange-500">
                  <Flame className="w-3 h-3 fill-orange-500" />
                  {user.streak}d
                </div>
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Streak</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground font-medium italic">
          &quot;Success is where preparation and opportunity meet.&quot;
        </p>
      </div>
    </EnhancedCard>
  );
};

export default LeaderboardSection;
