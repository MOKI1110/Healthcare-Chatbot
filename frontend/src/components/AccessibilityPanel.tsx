import React, { useState } from "react";

export default function AccessibilityPanel() {
  const [fontSize, setFontSize] = useState(1);
  const [highContrast, setHighContrast] = useState(false);

  function adjustFont(size: number) {
    setFontSize(size);
    document.body.style.fontSize = `${16 * size}px`;
  }

  function toggleContrast() {
    setHighContrast(!highContrast);
    document.body.style.backgroundColor = highContrast ? "#F8F9FA" : "#000";
    document.body.style.color = highContrast ? "#333" : "#FFF";
  }

  return (
    <div className="fixed bottom-4 right-4 glass-dark rounded-2xl p-3 flex gap-2 items-center shadow-2xl z-30 animate-fadeIn">
      <button
        aria-label="Increase font size"
        className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-110 shadow-md font-bold"
        onClick={() => adjustFont(fontSize + 0.1)}
      >
        Aa+
      </button>
      <button
        aria-label="Decrease font size"
        className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-110 shadow-md font-bold"
        onClick={() => adjustFont(Math.max(1, fontSize - 0.1))}
      >
        Aa-
      </button>
      <button
        aria-label="High contrast mode"
        className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 hover:scale-110 shadow-md ${
          highContrast 
            ? "bg-gradient-to-br from-yellow-500 to-orange-600 text-white" 
            : "bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-400"
        }`}
        onClick={toggleContrast}
      >
        ⚡
      </button>
    </div>
  );
}
