// Manual test for emergency flow
console.log("🧪 MANUAL EMERGENCY TEST");

// Simulate what symptom prediction page does
const testEmergencyData = {
  emergencyId: "EMG-TEST123",
  symptoms: "Severe chest pain, difficulty breathing, profuse sweating",
  diagnosis:
    "CRITICAL: Possible acute myocardial infarction - IMMEDIATE medical attention required",
  language: "en",
  timestamp: new Date().toISOString(),
  status: "critical",
};

// Store in localStorage
localStorage.setItem("pendingEmergency", JSON.stringify(testEmergencyData));
console.log("📱 Test data stored:", testEmergencyData);

// Check if data is stored
const stored = localStorage.getItem("pendingEmergency");
console.log("✅ Data retrieved:", JSON.parse(stored));

// Navigate to monitoring page
window.location.href =
  "/health-worker/monitoring?emergency=critical&auto_add=true";
