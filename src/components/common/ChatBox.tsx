import React, { useState, useRef, useEffect } from "react";
import { MainContainer } from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { chatService } from "../../services/chatService";
import { FaUserCircle } from "react-icons/fa";
import { MdSmartToy } from "react-icons/md";
import { IoChatbubbleEllipsesOutline, IoChevronDown } from "react-icons/io5";
import { IoSend } from "react-icons/io5";

// Thêm CSS tùy chỉnh
const chatBoxStyles = {
  chatButton: {
    position: "fixed" as const,
    bottom: 32,
    right: 32,
    zIndex: 1100,
    background: "#fff",
    border: "1px solid #222",
    borderRadius: 999,
    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
    width: 56,
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  chatContainer: {
    position: "fixed" as const,
    bottom: 24,
    right: 24,
    width: 370,
    height: 500,
    zIndex: 1200,
    display: "flex",
    flexDirection: "column" as const,
  },
  mainContainer: {
    height: 500,
    borderRadius: 12,
    boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
    background: "#fff",
    border: "1px solid #222",
    color: "#111",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
  },
  header: {
    background: "#000",
    color: "white",
    padding: "12px",
    width: "100%",
  },
  headerContent: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  messageList: {
    background: "#fff",
    padding: "8px",
  },
  userMessage: {
    padding: "8px 12px",
    borderRadius: "18px 18px 0 18px",
    maxWidth: "80%",
    background: "#0084ff",
    color: "#fff",
    fontWeight: 400,
    marginBottom: "8px",
    marginLeft: "auto",
    marginRight: "5px",
  },
  assistantMessage: {
    padding: "8px 12px",
    borderRadius: "18px 18px 18px 0",
    maxWidth: "80%",
    background: "#e4e6eb",
    color: "#050505",
    fontWeight: 400,
    marginBottom: "8px",
    marginRight: "auto",
    marginLeft: "5px",
  },
  avatar: {
    background: "transparent",
  },
  messageInput: {
    background: "#fff",
    color: "#111",
    borderTop: "1px solid #eaeaea",
    padding: "8px",
  },
  typingIndicator: {
    background: "#f0f0f0",
  },
  errorMessage: {
    color: "red",
    marginTop: 8,
    textAlign: "center" as const,
  },
};

interface ChatMessage {
  message: string;
  sender: "user" | "assistant";
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { message: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "assistant" },
  ]);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { message: text, sender: "user" }]);
    setIsTyping(true);
    setError(null);
    try {
      const res = await chatService.sendMessage(text, threadId);
      setMessages((prev) => [
        ...prev,
        { message: res.message, sender: "assistant" },
      ]);
      setThreadId(res.threadId);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          message: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại!",
          sender: "assistant",
        },
      ]);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setIsTyping(false);
    }
  };

  // Utility: clean AI answer (remove citation like 【8:0†ecom_data.promotions.json】)
  function cleanAIMessage(msg: string) {
    return msg.replace(/【\d+:\d+†[\w.]+】/g, "");
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={chatBoxStyles.chatButton}
          aria-label="Mở chatbox"
        >
          <IoChatbubbleEllipsesOutline size={32} color="#222" />
        </button>
      )}
      {open && (
        <div style={chatBoxStyles.chatContainer}>
          {" "}
          <MainContainer style={chatBoxStyles.mainContainer}>
            <div style={chatBoxStyles.header}>
              <div style={chatBoxStyles.headerContent}>
                <div style={{ fontWeight: "500", fontSize: "14px" }}>
                  Trò chuyện với AI Assistant của Tech Zone
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={chatBoxStyles.closeButton}
                  aria-label="Đóng chatbox"
                >
                  <IoChevronDown size={20} color="#fff" />
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {" "}
              <div
                ref={messageListRef as React.RefObject<HTMLDivElement>}
                style={{
                  ...chatBoxStyles.messageList,
                  overflowY: "auto",
                  flex: 1,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-end",
                      marginBottom: "10px",
                      justifyContent:
                        msg.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    {msg.sender === "assistant" && (
                      <div style={{ marginRight: "8px", flexShrink: 0 }}>
                        <MdSmartToy size={24} color="#333" />
                      </div>
                    )}
                    <div
                      style={
                        msg.sender === "user"
                          ? chatBoxStyles.userMessage
                          : chatBoxStyles.assistantMessage
                      }
                    >
                      {msg.sender === "assistant"
                        ? cleanAIMessage(msg.message)
                        : msg.message}
                    </div>
                    {msg.sender === "user" && (
                      <div
                        style={{ marginLeft: "8px", flexShrink: 0, order: 2 }}
                      >
                        <FaUserCircle size={24} color="#888" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ marginRight: "8px", flexShrink: 0 }}>
                      <MdSmartToy size={24} color="#333" />
                    </div>
                    <div
                      style={{
                        ...chatBoxStyles.assistantMessage,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ fontSize: "14px" }}>AI đang trả lời...</div>
                    </div>
                  </div>
                )}
              </div>{" "}
              <div
                style={{
                  padding: "10px",
                  borderTop: "1px solid #e0e0e0",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim() && !isTyping) {
                        handleSend(input.value);
                        input.value = "";
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "#f0f2f5",
                    borderRadius: "20px",
                    padding: "8px 12px",
                    fontSize: "14px",
                  }}
                  disabled={isTyping}
                  id="chat-input"
                />{" "}
                <button
                  onClick={() => {
                    const input = document.getElementById(
                      "chat-input",
                    ) as HTMLInputElement;
                    if (input && input.value.trim() && !isTyping) {
                      handleSend(input.value);
                      input.value = "";
                    }
                  }}
                  style={{
                    background: "#000000",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                  }}
                  disabled={isTyping}
                  aria-label="Gửi tin nhắn"
                >
                  <IoSend size={16} color="white" />
                </button>
              </div>
            </div>
          </MainContainer>
          {error && <div style={chatBoxStyles.errorMessage}>{error}</div>}
        </div>
      )}
    </>
  );
};

export default ChatBox;
