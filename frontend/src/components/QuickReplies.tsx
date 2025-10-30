import React from "react";

export default function QuickReplies({ options = [], onSelect }: { options?: string[]; onSelect?: (option: string) => void }) {
  return (
    <div role="group" aria-label="Quick Replies" className="flex flex-wrap gap-2 justify-center">
      {options.map((opt, idx) => (
        <button
          key={idx}
          onClick={() => onSelect && onSelect(opt)}
          className="px-6 py-2 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
