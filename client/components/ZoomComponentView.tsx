"use client";

import { useEffect, useRef } from "react";

interface ZoomComponentViewProps {
  meetingNumber: string;
  password?: string;
  userName: string;
  signature: string;
}

// Use Zoom Component View which has better React compatibility
const ZoomComponentView = ({
  meetingNumber,
  password,
  userName,
  signature,
}: ZoomComponentViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load Zoom Component View
    const loadZoomComponent = async () => {
      try {
        // @ts-ignore
        const ZoomMtgEmbedded = (await import("@zoom/meetingsdk/embedded")).default;
        
        const client = ZoomMtgEmbedded.createClient();
        
        await client.init({
          zoomAppRoot: containerRef.current!,
          language: "en-US",
          customIZUI: true,
        });

        await client.join({
          meetingNumber,
          password: password || "",
          userName,
          signature,
          tk: "",
          zak: "",
        });
      } catch (error) {
        console.error("Zoom Component View error:", error);
      }
    };

    loadZoomComponent();
  }, [meetingNumber, password, userName, signature]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] rounded-xl overflow-hidden"
      style={{ background: '#1a1a2e' }}
    />
  );
};

export default ZoomComponentView;
