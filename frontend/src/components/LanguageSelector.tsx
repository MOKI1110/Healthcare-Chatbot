import React, { useContext, useState } from "react";
import languages from "../locales/languages.json";
import { LanguageContext } from "../context/LanguageContext";

export default function LanguageSelector() {
  const { setLanguage } = useContext(LanguageContext);
  const [search, setSearch] = useState("");

  // If no languages file, fallback to a few
  const langs = languages || [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  ];

  const filteredLanguages = langs.filter(
    (lang) => lang.name.toLowerCase().includes(search.toLowerCase())
  );

  function start(langCode: string) {
    setLanguage(langCode);
  }

  return (
    <section aria-labelledby="language-select-title" className="w-full max-w-2xl px-4 relative z-10 animate-fadeIn">
      <div className="card p-8 mb-6">
        <h1 id="language-select-title" className="text-4xl font-bold text-center mb-3 gradient-text">
          Welcome to HealthBot Care
        </h1>
        <p className="text-center text-gray-600 text-lg mb-6">How can we help you today?</p>
        
        <div className="relative mb-6">
          <input
            className="w-full p-4 pl-12 text-lg border-2 border-gray-200 focus:border-indigo-500 rounded-2xl shadow-sm transition-all duration-300"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder=" Search languages..."
            aria-label="Search languages"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
        </div>
        
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredLanguages.slice(0, 8).map((lang, idx) => (
            <li key={lang.code} style={{ animationDelay: `${idx * 0.05}s` }} className="animate-fadeIn">
              <button
                onClick={() => start(lang.code)}
                className="w-full p-4 flex items-center gap-3 border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
                <span className="font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors duration-300">
                  {lang.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="text-center text-gray-500 text-sm">
        ✨ Secure • Private • Multilingual
      </div>
    </section>
  );
}
