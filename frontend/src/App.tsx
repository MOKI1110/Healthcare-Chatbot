import React, { useContext } from "react";
import Header from "./components/Header";
import LanguageSelector from "./components/LanguageSelector";
import Chatbot from "./components/Chatbot";
import EmergencyBanner from "./components/EmergencyBanner";
import { LanguageProvider } from "./context/LanguageProvider";
import { LanguageContext } from "./context/LanguageContext";
import "./main.css";

function InnerApp() {
  const { selectedLanguage } = useContext(LanguageContext);

  return (
    <div className="min-h-screen font-sans flex flex-col bg-[#050509] text-slate-100">
      {/* Top app header (you can keep / tweak your existing Header component) */}
      <Header />

      {/* Optional emergency ticker – looks better if made slim */}
      <div className="border-b border-red-900/40 bg-red-950/40">
        <EmergencyBanner />
      </div>

      {/* Main area – ChatGPT-style centered column */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl mx-auto">
          {!selectedLanguage ? (
            <LanguageSelector />
          ) : (
            <Chatbot />
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <InnerApp />
    </LanguageProvider>
  );
}
