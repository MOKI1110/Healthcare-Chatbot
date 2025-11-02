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
      // Reset file input
      e.target.value = "";
    }
  }

  return (
    <form
      className="flex items-center gap-4 p-5 card shadow-lg hover-glow w-[95%] mx-auto max-w-[85rem]"
      aria-label="Message input"
      onSubmit={handleSubmit}
    >
      {/* Voice Input Button */}
      <button 
        type="button" 
        aria-label="Voice input" 
        className="text-2xl p-3 rounded-xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 transition-all duration-300 hover:scale-110 group"
      >
        <span className="group-hover:scale-125 transition-transform duration-300 ">
          <RiVoiceAiFill className="text-gray-500 group-hover:text-gray-700 " />
        </span>
      </button>

      {/* Upload Button */}
      <label 
        htmlFor="file-upload"
        className="text-2xl p-3 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:scale-110 group"
        aria-label="Upload file"
      >
        <span className="group-hover:scale-125 transition-transform duration-300 ">
        <HiDocument className="text-gray-500 group-hover:text-gray-700 " />
        </span>
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="File upload input"
      />

      {/* Text Input */}
      <input
        className="flex-1 outline-none text-base p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-400 transition-all duration-300"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type or speak your message here..."
        aria-label="Type your message"
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!input.trim()}
        className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="Send message"
      >
        <span className="text-2xl">
          <TbSend />
        </span>
      </button>
    </form>
  );
}
