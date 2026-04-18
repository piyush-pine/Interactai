import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Opportunity Hub | InteractAI",
  description: "Discover your top AI-matched job roles based on interview performance. View compatibility scores, skill gaps, and start targeted interview prep.",
};

export default function MatchesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
