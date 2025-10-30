import React from "react";
import clsx from "clsx";

export default function ChatBubble({ sender, text }: { sender: string; text: string }) {
  return (
    <div
      className={clsx(
        "my-3 max-w-md animate-fadeIn relative group",
        sender === "user" ? "ml-auto flex justify-end" : "mr-auto flex justify-start"
      )}
      aria-live="polite"
    >
      <div
        className={clsx(
          "px-5 py-3 rounded-2xl shadow-lg relative overflow-hidden",
          sender === "user"
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
            : "bg-white text-gray-800 border border-gray-200"
        )}
      >
        <div className={clsx(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
          sender === "user" ? "bg-white" : "bg-gradient-to-br from-indigo-400 to-purple-400"
        )}></div>
        <p className="relative z-10 leading-relaxed">{text}</p>
        <div className={clsx(
          "absolute bottom-0 w-0 h-0",
          sender === "user"
            ? "right-0 border-8 border-l-transparent border-b-transparent border-indigo-600 transform translate-x-2 translate-y-2"
            : "left-0 border-8 border-r-transparent border-b-transparent border-white transform -translate-x-2 translate-y-2"
        )}></div>
      </div>
    </div>
  );
}
