"use client";

// Import Zoom compatibility patch BEFORE any other imports
import "@/lib/zoom-patch";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import dynamic from "next/dynamic";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  MessageSquare, 
  Users, 
  Settings,
  ScreenShare,
  Circle,
  Grid,
  Speaker
} from "lucide-react";

// Dynamically import ZoomMeeting to avoid SSR issues
const ZoomMeeting = dynamic(() => import("@/components/ZoomMeeting"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-dark-900">
      <div className="w-12 h-12 border-4 border-primary-200/30 border-t-primary-200 rounded-full animate-spin" />
    </div>
  ),
});

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
}

const MeetingPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const meetingId = searchParams.get("meetingId") || "";
  const password = searchParams.get("password") || "";
  const userName = searchParams.get("userName") || "Participant";

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'speaker'>('grid');

  // Real participants data
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: userName, isMuted: false, isVideoOn: true, isSpeaking: false },
    { id: "2", name: "AI Assistant", isMuted: false, isVideoOn: false, isSpeaking: false },
  ]);

  // Add new participant to the meeting
  const addParticipant = (name: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name,
      isMuted: false,
      isVideoOn: true,
      isSpeaking: false
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  // Remove participant from the meeting
  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  // Update participant status
  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  // Start AI Moderator
  const startAIModerator = useCallback(async () => {
    if (callStatus === CallStatus.ACTIVE) {
      await vapi.stop();
      setCallStatus(CallStatus.FINISHED);
      return;
    }

    setCallStatus(CallStatus.CONNECTING);

    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID || "", {
        variableValues: {
          topic: "Group Discussion",
          duration: "30",
        },
      });
      setCallStatus(CallStatus.ACTIVE);
    } catch (error) {
      console.error("Error starting AI moderator:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  }, [callStatus]);

  // VAPI event listeners
  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setAiMessages((prev) => [...prev, message.transcript]);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("message", onMessage);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("message", onMessage);
    };
  }, []);

  const leaveMeeting = () => {
    router.push("/gd");
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    // Update participant state
    updateParticipant("1", { isMuted: newMutedState });
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    // Update participant state
    updateParticipant("1", { isVideoOn: newVideoState });
  };

  // Check if user has camera and microphone permissions
  const checkMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Media permissions denied:', error);
      return false;
    }
  };

  // Request camera and microphone on mount
  useEffect(() => {
    checkMediaPermissions().then(hasPermission => {
      if (!hasPermission) {
        alert('Camera and microphone are required for this meeting. Please allow access to continue.');
      }
    });
  }, []);

  const ParticipantVideo = ({ participant }: { participant: Participant }) => (
    <div className="relative bg-dark-800 rounded-lg overflow-hidden aspect-video group">
      {participant.isVideoOn ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center relative">
          {/* Camera placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-12 h-12 text-white/50" />
          </div>
          <div className="text-center z-10">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-white">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white font-medium">{participant.name}</p>
            <p className="text-white/70 text-sm">Camera On</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-dark-700 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-dark-600 flex items-center justify-center mx-auto mb-2">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium">{participant.name}</p>
            <p className="text-gray-500 text-sm">Camera Off</p>
          </div>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        {participant.isMuted && (
          <div className="bg-red-500 rounded-full p-1.5 shadow-lg">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
        {participant.isSpeaking && (
          <div className="bg-green-500 rounded-full p-1.5 animate-pulse shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>

      {/* Participant badge */}
      <div className="absolute top-3 right-3">
        {participant.id === "2" ? (
          <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            AI Assistant
          </div>
        ) : (
          <div className="bg-dark-600/80 text-white text-xs px-2 py-1 rounded-full shadow-lg backdrop-blur">
            Participant
          </div>
        )}
      </div>

      {/* Hover overlay for actions */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex gap-2">
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Settings className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-dark-900 flex flex-col">
      {/* Main Meeting Area */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className={`h-full grid gap-4 ${
            layout === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {participants.map((participant) => (
              <div 
                key={participant.id} 
                className={layout === 'speaker' && participant.id === "1" ? 'col-span-1' : ''}
              >
                <ParticipantVideo participant={participant} />
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-dark-800 border-l border-dark-700 flex flex-col">
          {/* AI Assistant Panel */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-dark-700 rounded-lg p-4 mb-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                AI Assistant
              </h3>
              
              {aiMessages.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className="bg-dark-600 rounded-lg p-3">
                      <p className="text-gray-300 text-sm">{msg}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">AI Assistant is ready to help with your discussion...</p>
              )}
            </div>

            {/* AI Controls */}
            <button
              onClick={startAIModerator}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                callStatus === CallStatus.ACTIVE
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-purple-500 hover:bg-purple-600 text-white"
              }`}
            >
              {callStatus === CallStatus.CONNECTING ? "Connecting..." :
               callStatus === CallStatus.ACTIVE ? "Stop AI Assistant" : "Start AI Assistant"}
            </button>
          </div>

          {/* Meeting Info */}
          <div className="p-4 border-t border-dark-700">
            <div className="bg-dark-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Meeting ID</p>
              <p className="text-white font-mono text-sm">{meetingId}</p>
              {password && (
                <>
                  <p className="text-gray-400 text-xs mb-1 mt-2">Password</p>
                  <p className="text-white font-mono text-sm">{password}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-dark-800 border-t border-dark-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-dark-700 hover:bg-dark-600 text-gray-300"
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                !isVideoOn 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-dark-700 hover:bg-dark-600 text-gray-300"
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setLayout(layout === 'grid' ? 'speaker' : 'grid')}
              className="p-3 bg-dark-700 hover:bg-dark-600 rounded-full text-gray-300 transition-colors"
            >
              {layout === 'grid' ? <Speaker className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Control */}
          <button
            onClick={leaveMeeting}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Leave Meeting
          </button>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-3 rounded-full transition-colors ${
                showParticipants 
                  ? "bg-blue-500 hover:bg-blue-600 text-white" 
                  : "bg-dark-700 hover:bg-dark-600 text-gray-300"
              }`}
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 rounded-full transition-colors ${
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                  : "bg-dark-700 hover:bg-dark-600 text-gray-300"
              }`}
            >
              <Circle className="w-5 h-5" />
            </button>
            
            <button
              className="p-3 bg-dark-700 hover:bg-dark-600 rounded-full text-gray-300 transition-colors"
            >
              <ScreenShare className="w-5 h-5" />
            </button>
            
            <button
              className="p-3 bg-dark-700 hover:bg-dark-600 rounded-full text-gray-300 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Participants ({participants.length})</h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{participant.name}</p>
                      <div className="flex items-center gap-2 text-xs">
                        {participant.isVideoOn ? (
                          <span className="text-green-400 flex items-center gap-1">
                            <Video className="w-3 h-3" /> Camera On
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1">
                            <VideoOff className="w-3 h-3" /> Camera Off
                          </span>
                        )}
                        {participant.isMuted ? (
                          <span className="text-red-400 flex items-center gap-1">
                            <MicOff className="w-3 h-3" /> Muted
                          </span>
                        ) : (
                          <span className="text-green-400 flex items-center gap-1">
                            <Mic className="w-3 h-3" /> Unmuted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {participant.id !== "1" && participant.id !== "2" && (
                    <button
                      onClick={() => removeParticipant(participant.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-dark-600">
              <button
                onClick={() => {
                  const name = prompt("Enter participant name:");
                  if (name) {
                    addParticipant(name);
                  }
                }}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Add Participant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Zoom Meeting Component */}
      <div className="hidden">
        <ZoomMeeting
          meetingNumber={meetingId}
          password={password}
          userName={userName}
          onMeetingEnd={leaveMeeting}
        />
      </div>
    </div>
  );
};

export default MeetingPage;
