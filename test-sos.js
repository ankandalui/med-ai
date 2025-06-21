// Test script to simulate critical condition response
// This can be used to test the SOS functionality

const mockCriticalResponse = {
  success: true,
  diagnosis: `[CRITICAL EMERGENCY DETECTED]
⚠️ IMMEDIATE MEDICAL ATTENTION REQUIRED ⚠️

Based on the symptoms described, this appears to be a potentially life-threatening condition that requires immediate emergency medical intervention.

[POSSIBLE CONDITIONS]
• Acute myocardial infarction (heart attack)
• Severe allergic reaction (anaphylaxis)
• Acute respiratory distress
• Stroke symptoms
• Severe internal bleeding

[IMMEDIATE ACTIONS REQUIRED]
1. Call emergency services immediately (108)
2. Do not delay seeking medical attention
3. If conscious, keep patient calm and comfortable
4. Monitor vital signs if possible
5. Prepare for immediate transport to hospital

[CRITICAL WARNING]
This condition requires IMMEDIATE emergency medical intervention. Any delay could be life-threatening. Please proceed to the nearest emergency department immediately or call an ambulance.`,
  is_critical: true,
  language: "en",
  timestamp: new Date().toISOString(),
  disclaimer:
    "This is an emergency medical alert. Please seek immediate professional medical attention.",
};

console.log("Mock Critical Response for Testing:");
console.log(JSON.stringify(mockCriticalResponse, null, 2));

// Test the SOS alert console output
console.log("\n" + "=".repeat(60));
console.log("🚨🚨🚨 EMERGENCY SOS ALERT SYSTEM ACTIVATED 🚨🚨🚨");
console.log("=".repeat(60));
console.log("📱 Emergency Call Initiated");
console.log("📞 From Patient Number: 7074757878");
console.log("🏥 Alerting Government Hospital: 8100752679");
console.log("🚑 Dispatching Ambulance Service: 8653015622");
console.log("📍 Patient Location: Critical Emergency Detected");
console.log("⏰ Emergency Timestamp: " + new Date().toISOString());
console.log(
  "🆔 Emergency ID: EMG-" +
    Math.random().toString(36).substr(2, 9).toUpperCase()
);
console.log("=".repeat(60));
console.log("✅ HOSPITAL NOTIFICATION SUCCESSFUL");
console.log("✅ AMBULANCE DISPATCH SUCCESSFUL");
console.log("✅ ALL EMERGENCY SERVICES NOTIFIED");
console.log("🆘 SOS ALERT SYSTEM COMPLETE - HELP IS ON THE WAY! 🆘");
console.log("=".repeat(60));
