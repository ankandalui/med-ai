"use client";

import React, { useState, useRef, useEffect } from "react";

// Language options
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
];

interface ChatMessage {
  text: string;
  sender: "user" | "bot" | "welcome";
  language: string;
  image?: string | null;
}

const welcomeMessages: Record<string, string> = {
  en: "👋 Welcome to MedAI! Ask your health question in English, Hindi, or Bengali.",
  hi: "👋 MedAI में आपका स्वागत है! अपनी स्वास्थ्य संबंधी प्रश्न पूछें (हिन्दी में)।",
  bn: "👋 MedAI-তে স্বাগতম! আপনার স্বাস্থ্য প্রশ্ন জিজ্ঞাসা করুন (বাংলায়)।",
};

const MedAIChat: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [userInput, setUserInput] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] =
    useState<SpeechSynthesisUtterance | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Show welcome message on language change or clear
  useEffect(() => {
    setChatHistory([
      {
        text: welcomeMessages[currentLanguage],
        sender: "welcome",
        language: currentLanguage,
      },
    ]);
  }, [currentLanguage]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  // Voice recognition setup
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);

  // Voice input
  const handleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      const langMap: Record<string, string> = {
        en: "en-US",
        hi: "hi-IN",
        bn: "bn-IN",
      };
      recognitionRef.current.lang = langMap[currentLanguage] || "en-US";
      recognitionRef.current.start();
    }
  };

  // Voice output
  const handleSpeak = (text: string, btn: HTMLButtonElement) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking && currentUtterance) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
      btn.classList.remove("speaking");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      { en: "en-US", hi: "hi-IN", bn: "bn-IN" }[currentLanguage] || "en-US";
    utterance.rate = 0.9;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentUtterance(utterance);
      btn.classList.add("speaking");
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
      btn.classList.remove("speaking");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
      btn.classList.remove("speaking");
    };
    window.speechSynthesis.speak(utterance);
  };

  // Send message
  const sendMessage = async () => {
    const text = userInput.trim();
    if (!text) return;
    setChatHistory((prev) => [
      ...prev,
      { text, sender: "user", language: currentLanguage },
    ]);
    setUserInput("");
    setIsTyping(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory((prev) => [
        ...prev,
        {
          text: "I understand your health concern. As an AI assistant, I can provide general information, but please consult with a healthcare professional for proper medical advice. What specific symptoms are you experiencing?",
          sender: "bot",
          language: currentLanguage,
        },
      ]);
    }, 1500);
  };

  // Clear chat
  const clearChat = () => {
    if (window.confirm("Clear all chat history?")) {
      setChatHistory([
        {
          text: welcomeMessages[currentLanguage],
          sender: "welcome",
          language: currentLanguage,
        },
      ]);
    }
  };

  // UI
  return (
    <div className="relative">
      {/* Floating Chat Button */}
      <button
        className={`fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 ${
          isPopupOpen ? "rotate-45" : ""
        }`}
        onClick={() => setIsPopupOpen((v) => !v)}
        aria-label="Open MedAI Chat"
      >
        {isPopupOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </button>

      {/* Chat Popup */}
      <div
        className={`fixed inset-x-4 bottom-36 z-40 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 sm:inset-x-auto sm:right-4 sm:w-96 sm:bottom-20 ${
          isPopupOpen
            ? "opacity-100 translate-y-0 visible h-[75vh] max-h-[600px]"
            : "opacity-0 translate-y-8 invisible h-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span className="font-semibold text-sm sm:text-base">
              MedAI Rural Assistant
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="bg-white text-gray-900 rounded px-2 py-1 text-xs focus:outline-none min-w-0"
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            <button
              className="p-1 rounded-full hover:bg-white/20 focus:outline-none flex-shrink-0"
              onClick={() => setIsPopupOpen(false)}
              aria-label="Close Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-3 py-3 bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-0"
        >
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line break-words ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm"
                    : msg.sender === "bot"
                    ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-bl-sm"
                    : "bg-gray-100 text-gray-800 rounded-lg"
                }`}
              >
                <div className="pr-6">{msg.text}</div>

                {/* Speak button for bot/user messages */}
                {(msg.sender === "bot" || msg.sender === "user") && (
                  <button
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/20 hover:bg-black/30 text-xs text-white flex items-center justify-center transition-colors"
                    onClick={(e) => handleSpeak(msg.text, e.currentTarget)}
                    aria-label="Speak"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.775L4.05 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.05l4.333-3.775a1 1 0 011.617.775zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}

                {/* Language indicator */}
                {msg.language !== currentLanguage && (
                  <span className="block text-[10px] opacity-70 mt-1">
                    {msg.language.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="bg-gray-200 text-gray-600 rounded-xl px-3 py-2 text-xs flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span>MedAI is typing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <button
            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${
              isRecording
                ? "bg-red-500 border-red-500 text-white animate-pulse"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
            onClick={handleVoiceInput}
            aria-label="Voice Input"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <input
            type="text"
            className="flex-1 px-3 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Type your health question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={isTyping}
          />

          <button
            className="w-9 h-9 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            onClick={sendMessage}
            disabled={isTyping || !userInput.trim()}
            aria-label="Send"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.768 59.768 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>

          <button
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
            onClick={clearChat}
            title="Clear Chat"
            aria-label="Clear Chat"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedAIChat;
