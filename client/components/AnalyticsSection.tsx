"use client";

import { BarChart3, TrendingUp, Calendar, Zap } from "lucide-react";
import EnhancedCard from "./EnhancedCard";

export default function AnalyticsSection() {
  // Mock data for analytics
  const performanceData = [
    { label: "Intro", score: 85 },
    { label: "Technical", score: 65 },
    { label: "Behavioral", score: 78 },
    { label: "Coding", score: 92 },
    { label: "Communication", score: 70 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-black italic uppercase tracking-wider">Performance Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart Card */}
        <EnhancedCard variant="glass" className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h4 className="font-bold text-light-100 uppercase text-sm">Skills Breakdown</h4>
              <p className="text-xs text-muted-foreground">Recent performance across categories</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>

          <div className="space-y-6">
            {performanceData.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-primary">{item.score}%</span>
                </div>
                <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          <EnhancedCard variant="gradient" className="p-6 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded uppercase tracking-widest">Power Level</span>
            </div>
            <div className="mt-4">
              <h4 className="text-4xl font-black italic">ELITE</h4>
              <p className="text-sm opacity-70 mt-1">You're in the top 10% of candidates today.</p>
            </div>
          </EnhancedCard>

          <EnhancedCard variant="floating" className="p-6 flex flex-col justify-between border-primary/20 bg-primary/5">
            <div className="flex justify-between items-start">
              <Calendar className="w-8 h-8 text-primary" />
              <span className="text-[10px] font-black bg-primary/20 px-2 py-0.5 rounded uppercase tracking-widest text-primary">Schedule</span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Next Session</p>
              <h4 className="text-lg font-black italic">System Design Pro</h4>
              <p className="text-xs opacity-70 mt-1">Tomorrow, 10:00 AM</p>
            </div>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
}
