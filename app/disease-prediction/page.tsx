"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getApiUrl, API_CONFIG } from "@/lib/api-config";
import {
  Upload,
  Camera,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileImage,
  TrendingUp,
  Shield,
  ArrowLeft,
  Download,
  Share,
  Brain,
  Stethoscope,
  FileText,
  Activity,
  UserPlus,
  Save,
  User,
} from "lucide-react";
import Image from "next/image";

interface PredictionResult {
  success: boolean;
  prediction_id: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  disclaimer: string;
  database_id?: string;
  storage_secure?: boolean;
  storage_info?: any;
  ipfs?: {
    hash: string;
    url: string;
    lighthouse_url: string;
  };
  error?: string;
  message?: string;
}

interface VerificationResult {
  success: boolean;
  verified: boolean;
  original_prediction: string;
  original_confidence: number;
  gemini_analysis: string;
  medical_treatment_required: boolean;
  severity_level: string;
  timestamp: string;
  disclaimer: string;
  error?: string;
}

interface DiagnosisSection {
  title: string;
  content: string;
}

interface PatientFormData {
  name: string;
  phone: string;
  age: string;
  location: string;
  symptoms: string;
  treatment: string;
  medications: string;
  notes: string;
}

export default function DiseasePredictionPage() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(
    null
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [patientFormData, setPatientFormData] = useState<PatientFormData>({
    name: "",
    phone: "",
    age: "",
    location: "",
    symptoms: "Skin condition analysis from AI detection",
    treatment: "Consult dermatologist for proper evaluation and treatment plan",
    medications: "",
    notes: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        setError("Please select a valid image file (JPG, JPEG, or PNG)");
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setPrediction(null);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    try {
      // Directly upload to prediction API (Gemini check removed)
      const formData = new FormData();
      formData.append("image", selectedFile); // Use "image" for Next.js API proxy

      // Use the Next.js API proxy instead of direct Flask API call
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPrediction(data);

        // Automatically verify with Gemini AI
        setIsVerifying(true);
        try {
          const verifyResponse = await fetch("/api/disease-verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prediction: data.prediction,
              confidence: data.confidence,
              image_url: previewUrl,
            }),
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            setVerification(verifyData);
          } else {
            console.error("Verification failed:", verifyData.error);
          }
        } catch (verifyError) {
          console.error("Verification error:", verifyError);
        } finally {
          setIsVerifying(false);
        }
      } else {
        setError(data.error || "Failed to analyze image");
      }
    } catch (err) {
      setError(
        "Failed to connect to the analysis service. Please check your internet connection."
      );
    } finally {
      setIsUploading(false);
    }
  };
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setVerification(null);
    setShowRecordForm(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const parseDiagnosis = (text: string): DiagnosisSection[] => {
    const sections: DiagnosisSection[] = [];
    const sectionRegex = /\[(.*?)\]([^[]*)/g;
    let match;

    while ((match = sectionRegex.exec(text)) !== null) {
      sections.push({
        title: match[1].trim(),
        content: match[2].trim(),
      });
    }

    // Fallback if no sections found
    if (sections.length === 0 && text.trim().length > 0) {
      sections.push({
        title: "Medical Analysis",
        content: text.trim(),
      });
    }

    return sections;
  };
  const handleSaveRecord = async () => {
    if (!prediction || !verification) return;

    setIsSavingRecord(true);
    try {
      console.log("💾 Saving patient record to database...");

      const recordData = {
        patientName: patientFormData.name,
        patientPhone: patientFormData.phone,
        patientAge: patientFormData.age,
        patientLocation: patientFormData.location,
        diagnosis: prediction.prediction,
        symptoms: patientFormData.symptoms,
        treatment: patientFormData.treatment,
        medications: patientFormData.medications,
        notes: patientFormData.notes,
        severity: verification.severity_level,
        healthWorkerPhone: "", // Can be filled by health worker if logged in
        predictionData: {
          prediction: prediction.prediction,
          confidence: prediction.confidence,
          predictionId: prediction.prediction_id,
          timestamp: prediction.timestamp,
        },
        verificationData: {
          geminiAnalysis: verification.gemini_analysis,
          medicalTreatmentRequired: verification.medical_treatment_required,
          severityLevel: verification.severity_level,
          verified: verification.verified,
        },
        imageData: {
          ipfs: prediction.ipfs,
          storageSecure: prediction.storage_secure,
        },
      };

      const response = await fetch("/api/health-worker/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Patient record saved successfully:", result.data);
        setShowRecordForm(false);

        // Reset form
        setPatientFormData({
          name: "",
          phone: "",
          age: "",
          location: "",
          symptoms: "Skin condition analysis from AI detection",
          treatment:
            "Consult dermatologist for proper evaluation and treatment plan",
          medications: "",
          notes: "",
        });

        // Show success message
        alert(
          `✅ Patient record created successfully!\n\n` +
            `Record ID: ${result.data.recordId}\n` +
            `Patient: ${result.data.patientName}\n` +
            `Diagnosis: ${result.data.diagnosis}\n` +
            `Blockchain Stored: ${
              result.data.blockchainStored ? "Yes" : "No"
            }\n\n` +
            `Redirecting to health worker records...`
        );

        setTimeout(() => {
          window.location.href = "/health-worker/records";
        }, 3000);
      } else {
        console.error("❌ Failed to save record:", result.error);
        alert(`❌ Failed to save patient record: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error saving record:", error);
      alert("❌ Failed to save patient record. Please try again.");
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Pre-fill form data for critical cases
  useEffect(() => {
    if (verification && prediction) {
      // Update form with AI analysis data
      setPatientFormData((prev) => ({
        ...prev,
        symptoms: `Skin condition: ${
          prediction.prediction
        } (AI Confidence: ${prediction.confidence.toFixed(1)}%)`,
        treatment: verification.medical_treatment_required
          ? "URGENT: Consult dermatologist immediately for proper evaluation and treatment"
          : "Consult dermatologist for proper evaluation and treatment plan",
        notes: `AI-assisted diagnosis with ${
          verification.severity_level
        } severity. Verified by Gemini AI. ${
          verification.medical_treatment_required
            ? "Medical treatment required."
            : ""
        }`,
      }));
    }
  }, [verification, prediction]);

  const diagnosisSections = verification
    ? parseDiagnosis(verification.gemini_analysis)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {" "}
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Camera className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              AI-Enhanced Skin Disease Detection
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload an image for advanced AI analysis with Gemini verification
            and professional medical guidance. Complete with health worker
            record integration.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Gemini AI Verified
              </span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
              <Stethoscope className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Medical Guidance
              </span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-800 dark:text-purple-200">
                Health Records
              </span>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          {!prediction ? (
            /* Upload Section */
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                {/* File Upload Area */}
                <div className="mb-8">
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                      previewUrl
                        ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50 dark:bg-gray-700/50"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            width={300}
                            height={200}
                            className="rounded-lg shadow-md object-cover"
                          />
                          <button
                            onClick={handleReset}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p className="font-medium">{selectedFile?.name}</p>
                          <p>
                            {(selectedFile?.size! / (1024 * 1024)).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <FileImage className="w-16 h-16 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Upload Skin Image
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Choose a clear image of the skin condition for
                            accurate analysis
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                {/* Guidelines */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Image Guidelines
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Use clear, well-lit images
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Focus on the affected area
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Supported formats: JPG, JPEG, PNG
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Maximum file size: 10MB
                    </li>
                  </ul>
                </div>
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                )}{" "}
                {/* Analyze Button */}
                {selectedFile && (
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-lg font-semibold shadow-lg"
                  >
                    {" "}
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Image...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Results Section */
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Analyze Another Image
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>{" "}
              {/* Main Results */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Image and Basic Results */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      🤖 AI Analysis Results
                    </h3>
                    {previewUrl && (
                      <div className="mb-6">
                        <Image
                          src={previewUrl}
                          alt="Analyzed image"
                          width={400}
                          height={300}
                          className="w-full rounded-lg shadow-md object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Detected Condition
                        </h4>
                        <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                          {prediction.prediction}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          AI Confidence Level
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                              style={{ width: `${prediction.confidence}%` }}
                            />
                          </div>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {prediction.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Verification Status */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Gemini AI Verification
                        </h4>
                        {isVerifying ? (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying with medical AI...</span>
                          </div>
                        ) : verification ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-blue-800 dark:text-blue-200">
                                Verified by medical AI
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Severity:</span>
                                <span
                                  className={`ml-2 px-2 py-1 rounded text-xs ${
                                    verification.severity_level.toLowerCase() ===
                                    "high"
                                      ? "bg-red-100 text-red-800"
                                      : verification.severity_level.toLowerCase() ===
                                        "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {verification.severity_level}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Treatment:</span>
                                <span
                                  className={`ml-2 px-2 py-1 rounded text-xs ${
                                    verification.medical_treatment_required
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {verification.medical_treatment_required
                                    ? "Required"
                                    : "Not urgent"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Verification not available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gemini AI Medical Analysis */}
                {verification && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                          <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            🩺 Medical Professional Analysis
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Verified by Gemini AI •{" "}
                            {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Treatment Required Alert */}
                      {verification.medical_treatment_required && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-1">
                                Medical Treatment Recommended
                              </h4>
                              <p className="text-orange-800 dark:text-orange-200 text-sm">
                                This condition requires professional medical
                                evaluation and treatment.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Analysis Sections */}
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {diagnosisSections.map((section, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl p-4"
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                {section.title.includes("TREATMENT") && (
                                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                )}
                                {section.title.includes("CARE") && (
                                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                                )}
                                {section.title.includes("VERIFICATION") && (
                                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                )}
                                {!section.title.includes("TREATMENT") &&
                                  !section.title.includes("CARE") &&
                                  !section.title.includes("VERIFICATION") && (
                                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  {section.title}
                                </h4>
                                <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                  {section.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Health Worker Actions */}
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => setShowRecordForm(true)}
                            disabled={isSavingRecord}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1"
                          >
                            {isSavingRecord ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving Record...
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add to Patient Records
                              </>
                            )}
                          </Button>

                          {verification.medical_treatment_required && (
                            <Button
                              variant="outline"
                              className="border-orange-300 text-orange-700 hover:bg-orange-50"
                              onClick={() => window.open("tel:108", "_self")}
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Call Emergency
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>{" "}
              {/* Patient Record Form Modal */}
              {showRecordForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Add Patient to Records
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Create medical record from AI diagnosis
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveRecord();
                      }}
                      className="space-y-6"
                    >
                      {/* Patient Information */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Patient Information
                        </h4>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Patient Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={patientFormData.name}
                              onChange={(e) =>
                                setPatientFormData((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Enter patient name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              required
                              value={patientFormData.phone}
                              onChange={(e) =>
                                setPatientFormData((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Enter phone number"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Age
                            </label>
                            <input
                              type="number"
                              value={patientFormData.age}
                              onChange={(e) =>
                                setPatientFormData((prev) => ({
                                  ...prev,
                                  age: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Enter age"
                              min="1"
                              max="120"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Location
                            </label>
                            <input
                              type="text"
                              value={patientFormData.location}
                              onChange={(e) =>
                                setPatientFormData((prev) => ({
                                  ...prev,
                                  location: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Enter location"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Medical Information - Pre-filled */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          Medical Information
                        </h4>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                              AI Diagnosis
                            </label>
                            <input
                              type="text"
                              value={prediction?.prediction || ""}
                              readOnly
                              className="w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-900 dark:text-blue-100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                              AI Confidence
                            </label>
                            <input
                              type="text"
                              value={`${
                                prediction?.confidence?.toFixed(1) || 0
                              }%`}
                              readOnly
                              className="w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-900 dark:text-blue-100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                              Severity Level
                            </label>
                            <input
                              type="text"
                              value={verification?.severity_level || "Medium"}
                              readOnly
                              className="w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-900 dark:text-blue-100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                              Treatment Required
                            </label>
                            <input
                              type="text"
                              value={
                                verification?.medical_treatment_required
                                  ? "Yes"
                                  : "No"
                              }
                              readOnly
                              className="w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-900 dark:text-blue-100"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                            Symptoms
                          </label>
                          <textarea
                            value={patientFormData.symptoms}
                            onChange={(e) =>
                              setPatientFormData((prev) => ({
                                ...prev,
                                symptoms: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            rows={2}
                            placeholder="Describe visible symptoms"
                          />
                        </div>
                      </div>

                      {/* Treatment Plan */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                        <h4 className="font-semibold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Treatment Plan
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                              Recommended Treatment
                            </label>
                            <textarea
                              value={patientFormData.treatment}
                              onChange={(e) =>
                                setPatientFormData((prev) => ({
                                  ...prev,
                                  treatment: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                              rows={3}
                              placeholder="Enter treatment recommendations"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                              Medications (optional)
                            </label>
                            <textarea
                              value={patientFormData.medications}
                              onChange={(e) =>
                                setPatientFormData((prev) => ({
                                  ...prev,
                                  medications: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                              rows={2}
                              placeholder="List recommended medications"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Additional Notes
                        </label>
                        <textarea
                          value={patientFormData.notes}
                          onChange={(e) =>
                            setPatientFormData((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          rows={3}
                          placeholder="Any additional notes or observations"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button
                          type="submit"
                          disabled={isSavingRecord}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1"
                        >
                          {isSavingRecord ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving Record...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save to Records
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setShowRecordForm(false)}
                          variant="outline"
                          disabled={isSavingRecord}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}{" "}
              {/* Enhanced Medical Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
                      Important Medical Disclaimer
                    </h3>
                    <div className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed space-y-2">
                      <p>{prediction.disclaimer}</p>
                      {verification && (
                        <p>
                          <strong>AI-Enhanced Analysis:</strong> This diagnosis
                          includes verification by Gemini AI for enhanced
                          accuracy. However, this does not replace professional
                          medical evaluation.
                          {verification.medical_treatment_required && (
                            <span className="font-semibold">
                              {" "}
                              Immediate medical attention is recommended for
                              this condition.
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
