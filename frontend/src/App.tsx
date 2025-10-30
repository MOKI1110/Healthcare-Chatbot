import React, { useContext } from "react";
import Header from "./components/Header";
import LanguageSelector from "./components/LanguageSelector";
import Chatbot from "./components/Chatbot";
import AccessibilityPanel from "./components/AccessibilityPanel";
import EmergencyBanner from "./components/EmergencyBanner";
import StartOverButton from "./components/StartOverButton";
import { LanguageProvider } from "./context/LanguageProvider";
import { LanguageContext } from "./context/LanguageContext";
import "./main.css";

function InnerApp() {
  const { selectedLanguage } = useContext(LanguageContext);

  return (
    <div className="min-h-screen font-sans flex flex-col relative">
      <Header />
      <EmergencyBanner />
      <main className="flex-1 flex items-center justify-center py-8 relative z-10">
        {!selectedLanguage ? <LanguageSelector /> : <Chatbot />}
      </main>
      <AccessibilityPanel />

      {/* Show the Start Over button only if a language is active */}
      {selectedLanguage && <StartOverButton />}
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
