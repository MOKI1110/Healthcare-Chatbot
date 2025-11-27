import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";
import NexaLogo from "../assets/NEXA.png"; // your NEXA wordmark

import { HiOutlineInformationCircle, HiMenu } from "react-icons/hi";
import { TbLanguage } from "react-icons/tb";

import languages from "../locales/languages.json";
import { LanguageContext } from "../context/LanguageContext";
import i18n from "../utils/i18n";

export default function Header() {
  const { t } = useTranslation();
  const { selectedLanguage, setLanguage } = useContext(LanguageContext);

  const [showMenu, setShowMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleHelp = () => {
    alert(
      t(
        "About this chatbot:\nYour privacy is protected. For emergencies, please contact local medical services."
      )
    );
  };

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".lang-menu-header")) {
        setShowLangMenu(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const currentLang =
    (Array.isArray(languages) &&
      languages.find((l) => l.code === selectedLanguage)) ||
    languages[0];

  function handleLanguageChange(code: string) {
    setLanguage(code);
    i18n.changeLanguage(code);
    setShowLangMenu(false);
  }

  // Simple "go home" without react-router
  function goHome() {
    window.location.href = "/"; // or "/index.html" if needed
  }

  return (
    <header className="w-full bg-[#0a0a0c] border-b border-[#1a1a22]">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
        {/* LEFT — Logo + Brand (clickable) */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={goHome}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl opacity-40" />
            <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-blue-400/40 shadow-[0_0_15px_rgba(80,120,255,0.3)] bg-[#0f0f13] flex items-center justify-center">
              <img
                src={logo}
                alt="NEXA icon"
                className="h-full w-full object-contain p-1.5"
              />
            </div>
          </div>

          {/* Brand name using NEXA image */}
          <div className="flex flex-col">
            <img
              src={NexaLogo}
              alt="NEXA"
              className="h-6 sm:h-7 w-auto drop-shadow-md pointer-events-none select-none"
            />
            <p className="text-xs text-gray-400 -mt-1">
              {t("Your wellness companion")}
            </p>
          </div>
        </div>

        {/* RIGHT — Info + Language + Menu */}
        <div className="flex items-center gap-3">
          {/* Info button */}
          <button
            onClick={handleHelp}
            className="p-2 rounded-lg bg-[#15151b] border border-[#222] hover:border-blue-500 hover:bg-[#1b1b22] transition-all duration-200 shadow-sm hover:shadow-blue-500/20"
            aria-label={t("Help & Privacy")}
          >
            <HiOutlineInformationCircle className="text-gray-300 hover:text-white text-xl" />
          </button>

          {/* Language dropdown */}
          <div className="relative lang-menu-header">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLangMenu((prev) => !prev);
              }}
              className="flex items-center gap-1 px-3 h-9 rounded-lg bg-[#15151b] border border-[#222] hover:border-blue-500 hover:bg-[#1b1b22] transition-all duration-200 shadow-sm hover:shadow-blue-500/20 text-gray-200 text-sm"
              aria-label={t("Change language")}
            >
              <TbLanguage className="text-lg" />
              <span className="hidden sm:inline">
                {currentLang?.emoji} {currentLang?.native}
              </span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-[#0f0f13] border border-gray-700 rounded-xl p-2 shadow-xl z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg text-gray-200 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <span className="text-lg">{lang.emoji}</span>
                    <span>{lang.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile menu (if you ever add nav items) */}
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="sm:hidden p-2 rounded-lg bg-[#15151b] border border-[#222] hover:border-blue-500 hover:bg-[#1b1b22] transition-all duration-200"
            aria-label={t("Menu")}
          >
            <HiMenu className="text-gray-300 hover:text-white text-xl" />
          </button>
        </div>
      </div>

      {showMenu && (
        <div className="sm:hidden bg-[#0f0f13] border-t border-[#1d1d25] px-5 py-3">
          <p className="text-gray-400 text-sm">
            {/* Add mobile nav items later if needed */}
          </p>
        </div>
      )}
    </header>
  );
}
