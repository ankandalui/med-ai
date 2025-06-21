"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  User,
  Heart,
  Phone,
  MapPin,
  Calendar,
  Pill,
  Shield,
  ArrowLeft,
  Edit,
  Save,
  Copy,
  Share,
  Lock,
  Download,
  QrCode,
} from "lucide-react";
import Link from "next/link";

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

interface MedicalInfo {
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContacts: EmergencyContact[];
  doctorName: string;
  doctorPhone: string;
  hospital: string;
  insuranceInfo: string;
  organDonor: boolean;
}

export default function EmergencyInfoPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodType: "",
    allergies: [],
    medications: [],
    conditions: [],
    emergencyContacts: [],
    doctorName: "",
    doctorPhone: "",
    hospital: "",
    insuranceInfo: "",
    organDonor: false,
  });

  // Fetch real data from APIs
  useEffect(() => {
    const fetchEmergencyInfo = async () => {
      try {
        // TODO: Replace with actual API calls
        // const response = await fetch('/api/patient/emergency-info');
        // const data = await response.json();
        // setMedicalInfo(data);

        // Temporary empty state until APIs are connected
        console.log("Emergency info would be fetched from API");
      } catch (error) {
        console.error("Failed to fetch emergency info:", error);
      }
    };

    fetchEmergencyInfo();
  }, []);

  const handleSave = () => {
    // In real app, this would save to backend
    setIsEditing(false);
    alert("Emergency information updated successfully!");
  };

  const copyToClipboard = () => {
    const emergencyText = `
EMERGENCY MEDICAL INFORMATION
Name: ${user?.name || "Patient"}
Blood Type: ${medicalInfo.bloodType}
Allergies: ${medicalInfo.allergies.join(", ")}
Medical Conditions: ${medicalInfo.conditions.join(", ")}
Current Medications: ${medicalInfo.medications.join(", ")}
Primary Emergency Contact: ${medicalInfo.emergencyContacts[0]?.name} - ${
      medicalInfo.emergencyContacts[0]?.phone
    }
Doctor: ${medicalInfo.doctorName} - ${medicalInfo.doctorPhone}
Hospital: ${medicalInfo.hospital}
Insurance: ${medicalInfo.insuranceInfo}
Organ Donor: ${medicalInfo.organDonor ? "Yes" : "No"}
    `.trim();

    navigator.clipboard.writeText(emergencyText);
    alert("Emergency information copied to clipboard!");
  };

  const shareEmergencyInfo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Emergency Medical Information",
          text: `Emergency contact for ${user?.name || "Patient"}: ${
            medicalInfo.emergencyContacts[0]?.phone
          }`,
        });
      } catch (error) {
        console.log("Sharing failed:", error);
      }
    } else {
      copyToClipboard();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to access your emergency information
          </p>
          <Link href="/login">
            <Button>Login to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      <div className="container mx-auto px-4 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/patient">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  🆘 Emergency Info Card
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Critical medical information for emergency situations
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setShowQR(!showQR)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                  <Button variant="outline" onClick={shareEmergencyInfo}>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Alert */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-300">
                  🚨 In Case of Emergency
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Show this card to emergency responders. Keep it easily
                  accessible and up-to-date.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Emergency QR Code
              </h3>

              {/* QR Code Placeholder */}
              <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    QR Code for Emergency Info
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Scan this QR code to access emergency medical information
                instantly
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowQR(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-red-200 dark:border-red-800 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    🆘 EMERGENCY MEDICAL CARD
                  </h2>
                  <p className="text-red-100">
                    Present this card to emergency medical personnel
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-100">Last Updated</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Personal Information
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Full Name
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {user?.name || "Patient Name"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Date of Birth
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Jan 15, 1980
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        Blood Type
                      </span>
                      {isEditing ? (
                        <select
                          value={medicalInfo.bloodType}
                          onChange={(e) =>
                            setMedicalInfo((prev) => ({
                              ...prev,
                              bloodType: e.target.value,
                            }))
                          }
                          className="font-semibold bg-transparent border border-red-300 rounded px-2 py-1"
                        >
                          <option>A+</option>
                          <option>A-</option>
                          <option>B+</option>
                          <option>B-</option>
                          <option>AB+</option>
                          <option>AB-</option>
                          <option>O+</option>
                          <option>O-</option>
                        </select>
                      ) : (
                        <span className="font-bold text-red-700 dark:text-red-300 text-lg">
                          {medicalInfo.bloodType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-500" />
                    Emergency Contacts
                  </h3>

                  <div className="space-y-3">
                    {medicalInfo.emergencyContacts.map((contact, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          contact.isPrimary
                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                            : "bg-gray-50 dark:bg-gray-700/50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {contact.name}
                              {contact.isPrimary && (
                                <span className="text-green-600 dark:text-green-400 text-sm ml-2">
                                  (Primary)
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {contact.relationship}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                              {contact.phone}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard()}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Allergies */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    ⚠️ Allergies
                  </h3>

                  <div className="space-y-2">
                    {medicalInfo.allergies.map((allergy, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="font-medium text-red-800 dark:text-red-200">
                            {allergy}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Medications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-500" />
                    Current Medications
                  </h3>

                  <div className="space-y-2">
                    {medicalInfo.medications.map((medication, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">
                            {medication}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-500" />
                  Medical Conditions
                </h3>

                <div className="grid md:grid-cols-3 gap-3">
                  {medicalInfo.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-purple-800 dark:text-purple-200">
                          {condition}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Healthcare Provider Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    👨‍⚕️ Primary Doctor
                  </h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {medicalInfo.doctorName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {medicalInfo.doctorPhone}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🏥 Preferred Hospital
                  </h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {medicalInfo.hospital}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {medicalInfo.insuranceInfo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-300">
                        Organ Donor Status
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {medicalInfo.organDonor
                          ? "✅ Registered organ donor"
                          : "❌ Not an organ donor"}
                      </p>
                    </div>
                  </div>
                  {isEditing && (
                    <input
                      type="checkbox"
                      checked={medicalInfo.organDonor}
                      onChange={(e) =>
                        setMedicalInfo((prev) => ({
                          ...prev,
                          organDonor: e.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <p>🆔 Emergency Card ID: {user?.id || "EMG001"}</p>
                <p>Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Info
            </Button>
            <Button
              onClick={shareEmergencyInfo}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Share Card
            </Button>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
