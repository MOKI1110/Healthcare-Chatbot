import React from "react";

export default function TyperIndicator() {
  return (
    <div className="flex items-center gap-1 my-2 px-5 py-3 w-fit bg-gray-100 rounded-2xl" aria-label="Bot is typing">
      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce">•</span>
      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150">•</span>
      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300">•</span>
    </div>
  );
}
