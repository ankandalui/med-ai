"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Phone,
  Calendar,
  Stethoscope,
  AlertCircle,
  User,
  MapPin,
  Clock,
  Activity,
  Heart,
  Shield,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface MedicalRecord {
  id: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: string[];
  notes?: string;
  createdAt: string;
  healthWorker: {
    user: {
      name: string;
      phone: string;
    };
    specialization: string;
    hospital?: string;
  };
}

interface PatientData {
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
    age?: number;
    address?: string;
  };
  medicalRecords: MedicalRecord[];
  monitoring?: {
    status: string;
    symptoms?: string;
    diagnosis?: string;
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    weight: number;
    updatedAt: string;
  };
  emergencyAlerts: Array<{
    id: string;
    emergencyId: string;
    symptoms: string;
    diagnosis: string;
    status: string;
    sentAt: string;
  }>;
}

export default function PatientDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  // Auto-fetch data when authenticated user is available
  useEffect(() => {
    if (isAuthenticated && user?.phone && !isLoggedIn) {
      setPhoneNumber(user.phone);
      handleAutoLogin(user.phone);
    }
  }, [isAuthenticated, user, isLoggedIn]);

  const handleAutoLogin = async (phone: string) => {
    setIsLoading(true);
    setError("");

    try {
      console.log(
        "🔍 Auto-fetching patient records for authenticated user:",
        phone
      );
      const response = await fetch(`/api/patient/records?phone=${phone}`);
      const result = await response.json();

      console.log("📋 Patient API Response:", result);

      if (result.success) {
        setPatientData(result.data);
        setIsLoggedIn(true);
        console.log(
          `✅ Found ${result.data.medicalRecords.length} medical records`
        );
      } else {
        setError(result.error || "No records found for this phone number");
      }
    } catch (error) {
      console.log("❌ Error fetching patient data:", error);
      setError("Failed to fetch patient data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🔍 Fetching patient records for:", phoneNumber);
      const response = await fetch(`/api/patient/records?phone=${phoneNumber}`);
      const result = await response.json();

      console.log("📋 Patient API Response:", result);

      if (result.success) {
        setPatientData(result.data);
        setIsLoggedIn(true);
        console.log(
          `✅ Found ${result.data.medicalRecords.length} medical records`
        );
      } else {
        setError(result.error || "No records found for this phone number");
      }
    } catch (error) {
      console.log("❌ Error fetching patient data:", error);
      setError("Failed to fetch patient data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPatientData(null);
    setPhoneNumber("");
    setError("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "attention":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "stable":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Patient Dashboard
            </h1>
            <p className="text-gray-600">
              {isAuthenticated && user?.phone
                ? "Loading your medical records..."
                : "Enter your phone number to view your medical records"}
            </p>
          </div>

          {isLoading && isAuthenticated ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading your records...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={
                    isAuthenticated && user?.phone
                      ? user.phone
                      : "Enter your phone number"
                  }
                  className="mt-1"
                  disabled={isAuthenticated && user?.phone ? true : false}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {!isAuthenticated && (
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Phone className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? "Loading..." : "View My Records"}
                </Button>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">
              ℹ️ How it works:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                •{" "}
                {isAuthenticated
                  ? "Your records are automatically loaded when signed in"
                  : "Enter the phone number used during your medical consultation"}
              </li>
              <li>• View all medical reports uploaded by health workers</li>
              <li>• Track your health monitoring status</li>
              <li>• Access emergency alerts and treatment history</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {patientData?.patient.name}
            </h1>
            <p className="text-gray-600">
              Your Medical Records & Health Status
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Patient Info Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Phone:</span>
              <span className="font-medium">{patientData?.patient.phone}</span>
            </div>
            {patientData?.patient.age && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Age:</span>
                <span className="font-medium">{patientData.patient.age}</span>
              </div>
            )}
            {patientData?.patient.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Address:</span>
                <span className="font-medium">
                  {patientData.patient.address}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Current Health Status */}
        {patientData?.monitoring && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Current Health Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      patientData.monitoring.status
                    )}`}
                  >
                    {patientData.monitoring.status.toUpperCase()}
                  </span>
                </div>
                {patientData.monitoring.symptoms && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Symptoms:
                    </p>
                    <p className="text-sm text-gray-600">
                      {patientData.monitoring.symptoms}
                    </p>
                  </div>
                )}
                {patientData.monitoring.diagnosis && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Current Diagnosis:
                    </p>
                    <p className="text-sm text-gray-600">
                      {patientData.monitoring.diagnosis}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Last Updated: {formatDate(patientData.monitoring.updatedAt)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Emergency Alerts */}
        {patientData?.emergencyAlerts &&
          patientData.emergencyAlerts.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Emergency Alerts
              </h2>
              <div className="space-y-3">
                {patientData.emergencyAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 bg-red-50 border border-red-200 rounded-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-red-800">
                        Emergency ID: {alert.emergencyId}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          alert.status
                        )}`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-sm text-red-700 mb-1">
                      <strong>Symptoms:</strong> {alert.symptoms}
                    </p>
                    <p className="text-sm text-red-700 mb-2">
                      <strong>Diagnosis:</strong> {alert.diagnosis}
                    </p>
                    <p className="text-xs text-red-600">
                      Alert Time: {formatDate(alert.sentAt)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

        {/* Medical Records */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Medical Records ({patientData?.medicalRecords.length || 0})
          </h2>

          {!patientData?.medicalRecords ||
          patientData.medicalRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No medical records found</p>
              <p className="text-sm text-gray-500 mt-2">
                Medical records will appear here after health worker
                consultations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {patientData.medicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {record.diagnosis}
                      </h3>{" "}
                      <p className="text-sm text-gray-600">
                        By: {record.healthWorker?.user?.name || "AI System"} (
                        {record.healthWorker?.specialization ||
                          "AI-assisted diagnosis"}
                        )
                      </p>{" "}
                      {record.healthWorker?.hospital && (
                        <p className="text-xs text-gray-500">
                          {record.healthWorker?.hospital}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatDate(record.createdAt)}
                      </p>{" "}
                      <p className="text-xs text-gray-500">
                        Contact: {record.healthWorker?.user?.phone || "system"}
                      </p>
                    </div>
                  </div>

                  {record.symptoms && record.symptoms.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Symptoms:
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {record.symptoms.map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Treatment:
                    </p>
                    <p className="text-sm text-gray-600">{record.treatment}</p>
                  </div>

                  {record.medications && record.medications.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Medications:
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {record.medications.map((medication, index) => (
                          <li key={index}>{medication}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {record.notes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Notes:
                      </p>
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
