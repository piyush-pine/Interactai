"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomMtg } from "@zoom/meetingsdk";
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
  VolumeX
} from "lucide-react";

interface IntegratedZoomMeetingProps {
  meetingNumber: string;
  password?: string;
  userName: string;
  userEmail?: string;
  onMeetingEnd?: () => void;
  onError?: (error: string) => void;
}

interface Participant {
  userId: string;
  userName: string;
  audioState: "muted" | "unmuted" | "speaking";
  videoState: "on" | "off";
  isHost: boolean;
}

const IntegratedZoomMeeting = ({
  meetingNumber,
  password,
  userName,
  userEmail = "",
  onMeetingEnd,
  onError,
}: IntegratedZoomMeetingProps) => {
  const meetingContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [layout, setLayout] = useState<"gallery" | "speaker">("gallery");
  const [volume, setVolume] = useState(50);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    // Initialize Zoom Meeting SDK
    const initZoomMeeting = async () => {
      try {
        console.log("Initializing Zoom Meeting SDK...");
        
        // Check if ZoomMtg is available
        if (!ZoomMtg) {
          throw new Error("Zoom SDK not loaded");
        }

        // Configure Zoom Meeting SDK
        ZoomMtg.setZoomJSLib("https://source.zoom.us/6.0.0/lib", "/av");
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();
        
        // Initialize Zoom with error handling
        ZoomMtg.init({
          leaveUrl: window.location.href,
          isSupportAV: true,
          disableCORP: !window.crossOriginIsolated,
          success: () => {
            console.log("Zoom SDK initialized successfully");
            getSignatureAndJoin();
          },
          error: (err: any) => {
            console.error("Zoom initialization error:", err);
            if (isMounted.current) {
              setError("Failed to initialize Zoom SDK");
              setIsLoading(false);
            }
          }
        });
      } catch (err) {
        console.error("Zoom SDK configuration error:", err);
        if (isMounted.current) {
          setError("Failed to configure Zoom SDK");
          setIsLoading(false);
        }
      }
    };

    const getSignatureAndJoin = async () => {
      try {
        // Generate signature from server
        const response = await fetch("/api/zoom/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            meetingNumber: meetingNumber.replace(/\D/g, ''), // Remove non-digits
            role: 0 // 0 for host, 1 for participant
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get meeting signature");
        }

        const { signature } = await response.json();
        
        // Join the meeting
        ZoomMtg.join({
          meetingNumber: meetingNumber.replace(/\D/g, ''),
          userName,
          userEmail,
          passWord: password || "",
          signature,
          sdkKey: process.env.NEXT_PUBLIC_ZOOM_SDK_KEY || "",
          zak: "",
          success: () => {
            console.log("Successfully joined Zoom meeting");
            if (isMounted.current) {
              setIsLoading(false);
              updateParticipants();
            }
          },
          error: (err: any) => {
            console.error("Failed to join meeting:", err);
            if (isMounted.current) {
              setError("Failed to join meeting: " + (err.message || "Unknown error"));
              setIsLoading(false);
            }
          }
        });
      } catch (err) {
        console.error("Error joining meeting:", err);
        if (isMounted.current) {
          setError("Error joining meeting");
          setIsLoading(false);
        }
      }
    };

    const updateParticipants = () => {
      try {
        // For now, just show the current user as participant
        const formattedParticipants: Participant[] = [{
          userId: "current-user",
          userName: userName,
          audioState: isMuted ? "muted" : "unmuted",
          videoState: isVideoOn ? "on" : "off",
          isHost: true
        }];
        setParticipants(formattedParticipants);
      } catch (err) {
        console.error("Error updating participants:", err);
      }
    };

    return () => {
      isMounted.current = false;
      // Clean up
      try {
        ZoomMtg.leaveMeeting();
      } catch (err) {
        console.error("Error cleaning up:", err);
      }
    };
  }, [meetingNumber, password, userName, userEmail]);

  const toggleMute = () => {
    if (isMuted) {
      ZoomMtg.unmuteAudio();
    } else {
      ZoomMtg.muteAudio();
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (isVideoOn) {
      ZoomMtg.stopVideo();
    } else {
      ZoomMtg.startVideo();
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      ZoomMtg.stopShareScreen();
    } else {
      ZoomMtg.startShareScreen();
    }
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleRecording = () => {
    if (isRecording) {
      ZoomMtg.recordingStop();
    } else {
      ZoomMtg.recordingStart();
    }
  };

  const leaveMeeting = () => {
    ZoomMtg.leaveMeeting();
    onMeetingEnd?.();
  };

  const switchLayout = () => {
    const newLayout = layout === "gallery" ? "speaker" : "gallery";
    setLayout(newLayout);
    ZoomMtg.switchGalleryView(newLayout === "gallery");
  };

  const adjustVolume = (newVolume: number) => {
    setVolume(newVolume);
    // Note: Volume adjustment may not be available in all Zoom SDK versions
    console.log("Volume adjustment requested:", newVolume);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-900">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Meeting Error</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={leaveMeeting}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Leave Meeting
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Joining Meeting...</h3>
          <p className="text-gray-400">Please wait while we connect you to the meeting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-dark-800 border-b border-dark-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-medium">Group Discussion</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>ID: {meetingNumber}</span>
            <span>Participants: {participants.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">Recording</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 bg-black relative">
          <div 
            ref={meetingContainerRef}
            className="w-full h-full"
          />
          
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
                  {layout === "gallery" ? <Speaker className="w-5 h-5 text-white" /> : <Grid className="w-5 h-5 text-white" />}
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
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.userId} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {participant.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{participant.userName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {participant.audioState === "muted" && <MicOff className="w-3 h-3 text-red-400" />}
                        {participant.audioState === "speaking" && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                        {participant.videoState === "off" && <VideoOff className="w-3 h-3 text-gray-400" />}
                        {participant.isHost && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Host</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
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

export default IntegratedZoomMeeting;
