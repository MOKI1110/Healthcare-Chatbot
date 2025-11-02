import React, { useState } from "react";
import { HiDocument } from "react-icons/hi2";
import { RiVoiceAiFill } from "react-icons/ri";
import { TbSend } from "react-icons/tb";

type MessageInputProps = {
  onSend: (text: string) => void;
  onFileUpload: (file: File) => void;
};

export default function MessageInput({ onSend, onFileUpload }: MessageInputProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Form submitted! Input:", input);
    if (input.trim()) {
      console.log("Calling onSend with:", input.trim());
      onSend(input.trim());
      setInput("");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name, file.type, file.size);
      onFileUpload(file);
      e.target.value = "";
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-secondary-300 shadow-md transition-all duration-300 focus-within:border-primary-500 focus-within:shadow-lg"
    >
      {/* Voice Input Button with Tooltip */}
      <button
        type="button"
        className="p-3 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all duration-200 hover:scale-105 group relative"
        aria-label="Voice input"
      >
        <RiVoiceAiFill className="w-5 h-5" />
        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Voice Input
        </span>
      </button>

      {/* Upload Button with Tooltip */}
      <label className="p-3 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all duration-200 cursor-pointer hover:scale-105 group relative">
        <HiDocument className="w-5 h-5" />
        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Upload File
        </span>
        <input
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
          aria-label="Upload file"
        />
      </label>

      {/* Text Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or speak your message here..."
        className="flex-1 px-4 py-3 bg-transparent outline-none text-secondary-900 placeholder-secondary-500"
        aria-label="Type your message"
      />

      {/* Send Button with Tooltip */}
      <button
        type="submit"
        disabled={!input.trim()}
        className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 group relative ${
          input.trim()
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "bg-secondary-300 text-secondary-500 cursor-not-allowed"
        }`}
        aria-label="Send message"
      >
        <TbSend className="w-5 h-5" />
        {/* Tooltip - only show when button is enabled */}
        {input.trim() && (
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Send Message
          </span>
        )}
      </button>
    </form>
  );
}
