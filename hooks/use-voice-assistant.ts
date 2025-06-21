"use client";

import { useState, useEffect } from "react";

export function useVoiceAssistant() {
  const [isVoiceAssistantEnabled, setIsVoiceAssistantEnabled] = useState(false);
  const [isVoiceAssistantVisible, setIsVoiceAssistantVisible] = useState(false);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem("voice-assistant-enabled");
    if (saved === "true") {
      setIsVoiceAssistantEnabled(true);
    }
  }, []);

  // Save preference
  useEffect(() => {
    localStorage.setItem(
      "voice-assistant-enabled",
      isVoiceAssistantEnabled.toString()
    );
  }, [isVoiceAssistantEnabled]);

  const enableVoiceAssistant = () => {
    setIsVoiceAssistantEnabled(true);
    setIsVoiceAssistantVisible(true);
  };

  const disableVoiceAssistant = () => {
    setIsVoiceAssistantEnabled(false);
    setIsVoiceAssistantVisible(false);
  };

  const showVoiceAssistant = () => {
    if (isVoiceAssistantEnabled) {
      setIsVoiceAssistantVisible(true);
    }
  };

  const hideVoiceAssistant = () => {
    setIsVoiceAssistantVisible(false);
  };

  const toggleVoiceAssistant = () => {
    if (isVoiceAssistantEnabled) {
      setIsVoiceAssistantVisible(!isVoiceAssistantVisible);
    } else {
      enableVoiceAssistant();
    }
  };

  return {
    isVoiceAssistantEnabled,
    isVoiceAssistantVisible,
    enableVoiceAssistant,
    disableVoiceAssistant,
    showVoiceAssistant,
    hideVoiceAssistant,
    toggleVoiceAssistant,
  };
}
