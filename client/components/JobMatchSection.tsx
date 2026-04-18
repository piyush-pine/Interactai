"use client";

import React from "react";
import EnhancedCard from "./EnhancedCard";
import { Building2, ChevronRight, Target, ExternalLink } from "lucide-react";
import Link from "next/link";

const mockMatches = [
  {
    company: "Google",
    role: "Senior Software Engineer",
    matchScore: 92,
    requirements: ["React", "System Design", "Algorithms"],
    color: "from-blue-500 to-red-500",
  },
  {
    company: "Amazon",
    role: "SDE II (AWS)",
    matchScore: 85,
    requirements: ["Node.js", "Distributed Systems", "Cloud"],
    color: "from-orange-400 to-orange-600",
  },
  {
    company: "Meta",
    role: "Fullstack Developer",
    matchScore: 78,
    requirements: ["Next.js", "GraphQL", "Product Sense"],
    color: "from-blue-600 to-blue-400",
  },
];

interface JobMatchSectionProps {
  isPreview?: boolean;
  showTitle?: boolean;
}

const JobMatchSection = ({ isPreview = false, showTitle = true }: JobMatchSectionProps) => {
  const displayedMatches = isPreview ? mockMatches.slice(0, 1) : mockMatches;

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            AI Job Match Scorer
          </h2>
          {isPreview ? (
            <Link href="/matches" className="group">
              <span className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                View All <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </span>
            </Link>
          ) : (
            <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary uppercase tracking-wider">
              Beta Analytics
            </span>
          )}
        </div>
      )}

      <div className={isPreview ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-3 gap-6"}>
        {displayedMatches.map((job, idx) => (
          <EnhancedCard key={idx} variant="glass" className="p-5 group hover:border-primary/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-black text-foreground">{job.matchScore}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Match Prob.</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-foreground line-clamp-1">{job.role}</h3>
              <p className="text-sm text-primary font-medium">{job.company}</p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Top Skills Match</p>
              <div className="flex flex-wrap gap-1.5">
                {job.requirements.map((req, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-6">
              <div 
                className={`h-full bg-gradient-to-r ${job.color} transition-all duration-1000 ease-out`}
                style={{ width: `${job.matchScore}%` }}
              />
            </div>

            <Link href="/matches" className="block w-full">
              <button className="w-full py-2.5 rounded-xl border border-border bg-muted/50 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all flex items-center justify-center gap-2 text-sm font-bold relative overflow-hidden">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-black group-hover:animate-ping transition-colors" />
                <span className="pl-3">View Full Analysis</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </EnhancedCard>
        ))}
      </div>
    </div>
  );
};

export default JobMatchSection;
