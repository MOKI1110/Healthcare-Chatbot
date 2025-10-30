// Basic hook outline for speech input
import { useEffect, useRef } from "react";

export function useSpeechRecognition({ onResult, lang = "en-US" }) {
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [lang, onResult]);

  function startListening() {
    if (recognitionRef.current) recognitionRef.current.start();
  }

  function stopListening() {
    if (recognitionRef.current) recognitionRef.current.stop();
  }

  return { startListening, stopListening };
}
