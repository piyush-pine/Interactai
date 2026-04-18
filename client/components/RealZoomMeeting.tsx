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
  Circle as RecordIcon, 
  Grid, 
  Speaker, 
  ExternalLink,
  Copy,
  Check,
  Hash,
  Lock,
  Clock,
  User,
  Info,
  Camera,
  Signal,
  Maximize2,
  Volume2,
  Hand,
  Captions,
  Monitor,
  Brain,
  Star,
  MoreVertical,
  Award,
  TrendingUp,
  Play,
  Square,
  Circle as CircleIcon,
  Minimize2,
  Eye,
  EyeOff,
  Unlock,
  Video as VideoIcon,
  Mic as MicIcon,
  PhoneCall,
  MonitorSpeaker,
  StopCircle,
  Subtitles,
  Calendar,
  Group,
  UserPlus,
  Shield,
  LogOut,
  Fullscreen,
  Share,
  Wifi,
  Pause,
  Pin,
  Volume1,
  Volume,
  HelpCircle,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Headphones,
  Presentation,
  FileText,
  AlertTriangle,
  Settings2,
  Grid3x3 as Apps
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
  isAI?: boolean;
  joinedAt: Date;
  speakingTime: number;
  contributions: number;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  cameraQuality?: 'hd' | 'sd' | 'low';
  isScreenSharing: boolean;
  isRecording: boolean;
  isPinned: boolean;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
}

interface MeetingInfo {
  meetingId: string;
  joinUrl: string;
  password: string;
  topic: string;
  duration: number;
  hostName: string;
  startTime: Date;
  participants: number;
}

interface AIReview {
  participantId: string;
  participantName: string;
  speakingTime: number;
  contributions: number;
  rating: number;
  strengths: string[];
  improvements: string[];
  overallScore: number;
  cameraQuality: string;
  engagement: number;
  detailedFeedback: string[];
  performanceSummary: string;
}

interface AIAnalysis {
  participantReviews: AIReview[];
  summary: string;
  recommendations: string[];
  gdInsights: string[];
}

enum CallStatus {
  WAITING = "WAITING",
  JOINING = "JOINING", 
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
  DISCONNECTED = "DISCONNECTED",
  ENDING = "ENDING",
  ENDED = "ENDED",
}


