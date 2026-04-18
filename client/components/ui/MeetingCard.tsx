import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Video, VideoOff } from "lucide-react";

interface MeetingCardProps {
  meeting: {
    joinUrl: string;
    meetingId: string;
    password?: string;
  };
  userName: string;
  topic?: string;
  duration?: number;
}

const MeetingCard = ({ meeting, userName, topic = "Group Discussion", duration = 30 }: MeetingCardProps) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(meeting.joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const joinMeeting = () => {
    const params = new URLSearchParams({
      meetingId: meeting.meetingId,
      password: meeting.password || "",
      userName: userName,
      topic: topic,
      duration: duration.toString(),
    });
    router.push(`/gd-meeting?${params.toString()}`);
  };

  return (
    <div className="bg-dark-200 rounded-xl p-6 border border-dark-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-light-100">Zoom Meeting</h3>
            <p className="text-sm text-light-400">Meeting ID: {meeting.meetingId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Ready</span>
        </div>
      </div>

      {/* Meeting Link */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-xs text-light-400 uppercase tracking-wide mb-2 block">
            Shareable Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={meeting.joinUrl}
              readOnly
              className="flex-1 bg-dark-100 border border-dark-200 rounded-lg px-3 py-2 text-sm text-light-100 focus:outline-none focus:ring-2 focus:ring-primary-200/50"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-primary-200 hover:bg-primary-200/80 text-dark-100 font-medium rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {meeting.password && (
          <div>
            <label className="text-xs text-light-400 uppercase tracking-wide mb-2 block">
              Meeting Password
            </label>
            <div className="bg-dark-100 border border-dark-200 rounded-lg px-3 py-2">
              <p className="text-light-100 font-mono text-sm">{meeting.password}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={joinMeeting}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
        >
          <Video className="w-5 h-5" />
          Join Meeting
        </button>
        
        <a
          href={meeting.joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-dark-100 hover:bg-dark-100/80 text-light-100 font-semibold rounded-xl transition-colors border border-dark-200"
        >
          <ExternalLink className="w-5 h-5" />
          Open in Zoom App
        </a>
      </div>
    </div>
  );
};

export default MeetingCard;
