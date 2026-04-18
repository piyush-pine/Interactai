"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
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
  Grid, 
  Speaker,
  Monitor,
  Volume2,
  VolumeX,
  Star,
  TrendingUp,
  Award,
  Brain,
  Activity
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  isHost: boolean;
  speakingTime: number;
  contributions: number;
  rating?: number;
}

interface MeetingReview {
  participantId: string;
  participantName: string;
  speakingTime: number;
  contributions: number;
  rating: number;
  strengths: string[];
  improvements: string[];
  overallScore: number;
}

interface AIAnalysis {
  topPerformer: string;
  overallRating: number;
  participantReviews: MeetingReview[];
  summary: string;
  recommendations: string[];
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING", 
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const IntegratedMeetingSystem = ({ 
  meetingId, 
  userName, 
  topic, 
  duration,
  onMeetingEnd 
}: {
  meetingId: string;
  userName: string;
  topic: string;
  duration: number;
  onMeetingEnd: () => void;
}) => {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'speaker'>('grid');
  const [volume, setVolume] = useState(50);
  const [meetingStartTime, setMeetingStartTime] = useState<Date | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Real participants data
  const [participants, setParticipants] = useState<Participant[]>([
    { 
      id: "1", 
      name: userName, 
      isMuted: false, 
      isVideoOn: true, 
      isSpeaking: false, 
      isHost: true,
      speakingTime: 0,
      contributions: 0
    },
    { 
      id: "2", 
      name: "AI Assistant", 
      isMuted: false, 
      isVideoOn: false, 
      isSpeaking: false, 
      isHost: false,
      speakingTime: 0,
      contributions: 0
    },
  ]);

  // Simulate other participants joining
  const addParticipant = useCallback((name: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name,
      isMuted: false,
      isVideoOn: Math.random() > 0.3,
      isSpeaking: false,
      isHost: false,
      speakingTime: 0,
      contributions: 0
    };
    setParticipants(prev => [...prev, newParticipant]);
  }, []);

