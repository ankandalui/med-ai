"use client";

import React from "react";
import { VoiceAssistant } from "./voice-assistant";
import { VoiceAssistantButton } from "./voice-assistant-button";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";

export function VoiceAssistantProvider() {
  const { isVoiceAssistantVisible, hideVoiceAssistant } = useVoiceAssistant();

  return (
    <>
      <VoiceAssistantButton />
      {isVoiceAssistantVisible && (
        <VoiceAssistant onClose={hideVoiceAssistant} />
      )}
    </>
  );
}
