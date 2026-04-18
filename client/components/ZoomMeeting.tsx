"use client";

// IMMEDIATE POLYFILL - Run before any imports
if (typeof window !== 'undefined') {
  // Ensure React devtools hook exists with ReactCurrentOwner
  const win = window as any;
  if (!win.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    win.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      ReactCurrentOwner: { current: null },
      renderers: new Map(),
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
      checkDCE: () => false,
      onScheduleRoot: () => {},
      setStrictMode: () => {},
      getFiberRoots: () => new Set(),
    };
  }
  // Ensure ReactCurrentOwner exists on existing hook
  const hook = win.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook.ReactCurrentOwner) {
    hook.ReactCurrentOwner = { current: null };
  }
}

// Import Zoom compatibility patch BEFORE Zoom SDK
import "@/lib/zoom-patch";

import { useEffect, useRef, useState } from "react";
import { ZoomMtg } from "@zoom/meetingsdk";

interface ZoomMeetingProps {
  meetingNumber: string;
  password?: string;
  userName: string;
  userEmail?: string;
  onMeetingEnd?: () => void;
  onError?: (error: string) => void;
}

const ZoomMeeting = ({
  meetingNumber,
  password,
  userName,
  userEmail = "",
  onMeetingEnd,
  onError,
}: ZoomMeetingProps) => {
  const meetingRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    // Check if ZoomMtg is available
    if (!ZoomMtg) {
      console.error("Zoom SDK not loaded");
      if (isMounted.current) {
        setError("Zoom SDK failed to load");
        setIsLoading(false);
      }
      return;
    }

    try {
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

    const startMeeting = async () => {
      try {
        // Generate signature from server
        const response = await fetch("/api/zoom/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingNumber, role: 0 }),
        });

        if (!response.ok) {
          throw new Error("Failed to get meeting signature");
        }

        const { signature } = await response.json();

        // Join the meeting
        ZoomMtg.init({
          leaveUrl: window.location.href,
          success: () => {
            ZoomMtg.join({
              meetingNumber,
              userName,
              userEmail,
              passWord: password || "",
              signature,
              success: () => {
                if (isMounted.current) {
                  setIsLoading(false);
                }
              },
              error: (err: any) => {
                console.error("Join error:", err);
                if (isMounted.current) {
                  setError("Failed to join meeting. Please try again.");
                  setIsLoading(false);
                }
              },
            });
          },
          error: (err: any) => {
            console.error("Init error:", err);
            if (isMounted.current) {
              setError("Failed to initialize meeting.");
              setIsLoading(false);
            }
          },
        });
      } catch (err) {
        console.error("Error starting meeting:", err);
        if (isMounted.current) {
          setError("Failed to start meeting. Please check your connection.");
          setIsLoading(false);
        }
      }
    };

    startMeeting();

    // Cleanup when component unmounts
    return () => {
      isMounted.current = false;
      
      // Skip Zoom's leaveMeeting entirely to prevent dispatchEvent errors
      // Just call the callback directly
      try {
        onMeetingEnd?.();
      } catch (err) {
        console.error("Callback error:", err);
      }
    };
  }, [meetingNumber, password, userName, userEmail, onMeetingEnd]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-dark-200 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-destructive-100/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-destructive-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-light-100 font-medium mb-2">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            onError?.(error);
          }}
          className="px-4 py-2 bg-primary-200 hover:bg-primary-200/80 text-dark-100 rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-dark-200 rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-200 z-10">
          <div className="w-12 h-12 border-4 border-primary-200/30 border-t-primary-200 rounded-full animate-spin mb-4" />
          <p className="text-light-100">Joining Zoom Meeting...</p>
        </div>
      )}
      <div
        ref={meetingRef}
        id="zmmtg-root"
        className={`w-full h-full ${isLoading ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
};

export default ZoomMeeting;
