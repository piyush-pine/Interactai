"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GDSetupModalProps {
  onClose: () => void;
}

const GDSetupModal = ({ onClose }: GDSetupModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(30);

  const handleGenerateGD = async () => {
    setIsLoading(true);
    // Navigate to GD page where Zoom link will be generated
    setTimeout(() => {
      router.push(`/gd?topic=${encodeURIComponent(topic || "General Discussion")}&duration=${duration}`);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-100 rounded-2xl border border-dark-200 max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-light-100">Start Group Discussion</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-200 transition-colors"
          >
            <svg className="w-5 h-5 text-light-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="text-light-400 mb-6">
          Set up a group discussion with AI-powered moderation. A Zoom meeting link will be generated that you can share with participants.
        </p>

        {/* Topic Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-light-100 mb-2">
            Discussion Topic (Optional)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Impact of AI on Education"
            className="w-full px-4 py-3 bg-dark-200 border border-dark-200 rounded-lg text-light-100 placeholder-light-400 focus:outline-none focus:border-primary-200 transition-colors"
          />
        </div>

        {/* Duration Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-light-100 mb-2">
            Duration (minutes)
          </label>
          <div className="flex gap-2">
            {[15, 30, 45, 60].map((min) => (
              <button
                key={min}
                onClick={() => setDuration(min)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  duration === min
                    ? "bg-purple-500 text-white"
                    : "bg-dark-200 text-light-100 hover:bg-dark-200/80"
                }`}
              >
                {min}m
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-light-400">
            <svg className="w-5 h-5 text-success-100 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Zoom video conferencing integration</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-light-400">
            <svg className="w-5 h-5 text-success-100 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Sharable meeting link for participants</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-light-400">
            <svg className="w-5 h-5 text-success-100 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>AI moderator to watch and provide feedback</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerateGD}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Setting up...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate GD & Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GDSetupModal;
