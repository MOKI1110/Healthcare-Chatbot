import React, { useState, useContext, useRef } from "react";
import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";
import QuickReplies from "./QuickReplies";
import TyperIndicator from "./TyperIndicator";
import { sendChatMessage, uploadFile } from "../services/chatApi";
import { LanguageContext } from "../context/LanguageContext";
import { GiCycle } from "react-icons/gi";

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
  
  const initialMsg = "Hello! I'm here to help you check symptoms. You can also upload medical images or documents for analysis.";

  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    { role: 'assistant', content: initialMsg }
  ]);

  const [messages, setMessages] = useState<UIMessage[]>([
    { sender: 'bot', text: initialMsg }
  ]);

  const [isTyping, setIsTyping] = useState(false);

  async function handleUserMessage(text: string) {
    console.log("handleUserMessage called with:", text);
    
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
      
      console.log("Bot replied:", botReply);
      
      setMessages((msgs) => [...msgs, { sender: "bot", text: botReply }]);
      
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
  }

  return (
    <main className="min-h-screen bg-secondary-50 p-6 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header with Icon-based Start Over */}
        <div className="bg-primary-600 px-8 py-6 border-b border-primary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center text-2xl shadow-md">
                🏥
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  HealthBot Assistant
                </h2>
                <p className="text-sm text-primary-100">
                  Always here to help
                </p>
              </div>
            </div>
            
            {/* Icon-only Start Over button */}
            <button
              onClick={handleStartOver}
              className="w-10 h-10 rounded-full bg-primary-700 text-white hover:bg-primary-800 transition-all duration-200 flex items-center justify-center group relative"
              aria-label="Start new conversation"
            >
              <span className="text-lg">
                <GiCycle className="w-5 h-5" />
              </span>
              <span className="absolute top-full mt-2 right-0 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Start Over
              </span>
            </button>
          </div>
        </div>
  
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-primary-50 space-y-2" style={{ maxHeight: '60vh' }}>
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
  
        {/* Input area - NO Start Over button here anymore */}
        <div className="p-6 bg-white border-t border-secondary-200 space-y-4">
          <QuickReplies
            options={["Yes", "No", "Not sure"]}
            onSelect={handleQuickReply}
          />
          <MessageInput onSend={handleUserMessage} onFileUpload={handleFileUpload} />
        </div>
      </div>
    </main>
  );  
}