  // Remove participant from the meeting
  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  // Update participant status
  const updateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setParticipants(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  }, []);

  // Simulate speaking detection
  useEffect(() => {
    if (callStatus === CallStatus.ACTIVE) {
      const interval = setInterval(() => {
        // Randomly simulate speaking for different participants
        const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
        if (randomParticipant && Math.random() > 0.7) {
          updateParticipant(randomParticipant.id, {
            isSpeaking: true,
            speakingTime: randomParticipant.speakingTime + 2,
            contributions: randomParticipant.contributions + 1
          });
          
          setTimeout(() => {
            updateParticipant(randomParticipant.id, { isSpeaking: false });
          }, 2000);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [callStatus, participants, updateParticipant]);

  // Start AI Moderator
  const startAIModerator = useCallback(async () => {
    if (callStatus === CallStatus.ACTIVE) {
      await vapi.stop();
      setCallStatus(CallStatus.FINISHED);
      return;
    }

    setCallStatus(CallStatus.CONNECTING);

    try {
      const response = await fetch("/api/vapi/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          duration,
          userName,
        }),
      });

      if (!response.ok) throw new Error("Failed to start AI call");

      const { callId } = await response.json();
      
      vapi.start(callId);
      setCallStatus(CallStatus.ACTIVE);
      setMeetingStartTime(new Date());
      
      // Add initial AI message
      setAiMessages([`Hello ${userName}! I'm your AI GD moderator for today's "${topic}" discussion. I'll be monitoring the conversation and generating performance reviews for all participants.`]);
      
    } catch (error) {
      console.error("Error starting AI moderator:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  }, [callStatus, topic, duration, userName]);

  // Generate AI analysis
  const generateAIAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Calculate metrics
      const totalSpeakingTime = participants.reduce((sum, p) => sum + p.speakingTime, 0);
      const avgSpeakingTime = totalSpeakingTime / participants.length;
      
      // Generate reviews for each participant
      const reviews: MeetingReview[] = participants.map(participant => {
        const score = Math.min(100, 
          (participant.contributions * 10) + 
          (participant.speakingTime > avgSpeakingTime ? 20 : 0) +
          (participant.isHost ? 10 : 0)
        );
        
        const strengths = [];
        const improvements = [];
        
        if (participant.contributions > 5) strengths.push("Active participation");
        if (participant.speakingTime > avgSpeakingTime) strengths.push("Good speaking time");
        if (!participant.isMuted) strengths.push("Engaged with audio");
        if (participant.isVideoOn) strengths.push("Video presence");
        
        if (participant.contributions < 3) improvements.push("More participation needed");
        if (participant.speakingTime < avgSpeakingTime * 0.5) improvements.push("Increase speaking time");
        if (participant.isMuted) improvements.push("Enable audio for better engagement");
        
        return {
          participantId: participant.id,
          participantName: participant.name,
          speakingTime: participant.speakingTime,
          contributions: participant.contributions,
          rating: score,
          strengths,
          improvements,
          overallScore: score
        };
      });
      
      // Find top performer
      const topPerformer = reviews.reduce((prev, current) => 
        current.rating > prev.rating ? current : prev
      );
      
      // Generate recommendations
      const recommendations = [
        "Continue practicing active listening skills",
        "Maintain balanced participation",
        "Use visual aids when presenting",
        "Keep contributions concise and relevant"
      ];
      
      const analysis: AIAnalysis = {
        topPerformer: topPerformer.participantName,
        overallRating: Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length),
        participantReviews: reviews,
        summary: `The meeting had ${participants.length} participants with a total of ${totalSpeakingTime} seconds of speaking time. ${topPerformer.participantName} was the top performer with a rating of ${topPerformer.rating}/100.`,
        recommendations
      };
      
      setAiAnalysis(analysis);
      
      // Add AI message with analysis
      setAiMessages(prev => [...prev, 
        `Meeting analysis complete! ${topPerformer.participantName} was the top performer with a ${topPerformer.rating}/100 rating. Full reviews have been generated for all participants.`
      ]);
      
    } catch (error) {
      console.error("Error generating AI analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [participants]);

  // VAPI event handlers
  useEffect(() => {
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcript) {
        setAiMessages(prev => [...prev, message.transcript]);
        // Track AI contributions
        updateParticipant("2", { contributions: 1 });
      }
    };

    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("message", onMessage);

    return () => {
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("message", onMessage);
    };
  }, []);

  const leaveMeeting = () => {
    if (callStatus === CallStatus.ACTIVE) {
      vapi.stop();
      setCallStatus(CallStatus.FINISHED);
    }
    router.push("/gd");
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    updateParticipant("1", { isMuted: newMutedState });
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    updateParticipant("1", { isVideoOn: newVideoState });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const switchLayout = () => {
    setLayout(layout === "grid" ? "speaker" : "grid");
  };

  const adjustVolume = (newVolume: number) => {
    setVolume(newVolume);
  };

  return (
    <div className="h-screen bg-dark-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-dark-800 border-b border-dark-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-medium">Group Discussion: {topic}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>ID: {meetingId}</span>
            <span>Participants: {participants.length}</span>
            {meetingStartTime && (
              <span>Duration: {Math.floor((Date.now() - meetingStartTime.getTime()) / 60000)}m</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">Recording</span>
            </div>
          )}
          {callStatus === CallStatus.ACTIVE && (
            <button
              onClick={generateAIAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {isAnalyzing ? "Analyzing..." : "Generate Reviews"}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 bg-black relative">
          {/* Video Grid */}
          <div className="h-full p-4">
            <div className={`grid gap-4 h-full ${
              layout === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {participants.map((participant) => (
                <div key={participant.id} className="relative bg-dark-800 rounded-lg overflow-hidden group">
                  {participant.isVideoOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center relative">
                      {/* Video placeholder */}
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
                      <div className="bg-green-500 rounded-full p-1.5 shadow-lg animate-pulse">
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
                    ) : participant.isHost ? (
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        Host
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
              ))}
            </div>
          </div>
          
          {/* Overlay Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition-colors ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoOn 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isVideoOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-full transition-colors ${
                    isScreenSharing 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <ScreenShare className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
                  </div>
                </button>
                
                <div className="h-8 w-px bg-gray-600 mx-2" />
                
                <button
                  onClick={switchLayout}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  {layout === "grid" ? <Speaker className="w-5 h-5 text-white" /> : <Grid className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <Users className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="p-3 bg-purple-700 hover:bg-purple-600 rounded-full transition-colors"
                >
                  <Brain className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {/* Right Controls */}
              <div className="flex items-center gap-2">
                {/* Volume Control */}
                <div className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-2">
                  <button
                    onClick={() => adjustVolume(Math.max(0, volume - 10))}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <VolumeX className="w-4 h-4 text-white" />
                  </button>
                  <div className="w-20 bg-gray-600 rounded-full h-2 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${volume}%` }}
                    />
                  </div>
                  <button
                    onClick={() => adjustVolume(Math.min(100, volume + 10))}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <Volume2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <div className="h-8 w-px bg-gray-600 mx-2" />
                
                <button
                  onClick={startAIModerator}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    callStatus === CallStatus.ACTIVE 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  {callStatus === CallStatus.ACTIVE ? 'End AI' : 'Start AI'}
                </button>
                
                <button
                  onClick={leaveMeeting}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-dark-800 border-l border-dark-700 p-4">
            <h3 className="text-white font-semibold mb-4">Participants ({participants.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{participant.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        {participant.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                        {participant.isSpeaking && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                                                <span className="text-gray-400">Speaking: {participant.speakingTime}s</span>
                        <span className="text-gray-400">Contributions: {participant.contributions}</span>
                      </div>
                    </div>
                  </div>
                  {aiAnalysis?.participantReviews.find(r => r.participantId === participant.id) && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 text-sm">
                        {aiAnalysis.participantReviews.find(r => r.participantId === participant.id)?.rating}/100
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* AI Assistant Panel */}
        {showAI && (
          <div className="w-80 bg-dark-800 border-l border-dark-700 flex flex-col">
            <div className="p-4 border-b border-dark-700">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI GD Assistant
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {aiAnalysis ? (
                <div className="space-y-4">
                  <div className="bg-dark-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      Top Performer
                    </h4>
                    <p className="text-white">{aiAnalysis.topPerformer}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400">{aiAnalysis.overallRating}/100</span>
                    </div>
                  </div>
                  
                  <div className="bg-dark-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Summary</h4>
                    <p className="text-gray-300 text-sm">{aiAnalysis.summary}</p>
                  </div>
                  
                  <div className="bg-dark-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Recommendations</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {aiAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">
                  {callStatus === CallStatus.ACTIVE 
                    ? "AI is monitoring the conversation and will generate reviews when the meeting ends."
                    : "Start the AI assistant to enable meeting analysis and performance reviews."
                  }
                </div>
              )}
              
              {/* AI Messages */}
              {aiMessages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <h4 className="text-white font-medium mb-2">AI Messages</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {aiMessages.map((message, index) => (
                      <div key={index} className="bg-purple-900/20 border border-purple-700 rounded-lg p-2">
                        <p className="text-purple-300 text-sm">{message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-dark-800 border-l border-dark-700 flex flex-col">
            <div className="p-4 border-b border-dark-700">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            <div className="flex-1 p-4">
              <p className="text-gray-400 text-sm">Chat functionality coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedMeetingSystem;