const RealZoomMeeting = ({ 
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
  const [isPinned, setIsPinned] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isWaitingRoom, setIsWaitingRoom] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.WAITING);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  
  // Real camera and microphone streams
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [microphoneError, setMicrophoneError] = useState<string>("");
  
  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [layout, setLayout] = useState<'gallery' | 'speaker'>('gallery');
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
  const [meetingStartTime, setMeetingStartTime] = useState<Date | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string>("1"); // Host selected by default
  const [showGrid, setShowGrid] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAIGuiding, setIsAIGuiding] = useState(false);
  const [gdPhase, setGdPhase] = useState<'introduction' | 'discussion' | 'conclusion' | 'analysis'>('introduction');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [gdTimer, setGdTimer] = useState<number>(duration * 60); // Convert to seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [gdCompleted, setGdCompleted] = useState(false);
  const [speechRestartAttempts, setSpeechRestartAttempts] = useState(0);
  const [lastRestartTime, setLastRestartTime] = useState<number>(0);

  // Real participants data with AI
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
      isAI: false,
      joinedAt: new Date(),
      speakingTime: 0,
      contributions: 0,
      connectionQuality: 'excellent',
      cameraQuality: 'hd',
      isScreenSharing: false,
      isRecording: false,
      isPinned: false
    },
    { 
      id: "2", 
      name: "AI GD Moderator", 
      email: "ai@interact.ai",
      avatar: "AI",
      isMuted: false, 
      isVideoOn: false, 
      isSpeaking: false, 
      isHandRaised: false,
      isHost: false,
      isAI: true,
      joinedAt: new Date(),
      speakingTime: 0,
      contributions: 0,
      connectionQuality: 'excellent',
      cameraQuality: 'hd',
      isScreenSharing: false,
      isRecording: false,
      isPinned: false
    },
  ]);

  // Camera and microphone access functions
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      setLocalVideoStream(stream);
      setCameraError("");
      
      // Set video stream to local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Update participant with video stream
      updateParticipant("1", { 
        isVideoOn: true, 
        videoStream: stream,
        cameraQuality: 'hd'
      });
      
      return stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Unable to access camera. Please check permissions.");
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (localVideoStream) {
      localVideoStream.getTracks().forEach(track => track.stop());
      setLocalVideoStream(null);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      
      updateParticipant("1", { 
        isVideoOn: false, 
        videoStream: undefined 
      });
    }
  }, [localVideoStream]);

  const startMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      setLocalAudioStream(stream);
      setMicrophoneError("");
      
      // Update participant with audio stream
      updateParticipant("1", { 
        isMuted: false, 
        audioStream: stream 
      });
      
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setMicrophoneError("Unable to access microphone. Please check permissions.");
      return null;
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (localAudioStream) {
      localAudioStream.getTracks().forEach(track => track.stop());
      setLocalAudioStream(null);
      
      updateParticipant("1", { 
        isMuted: true, 
        audioStream: undefined 
      });
    }
  }, [localAudioStream]);

  // Initialize camera and microphone on component mount
  useEffect(() => {
    if (isVideoOn) {
      startCamera();
    }
    
    if (!isMuted) {
      startMicrophone();
    }
    
    return () => {
      stopCamera();
      stopMicrophone();
    };
  }, []);

  // Keep camera active when video is on
  useEffect(() => {
    if (isVideoOn && !localVideoStream) {
      startCamera();
    }
  }, [isVideoOn, localVideoStream, startCamera]);

  // Keep microphone active when unmuted
  useEffect(() => {
    if (!isMuted && !localAudioStream) {
      startMicrophone();
    }
  }, [isMuted, localAudioStream, startMicrophone]);

  // Remove participant from meeting
  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  // Update participant status
  const updateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setParticipants(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  }, []);

  // Initialize speech recognition with proper error handling
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      try {
        const recognition = new (window as any).webkitSpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          try {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript;
            
            if (event.results[last].isFinal && transcript) {
              setTranscript(prev => [...prev, `User: ${transcript}`]);
              
              // Update participant speaking time
              const currentParticipant = participants.find(p => p.id === "1");
              updateParticipant("1", {
                isSpeaking: true,
                speakingTime: (currentParticipant?.speakingTime || 0) + 2
              });
              
              setTimeout(() => {
                updateParticipant("1", { isSpeaking: false });
              }, 2000);
            }
          } catch (error) {
            console.error('Speech recognition result error:', error);
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          // Handle specific error types
          if (event.error === 'aborted') {
            console.log('Speech recognition was aborted - will restart if needed');
            // Don't auto-restart on abort to prevent infinite loops
            // The onend handler will handle restart if appropriate
          } else if (event.error === 'no-speech') {
            console.log('No speech detected - continuing...');
          } else if (event.error === 'not-allowed') {
            console.log('Microphone permission denied - speech recognition unavailable');
            setAiMessages(prev => [...prev, "Microphone access denied. Speech recognition unavailable."]);
          } else if (event.error === 'network') {
            console.log('Network error in speech recognition - will retry');
          } else {
            console.log(`Speech recognition error: ${event.error}`);
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
          // Auto-restart if still in meeting and not muted, with attempt limiting
          if (!isMuted && callStatus === CallStatus.CONNECTED && !gdCompleted) {
            const now = Date.now();
            const timeSinceLastRestart = now - lastRestartTime;
            
            // Only restart if haven't restarted too recently and haven't exceeded attempts
            if (timeSinceLastRestart > 2000 && speechRestartAttempts < 5) {
              setTimeout(() => {
                try {
                  recognition.start();
                  setIsListening(true);
                  setSpeechRestartAttempts(prev => prev + 1);
                  setLastRestartTime(Date.now());
                  console.log(`Speech recognition restarted (attempt ${speechRestartAttempts + 1})`);
                } catch (restartError) {
                  console.error('Failed to auto-restart speech recognition:', restartError);
                  setSpeechRestartAttempts(0); // Reset attempts on failure
                }
              }, 500);
            } else if (speechRestartAttempts >= 5) {
              console.log('Speech recognition restart limit reached, stopping auto-restart');
              setAiMessages(prev => [...prev, "Speech recognition stopped due to repeated errors. Manual analysis will be used."]);
            }
          }
        };
        
        setRecognition(recognition);
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        setAiMessages(prev => [...prev, "Speech recognition initialization failed. Manual analysis will be used."]);
      }
    } else {
      console.log('Speech recognition not supported in this browser');
      setAiMessages(prev => [...prev, "Speech recognition not supported. Manual analysis will be used."]);
    }
  }, []);

  // Start/stop speech recognition based on microphone state
  useEffect(() => {
    if (recognition && !isMuted && callStatus === CallStatus.CONNECTED) {
      recognition.start();
      setIsListening(true);
    } else if (recognition && (isMuted || callStatus !== CallStatus.CONNECTED)) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isMuted, callStatus]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerRunning && gdTimer > 0 && !gdCompleted) {
      interval = setInterval(() => {
        setGdTimer(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            setGdCompleted(true);
            setGdPhase('conclusion');
            setAiMessages(prev => [...prev, "Time's up! GD session has concluded. AI will now provide final reviews."]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, gdTimer, gdCompleted]);

  // Start timer when meeting starts
  useEffect(() => {
    if (callStatus === CallStatus.CONNECTED && !timerRunning && !gdCompleted) {
      setTimerRunning(true);
    }
  }, [callStatus, timerRunning, gdCompleted]);

  // Generate AI analysis with detailed reviews
  const generateAIAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setGdPhase('analysis');
    
    try {
      // Calculate metrics
      const totalSpeakingTime = participants.reduce((sum, p) => sum + p.speakingTime, 0);
      const avgSpeakingTime = totalSpeakingTime / participants.length;
      const cameraOnParticipants = participants.filter(p => p.isVideoOn).length;
      
      // Generate detailed reviews for each participant
      const reviews = participants.filter(p => !p.isAI).map(participant => {
        const engagement = (participant.contributions * 10) + (participant.isVideoOn ? 20 : 0) + (participant.isHandRaised ? 10 : 0);
        const score = Math.min(100, 
          (participant.contributions * 15) + 
          (participant.speakingTime > avgSpeakingTime ? 20 : 0) +
          (participant.isVideoOn ? 25 : 0) + // Camera on bonus
          (participant.isHost ? 10 : 0)
        );
        
        const strengths = [];
        const improvements = [];
        const detailedFeedback = [];
        
        // Detailed strengths analysis
        if (participant.contributions >= 8) {
          strengths.push("Excellent participation frequency");
          detailedFeedback.push("You contributed frequently to the discussion, showing great engagement and interest in the topic.");
        } else if (participant.contributions >= 5) {
          strengths.push("Active participation");
          detailedFeedback.push("You participated actively in the discussion, contributing valuable points to the conversation.");
        } else {
          improvements.push("Increase participation frequency");
          detailedFeedback.push("Consider contributing more frequently to the discussion to share your valuable insights.");
        }
        
        if (participant.speakingTime > avgSpeakingTime * 1.2) {
          strengths.push("Confident speaker with good time management");
          detailedFeedback.push("You spoke confidently and managed your speaking time well, neither dominating nor being too passive.");
        } else if (participant.speakingTime > avgSpeakingTime * 0.8) {
          strengths.push("Good speaking balance");
          detailedFeedback.push("You maintained a good balance in your speaking time, contributing appropriately to the discussion.");
        } else {
          improvements.push("Speak more confidently and frequently");
          detailedFeedback.push("Try to speak more confidently and frequently to share your thoughts with the group.");
        }
        
        if (participant.isVideoOn) {
          strengths.push("Maintained professional camera presence");
          detailedFeedback.push("Keeping your camera on throughout the session shows professionalism and helps maintain engagement.");
        } else {
          improvements.push("Keep camera on for better engagement");
          detailedFeedback.push("Maintaining camera presence is important for better engagement and professional communication.");
        }
        
        if (participant.isHandRaised) {
          strengths.push("Used hand raise feature appropriately");
          detailedFeedback.push("Using the hand raise feature shows respect for others' speaking time and orderly participation.");
        } else if (participant.contributions < 4) {
          improvements.push("Use hand raise to participate more");
          detailedFeedback.push("Consider using the hand raise feature to indicate when you want to speak, especially in larger groups.");
        }
        
        // Communication skills assessment
        if (participant.contributions >= 6 && participant.speakingTime > avgSpeakingTime * 0.7) {
          strengths.push("Strong communication skills");
          detailedFeedback.push("You demonstrated strong communication skills with clear articulation and relevant contributions.");
        }
        
        // Leadership qualities (if applicable)
        if (participant.isHost && participant.contributions >= 5) {
          strengths.push("Good leadership and facilitation");
          detailedFeedback.push("As host, you facilitated the discussion well and ensured everyone had opportunity to participate.");
        }
        
        // Constructive feedback
        if (participant.contributions < 3) {
          improvements.push("Share more thoughts and opinions");
          detailedFeedback.push("Don't hesitate to share your unique perspective - all viewpoints are valuable in group discussions.");
        }
        
        if (participant.speakingTime < avgSpeakingTime * 0.5) {
          improvements.push("Be more assertive in sharing ideas");
          detailedFeedback.push("Practice being more assertive in sharing your ideas - your thoughts are important to the group.");
        }
        
        // Overall performance summary
        let performanceSummary = "";
        if (score >= 85) {
          performanceSummary = "Outstanding performance! You demonstrated excellent communication skills, active participation, and professional conduct throughout the discussion.";
        } else if (score >= 70) {
          performanceSummary = "Good performance! You participated well and contributed meaningfully to the discussion. Keep up the great work.";
        } else if (score >= 55) {
          performanceSummary = "Satisfactory performance. You participated in the discussion, but there's room for improvement in engagement and contribution frequency.";
        } else {
          performanceSummary = "Needs improvement. Focus on increasing participation, maintaining camera presence, and contributing more actively to discussions.";
        }
        
        return {
          participantId: participant.id,
          participantName: participant.name,
          speakingTime: participant.speakingTime,
          contributions: participant.contributions,
          rating: score,
          strengths,
          improvements,
          overallScore: score,
          cameraQuality: participant.cameraQuality || 'hd',
          engagement,
          detailedFeedback,
          performanceSummary
        };
      });
      
      const analysis: AIAnalysis = {
        participantReviews: reviews,
        summary: `Group Discussion Analysis Complete!\n\nSession Overview:\n- ${participants.length} participants participated\n- Total discussion time: ${Math.round(totalSpeakingTime)} seconds\n- Average speaking time: ${Math.round(avgSpeakingTime)} seconds per participant\n- Camera compliance: ${Math.round((cameraOnParticipants / participants.length) * 100)}%\n- Total contributions: ${participants.reduce((sum, p) => sum + p.contributions, 0)}\n\nIndividual detailed reviews have been generated for all participants with comprehensive feedback on communication skills, participation, and areas for improvement.`,
        recommendations: [
          "Continue maintaining camera presence for better engagement and professional communication",
          "Practice balanced speaking - contribute regularly without dominating the conversation",
          "Use hand raise feature to indicate when you want to speak, especially in larger groups",
          "Focus on quality arguments rather than quantity - make your contributions count",
          "Listen actively to others before responding and build on their ideas",
          "Prepare discussion points in advance to contribute more meaningfully",
          "Practice assertive communication while respecting others' speaking time"
        ],
        gdInsights: [
          `Average speaking time: ${Math.round(avgSpeakingTime)}s per participant`,
          `Camera compliance: ${Math.round((cameraOnParticipants / participants.length) * 100)}%`,
          `Total contributions: ${participants.reduce((sum, p) => sum + p.contributions, 0)}`,
          `Discussion quality: ${reviews.filter(r => r.rating >= 70).length >= reviews.length / 2 ? 'Good' : 'Needs improvement'}`,
          `Most active participant: ${reviews.reduce((prev, curr) => prev.rating > curr.rating ? prev : curr).participantName}`,
          `Engagement level: ${reviews.reduce((sum, r) => sum + r.engagement, 0) / reviews.length}%`
        ]
      };
      
      setAiAnalysis(analysis);
      
      // Make AI speak the analysis summary
      if (process.env.NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID && process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
        try {
          await vapi.say(
            `Group discussion analysis complete! I've generated detailed reviews for all ${reviews.length} participants. Each review includes comprehensive feedback on communication skills, participation level, and specific areas for improvement. This is a collaborative learning experience designed to help everyone improve their discussion skills. Please review your individual feedback and focus on the recommended areas for development.`
          );
          setAiMessages(prev => [...prev, "AI provided analysis summary!"]);
        } catch (speechError: any) {
          console.error("Analysis speech error:", speechError);
          setAiMessages(prev => [...prev, `Analysis Speech Error: ${speechError.message}`]);
        }
      }
      
      const analysisMessage = `GD Analysis Complete!\n\nDetailed individual reviews generated for all ${reviews.length} participants:\n\nEach review includes:\n- Performance score and summary\n- Detailed strengths and achievements\n- Specific areas for improvement\n- Actionable feedback and recommendations\n- Communication skills assessment\n\nThis analysis helps identify your strengths and areas for development in group discussions.`;
      setAiMessages(prev => [...prev, analysisMessage]);
      
    } catch (error) {
      console.error("Error generating analysis:", error);
      setAiMessages(prev => [...prev, "Error generating analysis. Please try again."]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [participants]);

  // Add new participant function with AI welcome
  const addNewParticipant = useCallback((name: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      avatar: name.charAt(0).toUpperCase(),
      isMuted: false,
      isVideoOn: true,
      isSpeaking: false,
      isHandRaised: false,
      isHost: false,
      isAI: false,
      joinedAt: new Date(),
      speakingTime: 0,
      contributions: 0,
      connectionQuality: 'excellent',
      cameraQuality: 'hd',
      isScreenSharing: false,
      isRecording: false,
      isPinned: false
    };
    
    setParticipants(prev => [...prev, newParticipant]);
    
    // AI welcomes new participant
    const welcomeMessage = `Welcome to the discussion, ${name}! Please introduce yourself briefly and then share your thoughts on "${topic}".`;
    setAiMessages(prev => [...prev, welcomeMessage]);
    
    // Make AI speak the welcome
    if (process.env.NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID && process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
      vapi.say(`Welcome to the discussion, ${name}! Please introduce yourself briefly and then share your thoughts on ${topic}.`);
    }
  }, [topic]);

  // Generate AI topic when no topic provided
  const generateAITopic = useCallback(() => {
    const topics = [
      "The impact of artificial intelligence on job markets",
      "Social media's influence on mental health",
      "Climate change and individual responsibility",
      "Remote work vs office work productivity",
      "The future of education technology",
      "Universal basic income pros and cons",
      "Digital privacy in the modern age",
      "Sustainable living and lifestyle choices",
      "The role of government in regulating technology",
      "Work-life balance in the digital era"
    ];
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    return randomTopic;
  }, []);

  // AI Guidance functions
  const startAIGuidance = useCallback(() => {
    setIsAIGuiding(true);
    setGdPhase('introduction');
    
    // Check if topic provided by host or generate AI topic
    const gdTopic = topic || generateAITopic();
    
    const introMessage = `Welcome to the Group Discussion on "${gdTopic}"!\n\nDiscussion Guidelines:\n- Keep cameras on throughout the session\n- Speak clearly and participate actively\n- Respect others' speaking time\n- I'll monitor contributions and speaking patterns\n- No winners or toppers - everyone gets a fair review\n\nLet's start with brief introductions from each participant.`;
    setAiMessages(prev => [...prev, introMessage]);
    
    // Make AI speak the introduction
    setTimeout(() => {
      if (process.env.NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID && process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
        const speechIntro = topic 
          ? `Welcome to the Group Discussion on ${topic}. Please keep your cameras on throughout the session, speak clearly, and participate actively. I'll monitor your contributions and speaking patterns. There will be no winners or toppers - everyone will receive a fair review. Let's start with brief introductions from each participant.`
          : `I notice no topic was provided, so I've selected a topic for our discussion: ${gdTopic}. Welcome to the Group Discussion on ${gdTopic}. Please keep your cameras on throughout the session, speak clearly, and participate actively. I'll monitor your contributions and speaking patterns. There will be no winners or toppers - everyone will receive a fair review. Let's start with brief introductions from each participant.`;
        
        vapi.say(speechIntro);
      }
    }, 1000);
    
    // Move to discussion phase after introductions
    setTimeout(() => {
      setGdPhase('discussion');
      const discussMessage = `Now let's begin the discussion on: "${gdTopic}"\n\nTips:\n- Make relevant and meaningful contributions\n- Support your arguments with examples\n- Listen actively to others\n- Maintain balanced participation\n- Focus on quality discussion, not competition\n\nI'll be monitoring your participation and providing individual reviews after the discussion.`;
      setAiMessages(prev => [...prev, discussMessage]);
      
      if (process.env.NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID && process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
        vapi.say(
          `Now let's begin the discussion on ${gdTopic}. Make relevant and meaningful contributions, support your arguments with examples, listen actively to others, and maintain balanced participation. Focus on quality discussion, not competition. I'll be monitoring your participation and providing individual reviews after the discussion.`
        );
      }
      
      setIsAIGuiding(false);
    }, 15000);
  }, [topic, generateAITopic]);

  // VAPI Validation Checkpoint
  const validateVAPIConfiguration = useCallback(() => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID;
    const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    
    const validation = {
      isValid: true,
      issues: [] as string[],
      recommendations: [] as string[]
    };
    
    // Check environment variables
    if (!assistantId) {
      validation.isValid = false;
      validation.issues.push("NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID is missing");
      validation.recommendations.push("Add GD assistant ID to .env file");
    }
    
    if (!webToken) {
      validation.isValid = false;
      validation.issues.push("NEXT_PUBLIC_VAPI_WEB_TOKEN is missing");
      validation.recommendations.push("Add VAPI web token to .env file");
    }
    
    // Check assistant ID format
    if (assistantId && !assistantId.startsWith('assistant_')) {
      validation.issues.push("Assistant ID format may be incorrect");
      validation.recommendations.push("Ensure assistant ID starts with 'assistant_'");
    }
    
    // Check web token format
    if (webToken && webToken.length < 20) {
      validation.issues.push("Web token format may be incorrect");
      validation.recommendations.push("Ensure web token is at least 20 characters long");
    }
    
    return validation;
  }, []);

  // Real VAPI AI integration with enhanced error handling
  const startMeeting = useCallback(async () => {
    setCallStatus(CallStatus.JOINING);
    setIsAnalyzing(true);

    try {
      // VAPI Validation Checkpoint
      const validation = validateVAPIConfiguration();
      
      if (!validation.isValid) {
        setAiMessages(prev => [...prev, "VAPI Validation Failed:"]);
        validation.issues.forEach(issue => {
          setAiMessages(prev => [...prev, `  ${issue}`]);
        });
        setAiMessages(prev => [...prev, "Recommendations:"]);
        validation.recommendations.forEach(rec => {
          setAiMessages(prev => [...prev, `  ${rec}`]);
        });
        setAiMessages(prev => [...prev, "Using fallback mode..."]);
      }
      
      // Check VAPI configuration
      const assistantId = process.env.NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID;
      const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
      
      const gdTopic = topic || generateAITopic();
      
      const introMessage = `Welcome to the Group Discussion on "${gdTopic}"!\n\nDiscussion Guidelines:\n- Keep cameras on throughout discussion\n- Speak clearly and participate actively\n- I'll monitor speaking time and contributions\n- No winners or toppers - everyone gets a fair review\n\nLet's begin with introductions!`;
      setAiMessages(prev => [...prev, introMessage]);
      
      if (assistantId && webToken) {
        try {
          // Test VAPI connectivity
          setAiMessages(prev => [...prev, "Connecting to AI assistant..."]);
          
          // Start VAPI call with AI - Enhanced like interviewer
          const call = await vapi.start(assistantId);
          
          // Set up VAPI event listeners for better integration - AI Interviewer Style
          vapi.on('call-start', () => {
            setAiMessages(prev => [...prev, "AI GD Moderator connected successfully!"]);
          });
          
          vapi.on('speech-start', () => {
            setAiMessages(prev => [...prev, "AI is speaking..."]);
          });
          
          vapi.on('speech-end', () => {
            setAiMessages(prev => [...prev, "AI finished speaking. Now monitoring discussion."]);
          });
          
          vapi.on('error', (error: any) => {
            console.error("VAPI speech error:", error);
            setAiMessages(prev => [...prev, `AI Speech Error: ${error.message}`]);
          });
          
          vapi.on('message', (message: any) => {
            // Handle AI messages for GD monitoring
            if (message.type === 'transcript') {
              // Add to transcript for analysis
              setTranscript(prev => [...prev, `AI: ${message.content}`]);
            }
          });
          
          // Make AI speak with strict 30-second opening script
          try {
            // Strict 30-second opening script - following VAPI prompt structure
            const openingScript = topic 
              ? `Hello everyone.\nI am your GD moderator.\nToday's topic is: ${topic}.\nStay on topic and ensure equal participation.\nPlease introduce yourselves briefly.`
              : `Hello everyone.\nI am your GD moderator.\nToday's topic is: Impact of technology on society.\nStay on topic and ensure equal participation.\nPlease introduce yourselves briefly.`;
            
            await vapi.say(openingScript);
            setAiMessages(prev => [...prev, "AI gave 30-second opening!"]);
            
            // Set AI to silent mode during discussion
            setAiMessages(prev => [...prev, "AI is now monitoring silently..."]);
            
          } catch (speechError: any) {
            console.error("Opening speech error:", speechError);
            setAiMessages(prev => [...prev, `Opening Speech Error: ${speechError.message}`]);
          }
          
          setAiMessages(prev => [...prev, "AI GD Moderator is ready!"]);
          
        } catch (vapiError: any) {
          console.error("VAPI specific error:", vapiError);
          setAiMessages(prev => [...prev, `VAPI Connection Error: ${vapiError.message}. Using fallback mode.`]);
        }
      } else {
        // Detailed VAPI configuration troubleshooting
        const missingVars: string[] = [];
        if (!assistantId) missingVars.push("NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID");
        if (!webToken) missingVars.push("NEXT_PUBLIC_VAPI_WEB_TOKEN");
        
        setAiMessages(prev => [...prev, `VAPI Configuration Issues:`]);
        setAiMessages(prev => [...prev, `Missing environment variables: ${missingVars.join(", ")}`]);
        setAiMessages(prev => [...prev, `To fix VAPI:`]);
        setAiMessages(prev => [...prev, `1. Get web token from VAPI dashboard`]);
        setAiMessages(prev => [...prev, `2. Create GD assistant in VAPI`]);
        setAiMessages(prev => [...prev, `3. Add to .env.local file:`]);
        setAiMessages(prev => [...prev, `NEXT_PUBLIC_VAPI_GD_ASSISTANT_ID=your-gd-assistant-id`]);
        setAiMessages(prev => [...prev, `NEXT_PUBLIC_VAPI_WEB_TOKEN=your-web-token`]);
        setAiMessages(prev => [...prev, `4. Restart development server`]);
        setAiMessages(prev => [...prev, `Using fallback mode for now...`]);
      }
      
      setCallStatus(CallStatus.CONNECTED);
      setMeetingStartTime(new Date());
      setIsAnalyzing(false);
      setSpeechRestartAttempts(0); // Reset speech restart attempts
      setLastRestartTime(0);
      
      // Start AI guidance after introduction
      setTimeout(() => {
        startAIGuidance();
      }, 5000);
      
    } catch (error: any) {
      console.error("Error starting meeting:", error);
      setCallStatus(CallStatus.WAITING);
      setAiMessages(prev => [...prev, `Meeting Error: ${error.message || "Unknown error"}`]);
      setAiMessages(prev => [...prev, `Troubleshooting steps:`]);
      setAiMessages(prev => [...prev, `1. Check internet connection`]);
      setAiMessages(prev => [...prev, `2. Verify VAPI configuration`]);
      setAiMessages(prev => [...prev, `3. Check browser console for details`]);
      setAiMessages(prev => [...prev, `4. Try refreshing the page`]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [topic, duration, userName, startAIGuidance, generateAITopic]);

  // Meeting controls
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    updateParticipant("1", { isMuted: newMutedState });
    
    if (newMutedState) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  }, [isMuted, startMicrophone, stopMicrophone, updateParticipant]);

  const toggleVideo = useCallback(() => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    updateParticipant("1", { isVideoOn: newVideoState });
    
    if (newVideoState) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isVideoOn, startCamera, stopCamera, updateParticipant]);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing(!isScreenSharing);
  }, [isScreenSharing]);

  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
  }, [isRecording]);

  const toggleHandRaised = useCallback(() => {
    setIsHandRaised(!isHandRaised);
    updateParticipant("1", { isHandRaised: !isHandRaised });
  }, [isHandRaised, updateParticipant]);

  const toggleCaptions = useCallback(() => {
    setShowCaptions(!showCaptions);
  }, [showCaptions]);

  const switchLayout = useCallback(() => {
    setLayout(layout === "gallery" ? "speaker" : "gallery");
  }, [layout]);

  const leaveMeeting = useCallback(() => {
    setCallStatus(CallStatus.ENDING);
    
    // Stop camera and microphone
    stopCamera();
    stopMicrophone();
    
    // End VAPI call
    vapi.stop();
    
    setTimeout(() => {
      onLeave();
    }, 1000);
  }, [onLeave, stopCamera, stopMicrophone]);

  // Auto-start meeting when component mounts
  useEffect(() => {
    if (callStatus === CallStatus.WAITING) {
      startMeeting();
    }
  }, []);

  if (callStatus === CallStatus.WAITING) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-muted border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Starting Meeting...</h3>
          <p className="text-muted-foreground">Please wait while we connect you to the meeting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header - Zoom Style */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-mono text-sm">{meetingId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground text-sm">Password: {meetingInfo?.password || "None"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${gdTimer <= 60 ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${gdTimer <= 60 ? 'text-red-400 animate-pulse' : 'text-foreground'}`}>
                {Math.floor(gdTimer / 60)}:{(gdTimer % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2 text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm">Recording</span>
              </div>
            )}
            
            {gdPhase === 'analysis' && (
              <div className="flex items-center gap-2 text-purple-400">
                <Brain className="w-4 h-4" />
                <span className="text-sm">AI Analyzing...</span>
              </div>
            )}
            
            {/* Host Controls */}
            {participants.find(p => p.id === "1")?.isHost && (
              <>
                {!gdCompleted && gdPhase !== 'analysis' && (
                  <button
                    onClick={() => {
                      setGdCompleted(true);
                      setTimerRunning(false);
                      setGdPhase('conclusion');
                      setAiMessages(prev => [...prev, "GD marked as completed by host. Generating AI reviews..."]);
                      
                      // Automatically trigger AI analysis
                      setTimeout(() => {
                        generateAIAnalysis();
                      }, 1000);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    End GD & Generate Reviews
                  </button>
                )}
                
                {/* Leave Meeting Button */}
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to leave the meeting?")) {
                      window.location.href = "/";
                    }
                  }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Meeting
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex min-h-0">
        {/* Video Area - Professional GD Layout */}
        <div className="flex-1 bg-black relative flex flex-col">
          {/* Small Participant Cards - Top Section */}
          <div className="h-24 bg-background border-b border-border p-2">
            <div className="flex gap-2 h-full overflow-hidden">
              {participants.slice(0, showGrid ? 4 : Math.min(4, participants.length)).map((participant) => (
                <div
                  key={participant.id}
                  onClick={() => setSelectedParticipant(participant.id)}
                  className={`flex-1 bg-card rounded-lg cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-blue-500/50 relative ${
                    selectedParticipant === participant.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {participant.isVideoOn ? (
                    <div className="w-full h-full relative">
                      {participant.id === "1" && localVideoStream ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover rounded-lg"
                          style={{ transform: 'scaleX(-1)' }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                          <span className="text-primary-foreground text-lg font-bold">
                            {participant.avatar}
                          </span>
                        </div>
                      )}
                      {/* Participant info overlay */}
                      <div className="absolute bottom-1 left-1 right-1 bg-black/60 rounded px-1 py-0.5">
                        <p className="text-primary-foreground text-xs font-medium truncate">
                          {participant.name}
                        </p>
                      </div>
                      {participant.isAI && (
                        <div className="absolute top-1 right-1 bg-purple-500 text-primary-foreground text-xs px-1 py-0.5 rounded">
                          AI
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-background flex items-center justify-center">
                      <VideoOff className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Grid Toggle Button */}
            {participants.length >= 3 && (
              <button
                onClick={() => setShowGrid(!showGrid)}
                className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full transition-colors"
              >
                {showGrid ? "Focus" : "Grid"}
              </button>
            )}
          </div>

          {/* Main Video Area */}
          <div className="flex-1 relative">
            {(() => {
              const selected = participants.find(p => p.id === selectedParticipant);
              if (!selected) return null;
              
              return (
                <div className="w-full h-full relative">
                  {selected.isVideoOn ? (
                    <div className="w-full h-full">
                      {selected.id === "1" && localVideoStream ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                          style={{ transform: 'scaleX(-1)' }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                              <span className="text-4xl font-bold text-primary-foreground animate-pulse">
                                {selected.avatar}
                              </span>
                            </div>
                            <p className="text-primary-foreground text-xl font-medium">{selected.name}</p>
                            <p className="text-primary-foreground/80 text-sm">
                              {selected.isAI ? "AI GD Moderator" : "Participant"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <VideoOff className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-xl font-medium">{selected.name}</p>
                        <p className="text-muted-foreground/70 text-sm">Camera Off</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Main video overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-lg font-medium">{selected.name}</p>
                        {selected.connectionQuality && (
                          <div className="flex items-center gap-2 mt-1">
                            <Signal className={`w-4 h-4 ${
                              selected.connectionQuality === 'excellent' ? 'text-green-400' :
                              selected.connectionQuality === 'good' ? 'text-yellow-400' :
                              selected.connectionQuality === 'fair' ? 'text-orange-400' :
                              'text-red-400'
                            } animate-pulse`} />
                            <span className={`text-sm ${
                              selected.connectionQuality === 'excellent' ? 'text-green-400' :
                              selected.connectionQuality === 'good' ? 'text-yellow-400' :
                              selected.connectionQuality === 'fair' ? 'text-orange-400' :
                              'text-red-400'
                            }`}>
                              {selected.connectionQuality.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      {selected.isAI && (
                        <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                          AI Moderator
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        
                
        {/* Sidebar - Participants Panel */}
        {showParticipants && (
          <div className="w-80 bg-card flex flex-col border-l border-border">
            <div className="p-4">
              <div className="flex items-center justify-center">
                <h3 className="text-foreground font-semibold">Participants ({participants.length})</h3>
              </div>
              
              {/* Host Controls */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setLayout(layout === "gallery" ? "speaker" : "gallery")}
                  className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-full transition-colors"
                >
                  {layout === "gallery" ? "Speaker View" : "Gallery View"}
                </button>
                <button
                  onClick={() => {
                    // Mute all participants except host and AI
                    participants.forEach(p => {
                      if (!p.isHost && !p.isAI) {
                        updateParticipant(p.id, { isMuted: true });
                      }
                    });
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-primary-foreground text-xs rounded-full transition-colors"
                >
                  Mute All
                </button>
                <button
                  onClick={() => {
                    // Turn on all cameras
                    participants.forEach(p => {
                      if (!p.isAI && !p.isVideoOn) {
                        updateParticipant(p.id, { isVideoOn: true });
                      }
                    });
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-primary-foreground text-xs rounded-full transition-colors"
                >
                  Cameras On
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 space-y-1">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-foreground text-sm font-medium">
                          {participant.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {participant.name}
                          {participant.isAI && <span className="ml-2 text-purple-500 text-xs">(AI)</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          {participant.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                          {participant.isHandRaised && <div className="w-3 h-3 bg-yellow-500 rounded-full" />}
                          {participant.isSpeaking && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                          {participant.isVideoOn && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                          {!participant.isVideoOn && <VideoOff className="w-3 h-3 text-muted-foreground" />}
                          <span className="text-muted-foreground">Speaking: {participant.speakingTime}s</span>
                          <span className="text-muted-foreground">Contributions: {participant.contributions}</span>
                          <span className="text-muted-foreground">Joined: {Math.floor((Date.now() - participant.joinedAt.getTime()) / 60000)}m ago</span>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* AI Panel */}
            {showAI && (
              <div className="p-4">
                <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI GD Assistant
                </h3>
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="text-foreground text-sm font-medium mb-2">Meeting Status</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>📊 Active Participants: {participants.filter(p => !p.isAI).length}</p>
                      <p>📹 Camera Compliance: {Math.round((participants.filter(p => !p.isAI && p.isVideoOn).length / participants.filter(p => !p.isAI).length) * 100)}%</p>
                      <p>🎤 Speaking Time: {Math.round(participants.reduce((sum, p) => sum + p.speakingTime, 0) / participants.length)}s avg</p>
                      <p>💬 Contributions: {participants.reduce((sum, p) => sum + p.contributions, 0)} total</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Meeting Controls - Bottom Center */}
            <div className="fixed bottom-4 left-0 right-0 z-50">
              <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto pb-4">
                {/* Primary Controls */}
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition-all transform hover:scale-105 ${
                    isMuted 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-all transform hover:scale-105 ${
                    isVideoOn 
                      ? 'bg-muted hover:bg-muted/80' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isVideoOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-full transition-all transform hover:scale-105 ${
                    isScreenSharing 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Monitor className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-full transition-all transform hover:scale-105 ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {isRecording ? <RecordIcon className="w-5 h-5 text-white" /> : <CircleIcon className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={toggleHandRaised}
                  className={`p-3 rounded-full transition-all transform hover:scale-105 ${
                    isHandRaised 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${isHandRaised ? 'bg-white' : 'bg-gray-400'}`} />
                  </div>
                </button>
                
                <div className="h-6 w-px bg-border mx-2" />
                
                {/* Secondary Controls */}
                <button
                  onClick={toggleCaptions}
                  className={`p-3 rounded-full transition-all transform hover:scale-105 ${
                    showCaptions 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Subtitles className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={switchLayout}
                  className="p-3 bg-muted hover:bg-muted/80 rounded-full transition-all transform hover:scale-105"
                >
                  {layout === "gallery" ? <Speaker className="w-5 h-5 text-foreground" /> : <Grid className="w-5 h-5 text-foreground" />}
                </button>
                
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className={`p-3 rounded-full transition-all transform hover:scale-105 relative ${
                    showParticipants 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Users className="w-5 h-5 text-foreground" />
                  {participants.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {participants.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="p-3 bg-muted hover:bg-muted/80 rounded-full transition-all transform hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5 text-foreground" />
                </button>
                
                <button
                  onClick={() => setShowAI(!showAI)}
                  className={`p-3 rounded-full transition-all transform hover:scale-105 ${
                    showAI 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Brain className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealZoomMeeting;
