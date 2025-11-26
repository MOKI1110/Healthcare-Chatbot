import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";
import { LanguageContext } from "../context/LanguageContext";

export default function Header() {
  const { t } = useTranslation();
  const { setLanguage } = useContext(LanguageContext);

  // Handler for language switch (can prompt modal in full version)
  function onSwitchLanguage() {
    setLanguage(null);
  }

  // Handler for help/info (would open Modal in full version)
  function onHelp() {
    // Implement modal logic
    alert(t("About this chatbot:\nYour privacy is protected. For emergencies, use local services."));
  }

  return (
    <header className="glass relative z-10 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img 
              src={logo} 
              alt={t("Brand Logo")} 
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
          <h1 className="text-xl font-bold gradient-text">HealthBot Care</h1>
        </div>
        <div className="flex gap-3 items-center">
          <button
            aria-label={t("Switch Language")}
            onClick={onSwitchLanguage}
            className="btn-ghost hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 rounded-xl p-3 transition-all duration-300 hover:scale-110 group relative"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300" role="img" aria-label="Language">🌐</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            aria-label={t("Help & Privacy")}
            onClick={onHelp}
            className="btn-ghost hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 rounded-xl p-3 transition-all duration-300 hover:scale-110 group relative"
          >
            <span className="text-xl font-bold group-hover:scale-125 transition-transform duration-300" role="img" aria-label="Help">?</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </header>
  );
}
