"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface UserProfileProps {
  user: User | null;
}

const UserProfile = ({ user }: UserProfileProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        router.push("/sign-in");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      {/* User Profile */}
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200/50">
          <Image
            src={"/user-avatar.png"}
            alt={user.name || "User"}
            fill
            className="object-cover"
          />
        </div>
        <span className="text-light-100 font-medium hidden sm:block">
          {user.name}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push("/profile");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-dark-200 border border-border hover:bg-muted text-light-100 font-semibold rounded-full transition-all duration-200 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="hidden sm:inline">My Profile</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-destructive-100 hover:bg-destructive-200 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50"
        >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
        )}
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  </div>
  );
};

export default UserProfile;
