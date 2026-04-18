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
  Activity,
  Link,
  ExternalLink,
  Copy,
  Check,
  MoreVertical,
  Subtitles,
  Calendar,
  Group,
  UserPlus,
  Shield,
  LogOut,
  Maximize,
  Minimize,
  Fullscreen,
  MessageSquare as ChatBubble,
  Share,
  Wifi,
  Signal,
  Info,
  HelpCircle,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Camera,
  Headphones,
  Keyboard,
  Presentation,
  FileText,
  AlertTriangle,
  Phone as Call,
  Video as VideoCamera,
  Settings2,
  Users as People,
  MessageSquare as Chat2,
  Grid3x3 as Apps,
  Pin,
  Volume1,
  Volume
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
  isHost: boolean;
  joinedAt: Date;
  speakingTime: number;
  contributions: number;
  rating?: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface MeetingInfo {
  meetingId: string;
  joinUrl: string;
  password: string;
  topic: string;
  duration: number;
  hostName: string;
  startTime: Date;
}

interface AIAnalysis {
  topPerformer: string;
  overallRating: number;
  participantReviews: Array<{
    participantId: string;
    participantName: string;
    speakingTime: number;
    contributions: number;
    rating: number;
    strengths: string[];
    improvements: string[];
    overallScore: number;
  }>;
  summary: string;
  recommendations: string[];
}

enum CallStatus {
  WAITING = "WAITING",
  JOINING = "JOINING", 
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
  DISCONNECTED = "DISCONNECTED",
}

