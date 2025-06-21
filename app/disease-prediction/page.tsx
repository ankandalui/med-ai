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
      formData.append("image", selectedFile); // Use "image" for Next.js API proxy

      // Use the Next.js API proxy instead of direct Flask API call
      const response = await fetch("/api/predict", {
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
              </div>
              {/* Technical Information */}
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
