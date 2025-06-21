"use client";

import { useState, useRef } from "react";
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
  Activity,
  Clock,
  TrendingUp,
  Shield,
  ArrowLeft,
  Download,
  Share,
} from "lucide-react";
import Image from "next/image";

interface PredictionResult {
  success: boolean;
  prediction_id: string;
  prediction: string;
  confidence: number;
  treatment_info: {
    description: string;
    treatment: string;
    urgency: "low" | "medium" | "high";
    next_steps: string[];
  };
  timestamp: string;
  disclaimer: string;
  model_used: string;
  database_id?: string;
  ipfs?: {
    hash: string;
    url: string;
    lighthouse_url: string;
  };
}

export default function DiseasePredictionPage() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      const formData = new FormData();
      formData.append("file", selectedFile); // Changed from "image" to "file" to match API
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PREDICT), {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPrediction(data);
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
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <AlertCircle className="w-5 h-5" />;
      case "medium":
        return <Clock className="w-5 h-5" />;
      case "low":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Camera className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Skin Disease Detection
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload an image of a skin condition and get instant AI-powered
            analysis with treatment recommendations.
          </p>
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
                )}

                {/* Analyze Button */}
                {selectedFile && (
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-lg font-semibold shadow-lg"
                  >
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
              </div>

              {/* Main Results */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Image and Basic Results */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Analysis Results
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
                          Confidence Level
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
                    </div>
                  </div>
                </div>
                {/* Treatment Information */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Treatment Information
                    </h3>

                    {/* Urgency Level */}
                    <div
                      className={`rounded-xl p-4 mb-6 border ${getUrgencyColor(
                        prediction.treatment_info.urgency
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        {getUrgencyIcon(prediction.treatment_info.urgency)}
                        <div>
                          <h4 className="font-semibold capitalize">
                            {prediction.treatment_info.urgency} Priority
                          </h4>
                          <p className="text-sm opacity-80">
                            {prediction.treatment_info.urgency === "high"
                              ? "Seek immediate medical attention"
                              : prediction.treatment_info.urgency === "medium"
                              ? "Schedule an appointment soon"
                              : "Monitor and consult if needed"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Description
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {prediction.treatment_info.description}
                      </p>
                    </div>

                    {/* Treatment */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Treatment Approach
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {prediction.treatment_info.treatment}
                      </p>
                    </div>

                    {/* Next Steps */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Recommended Next Steps
                      </h4>
                      <ul className="space-y-2">
                        {prediction.treatment_info.next_steps.map(
                          (step, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <span className="text-gray-600 dark:text-gray-300">
                                {step}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>{" "}
              </div>

              {/* Technical Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Analysis Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Model Information */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        AI Model
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        {prediction.model_used === "real_ai"
                          ? "✅ Real AI Model"
                          : "⚠️ Demo Mode"}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                        Prediction ID: {prediction.prediction_id}
                      </p>
                    </div>

                    {/* Database Storage */}
                    {prediction.database_id && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                        <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                          Secure Storage
                        </h4>
                        <p className="text-green-800 dark:text-green-200 text-sm">
                          ✅ Stored in Database
                        </p>
                        <p className="text-green-600 dark:text-green-400 text-xs mt-1 font-mono">
                          ID: {prediction.database_id}
                        </p>
                      </div>
                    )}

                    {/* IPFS Storage */}
                    {prediction.ipfs && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 md:col-span-2">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                          Blockchain Storage (IPFS)
                        </h4>
                        <p className="text-purple-800 dark:text-purple-200 text-sm mb-3">
                          ✅ Image stored on decentralized IPFS network
                        </p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                              IPFS Hash:
                            </p>
                            <code className="text-xs bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded font-mono break-all">
                              {prediction.ipfs.hash}
                            </code>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <a
                              href={prediction.ipfs.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-900/70 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-md transition-colors"
                            >
                              🌐 IPFS Gateway
                            </a>
                            <a
                              href={prediction.ipfs.lighthouse_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-900/70 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-md transition-colors"
                            >
                              ⚡ Lighthouse
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Analysis completed at:{" "}
                      {new Date(prediction.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
                      Important Medical Disclaimer
                    </h3>
                    <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                      {prediction.disclaimer}
                    </p>
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
