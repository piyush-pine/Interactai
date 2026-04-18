"use client";

import { useState } from "react";
import ZoomMeeting from "./ZoomMeeting";

interface ZoomMeetingManagerProps {
  userName?: string;
  userEmail?: string;
  onMeetingEnd?: () => void;
}

const ZoomMeetingManager = ({
  userName = "User",
  userEmail = "",
  onMeetingEnd,
}: ZoomMeetingManagerProps) => {
  const [currentView, setCurrentView] = useState<'setup' | 'joining' | 'meeting'>('setup');
  const [meetingData, setMeetingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinMode, setJoinMode] = useState<'create' | 'join'>('create');
  const [meetingNumber, setMeetingNumber] = useState('');
  const [password, setPassword] = useState('');

  const createMeeting = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/zoom/create-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'AI Moderated Meeting',
          duration: 60,
          password: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresSetup) {
          setError('Zoom API not configured. Please check your environment variables.');
        } else {
          setError(data.error || 'Failed to create meeting');
        }
        return;
      }

      setMeetingData(data);
      setCurrentView('meeting');
    } catch (err) {
      setError('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const joinExistingMeeting = async () => {
    if (!meetingNumber.trim()) {
      setError('Please enter a meeting ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setMeetingData({
        meetingId: meetingNumber.trim(),
        password: password.trim(),
      });
      setCurrentView('meeting');
    } catch (err) {
      setError('Failed to join meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingEnd = () => {
    setCurrentView('setup');
    setMeetingData(null);
    setMeetingNumber('');
    setPassword('');
    onMeetingEnd?.();
  };

  if (currentView === 'meeting' && meetingData) {
    return (
      <ZoomMeeting
        meetingNumber={meetingData.meetingId}
        password={meetingData.password}
        userName={userName}
        userEmail={userEmail}
        onMeetingEnd={handleMeetingEnd}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-dark-200 rounded-xl">
      <h2 className="text-2xl font-bold text-light-100 mb-6">Zoom Meeting</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive-100/20 border border-destructive-100/30 rounded-lg">
          <p className="text-destructive-100 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setJoinMode('create')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              joinMode === 'create'
                ? 'bg-primary-200 text-dark-100'
                : 'bg-dark-300 text-light-100 hover:bg-dark-400'
            }`}
          >
            Create Meeting
          </button>
          <button
            onClick={() => setJoinMode('join')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              joinMode === 'join'
                ? 'bg-primary-200 text-dark-100'
                : 'bg-dark-300 text-light-100 hover:bg-dark-400'
            }`}
          >
            Join Meeting
          </button>
        </div>

        {joinMode === 'create' ? (
          <div>
            <p className="text-light-200 mb-4">
              Create a new Zoom meeting for AI moderation
            </p>
            <button
              onClick={createMeeting}
              disabled={loading}
              className="w-full py-3 bg-primary-200 hover:bg-primary-200/80 disabled:bg-primary-200/50 text-dark-100 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create New Meeting'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-light-200 text-sm font-medium mb-2">
                Meeting ID
              </label>
              <input
                type="text"
                value={meetingNumber}
                onChange={(e) => setMeetingNumber(e.target.value)}
                placeholder="Enter meeting ID"
                className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-light-100 placeholder-light-300 focus:outline-none focus:ring-2 focus:ring-primary-200/50"
              />
            </div>
            <div>
              <label className="block text-light-200 text-sm font-medium mb-2">
                Password (optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-light-100 placeholder-light-300 focus:outline-none focus:ring-2 focus:ring-primary-200/50"
              />
            </div>
            <button
              onClick={joinExistingMeeting}
              disabled={loading}
              className="w-full py-3 bg-primary-200 hover:bg-primary-200/80 disabled:bg-primary-200/50 text-dark-100 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Joining...' : 'Join Meeting'}
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-light-300">
        <p className="mb-2">Manual Setup:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open Zoom and create a new meeting</li>
          <li>Copy the invite link</li>
          <li>Share with participants</li>
          <li>Start the AI moderator above</li>
        </ol>
      </div>
    </div>
  );
};

export default ZoomMeetingManager;
