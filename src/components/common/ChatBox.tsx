import React, { useState, useRef, useEffect } from "react";
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  Avatar,
  MainContainer,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { chatService } from "../../services/chatService";
import { FaUserCircle } from "react-icons/fa";
import { MdSmartToy } from "react-icons/md";
import { IoChatbubbleEllipsesOutline, IoClose } from "react-icons/io5";

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

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
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
          }}
          aria-label="Mở chatbox"
        >
          <IoChatbubbleEllipsesOutline size={32} color="#222" />
        </button>
      )}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 370,
            zIndex: 1200,
          }}
        >
          <MainContainer
            style={{
              height: 500,
              borderRadius: 12,
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              background: "#fff",
              border: "1px solid #222",
              color: "#111",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: 8,
              }}
            >
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Đóng chatbox"
              >
                <IoClose size={24} color="#222" />
              </button>
            </div>
            <ChatContainer>
              <MessageList
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator content="AI đang trả lời..." />
                  ) : null
                }
                ref={messageListRef as React.RefObject<HTMLDivElement>}
                style={{ background: "#fff" }}
              >
                {messages.map((msg, idx) => (
                  <Message
                    key={idx}
                    model={{
                      message: msg.message,
                      sentTime: "now",
                      sender: msg.sender,
                      direction:
                        msg.sender === "user" ? "outgoing" : "incoming",
                      position: "single",
                    }}
                  >
                    <Avatar
                      src={undefined}
                      name={msg.sender === "assistant" ? "AI" : "Bạn"}
                      style={{ background: "transparent" }}
                    >
                      {msg.sender === "assistant" ? (
                        <MdSmartToy size={32} color="#111" />
                      ) : (
                        <FaUserCircle size={32} color="#888" />
                      )}
                    </Avatar>
                  </Message>
                ))}
              </MessageList>
              <MessageInput
                placeholder="Nhập tin nhắn..."
                onSend={handleSend}
                attachButton={false}
                disabled={isTyping}
                style={{ background: "#fff", color: "#111" }}
              />
            </ChatContainer>
          </MainContainer>
          {error && (
            <div style={{ color: "red", marginTop: 8, textAlign: "center" }}>
              {error}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox;
