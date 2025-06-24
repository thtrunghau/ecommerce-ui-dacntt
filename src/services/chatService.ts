// Chat service for AI chatbox integration
import { API_BASE_URL } from "./apiService";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface ChatRequest {
  message: string;
  threadId?: string;
}

export interface ChatResponse {
  message: string;
  threadId: string;
}

export const chatService = {
  sendMessage: async (message: string, threadId?: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ message, threadId }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Network error" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },
};
