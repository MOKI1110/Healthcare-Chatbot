import React from "react";

export default function TyperIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="px-6 py-4 rounded-2xl shadow-md bg-primary-50 border border-primary-200">
        <div className="flex gap-1.5">
          <div 
            className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
