import React, { useState } from "react";

type MessageInputProps = {
  onSend: (text: string) => void;
};

export default function MessageInput({ onSend }: MessageInputProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Form submitted! Input:", input); // DEBUG
    if (input.trim()) {
      console.log("Calling onSend with:", input.trim()); // DEBUG
      onSend(input.trim());
      setInput("");
    }
  }

  return (
    <form
      className="flex items-center gap-4 p-5 card shadow-lg hover-glow w-[95%] mx-auto max-w-[85rem]"
      aria-label="Message input"
      onSubmit={handleSubmit}
    >
      <button 
        type="button" 
        aria-label="Voice input" 
        className="text-2xl p-3 rounded-xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 transition-all duration-300 hover:scale-110 hover:rotate-12 group"
      >
        <span className="group-hover:scale-125 transition-transform duration-300">🎤</span>
      </button>
      <input
        className="flex-1 outline-none text-base p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-400 transition-all duration-300"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type or speak your message here..."
        aria-label="Type your message"
      />
      <button
        type="submit"
        disabled={!input.trim()}
        className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="Send message"
      >
        <span className="text-2xl">📨</span>
      </button>
    </form>
  );
}
