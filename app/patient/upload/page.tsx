"use client";

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  Syringe,
  Heart,
  Eye,
  Lock,
  ArrowLeft,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Cloud,
} from "lucide-react";
import Link from "next/link";

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  type: "prescription" | "report" | "vaccine" | "scan" | "other";
  title: string;
  description: string;
  tags: string[];
  errorMessage?: string;
}

export default function UploadRecordPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showFileAddedNotification, setShowFileAddedNotification] =
    useState(false);

  const recordTypes = [
    {
      value: "prescription",
      label: "Prescription",
      icon: FileText,
      color: "blue",
    },
    { value: "report", label: "Lab Report", icon: Heart, color: "green" },
    { value: "vaccine", label: "Vaccination", icon: Syringe, color: "purple" },
    { value: "scan", label: "Medical Scan", icon: Eye, color: "orange" },
    { value: "other", label: "Other", icon: FileText, color: "gray" },
  ];
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("📁 onDrop called with files:", acceptedFiles.length);

    // Filter valid files
    const validFiles = acceptedFiles.filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const validSize = file.size <= 10 * 1024 * 1024; // 10MB
      const isValid = validTypes.includes(file.type) && validSize;

      if (!isValid) {
        console.warn(
          "❌ Invalid file:",
          file.name,
          "Type:",
          file.type,
          "Size:",
          file.size
        );
      }

      return isValid;
    });

    if (validFiles.length === 0) {
      console.warn("❌ No valid files to upload");
      return;
    }

    const newFiles = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "pending" as const,
      type: "prescription" as const,
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: "",
      tags: [],
    }));

    console.log("✅ Created file objects:", newFiles.length, "files");
    newFiles.forEach((f) =>
      console.log(
        `   - ${f.file.name} (${(f.file.size / 1024 / 1024).toFixed(2)}MB)`
      )
    );
    setFiles((prev) => {
      const updated = [...prev, ...newFiles];
      console.log("📋 Updated files state:", updated.length, "total files");

      // Show success notification
      setShowFileAddedNotification(true);
      setTimeout(() => setShowFileAddedNotification(false), 3000);

      return updated;
    });
  }, []);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    console.log(
      "📂 File selection event triggered, files count:",
      selectedFiles?.length || 0
    );

    if (selectedFiles && selectedFiles.length > 0) {
      const fileArray = Array.from(selectedFiles);
      console.log("🔍 Processing selected files:");
      fileArray.forEach((f) =>
        console.log(
          `   - ${f.name} (${f.type}, ${(f.size / 1024 / 1024).toFixed(2)}MB)`
        )
      );

      onDrop(fileArray);
    } else {
      console.log("❌ No files selected");
    }

    // Reset the input to allow selecting the same files again
    event.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    console.log("🎯 Drag & drop event triggered");

    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log("📥 Dropped files count:", droppedFiles.length);

    if (droppedFiles.length > 0) {
      onDrop(droppedFiles);
    }
  };

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file))
    );
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const addTag = (fileId: string, tag: string) => {
    if (!tag.trim()) return;

    updateFile(fileId, {
      tags: [
        ...files.find((f) => f.id === fileId)!.tags,
        tag.trim().toLowerCase(),
      ],
    });
  };

  const removeTag = (fileId: string, tagIndex: number) => {
    const file = files.find((f) => f.id === fileId)!;
    updateFile(fileId, {
      tags: file.tags.filter((_, index) => index !== tagIndex),
    });
  };
  const uploadToLighthouse = async (file: UploadFile) => {
    try {
      console.log("🚀 Preparing file for Lighthouse upload:", file.file.name);

      const formData = new FormData();
      formData.append("file", file.file);
      formData.append(
        "metadata",
        JSON.stringify({
          title: file.title,
          description: file.description,
          type: file.type,
          tags: file.tags,
        })
      );

      console.log("📡 Sending request to Lighthouse API...");
      const response = await fetch("/api/patient/upload-to-lighthouse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "❌ Lighthouse API response error:",
          response.status,
          errorData
        );
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      console.log("✅ Lighthouse API response successful:", result);
      return result.cid;
    } catch (error) {
      console.error("❌ Lighthouse upload error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
    }
  };
  const handleUpload = async () => {
    if (files.length === 0) {
      console.warn("❌ No files to upload");
      return;
    }

    console.log("🚀 Starting upload process for", files.length, "files");
    setIsUploading(true);

    for (const file of files) {
      if (file.status !== "pending") {
        console.log(
          "⏭️ Skipping file (not pending):",
          file.file.name,
          "Status:",
          file.status
        );
        continue;
      }

      try {
        console.log("📤 Uploading file:", file.file.name);
        updateFile(file.id, { status: "uploading", progress: 10 });

        // Upload to Lighthouse
        console.log("🔗 Uploading to Lighthouse IPFS...");
        const cid = await uploadToLighthouse(file);
        console.log("✅ Lighthouse upload successful. CID:", cid);
        updateFile(file.id, { progress: 70 }); // Store file metadata in database
        console.log("💾 Saving metadata to database...");
        const saveResponse = await fetch("/api/patient/save-medical-record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cid,
            title: file.title,
            description: file.description,
            type: file.type,
            tags: file.tags,
            fileName: file.file.name,
            fileSize: file.file.size,
            fileType: file.file.type,
            ipfsUrl: `https://gateway.lighthouse.storage/ipfs/${cid}`,
            patientId: user?.id || "temp-patient-id", // Use actual user ID from auth
          }),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          console.error("❌ Database save failed:", errorData);
          throw new Error(errorData.error || "Failed to save record");
        }

        const saveResult = await saveResponse.json();
        console.log(
          "✅ Database save successful. Record ID:",
          saveResult.recordId
        );

        updateFile(file.id, { status: "completed", progress: 100 });
        console.log("🎉 File upload completed:", file.file.name);
      } catch (error) {
        console.error(
          "❌ Upload failed for file:",
          file.file.name,
          "Error:",
          error
        );
        updateFile(file.id, {
          status: "error",
          errorMessage:
            error instanceof Error
              ? error.message
              : "Upload failed. Please try again.",
        });
      }
    }

    console.log("✨ Upload process completed");
    setIsUploading(false);
  };

  const getTypeColor = (type: string) => {
    const typeConfig = recordTypes.find((t) => t.value === type);
    const color = typeConfig?.color || "gray";

    switch (color) {
      case "blue":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "green":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "purple":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30";
      case "orange":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
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
            Please login to upload medical records
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
      <div className="container mx-auto px-4 pt-16 sm:pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/patient/locker">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Locker
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
              <Upload className="w-8 h-8 text-white" />
            </div>{" "}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Upload Medical Records
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Securely store your medical documents on the blockchain
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  🔐 End-to-End Encryption
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your files are encrypted before upload and stored securely on
                  IPFS via Lighthouse. Only you can decrypt and access your
                  medical records.
                </p>
              </div>
            </div>{" "}
          </div>
        </div>
        {/* File Added Notification */}
        {showFileAddedNotification && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200 font-medium">
                ✅ Files selected successfully! Ready for upload.
              </p>
            </div>
          </div>
        )}
        {/* Upload Area */}{" "}
        <div className="mb-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
              dragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
            }`}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              className="hidden"
              id="file-upload"
            />{" "}
            <div className="flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-full transition-all duration-300 ${
                  files.length > 0
                    ? "bg-green-100 dark:bg-green-900/30"
                    : dragOver
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {files.length > 0 ? (
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                ) : (
                  <Cloud
                    className={`w-12 h-12 ${
                      dragOver
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400"
                    }`}
                  />
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {files.length > 0
                    ? `${files.length} File${
                        files.length > 1 ? "s" : ""
                      } Selected`
                    : dragOver
                    ? "Drop files here"
                    : "Upload Medical Records"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {files.length > 0
                    ? "Files ready for upload. Fill in details below and click Upload All Files."
                    : "Drag and drop files here, or click to select files"}
                </p>
                {files.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports: PDF, DOC, DOCX, JPG, PNG, WEBP (Max 10MB per file)
                  </p>
                )}
              </div>

              {files.length === 0 && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById("file-upload")?.click();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              )}
            </div>{" "}
          </div>
        </div>{" "}
        {/* Removed debug panel for production */}
        {/* File List */}
        {files.length > 0 && (
          <div className="mb-8">
            {" "}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Files to Upload ({files.length})
              </h2>
              {files.some((f) => f.status === "pending") && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-green-600 to-blue-600 w-full sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload All Files
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  {" "}
                  <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
                    {/* File Info */}
                    <div className="order-2 lg:order-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${getTypeColor(
                              file.type
                            )}`}
                          >
                            {recordTypes.find((t) => t.value === file.type)
                              ?.icon &&
                              React.createElement(
                                recordTypes.find((t) => t.value === file.type)!
                                  .icon,
                                {
                                  className: "w-5 h-5",
                                }
                              )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {file.file.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>

                        {file.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Status */}
                      <div className="mb-4">
                        {file.status === "pending" && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            Ready to upload
                          </div>
                        )}

                        {file.status === "uploading" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading to blockchain...{" "}
                              {Math.round(file.progress)}%
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {file.status === "completed" && (
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Successfully uploaded to blockchain
                          </div>
                        )}

                        {file.status === "error" && (
                          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            {file.errorMessage || "Upload failed"}
                          </div>
                        )}
                      </div>
                    </div>{" "}
                    {/* Metadata Form */}
                    <div className="space-y-4 order-1 lg:order-2">
                      {/* Record Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Record Type
                        </label>
                        <select
                          value={file.type}
                          onChange={(e) =>
                            updateFile(file.id, { type: e.target.value as any })
                          }
                          disabled={file.status !== "pending"}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 text-sm sm:text-base"
                        >
                          {recordTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={file.title}
                          onChange={(e) =>
                            updateFile(file.id, { title: e.target.value })
                          }
                          disabled={file.status !== "pending"}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 text-sm sm:text-base"
                          placeholder="Enter a descriptive title"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={file.description}
                          onChange={(e) =>
                            updateFile(file.id, { description: e.target.value })
                          }
                          disabled={file.status !== "pending"}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 resize-none text-sm sm:text-base"
                          rows={3}
                          placeholder="Add details about this record"
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {file.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-sm"
                            >
                              #{tag}
                              {file.status === "pending" && (
                                <button
                                  onClick={() => removeTag(file.id, index)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                        {file.status === "pending" && (
                          <input
                            type="text"
                            placeholder="Add tags (press Enter)"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                addTag(file.id, e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