const GoogleMeetInterface = ({ 
  meetingId, 
  userName, 
  userEmail,
  topic, 
  duration,
  onLeave 
}: {
  meetingId: string;
  userName: string;
  userEmail?: string;
  topic: string;
  duration: number;
  onLeave: () => void;
}) => {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.WAITING);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  [showCaptions, setShowCaptions] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'speaker'>('grid');
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
  const [meetingStartTime, setMeetingStartTime] = useState<Date | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoGridRef = useRef<HTMLDivElement>(null);

  // Real participants data
  const [participants, setParticipants] = useState<Participant[]>([
    { 
      id: "1", 
      name: userName, 
      email: userEmail,
      avatar: userName.charAt(0).toUpperCase(),
      isMuted: false, 
      isVideoOn: true, 
      isSpeaking: false, 
      isHandRaised: false,
      isHost: true,
      joinedAt: new Date(),
      speakingTime: 0,
      contributions: 0,
      connectionQuality: 'excellent'
    },
  ]);

  // Simulate other participants joining
  const addParticipant = useCallback((name: string, email?: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      avatar: name.charAt(0).toUpperCase(),
      isMuted: Math.random() > 0.5,
      isVideoOn: Math.random() > 0.3,
      isSpeaking: false,
      isHandRaised: false,
      isHost: false,
      joinedAt: new Date(),
      speakingTime: 0,
      contributions: 0,
      connectionQuality: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any
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
    if (callStatus === CallStatus.CONNECTED) {
      const interval = setInterval(() => {
        // Randomly simulate speaking for different participants
        const activeParticipants = participants.filter(p => !p.isMuted);
        if (activeParticipants.length > 0) {
          const randomParticipant = activeParticipants[Math.floor(Math.random() * activeParticipants.length)];
          if (randomParticipant && Math.random() > 0.6) {
            updateParticipant(randomParticipant.id, {
              isSpeaking: true,
              speakingTime: randomParticipant.speakingTime + 2,
              contributions: randomParticipant.contributions + 1
            });
            
            setTimeout(() => {
              updateParticipant(randomParticipant.id, { isSpeaking: false });
            }, 3000);
          }
        }
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [callStatus, participants, updateParticipant]);

  // Start AI Moderator
  const startAIModerator = useCallback(async () => {
    if (callStatus === CallStatus.CONNECTED) {
      // Stop AI if running
      setAiMessages(prev => [...prev, "AI moderator stopped."]);
      return;
    }

    setCallStatus(CallStatus.CONNECTING);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/vapi/call", {
        method: "POST",
        headers: { "ContentContent-Type": "application/json" },
        body: JSON.stringify({
          topic,
          duration,
          userName,
        }),
      });

      if (!response.ok) throw new Error("Failed to start AI call");

      const { callId } = await response.json();
      
      vapi.start(callId);
      setCallStatus(CallStatus.CONNECTED);
      setMeetingStartTime(new Date());
      
      // Add initial AI message
      setAiMessages([`Hello ${userName}! I'm your AI GD moderator for today's "${topic}" discussion. I'll be monitoring the conversation and generating performance reviews for all participants.`]);
      
      // Add AI as participant
      addParticipant("AI Assistant", "ai@interact.ai");
      
    } catch (error) {
      console.error("Error starting AI moderator:", error);
      setCallStatus(CallStatus.WAITING);
    } finally {
      setIsAnalyzing(false);
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
      const reviews = participants.map(participant => {
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
        summary: `The meeting had ${participants.length} participants with a total of ${totalSpeakingTime} seconds of speaking time. ${topPerformer.participantName} was the top performer with a ${topPerformer.rating}/100 rating.`,
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
        const aiParticipant = participants.find(p => p.name === "AI Assistant");
        if (aiParticipant) {
          updateParticipant(aiParticipant.id, { contributions: aiParticipant.contributions + 1 });
        }
      }
    };

    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("message", onMessage);

    return () => {
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.join("message", onMessage);
    };
  }, [participants]);

  const leaveMeeting = () => {
    if (callStatus === CallStatus.CONNECTED) {
      vapi.stop();
      setCallStatus(CallStatus.DISCONNECTED);
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

  const toggleHandRaised = () => {
    setIsHandRaised(!isHandRaised);
    updateParticipant("1", { isHandRaised: !isHandRaised });
  };

  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const switchLayout = () => {
    setLayout(layout === "grid" ? "speaker" : "grid");
  };

  const adjustVolume = (newVolume: number) => {
    setVolume(newVolume);
  };

  const copyMeetingLink = () => {
    if (meetingInfo?.joinUrl) {
      navigator.clipboard.writeText(meetingInfo.joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const joinViaZoom = () => {
    if (meetingInfo?.joinUrl) {
      window.open(meetingInfo.joinUrl, '_blank');
    }
  };

  const joinViaInteractAI = () => {
    setCallStatus(CallStatus.JOINING);
    // Simulate joining
    setTimeout(() => {
      setCallStatus(CallStatus.CONNECTED);
      setMeetingInfo({
        meetingId: meetingId,
        joinUrl: `https://zoom.us/j/${meetingId}`,
        password: "",
        topic,
        duration,
        hostName: userName,
        startTime: new Date()
      });
    }, 2000);
  };

  if (callStatus === CallStatus.WAITING) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Joining Meeting...</h3>
          <p className="text-gray-600">Please wait while we connect you to the meeting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <VideoCamera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-gray-900">{topic}</h1>
              <p className="text-sm text-gray-500">Meeting ID: {meetingId}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">Recording</span>
            </div>
          )}
          
          <button
            onClick={generateAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {isAnalyzing ? "Analyzing..." : "Generate Reviews"}
          </button>
          
          <button
            onClick={leaveMeeting}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Exit className="w-4 h-4" />
            Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 bg-black relative">
          {/* Video Grid */}
          <div 
            ref={videoGridRef}
            className={`h-full p-4 ${
              layout === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}
          >
            {participants.map((participant) => (
              <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden group">
                {participant.isVideoOn ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center relative">
                    {/* Video placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 text-white/50" />
                    </div>
                    <div className="text-center z-10">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-white">
                          {participant.avatar}
                        </span>
                      </div>
                      <p className="text-white font-medium">{participant.name}</p>
                      <p className="text-white/70 text-sm">Connected</p>
                      {participant.connectionQuality && (
                        <div className="flex items-center gap-1 mt-1">
                          <Signal className={`w-3 h-3 ${
                            participant.connectionQuality === 'excellent' ? 'text-green-500' :
                            participant.connectionQuality === 'good' ? 'text-yellow-500' :
                            participant.connectionQuality === 'fair' ? 'text-orange-500' :
                            'text-red-500'
                          }`} />
                          <span className={`text-xs ${
                            participant.connectionQuality === 'excellent' ? 'text-green-500' :
                            participant.connectionQuality === 'good' ? 'text-yellow-500' :
                            participant.connectionQuality === 'fair' ? 'text-orange-500' :
                            'text-red-500'
                          }`}>
                            {participant.connectionQuality}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                        <PersonAdd className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400 font-medium">{participant.name}</p>
                      <p className="text-gray-500 text-sm">Camera Off</p>
                    </div>
                  </div>
                )}
                
                {/* Status indicators */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  {participant.isMuted && (
                    <div className="bg-white rounded-full p-1.5 shadow-lg">
                      <MicOff className="w-3 h-3 text-gray-600" />
                    </div>
                  )}
                  {participant.isHandRaised && (
                    <div className="bg-yellow-500 rounded-full p-1.5 shadow-lg">
                      <HandRaised className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {participant.isSpeaking && (
                    <div className="bg-green-500 rounded-full p-1.5 shadow-lg animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                {/* Participant info */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {participant.id === "2" ? (
                    <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      AI
                    </div>
                  ) : participant.isHost ? (
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      Host
                    </div>
                  ) : (
                    <div className="bg-gray-700/80 text-white text-xs px-2 py-1 rounded-full shadow-lg backdrop-blur">
                      Participant
                    </div>
                  )}
                  {aiAnalysis?.participantReviews.find(r => r.participantId === participant.id) && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 text-sm">
                        {aiAnalysis.participantReviews.find(r => r.participantId === participant.id)?.rating}/100
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover overlay for actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                      ? 'bg-white hover:bg-gray-100' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5 text-gray-600" /> : <Mic className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoOn 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {isVideoOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-gray-600" />}
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
                  <Record className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={toggleHandRaised}
                  className={`p-3 rounded-full transition-colors ${
                    isHandRaised 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <HandRaised className="w-5 h-5 text-white" />
                </button>
                
                <div className="h-8 w-px bg-gray-600 mx-2" />
                
                <button
                  onClick={toggleCaptions}
                  className={`p-3 rounded-full transition-colors ${
                    showCaptions 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <ClosedCaptions className="w-5 h-5 text-white" />
                </button>
                
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
                  onClick={() => setShowChat(!showChat)}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <ChatBubble className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={() => setShowAI(!showAI)}
                  className={`p-3 rounded-full transition-colors ${
                    showAI 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <Brain className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={() => setShowApps(!showApps)}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <Apps className="w-5 h-5 text-white" />
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
                  onClick={toggleFullscreen}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <Fullscreen className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-3 rounded-full transition-colors ${
                    isPinned 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <PushPin className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={leaveMeeting}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Phone className="w-5 h-5 text-white" />
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold">Participants ({participants.length})</h3>
              <button
                onClick={() => addParticipant("New User")}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
              >
                <PersonAdd className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-700 text-sm font-medium">
                        {participant.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{participant.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        {participant.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
                        {participant.isHandRaised && <HandRaised className="w-3 h-3 text-yellow-500" />}
                        {participant.isSpeaking && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                        {participant.isVideoOn && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        <span className="text-gray-500">Speaking: {participant.speakingTime}s</span>
                        <span className="text-gray-500">Contributions: {participant.contributions}</span>
                        <span className="text-gray-500">Joined: {Math.floor((Date.now() - participant.joinedAt.getTime()) / 60000)}m ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {aiAnalysis?.participantReviews.find(r => r.participantId === participant.id) && (
                      <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 text-sm">
                        {aiAnalysis.participantReviews.find(r => r.participantId === participant.id)?.rating}/100
                      </span>
                    </div>
                  )}
                    <button
                      onClick={() => removeParticipant(participant.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Exit className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* AI Assistant Panel */}
        {showAI && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                AI GD Assistant
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {aiAnalysis ? (
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="text-gray-900 font-medium mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      Top Performer
                    </h4>
                    <p className="text-gray-900">{aiAnalysis.topPerformer}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400">{aiAnalysis.overallRating}/100</span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="text-gray-900 font-medium mb-2">Summary</h4>
                    <p className="text-gray-700 text-sm">{aiAnalysis.summary}</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="text-gray-900 font-medium mb-2">Recommendations</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
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
                <div className="text-gray-500 text-sm">
                  {callStatus === CallStatus.CONNECTED 
                    ? "AI is monitoring the conversation and will generate reviews when the meeting ends."
                    : "Start the AI assistant to enable meeting analysis and performance reviews."
                  }
                </div>
              )}
              
              {/* AI Messages */}
              {aiMessages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-gray-900 font-medium mb-2">AI Messages</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {aiMessages.map((message, index) => (
                      <div key={index} className="bg-purple-100 border border-purple-300 rounded-lg p-2">
                        <p className="text-purple-700 text-sm">{message}</p>
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
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold">Chat</h3>
            </div>
            <div className="flex-1 p-4">
              <div className="text-gray-500 text-sm">Chat functionality coming soon...</div>
            </div>
          </div>
        )}
        
        {/* Apps Panel */}
        {showApps && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold">Apps</h3>
            </div>
            <div className="flex-1 p-4">
              <div className="text-gray-500 text-sm">Apps functionality coming soon...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMeetInterface;
