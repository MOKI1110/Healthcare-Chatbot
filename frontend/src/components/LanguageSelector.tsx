import React from "react";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";

export default function LanguageSelector() {
  const { t } = useTranslation();

  function openChat() {
    try {
      // Emit an event the Chatbot listens for
      window.dispatchEvent(new CustomEvent("healthbot:start"));

      // Remember the user intent (optional)
      window.sessionStorage.setItem("healthbot-open", "true");

      // Jump to the chat root if it's on the same page
      window.location.hash = "#chat";
    } catch (err) {
      // don't crash the page if something goes wrong
      // eslint-disable-next-line no-console
      console.warn("Could not open chat programmatically", err);
    }
  }

  return (
    <section
      aria-labelledby="healthbot-hero-title"
      className="w-full px-2 sm:px-4 py-10 bg-[#050509]"
    >
      {/* Centered hero like ChatGPT home */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-3xl opacity-60" />
          <div className="relative h-16 w-16 rounded-2xl bg-[#0b0b10] border border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt={t("HealthBot logo")}
              className="h-full w-full object-contain p-2"
            />
          </div>
        </div>

        <h1
          id="healthbot-hero-title"
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-3 text-white"
        >
          {t("Welcome, how can we help today?")}
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl">
          {t(
            "Ask HealthBot about your symptoms, medications, or lab reports. I’ll help you understand what might be going on and when to seek a doctor."
          )}
        </p>
      </div>

      {/* Main card – “what you can ask” instead of language picker */}
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-[#0c0f13] shadow-[0_0_40px_rgba(0,0,0,0.6)] p-5 sm:p-7 md:p-8">
        <p className="text-xs uppercase tracking-wide text-emerald-300 mb-4 text-center">
          {t("Try asking about…")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-700/80 bg-[#050509] px-4 py-3 text-left">
            <p className="text-xs text-emerald-300 mb-1">{t("Symptoms")}</p>
            <p className="text-sm text-slate-100">
              {t("“I have a headache and mild fever since yesterday.”")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-[#050509] px-4 py-3 text-left">
            <p className="text-xs text-emerald-300 mb-1">{t("Lab reports")}</p>
            <p className="text-sm text-slate-100">
              {t("“Can you help me understand my blood test results?”")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-[#050509] px-4 py-3 text-left">
            <p className="text-xs text-emerald-300 mb-1">{t("Medicines")}</p>
            <p className="text-sm text-slate-100">
              {t("“I missed a dose of my tablet, what should I do?”")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-[#050509] px-4 py-3 text-left">
            <p className="text-xs text-emerald-300 mb-1">{t("General health")}</p>
            <p className="text-sm text-slate-100">
              {t("“How can I improve my sleep and reduce stress?”")}
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs text-slate-400 text-center">
          {t(
            "Scroll down to start chatting with HealthBot. You can change language inside the chat anytime."
          )}
        </p>

        {/* START CHAT BUTTON */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={openChat}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-lg"
            aria-label={t("Start chat")}
          >
            {t("Start chat")}
          </button>
        </div>
      </div>

      {/* Footer small text like ChatGPT disclaimer */}
      <div className="mt-4 text-center text-[11px] text-slate-500">
        ✨ {t("Secure")} • {t("Private")} • {t("Not a replacement for your doctor")}
      </div>
    </section>
  );
}
