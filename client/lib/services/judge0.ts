import axios, { AxiosError } from "axios";

// Server API URL - uses environment variable or defaults to localhost
const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

// Types
export interface CodeExecutionRequest {
  code: string;
  language: string;
  stdin?: string;
  expectedOutput?: string;
}

export interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: string;
  memory?: number;
  status: string;
  exitCode?: number;
  compileOutput?: string;
}

export interface LanguageInfo {
  id: string;
  label: string;
}

/**
 * Execute code on the server using Judge0 API
 */
export const executeCode = async (
  request: CodeExecutionRequest
): Promise<CodeExecutionResult> => {
  try {
    const response = await axios.post<CodeExecutionResult>(
      `${SERVER_API_URL}/api/execute`,
      request,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error("Code execution error:", error);

    if (error instanceof AxiosError) {
      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          output: "",
          error: "Request timed out. The server took too long to respond.",
          status: "timeout",
        };
      }

      if (error.response) {
        const data = error.response.data as CodeExecutionResult;
        return {
          success: false,
          output: data?.output || "",
          error: data?.error || `Server error: ${error.response.status}`,
          status: data?.status || "error",
        };
      }

      if (error.request) {
        return {
          success: false,
          output: "",
          error: "Cannot connect to server. Please make sure the server is running.",
          status: "connection_error",
        };
      }
    }

    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      status: "error",
    };
  }
};

/**
 * Get list of supported languages from the server
 */
export const getSupportedLanguages = async (): Promise<LanguageInfo[]> => {
  try {
    const response = await axios.get<{ success: boolean; languages: LanguageInfo[] }>(
      `${SERVER_API_URL}/api/execute/languages`,
      {
        timeout: 5000,
      }
    );

    if (response.data.success) {
      return response.data.languages;
    }

    // Fallback to default languages if server returns error
    return getDefaultLanguages();
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    // Return default languages if server is unavailable
    return getDefaultLanguages();
  }
};

/**
 * Default languages list (fallback when server is unavailable)
 */
const getDefaultLanguages = (): LanguageInfo[] => [
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

/**
 * Format execution result for display
 */
export const formatExecutionResult = (result: CodeExecutionResult): string => {
  if (!result.success && result.error) {
    if (result.compileOutput) {
      return `Compilation Error:\n${result.compileOutput}\n\n${result.error}`;
    }
    return `Error: ${result.error}`;
  }

  let output = result.output || "(No output)";

  if (result.executionTime || result.memory) {
    const stats: string[] = [];
    if (result.executionTime) stats.push(`Time: ${result.executionTime}`);
    if (result.memory) stats.push(`Memory: ${(result.memory / 1024).toFixed(2)} MB`);
    output += `\n\n[${stats.join(" | ")}]`;
  }

  return output;
};

/**
 * Check if server is available
 */
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${SERVER_API_URL}/health`, {
      timeout: 3000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
};
