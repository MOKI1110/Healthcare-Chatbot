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
    lang =>
      lang.label.toLowerCase().includes(search.toLowerCase()) ||
      lang.native.toLowerCase().includes(search.toLowerCase())
  );

  function start(langCode: string) {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  }

  return (
    <section aria-labelledby="language-select-title" className="w-full max-w-2xl px-4 relative z-10 animate-fadeIn">
      <div className="card p-8 mb-6">
        <h1 id="language-select-title" className="text-4xl font-bold text-center mb-3 gradient-text">
          {t("Welcome, how can we help today?")}
        </h1>
        <p className="text-center text-gray-600 text-lg mb-6">
          {t("Please choose your language.")}
        </p>
        <div className="relative mb-6">
          <input
            className="w-full p-4 pl-12 text-lg border-2 border-gray-200 focus:border-indigo-500 rounded-2xl shadow-sm transition-all duration-300"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("Search languages...")}
            aria-label={t("Search languages...")}
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
        </div>

        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredLanguages.map((lang, idx) => (
            <li key={lang.code} style={{ animationDelay: `${idx * 0.05}s` }} className="animate-fadeIn">
              <button
                onClick={() => start(lang.code)}
                className="w-full p-4 flex items-center gap-3 border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300" role="img" aria-label={lang.label}>
                  {lang.emoji}
                </span>
                <span className="font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors duration-300">
                  {lang.native} <span className="text-xs text-gray-400">({lang.label})</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center text-gray-500 text-sm">
        ✨ {t("Secure")} • {t("Private")} • {t("Multilingual")}
      </div>
    </section>
  );
}
