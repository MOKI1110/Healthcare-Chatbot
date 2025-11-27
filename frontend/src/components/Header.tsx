import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";

export default function Header() {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  
  const handleHelp = () => {
    alert(t("About this chatbot:\nYour privacy is protected. For emergencies, use local services."));
  };

  return (
    <header className="relative z-50">
      <div className="glass backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <img 
                  src={logo} 
                  alt={t("Brand Logo")} 
                  className="relative h-12 w-auto drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300 rounded-xl" 
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  HealthBot
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Your wellness companion</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Help Button */}
              <button
                onClick={handleHelp}
                className="group relative p-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 hover:shadow-lg"
                aria-label={t("Help & Privacy")}
              >
                <svg className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Menu Button (Mobile) */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Menu"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}