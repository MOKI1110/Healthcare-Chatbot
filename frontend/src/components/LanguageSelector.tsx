import React, { useContext, useState } from "react";
import languages from "../locales/languages.json";
import { LanguageContext } from "../context/LanguageContext";
import i18n from "../utils/i18n";
import { useTranslation } from "react-i18next";

export default function LanguageSelector() {
  const { t } = useTranslation();
  const { setLanguage } = useContext(LanguageContext);
  const [search, setSearch] = useState("");

  // Fallback to your chosen five languages if languages.json is missing or incorrect
  const langs = (Array.isArray(languages) && languages.length > 0) ? languages : [
    { code: "en", label: "English", native: "English", emoji: "🇬🇧" },
    { code: "ta", label: "Tamil", native: "தமிழ்", emoji: "🇮🇳" },
    { code: "hi", label: "Hindi", native: "हिन्दी", emoji: "🇮🇳" },
    { code: "te", label: "Telugu", native: "తెలుగు", emoji: "🇮🇳" },
    { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", emoji: "🇮🇳" }
  ];

  const filteredLanguages = langs.filter(
    (lang) =>
      lang.label.toLowerCase().includes(search.toLowerCase()) ||
      lang.native.toLowerCase().includes(search.toLowerCase())
  );

  function start(langCode: string) {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  }

  return (
    <section
      aria-labelledby="language-select-title"
      className="w-full px-2 sm:px-4"
    >
      {/* Centered hero like ChatGPT home */}
      <div className="flex flex-col items-center text-center mb-8">
        <h1
          id="language-select-title"
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-3"
        >
          HealthBot
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl">
          {t("Welcome, how can we help today?")}  
        </p>
      </div>

      {/* Main card – similar to ChatGPT’s “New chat” area */}
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-[#0c0f13] shadow-[0_0_40px_rgba(0,0,0,0.6)] p-5 sm:p-7 md:p-8">
        {/* Search bar */}
        <div className="relative mb-6">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">
            🔍
          </span>
          <input
            className="w-full rounded-2xl bg-[#050509] border border-slate-700/80 px-11 py-3 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search languages...")}
            aria-label={t("Search languages...")}
          />
        </div>

        {/* Language pills – like ChatGPT model cards but compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredLanguages.map((lang, idx) => (
            <button
              key={lang.code}
              onClick={() => start(lang.code)}
              style={{ animationDelay: `${idx * 40}ms` }}
              className="group flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-[#050509] px-4 py-3 text-left hover:border-emerald-500/80 hover:bg-[#050f10] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all duration-200"
            >
              <span
                className="text-2xl sm:text-3xl drop-shadow-sm group-hover:scale-110 transition-transform"
                role="img"
                aria-label={lang.label}
              >
                {lang.emoji}
              </span>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-medium text-slate-100">
                  {lang.native}
                </span>
                <span className="text-xs text-slate-500">
                  {lang.label}
                </span>
              </div>
            </button>
          ))}

          {filteredLanguages.length === 0 && (
            <div className="col-span-full text-center text-sm text-slate-500 py-4">
              {t("No languages found")}
            </div>
          )}
        </div>
      </div>

      {/* Footer small text like ChatGPT disclaimer */}
      <div className="mt-4 text-center text-[11px] text-slate-500">
        ✨ {t("Secure")} • {t("Private")} • {t("Multilingual")}
      </div>
    </section>
  );
}
