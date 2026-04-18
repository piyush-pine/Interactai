"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = (savedTheme as "light" | "dark") || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Sun icon for light mode */}
      <Sun 
        className={`h-4 w-4 text-yellow-500 transition-all duration-300 ${
          theme === "light" 
            ? "opacity-100 rotate-0 scale-100" 
            : "opacity-0 -rotate-90 scale-0"
        } absolute`}
      />
      
      {/* Moon icon for dark mode */}
      <Moon 
        className={`h-4 w-4 text-blue-400 transition-all duration-300 ${
          theme === "dark" 
            ? "opacity-100 rotate-0 scale-100" 
            : "opacity-0 rotate-90 scale-0"
        } absolute`}
      />
      
      {/* Animated background circle */}
      <div 
        className={`absolute inset-1 rounded-full transition-all duration-300 ${
          theme === "dark" 
            ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20" 
            : "bg-gradient-to-br from-yellow-400/20 to-orange-500/20"
        }`}
      />
      
      {/* Subtle glow effect */}
      <div 
        className={`absolute inset-0 rounded-lg transition-all duration-300 ${
          theme === "dark" 
            ? "shadow-lg shadow-blue-500/20" 
            : "shadow-lg shadow-yellow-500/20"
        }`}
      />
    </button>
  );
}
