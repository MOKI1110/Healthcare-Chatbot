import React from "react";

export default function QuickReplies({ 
  options = [], 
  onSelect 
}: { 
  options?: string[]; 
  onSelect?: (option: string) => void 
}) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onSelect?.(option)}
          className="px-5 py-2 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
