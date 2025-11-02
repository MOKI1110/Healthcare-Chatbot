import React, { useState, useContext, useRef } from "react";
import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";
import QuickReplies from "./QuickReplies";
import TyperIndicator from "./TyperIndicator";
import StartOverButton from "./StartOverButton";
import { sendChatMessage, uploadFile } from "../services/chatApi";
import { LanguageContext } from "../context/LanguageContext";

function getSessionId() {
  let sid = window.localStorage.getItem("healthbot-session-id");
  if (!sid) {
    sid = crypto.randomUUID();
    window.localStorage.setItem("healthbot-session-id", sid);
  }
  return sid;
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm here to help you check symptoms. You can also upload medical images or documents for analysis." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const { selectedLanguage } = useContext(LanguageContext);
  const userSessionId = useRef(getSessionId()).current;

  async function handleUserMessage(text: string) {
    console.log("handleUserMessage called with:", text);
    
    setMessages((msgs) => [...msgs, { sender: "user", text }]);
    setIsTyping(true);

    try {
      const botReply = await sendChatMessage({
        message: text,
        locale: selectedLanguage || "en",
        sessionId: userSessionId,
      });
      console.log("Bot replied:", botReply);
      setMessages((msgs) => [...msgs, { sender: "bot", text: botReply }]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleFileUpload(file: File) {
    console.log("handleFileUpload called with:", file.name);
    
    const fileType = file.type.startsWith('image/') ? '🖼️' : '📄';
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: `${fileType} Uploaded: ${file.name}` }
    ]);
    setIsTyping(true);

    try {
      const botReply = await uploadFile({
        file,
        locale: selectedLanguage || "en",
        sessionId: userSessionId,
      });
      console.log("Bot replied to file:", botReply);
      setMessages((msgs) => [...msgs, { sender: "bot", text: botReply }]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Sorry, I couldn't process that file. Please try again or upload a different file." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleQuickReply(reply: string) {
    handleUserMessage(reply);
  }

  function handleStartOver() {
    setMessages([{ sender: "bot", text: "Hello! I'm here to help you check symptoms. You can also upload medical images or documents for analysis." }]);
  }

  return (
    <main className="max-w-[110rem] mx-auto p-8 flex flex-col h-[90vh] relative z-10 animate-fadeIn w-full">
      <div className="card flex-1 flex flex-col overflow-hidden p-10 shadow-2xl rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-100 w-[95%] mx-auto max-w-[85rem]">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-2xl shadow-lg">
            🤖
          </div>
          <div>
            <h2 className="font-bold text-lg gradient-text">HealthBot Assistant</h2>
            <p className="text-sm text-gray-500">Always here to help</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto mb-8 px-10 space-y-6 scroll-smooth max-h-[70vh]">
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} {...msg} />
          ))}
          {isTyping && <TyperIndicator />}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <QuickReplies
          options={["Yes", "No", "Not sure"]}
          onSelect={handleQuickReply}
        />
        <MessageInput onSend={handleUserMessage} onFileUpload={handleFileUpload} />
        <StartOverButton onClick={handleStartOver} />
      </div>
    </main>
  );
}
