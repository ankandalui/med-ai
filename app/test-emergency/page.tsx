"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestEmergencyPage() {
  const [testResult, setTestResult] = useState("");
  const runEmergencyTest = async () => {
    console.log("🧪 RUNNING EMERGENCY TEST");
    setTestResult("Creating test emergency...");

    try {
      // Create test emergency data
      const emergencyData = {
        emergencyId: "EMG-TEST-" + Date.now(),
        patientName: "Test Emergency Patient",
        patientPhone: "9999999999",
        symptoms:
          "Severe chest pain, difficulty breathing, dizziness, profuse sweating",
        diagnosis:
          "CRITICAL: Possible acute myocardial infarction (heart attack) - IMMEDIATE medical attention required",
        healthWorkerPhone: "7074757878",
        location: "Test Location",
        age: 45,
        status: "CRITICAL",
      };

      console.log("📋 Posting test emergency to database:", emergencyData);

      // POST emergency data to database
      const response = await fetch("/api/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emergencyData),
      });

      const result = await response.json();
      console.log("✅ Emergency API Response:", result);

      if (!result.success) {
        throw new Error(`Failed to create emergency: ${result.error}`);
      }

      setTestResult(
        `Emergency created successfully! ID: ${result.data.emergencyId}`
      );

      // Navigate to monitoring page with emergency ID
      setTimeout(() => {
        const redirectUrl = `/health-worker/monitoring?emergency=${result.data.emergencyId}&auto_add=true`;
        console.log("🌐 Redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
      }, 1000);
    } catch (error) {
      console.log("❌ Error creating test emergency:", error);
      setTestResult(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };
  const checkLocalStorage = async () => {
    try {
      console.log("📋 Checking database for recent emergencies...");
      setTestResult("Fetching emergencies from database...");

      const response = await fetch("/api/emergency?limit=5");
      const result = await response.json();

      console.log("📋 Recent emergencies:", result);
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      console.log("❌ Error fetching emergencies:", error);
      setTestResult(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Emergency System Test</h1>

        <div className="space-y-4">
          <Button
            onClick={runEmergencyTest}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            🚨 Test Emergency Flow
          </Button>{" "}
          <Button
            onClick={checkLocalStorage}
            variant="outline"
            className="w-full"
          >
            � Check Database Emergencies
          </Button>
          <Button
            onClick={async () => {
              try {
                const response = await fetch("/api/emergency", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    emergencyId: "EMG-TEST-CLEAR",
                    status: "COMPLETED",
                  }),
                });
                setTestResult("Database cleanup attempted");
              } catch (error) {
                setTestResult("Database cleanup error");
              }
            }}
            variant="outline"
            className="w-full"
          >
            🗑️ Clear Test Data
          </Button>
        </div>

        {testResult && (
          <div className="mt-8 p-4 bg-white rounded border">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {testResult}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">🔍 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Test Emergency Flow" button</li>
            <li>Open browser console (F12) to see debug logs</li>
            <li>Should auto-redirect to monitoring page</li>
            <li>Dialog should open with critical status selected</li>
            <li>Symptoms and diagnosis should be pre-filled</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
