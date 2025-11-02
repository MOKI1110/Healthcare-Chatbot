import React from "react";
import clsx from "clsx";

interface ChatBubbleProps {
  sender: string;
  text: string;
  isHealthRelated?: boolean;
}

export default function ChatBubble({ sender, text, isHealthRelated }: ChatBubbleProps) {
  const isBot = sender === "bot";
  const showWarning = isBot && isHealthRelated === false && text.includes('⚠️');

  return (
    <div
      className={clsx(
        "my-3 max-w-[75%] animate-fadeIn relative group",
        sender === "user" ? "ml-auto flex justify-end" : "mr-auto flex justify-start"
      )}
      aria-live="polite"
    >
      <div
        className={clsx(
          "px-5 py-3 rounded-2xl shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg",
          sender === "user"
            ? "bg-primary-600 text-white"
            : "bg-primary-50 text-secondary-900 border border-primary-200"
        )}
      >
        {/* Warning banner for non-health documents */}
        {showWarning && (
          <div className="mb-3 p-3 bg-yellow-50 border-l-4 border-accent-yellow rounded-lg">
            <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>This document may not be health-related</span>
            </p>
          </div>
        )}

        {/* Hover effect overlay */}
        <div
          className={clsx(
            "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
            sender === "user" ? "bg-white" : "bg-primary-400"
          )}
        ></div>

        {/* Message text */}
        <p className="relative z-10 leading-relaxed whitespace-pre-wrap">{text}</p>

        {/* Chat bubble tail */}
        <div
          className={clsx(
            "absolute bottom-0 w-0 h-0",
            sender === "user"
              ? "right-0 border-8 border-l-transparent border-b-transparent border-primary-600 transform translate-x-2 translate-y-2"
              : "left-0 border-8 border-r-transparent border-b-transparent border-primary-50 transform -translate-x-2 translate-y-2"
          )}
        ></div>
      </div>
    </div>
  );
}
