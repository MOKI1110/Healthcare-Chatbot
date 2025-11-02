import React, { useState, useContext, useRef, useEffect } from "react";
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

// Message type for history
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// UI Message type with health relevance flag
type UIMessage = {
  sender: 'user' | 'bot';
  text: string;
  isHealthRelated?: boolean;
};

// Load conversation history from localStorage
function loadConversationHistory(sessionId: string): Message[] {
  const stored = localStorage.getItem(`healthbot-history-${sessionId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [{
    role: 'assistant',
    content: "Hello! I'm here to help you check symptoms. You can also upload medical images or documents for analysis."
  }];
}

// Save conversation history to localStorage
function saveConversationHistory(sessionId: string, history: Message[]) {
  localStorage.setItem(`healthbot-history-${sessionId}`, JSON.stringify(history));
}

// Convert conversation history to UI messages
function historyToUIMessages(history: Message[]): UIMessage[] {
  return history.map(msg => ({
    sender: msg.role === 'assistant' ? 'bot' : 'user',
    text: msg.content
  }));
}

export default function Chatbot() {
  const userSessionId = useRef(getSessionId()).current;
  
  // Load conversation history from localStorage on mount
  const [conversationHistory, setConversationHistory] = useState<Message[]>(() => 
    loadConversationHistory(userSessionId)
  );
  
  const [messages, setMessages] = useState<UIMessage[]>(() => 
    historyToUIMessages(loadConversationHistory(userSessionId))
  );
  
  const [isTyping, setIsTyping] = useState(false);
  const { selectedLanguage } = useContext(LanguageContext);

  // Save to localStorage whenever conversation history changes
  useEffect(() => {
    saveConversationHistory(userSessionId, conversationHistory);
  }, [conversationHistory, userSessionId]);

  async function handleUserMessage(text: string) {
    console.log("handleUserMessage called with:", text);
    
    // Add to UI
    setMessages((msgs) => [...msgs, { sender: "user", text }]);
    
    // Add to conversation history
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
      
      console.log("Bot replied:", botReply);
      
      // Add bot reply to UI
      setMessages((msgs) => [...msgs, { sender: "bot", text: botReply }]);
      
      // Add bot reply to conversation history and save
      const updatedHistory: Message[] = [
        ...newHistory,
        { role: 'assistant', content: botReply }
      ];
      setConversationHistory(updatedHistory);
      
    } catch {
      const errorMsg = "Sorry, something went wrong. Please try again.";
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
    console.log("handleFileUpload called with:", file.name);
    
    const fileType = file.type.startsWith('image/') ? '🖼️' : '📄';
    const uploadMsg = `${fileType} Uploaded: ${file.name}`;
    
    setMessages((msgs) => [...msgs, { sender: "user", text: uploadMsg }]);
    
    // Add file upload to conversation history
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
      
      console.log("Bot replied to file:", response);
      
      // Add bot reply to UI with health relevance flag
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
      const errorMsg = "Sorry, I couldn't process that file. Please try again or upload a different file.";
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
    const initialMsg = "Hello! I'm here to help you check symptoms. You can also upload medical images or documents for analysis.";
    
    const initialHistory: Message[] = [
      { role: 'assistant', content: initialMsg }
    ];
    
    setMessages([{ sender: "bot", text: initialMsg }]);
    setConversationHistory(initialHistory);
    
    // Clear from localStorage
    localStorage.removeItem(`healthbot-history-${userSessionId}`);
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
            <ChatBubble 
              key={idx} 
              sender={msg.sender} 
              text={msg.text}
              isHealthRelated={msg.isHealthRelated}
            />
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
