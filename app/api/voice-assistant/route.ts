import { NextRequest, NextResponse } from "next/server";

// Dynamic import to avoid TypeScript issues
let GoogleGenerativeAI: any;
try {
  GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
} catch (error) {
  console.error("Failed to import Google Generative AI:", error);
}

// Initialize Gemini AI
const genai = GoogleGenerativeAI
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
  : null;

// Interface for structured response
interface VoiceAssistantResponse {
  response: string;
  action: "navigation" | "task" | "medical_advice" | "emergency" | "error";
  navigationUrl: string | null;
  taskType: string | null;
  urgencyLevel: "low" | "medium" | "high" | "critical";
}

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      language = "en",
      userType = "patient",
      currentPage,
    } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid query" },
        { status: 400 }
      );
    }

    let structuredResponse: VoiceAssistantResponse = {
      response: "I understand you need help. Let me assist you.",
      action: "medical_advice",
      navigationUrl: null,
      taskType: null,
      urgencyLevel: "low",
    };

    // Try to use Gemini AI for more intelligent responses
    try {
      if (genai) {
        const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `You are MedAI Voice Assistant for ${
          userType === "HEALTH_WORKER" ? "health workers" : "patients"
        } in rural India.

CURRENT CONTEXT:
- User Type: ${userType}
- Current Page: ${currentPage || "unknown"}
- Language: ${language}

CAPABILITIES:
1. Medical Guidance (simple, rural-appropriate advice)
2. Navigation Commands (can navigate to different pages)
3. Task Performance (help with medical forms, reminders)
4. Emergency Assistance
5. Regional Language Support

NAVIGATION PAGES:
${
  userType === "HEALTH_WORKER"
    ? `
- /health-worker (Dashboard)
- /health-worker/monitoring (Patient Monitoring)
- /health-worker/patients (Patient Management)
- /health-worker/records (Medical Records)
- /ai (AI Tools)
`
    : `
- /patient/dashboard (Patient Dashboard)
- /patient/locker (Medical Records)
- /patient/reminders (Medicine Reminders)
- /patient/emergency (Emergency Services)
- /ai (AI Consultation)
`
}

RESPOND IN ${
          language === "hi"
            ? "Hindi"
            : language === "bn"
            ? "Bengali"
            : "English"
        } using simple words.

GUIDELINES:
- For medical advice: Use household terms, mention consulting doctor
- For navigation: Confirm the action you're taking
- For emergencies: Show urgency and guide to emergency services
- Keep responses under 100 words
- Be culturally appropriate for rural India

User Query: "${text}"`;

        const result = await model.generateContent(systemPrompt);
        const aiResponse = result.response.text();

        structuredResponse.response = aiResponse;
      }
    } catch (aiError) {
      console.error("Gemini AI Error:", aiError);
      // Fall back to simple logic if AI fails
    }

    // Simple navigation detection (fallback or enhancement)
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("dashboard") ||
      lowerText.includes("डैशबोर्ड") ||
      lowerText.includes("ড্যাশবোর্ড")
    ) {
      structuredResponse = {
        ...structuredResponse,
        response:
          language === "hi"
            ? "मैं आपको डैशबोर्ड पर ले जा रहा हूं"
            : language === "bn"
            ? "আমি আপনাকে ড্যাশবোর্ডে নিয়ে যাচ্ছি"
            : "Taking you to the dashboard",
        action: "navigation",
        navigationUrl:
          userType === "HEALTH_WORKER"
            ? "/health-worker"
            : "/patient/dashboard",
      };
    } else if (
      lowerText.includes("monitoring") ||
      lowerText.includes("monitor") ||
      lowerText.includes("मॉनिटर") ||
      lowerText.includes("মনিটর")
    ) {
      structuredResponse = {
        ...structuredResponse,
        response:
          language === "hi"
            ? "मैं आपको मॉनिटरिंग पेज पर ले जा रहा हूं"
            : language === "bn"
            ? "আমি আপনাকে মনিটরিং পেজে নিয়ে যাচ্ছি"
            : "Taking you to the monitoring page",
        action: "navigation",
        navigationUrl:
          userType === "HEALTH_WORKER"
            ? "/health-worker/monitoring"
            : "/monitoring",
      };
    } else if (
      lowerText.includes("record") ||
      lowerText.includes("रिकॉर्ड") ||
      lowerText.includes("রেকর্ড")
    ) {
      structuredResponse = {
        ...structuredResponse,
        response:
          language === "hi"
            ? "मैं आपको रिकॉर्ड पेज पर ले जा रहा हूं"
            : language === "bn"
            ? "আমি আপনাকে রেকর্ড পেজে নিয়ে যাচ্ছি"
            : "Taking you to the records page",
        action: "navigation",
        navigationUrl:
          userType === "HEALTH_WORKER"
            ? "/health-worker/records"
            : "/patient/locker",
      };
    } else if (
      lowerText.includes("emergency") ||
      lowerText.includes("आपात") ||
      lowerText.includes("জরুরী")
    ) {
      structuredResponse = {
        ...structuredResponse,
        response:
          language === "hi"
            ? "⚠️ आपातकालीन सेवाओं से जुड़ रहे हैं"
            : language === "bn"
            ? "⚠️ জরুরী সেবার সাথে সংযোগ করছি"
            : "⚠️ Connecting to emergency services",
        action: "emergency",
        navigationUrl: "/patient/emergency",
        urgencyLevel: "critical",
      };
    } else if (
      lowerText.includes("ai") ||
      lowerText.includes("diagnosis") ||
      lowerText.includes("निदान") ||
      lowerText.includes("নির্ণয়")
    ) {
      structuredResponse = {
        ...structuredResponse,
        response:
          language === "hi"
            ? "AI निदान उपकरण खोल रहा हूं"
            : language === "bn"
            ? "AI নির্ণয় টুল খুলছি"
            : "Opening AI diagnosis tools",
        action: "navigation",
        navigationUrl: "/ai",
      };
    } else {
      // Generic medical advice responses
      const responses = {
        en: "I can help you with medical guidance, navigation, and emergency services. Try asking me to 'go to dashboard' or 'show emergency services'.",
        hi: "मैं आपको चिकित्सा मार्गदर्शन, नेवीगेशन और आपातकालीन सेवाओं में मदद कर सकता हूं। मुझसे 'डैशबोर्ड पर जाएं' या 'आपातकालीन सेवाएं दिखाएं' कहकर देखें।",
        bn: "আমি আপনাকে চিকিৎসা নির্দেশনা, নেভিগেশন এবং জরুরী সেবায় সাহায্য করতে পারি। 'ড্যাশবোর্ডে যান' বা 'জরুরী সেবা দেখান' বলে দেখুন।",
      };

      structuredResponse.response =
        responses[language as keyof typeof responses] || responses.en;
    }

    return NextResponse.json({
      success: true,
      data: structuredResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Voice Assistant Error:", error);

    const errorMessages = {
      en: "Sorry, I encountered an error. Please try again.",
      hi: "क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
      bn: "দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহপূর্বক আবার চেষ্টা করুন।",
    };

    return NextResponse.json(
      {
        success: false,
        error: errorMessages.en,
        data: {
          response: errorMessages.en,
          action: "error" as const,
          navigationUrl: null,
          taskType: null,
          urgencyLevel: "low" as const,
        },
      },
      { status: 500 }
    );
  }
}
