import { useState, useContext, useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";
import QuickReplies from "./QuickReplies";
import TyperIndicator from "./TyperIndicator";

import { sendChatMessage, uploadFile } from "../services/chatApi";
import { LanguageContext } from "../context/LanguageContext";

import { GiCycle } from "react-icons/gi";
import { TbLanguage } from "react-icons/tb";
import { useTranslation } from "react-i18next";

import BotLogo from "../assets/logo.png";
import languages from "../locales/languages.json";
import i18n from "../utils/i18n";

function getSessionId() {
  let sid = window.sessionStorage.getItem("healthbot-session-id");
  if (!sid) {
    sid = crypto.randomUUID();
    window.sessionStorage.setItem("healthbot-session-id", sid);
  }
  return sid;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

type UIMessage = {
  sender: "user" | "bot";
  text: string;
  isHealthRelated?: boolean;
};

export default function Chatbot() {
  const userSessionId = useRef(getSessionId()).current;
  const { selectedLanguage, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  const [messages, setMessages] = useState<UIMessage[]>([
    { sender: "bot", text: t("greeting") },
  ]);

  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    { role: "assistant", content: t("greeting") },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 🔥 FIX: Update greeting + history when language changes
  useEffect(() => {
    const newGreeting = t("greeting");

    setMessages([{ sender: "bot", text: newGreeting }]);
    setConversationHistory([{ role: "assistant", content: newGreeting }]);
  }, [selectedLanguage]);


  // 🔥 Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".lang-menu")) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


  // ===========================
  // SEND MESSAGE
  // ===========================
  async function handleUserMessage(text: string) {
    setMessages((msgs) => [...msgs, { sender: "user", text }]);

    const newHistory: Message[] = [
      ...conversationHistory,
      { role: "user", content: text },
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
      setConversationHistory([
        ...newHistory,
        { role: "assistant", content: botReply },
      ]);
    } catch {
      const err = t("error_something_went_wrong");

      setMessages((msgs) => [...msgs, { sender: "bot", text: err }]);
      setConversationHistory([
        ...newHistory,
        { role: "assistant", content: err },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  // ===========================
  // FILE UPLOAD
  // ===========================
  async function handleFileUpload(file: File) {
    const fileType = file.type.startsWith("image/") ? "🖼️" : "📄";
    const uploadMsg = `${fileType} ${t("file_uploaded")}: ${file.name}`;

    setMessages((msgs) => [...msgs, { sender: "user", text: uploadMsg }]);

    const newHistory: Message[] = [
      ...conversationHistory,
      { role: "user", content: uploadMsg },
    ];

    setIsTyping(true);

    try {
      const response = await uploadFile({
        file,
        conversationHistory: newHistory,
        locale: selectedLanguage || undefined,
        sessionId: userSessionId,
      });

      setMessages((msgs) => [
        ...msgs,
        {
          sender: "bot",
          text: response.message,
          isHealthRelated: response.isHealthRelated,
        },
      ]);

      setConversationHistory([
        ...newHistory,
        { role: "assistant", content: response.message },
      ]);
    } catch {
      const err = t("error_file_upload");
      setMessages((msgs) => [...msgs, { sender: "bot", text: err }]);
    } finally {
      setIsTyping(false);
    }
  }


  // Restart
  function handleStartOver() {
    const startMsg = t("greeting");
    setMessages([{ sender: "bot", text: startMsg }]);
    setConversationHistory([{ role: "assistant", content: startMsg }]);
  }


  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex flex-col w-full max-w-5xl h-[81vh] bg-[#0a0a0c] rounded-2xl border border-gray-800 shadow-xl overflow-visible">

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-[#0c0c10]">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl animate-pulse"></div>
              <div className="relative h-11 w-11 rounded-full overflow-hidden bg-gray-900 border border-emerald-400 shadow-lg shadow-emerald-500/40">
                <img src={BotLogo} className="h-full w-full object-contain p-2" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">{t("HealthBot Assistant")}</span>
              <span className="text-xs text-gray-400">{t("Always here to help")}</span>
            </div>
          </div>


          {/* BUTTONS */}
          <div className="flex items-center gap-3">

            {/* Language Button */}
            <div className="relative lang-menu">
              <button
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white"
                onClick={(e) => {
                  e.stopPropagation(); // prevent closing instantly
                  setShowLangMenu(!showLangMenu);
                }}
              >
                <TbLanguage className="text-xl" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-[#151519] border border-gray-700 rounded-xl p-2 shadow-xl z-50 animate-fadeSlide">
                  {languages.map((lang, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-gray-200 hover:bg-gray-800"
                      onClick={() => {
                        setLanguage(lang.code);
                        i18n.changeLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                    >
                      {lang.emoji} {lang.native}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Restart */}
            <button
              onClick={handleStartOver}
              className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white"
            >
              <GiCycle className="w-5 h-5" />
            </button>

          </div>
        </div>


        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#0a0a0c]">
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} sender={msg.sender} text={msg.text} isHealthRelated={msg.isHealthRelated} />
          ))}

          {isTyping && <TyperIndicator />}

          <div ref={messagesEndRef} />
        </div>


        {/* INPUT AREA */}
        <div className="border-t border-gray-800 bg-[#0a0a0c] px-5 py-4 space-y-3">

          <QuickReplies
            options={[t("Yes"), t("No"), t("Not sure")]}
            onSelect={handleUserMessage}
          />

          <MessageInput
            onSend={handleUserMessage}
            onFileUpload={handleFileUpload}
          />

          <p className="text-[11px] text-gray-500 text-center">
            HealthBot may make mistakes. For serious concerns, consult a doctor.
          </p>
        </div>

      </div>
    </div>
  );
}
