import React, { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

// Optionally let parent override behavior via onClick prop
type StartOverButtonProps = {
  onClick?: () => void;
};

export default function StartOverButton({ onClick }: StartOverButtonProps) {
  const { setLanguage } = useContext(LanguageContext);

  // Default handler: resets language via context
  function handleStartOver() {
    if (window.confirm("Are you sure you want to start over?")) {
      setLanguage(null);
    }
  }

  return (
    <button
      onClick={onClick ? onClick : handleStartOver}
      className="fixed bottom-6 left-6 px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
      aria-label="Start Over"
      type="button"
    >
      🔁 Start Over
    </button>
  );
}
