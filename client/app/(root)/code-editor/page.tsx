"use client";

import { useRouter } from "next/navigation";
import CodePracticeEditor from "@/components/CodePracticeEditor";

export default function CodeEditorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <div className="h-[calc(100vh-140px)]">
          <CodePracticeEditor onClose={() => router.push("/")} />
        </div>
      </main>
    </div>
  );
}
