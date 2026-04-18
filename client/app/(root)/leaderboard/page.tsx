"use client";

import React, { useState, useEffect } from "react";
import LeaderboardSection from "@/components/LeaderboardSection";
import UserProfile from "@/components/UserProfile";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { User } from "@/types";

export default function LeaderboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold italic tracking-tight uppercase">Global Rankings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Competitive benchmarking for top technical talent.</p>
        </div>
        <UserProfile user={user} />
      </div>

      <div className="max-w-4xl mx-auto">
        <LeaderboardSection isPreview={false} />
      </div>
    </main>
  );
}
