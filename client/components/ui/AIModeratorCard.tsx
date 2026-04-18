import { useState } from "react";
import Image from "next/image";
import { Bot, Mic, MicOff, Play, Square } from "lucide-react";
import StatusBadge from "./StatusBadge";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING", 
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface AIModeratorCardProps {
  callStatus: CallStatus;
  isSpeaking: boolean;
  aiMessages: string[];
  onStartStop: () => void;
  topic: string;
  duration: number;
}

const AIModeratorCard = ({ 
  callStatus, 
  isSpeaking, 
  aiMessages, 
  onStartStop, 
  topic, 
  duration 
}: AIModeratorCardProps) => {
  const getStatusConfig = () => {
    switch (callStatus) {
      case CallStatus.ACTIVE:
        return { status: "active" as const, text: "Watching and analyzing..." };
      case CallStatus.CONNECTING:
        return { status: "connecting" as const, text: "Connecting..." };
      case CallStatus.FINISHED:
        return { status: "inactive" as const, text: "Session finished" };
      default:
        return { status: "inactive" as const, text: "Ready to moderate" };
    }
  };

  const { status, text } = getStatusConfig();

  return (
    <div className="bg-dark-200 rounded-xl p-6 border border-dark-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            {isSpeaking && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-dark-200" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-light-100">AI Moderator</h3>
            <StatusBadge status={status}>
              {isSpeaking && <Mic className="w-3 h-3" />}
              <span>{text}</span>
            </StatusBadge>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-dark-100 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-light-400 mb-1">Topic</p>
            <p className="text-light-100 font-medium">{topic}</p>
          </div>
          <div>
            <p className="text-light-400 mb-1">Duration</p>
            <p className="text-light-100 font-medium">{duration} minutes</p>
          </div>
        </div>
      </div>

      {/* AI Messages */}
      {aiMessages.length > 0 && (
        <div className="bg-dark-100 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
          <h4 className="text-sm font-medium text-light-100 mb-3 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            AI Transcript
          </h4>
          <div className="space-y-2">
            {aiMessages.slice(-3).map((msg, i) => (
              <div key={i} className="text-sm text-light-100 bg-dark-200 rounded-lg p-3">
                <span className="text-purple-400 font-medium">AI:</span> {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Button */}
      <button
        onClick={onStartStop}
        disabled={callStatus === CallStatus.CONNECTING}
        className={`flex items-center justify-center gap-2 w-full px-6 py-3 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          callStatus === CallStatus.ACTIVE
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        }`}
      >
        {callStatus === CallStatus.CONNECTING ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Connecting...</span>
          </>
        ) : callStatus === CallStatus.ACTIVE ? (
          <>
            <Square className="w-5 h-5" />
            <span>Stop AI Moderator</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            <span>Start AI Moderator</span>
          </>
        )}
      </button>

      {/* Description */}
      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-xs text-light-300 leading-relaxed">
          <strong>AI Moderator Features:</strong> Listens to discussions, provides real-time feedback on communication skills, analyzes arguments, tracks participation, and offers suggestions for improvement.
        </p>
      </div>
    </div>
  );
};

export default AIModeratorCard;
