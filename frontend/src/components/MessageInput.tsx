import React, { useState, useRef, useCallback, memo } from "react";
import { HiDocument } from "react-icons/hi2";
import { RiVoiceAiFill } from "react-icons/ri";
import { TbSend } from "react-icons/tb";

type MessageInputProps = {
  onSend: (text: string) => void;
  onFileUpload: (file: File) => void;
};

const MessageInput = memo(function MessageInput({ onSend, onFileUpload }: MessageInputProps) {
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustHeight();
  }, [adjustHeight]);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed) {
      onSend(trimmed);
      setInput("");
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [input, onSend]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  }, [sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = "";
    }
  }, [onFileUpload]);

  const isDisabled = !input.trim();

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 px-4 py-3 rounded-3xl bg-white dark:bg-[#2f2f2f] 
                   border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md 
                   transition-shadow duration-200"
      >
        {/* Left side buttons */}
        <div className="flex items-center gap-1 pb-1">
          {/* Voice button */}
          <button
            type="button"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 
                     dark:hover:bg-gray-700 transition-colors"
            aria-label="Voice input"
          >
            <RiVoiceAiFill className="w-5 h-5" />
          </button>

          {/* Upload button */}
          <button
            type="button"
            onClick={handleFileClick}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 
                     dark:hover:bg-gray-700 transition-colors"
            aria-label="Upload file"
          >
            <HiDocument className="w-5 h-5" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
            aria-hidden="true"
          />
        </div>

        {/* Auto-resizing textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message HealthBot..."
          className="flex-1 max-h-[200px] py-2 bg-transparent outline-none border-none 
                     text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 
                     text-[15px] leading-6 resize-none overflow-y-auto focus:ring-0 focus:outline-none"
          style={{ boxShadow: 'none' }}
          rows={1}
          aria-label="Type your message"
        />

        {/* Send button */}
        <div className="pb-1">
          <button
            type="submit"
            disabled={isDisabled}
            className={`p-2 rounded-lg transition-all ${
              isDisabled
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
            }`}
            aria-label="Send message"
          >
            <TbSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
});

export default MessageInput;