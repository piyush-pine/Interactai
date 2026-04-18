import { AlertTriangle, Video, Zap } from "lucide-react";

interface SetupCardProps {
  type: "generate" | "manual" | "loading";
  onGenerate?: () => void;
  topic?: string;
  duration?: number;
}

const SetupCard = ({ type, onGenerate, topic = "General Discussion", duration = 30 }: SetupCardProps) => {
  if (type === "loading") {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-2xl">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Theme-aware loader */}
          <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-2 border-muted-foreground/30 rounded-full"></div>
          <div className="absolute inset-3 border border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">Creating Meeting...</h3>
        <p className="text-muted-foreground mb-2">Setting up your AI-powered GD session</p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span>Initializing AI moderator</span>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-200"></div>
        </div>
      </div>
    );
  }

  if (type === "manual") {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Zoom Setup Required
        </h2>
        <p className="text-muted-foreground max-w-md mb-6 mx-auto">
          To automatically generate Zoom meetings, you need to configure Zoom API credentials. For now, you can manually create a Zoom meeting and share the link.
        </p>
        <div className="bg-muted border border-border rounded-xl p-6 max-w-md w-full mx-auto text-left">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-yellow-500" />
            Manual Setup Steps:
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Open Zoom and create a new meeting</li>
            <li>Copy the invite link</li>
            <li>Share with participants</li>
            <li>Start the AI moderator below</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-2xl">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Video className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Start Group Discussion
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 mx-auto leading-relaxed">
        Create a Zoom meeting for your group discussion on <span className="text-purple-500 font-medium">{topic}</span>. 
        You'll get a shareable link that participants can use to join.
      </p>
      
      {/* Meeting Details */}
      <div className="bg-muted border border-border rounded-xl p-4 mb-6 max-w-sm mx-auto">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-left">
            <p className="text-muted-foreground mb-1">Topic</p>
            <p className="text-foreground font-medium">{topic}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground mb-1">Duration</p>
            <p className="text-foreground font-medium">{duration} min</p>
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg mx-auto relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700/20 to-pink-700/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center gap-3">
          <Zap className="w-5 h-5" />
          <span>Generate Meeting Link</span>
        </div>
      </button>
    </div>
  );
};

export default SetupCard;
