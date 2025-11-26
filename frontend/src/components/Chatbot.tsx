import React, { useState, useContext, useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";
import QuickReplies from "./QuickReplies";
import TyperIndicator from "./TyperIndicator";
import { sendChatMessage, uploadFile } from "../services/chatApi";
import { LanguageContext } from "../context/LanguageContext";
import { GiCycle } from "react-icons/gi";
import { useTranslation } from "react-i18next";
import BotLogo from "../assets/logo.png";

function getSessionId() {
  let sid = window.sessionStorage.getItem("healthbot-session-id");
  if (!sid) {
    sid = crypto.randomUUID();
    window.sessionStorage.setItem("healthbot-session-id", sid);
  }
  return sid;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type UIMessage = {
  sender: 'user' | 'bot';
  text: string;
  isHealthRelated?: boolean;
};

export default function Chatbot() {
  const userSessionId = useRef(getSessionId()).current;
  const { selectedLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  const initialMsg = t("greeting");

  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    { role: "assistant", content: initialMsg },
  ]);

  const [messages, setMessages] = useState<UIMessage[]>([
    { sender: "bot", text: initialMsg },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);


  async function handleUserMessage(text: string) {
    setMessages((msgs) => [...msgs, { sender: "user", text }]);
    const newHistory: Message[] = [
      ...conversationHistory,
      { role: 'user', content: text }
    ];
    setIsTyping(true);

    try {
      const botReply = await sendChatMessage({
        message: text,
        conversationHistory: newHistory,
        locale: selectedLanguage || "en",
        sessionId: userSessionId,
      });

      setMessages((msgs) => [...msgs, { sender: "bot", text: botReply }]);
      const updatedHistory: Message[] = [
        ...newHistory,
        { role: 'assistant', content: botReply }
      ];
      setConversationHistory(updatedHistory);
    } catch {
      const errorMsg = t("error_something_went_wrong", "Sorry, something went wrong. Please try again.");
      setMessages((msgs) => [...msgs, { sender: "bot", text: errorMsg }]);
      const updatedHistory: Message[] = [
        ...newHistory,
        { role: 'assistant', content: errorMsg }
      ];
      setConversationHistory(updatedHistory);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleFileUpload(file: File) {
    const fileType = file.type.startsWith('image/') ? '🖼️' : '📄';
    const uploadMsg = `${fileType} ${t("file_uploaded", "Uploaded")}: ${file.name}`;

    setMessages((msgs) => [...msgs, { sender: "user", text: uploadMsg }]);
    const newHistory: Message[] = [
      ...conversationHistory,
      { role: 'user', content: uploadMsg }
    ];
    setIsTyping(true);

    try {
      const response = await uploadFile({
        file,
        conversationHistory: newHistory,
        locale: selectedLanguage || "en",
        sessionId: userSessionId,
      });

      setMessages((msgs) => [...msgs, {
        sender: "bot",
        text: response.message,
        isHealthRelated: response.isHealthRelated
      }]);
      const updatedHistory: Message[] = [
        ...newHistory,
        { role: 'assistant', content: response.message }
      ];
      setConversationHistory(updatedHistory);

    } catch {
      const errorMsg = t("error_file_upload", "Sorry, I couldn't process that file. Please try again or upload a different file.");
      setMessages((msgs) => [...msgs, { sender: "bot", text: errorMsg }]);
      const updatedHistory: Message[] = [
        ...newHistory,
        { role: 'assistant', content: errorMsg }
      ];
      setConversationHistory(updatedHistory);
    } finally {
      setIsTyping(false);
    }
  }

  function handleQuickReply(reply: string) {
    handleUserMessage(reply);
  }

  function handleStartOver() {
    const startMsg = t("greeting");
    const initialHistory: Message[] = [
      { role: 'assistant', content: startMsg }
    ];
    setMessages([{ sender: "bot", text: startMsg }]);
    setConversationHistory(initialHistory);
  }

  return (
  <div className="w-full h-full flex justify-center">
    <div className="flex flex-col w-full max-w-5xl h-[81vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
    {/* Top bar (like ChatGPT header) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-900/80">
        <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl animate-pulse"></div>
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-900 border border-emerald-400 shadow-lg shadow-emerald-500/40">
            <img
              src={BotLogo}
              alt="Bot Logo"
              className="h-full w-full object-contain p-2"
            />
          </div>
        </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-100">
              {t("HealthBot Assistant")}
            </span>
            <span className="text-xs text-gray-400">
              {t("Always here to help")}
            </span>
          </div>
        </div>

        {/* Icon-only Start Over button – simplified */}
        <button
          onClick={handleStartOver}
          className="w-9 h-9 rounded-full bg-primary-700 text-white hover:bg-primary-800 transition-all duration-200 flex items-center justify-center"
          aria-label={t("Start Over")}
          title={t("Start Over")}
        >
          <GiCycle className="w-5 h-5" />
        </button>
      </div>

      {/* Chat messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-900"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            sender={msg.sender}
            text={msg.text}
            isHealthRelated={msg.isHealthRelated}
          />
        ))}
        {isTyping && <TyperIndicator />}
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies + input, like the bottom composer in ChatGPT */}
      <div className="border-t border-gray-700 bg-gray-900/95 px-4 py-3 space-y-3">
        <QuickReplies
          options={[
            t("Yes", "Yes"),
            t("No", "No"),
            t("Not sure", "Not sure"),
          ]}
          onSelect={handleQuickReply}
        />
        <MessageInput onSend={handleUserMessage} onFileUpload={handleFileUpload} />
        <p className="text-[11px] text-gray-500 text-center">
          HealthBot may make mistakes. For serious symptoms, consult a doctor or emergency services.
        </p>
      </div>
    </div>
  </div>
);

}
