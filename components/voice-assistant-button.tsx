"use client";

import React from "react";
import { Mic, MicOff } from "lucide-react";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import { cn } from "@/lib/utils";

export function VoiceAssistantButton() {
  const {
    isVoiceAssistantEnabled,
    isVoiceAssistantVisible,
    toggleVoiceAssistant,
  } = useVoiceAssistant();

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-40">
      {/* Tooltip */}
      <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Voice Assistant
      </div>

      <button
        onClick={toggleVoiceAssistant}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110",
          isVoiceAssistantEnabled && isVoiceAssistantVisible
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        )}
      >
        {isVoiceAssistantEnabled && isVoiceAssistantVisible ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Floating label - simple indicator for new users */}
      {!isVoiceAssistantEnabled && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
      )}
    </div>
  );
}
