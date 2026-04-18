"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { executeCode, checkServerHealth } from "@/lib/services/judge0";

interface CodePracticeEditorProps {
  onClose: () => void;
}

const languages = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "c", label: "C" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
  { id: "swift", label: "Swift" },
];

const defaultCode: Record<string, string> = {
  javascript: `// JavaScript code here
function solution() {
  // Write your code here
  
}

console.log(solution());`,
  typescript: `// TypeScript code here
function solution(): void {
  // Write your code here
  
}

console.log(solution());`,
  python: `# Python code here
def solution():
    # Write your code here
    pass

print(solution())`,
  java: `// Java code here
public class Solution {
    public static void main(String[] args) {
        // Write your code here
        
    }
}`,
  cpp: `// C++ code here
#include <iostream>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
  c: `// C code here
#include <stdio.h>

int main() {
    // Write your code here
    
    return 0;
}`,
  csharp: `// C# code here
using System;

class Solution {
    static void Main() {
        // Write your code here
        
    }
}`,
  go: `// Go code here
package main

import "fmt"

func main() {
    // Write your code here
    
}`,
  rust: `// Rust code here
fn main() {
    // Write your code here
    
}`,
  php: `<?php
// PHP code here
function solution() {
    // Write your code here
    
}

echo solution();`,
  ruby: `# Ruby code here
def solution
  # Write your code here
  
end

puts solution`,
  swift: `// Swift code here
import Foundation

func solution() {
    // Write your code here
    
}

print(solution())`,
};

const CodePracticeEditor = ({ onClose }: CodePracticeEditorProps) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(defaultCode["javascript"]);
  const [theme, setTheme] = useState<"vs-dark" | "vs-light">("vs-dark");
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [isCompiling, setIsCompiling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<"success" | "error" | null>(null);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(defaultCode[newLang] || "// Write your code here\n");
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorInstance.focus();
    editorInstance.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setResult("Compiling...");
    setResultType(null);

    try {
      const executionResult = await executeCode({
        code,
        language,
      });

      if (executionResult.compileOutput || executionResult.error) {
        setResult(executionResult.compileOutput || executionResult.error || "Compilation failed");
        setResultType("error");
      } else {
        setResult("✓ Compilation successful! No errors found.");
        setResultType("success");
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setResultType("error");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResult("Running...");
    setResultType(null);

    try {
      const executionResult = await executeCode({
        code,
        language,
      });

      let outputText = `[${new Date().toLocaleTimeString()}] Program started\n`;

      if (executionResult.compileOutput) {
        outputText += `Compilation Output:\n${executionResult.compileOutput}\n\n`;
      }

      if (executionResult.error) {
        outputText += `Error:\n${executionResult.error}`;
        setResultType("error");
      } else {
        outputText += `Output:\n${executionResult.output || "(No output)"}`;
        if (executionResult.executionTime) {
          outputText += `\n\nExecution Time: ${executionResult.executionTime}`;
        }
        if (executionResult.memory) {
          outputText += `\nMemory Used: ${(executionResult.memory / 1024).toFixed(2)} MB`;
        }
        outputText += `\nProcess finished with exit code ${executionResult.exitCode ?? 0}`;
        setResultType("success");
      }

      setResult(outputText);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setResultType("error");
    } finally {
      setIsRunning(false);
    }
  };

  // Check server status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const isOnline = await checkServerHealth();
      setServerStatus(isOnline ? "online" : "offline");
    };
    checkStatus();
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-dark-100 rounded-2xl overflow-hidden border border-dark-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-200 border-b border-dark-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-light-100">Language:</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 bg-dark-100 border border-dark-200 rounded-lg text-sm text-light-100 focus:outline-none focus:border-primary-200 transition-colors"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setTheme(theme === "vs-dark" ? "vs-light" : "vs-dark")}
            className="p-2 rounded-lg bg-dark-100 hover:bg-dark-200 transition-colors"
            title="Toggle Theme"
          >
            {theme === "vs-dark" ? (
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isCompiling ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Compile
          </button>

          <button 
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-success-100 hover:bg-success-200 text-dark-100 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <span className="w-4 h-4 border-2 border-dark-100/30 border-t-dark-100 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            Run
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-dark-100 hover:bg-destructive-100 hover:text-white text-light-100 font-semibold rounded-lg transition-colors border border-dark-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
        </div>
      </div>

      {/* Main Content - Editor + Result Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Result Panel - Left Side */}
        <div className="w-72 bg-dark-200 border-r border-dark-200 flex flex-col">
          <div className="px-4 py-3 bg-dark-200 border-b border-dark-200">
            <h3 className="text-sm font-semibold text-light-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Result / Output
            </h3>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {result ? (
              <div className={`text-sm font-mono whitespace-pre-wrap ${resultType === "error" ? "text-destructive-100" : resultType === "success" ? "text-success-100" : "text-light-100"}`}>
                {result}
              </div>
            ) : (
              <div className="text-light-400 text-sm italic">
                Click Compile or Run to see results here...
              </div>
            )}
          </div>
        </div>

        {/* Editor - Right Side */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language}
            value={code}
            theme={theme}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              padding: { top: 16 },
              fontFamily: "'Fira Code', 'Consolas', monospace",
              fontLigatures: true,
              cursorBlinking: "smooth",
              smoothScrolling: true,
              contextmenu: true,
              multiCursorModifier: "ctrlCmd",
              wordWrap: "on",
              folding: true,
              renderWhitespace: "selection",
              bracketPairColorization: { enabled: true },
              formatOnPaste: true,
              formatOnType: true,
              suggest: {
                showKeywords: true,
                showSnippets: true,
                showFunctions: true,
                showVariables: true,
              },
            }}
            loading={
              <div className="flex items-center justify-center h-full text-light-100">
                <span className="w-6 h-6 border-2 border-primary-200 border-t-transparent rounded-full animate-spin mr-2" />
                Loading Editor...
              </div>
            }
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-200 border-t border-dark-200 text-xs text-light-100">
        <div className="flex items-center gap-4">
          <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
          <span>UTF-8</span>
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === "online"
                  ? "bg-success-100"
                  : serverStatus === "offline"
                  ? "bg-destructive-100"
                  : "bg-yellow-500 animate-pulse"
              }`}
            />
            <span className="text-light-400">
              {serverStatus === "online"
                ? "Server Online"
                : serverStatus === "offline"
                ? "Server Offline"
                : "Checking..."}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>{resultType === "success" ? "✓ Success" : resultType === "error" ? "✗ Error" : "Ready"}</span>
        </div>
      </div>
    </div>
  );
};

export default CodePracticeEditor;
