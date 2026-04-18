"use client";

import React, { useState } from "react";
import EnhancedCard from "@/components/EnhancedCard";
import { 
  Building2, 
  Target, 
  ChevronRight, 
  Briefcase, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

const allMatches = [
  {
    id: 1,
    company: "Google",
    role: "Senior Software Engineer",
    matchScore: 92,
    requirements: ["React", "System Design", "Algorithms"],
    color: "from-blue-500 to-red-500",
    description: "Your strong background in complex system design and React performance optimization makes you a top 5% candidate for this role.",
    skillsMatched: ["React", "TypeScript", "Node.js", "System Design"],
    skillsMissing: ["Google Cloud Platform", "Kubernetes"],
    salaryRange: "$180k - $240k",
    location: "Mountain View, CA (Remote Friendly)"
  },
  {
    id: 2,
    company: "Amazon",
    role: "SDE II (AWS)",
    matchScore: 85,
    requirements: ["Node.js", "Distributed Systems", "Cloud"],
    color: "from-orange-400 to-orange-600",
    description: "Your experience with high-scale microservices aligns perfectly with AWS developer productivity team requirements.",
    skillsMatched: ["Node.js", "Express", "Distributed Systems"],
    skillsMissing: ["AWS Lambda", "DynamoDB"],
    salaryRange: "$165k - $210k",
    location: "Seattle, WA"
  },
  {
    id: 3,
    company: "Meta",
    role: "Fullstack Developer",
    matchScore: 78,
    requirements: ["Next.js", "GraphQL", "Product Sense"],
    color: "from-blue-600 to-blue-400",
    description: "Your Next.js portfolio is impressive. Strengthening your GraphQL knowledge would push your match score above 90%.",
    skillsMatched: ["Next.js", "React", "Tailwind CSS"],
    skillsMissing: ["GraphQL", "Relay"],
    salaryRange: "$170k - $225k",
    location: "Menlo Park, CA"
  },
  {
    id: 4,
    company: "Netflix",
    role: "Senior UI Engineer",
    matchScore: 89,
    requirements: ["A/B Testing", "Performance", "Cypress"],
    color: "from-red-600 to-red-800",
    description: "Exceptional match for the core playback UI team. Your focus on rendering performance is a key highlight.",
    skillsMatched: ["React", "Performance Optimization", "Cypress"],
    skillsMissing: ["RxJS", "GCN"],
    salaryRange: "$200k - $300k",
    location: "Los Gatos, CA"
  }
];

export default function MatchesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMatches = allMatches.filter(m => 
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 animate-slide-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Target className="w-10 h-10 text-primary" />
            AI OPPORTUNITY <span className="text-primary italic">HUB</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-lg">
            Our AI has scanned <span className="text-foreground font-bold">1,200+ roles</span> to find your perfect career matches based on your latest interview performance.
          </p>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search roles or companies..." 
            className="w-full md:w-80 bg-muted/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnhancedCard variant="glass" className="p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Top Compatibility</p>
            <p className="text-2xl font-black text-foreground">92% Match</p>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="glass" className="p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">verified roles</p>
            <p className="text-2xl font-black text-foreground">4 Opportunities</p>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="glass" className="p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <BarChart3 className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Market Salary Avg</p>
            <p className="text-2xl font-black text-foreground">$185k - $230k</p>
          </div>
        </EnhancedCard>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {filteredMatches.map((job) => (
          <EnhancedCard key={job.id} variant="glass" className="group overflow-hidden relative">
            {/* Compatibility Badge */}
            <div className="absolute top-0 right-0 p-6">
              <div className="relative flex flex-col items-center">
                <span className="text-3xl font-black text-foreground">{job.matchScore}%</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Fit Score</span>
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Top Section */}
              <div className="flex gap-6">
                <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0 group-hover:border-primary/50 transition-colors">
                  <Building2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{job.role}</h3>
                  <p className="text-foreground/70 font-bold flex items-center gap-2">
                    {job.company} 
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{job.location}</span>
                  </p>
                </div>
              </div>

              {/* AI Verdict */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Zap className="w-3 h-3" /> AI Verdict
                </p>
                <p className="text-sm font-medium text-foreground/90 italic leading-relaxed">
                  &quot;{job.description}&quot;
                </p>
              </div>

              {/* Analysis Split */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Matched Strengths</p>
                  <ul className="space-y-2">
                    {job.skillsMatched.map(skill => (
                      <li key={skill} className="flex items-center gap-2 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {skill}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Skill Gaps</p>
                  <ul className="space-y-2">
                    {job.skillsMissing.map(skill => (
                      <li key={skill} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <AlertCircle className="w-3.5 h-3.5 text-orange-500" /> {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Annual Est.</p>
                  <p className="text-lg font-black text-foreground">{job.salaryRange}</p>
                </div>
                
                <Link href="/interview">
                  <button className="px-6 py-3 bg-primary text-black font-black rounded-xl hover:scale-105 transition-transform flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                    START PREP <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </EnhancedCard>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-bold text-muted-foreground">No roles found matching your search term.</p>
        </div>
      )}
    </div>
  );
}
