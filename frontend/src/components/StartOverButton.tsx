import React from "react";

type StartOverButtonProps = {
  onClick?: () => void;
};

export default function StartOverButton({ onClick }: StartOverButtonProps) {
  function handleStartOver() {
    if (window.confirm("Are you sure you want to start over?")) {
      onClick?.();
    }
  }

  return (
    <button
      onClick={handleStartOver}
      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-secondary-100 text-secondary-700 border border-secondary-300 hover:bg-secondary-200 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md mx-auto"
    >
      <span>🔁</span>
      <span>Start Over</span>
    </button>
  );
}
