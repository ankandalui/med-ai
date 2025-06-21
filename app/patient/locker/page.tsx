"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Upload,
  Download,
  FileText,
  Syringe,
  Heart,
  Lock,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface MedicalRecord {
  id: string;
  type: "prescription" | "report" | "vaccine" | "scan" | "other";
  title: string;
  description: string;
  date: string;
  size: string;
  encrypted: boolean;
  ipfsHash: string;
  lighthouse_cid: string;
  uploadedBy: string;
  tags: string[];
  isShared: boolean;
  healthWorkerInfo?: {
    name: string;
    phone: string;
    specialization: string;
    hospital?: string;
  };
  medicalData?: {
    diagnosis: string;
    symptoms: string[];
    treatment: string;
    medications: string[];
    notes?: string;
  };
}

export default function PrescriptionLockerPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false); // Fetch real data from APIs
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        console.log("Fetching medical records from API...");

        // First try to get user's phone number from auth
        if (!user?.phone) {
          console.log("No phone number found in user auth");
          setLoading(false);
          return;
        }

        console.log("🔍 Fetching patient records for phone:", user.phone);

        // Use the same API as patient dashboard that includes medical records from health workers
        const response = await fetch(
          `/api/patient/records?phone=${user.phone}`
        );
        const result = await response.json();

        console.log("📋 Patient API Response:", result);

        if (result.success && result.data) {
          console.log(
            "Processing medical records:",
            result.data.medicalRecords?.length || 0
          );
          console.log(
            "Processing uploaded documents:",
            result.data.uploadedDocuments?.length || 0
          ); // Transform medical records assigned by health workers into document format
          const medicalRecordDocs = (result.data.medicalRecords || []).map(
            (record: any) => ({
              id: record.id,
              type: "report" as const,
              title: `Medical Report - ${record.diagnosis}`,
              description: `Symptoms: ${
                record.symptoms?.join(", ") || "N/A"
              }\nTreatment: ${record.treatment}\nBy: ${
                record.healthWorker?.user?.name || "Health Worker"
              }`,
              date: new Date(record.createdAt).toLocaleDateString(),
              size: "Medical Record",
              encrypted: record.encrypted || true, // Health worker records are encrypted by default
              ipfsHash: record.cid || "",
              lighthouse_cid: record.cid || "",
              uploadedBy: record.healthWorker?.user?.name || "Health Worker",
              tags: ["medical-record", "health-worker", "blockchain-verified"],
              isShared: true,
              healthWorkerInfo: {
                name: record.healthWorker?.user?.name,
                phone: record.healthWorker?.user?.phone,
                specialization: record.healthWorker?.specialization,
                hospital: record.healthWorker?.hospital,
              },
              medicalData: {
                diagnosis: record.diagnosis,
                symptoms: record.symptoms,
                treatment: record.treatment,
                medications: record.medications,
                notes: record.notes,
              },
            })
          );

          // Transform uploaded documents
          const uploadedDocs = (result.data.uploadedDocuments || []).map(
            (doc: any) => ({
              id: doc.id,
              type: doc.type || "other",
              title: doc.title || "Untitled Document",
              description: doc.description || "",
              date: new Date(doc.createdAt).toLocaleDateString(),
              size: doc.size || "0 KB",
              encrypted: doc.encrypted || false,
              ipfsHash: doc.ipfsHash || doc.lighthouse_cid || "",
              lighthouse_cid: doc.lighthouse_cid || doc.ipfsHash || "",
              uploadedBy: "You",
              tags: doc.tags || [],
              isShared: doc.isShared || false,
            })
          );

          // Combine both types of records
          const allRecords = [...medicalRecordDocs, ...uploadedDocs];
          console.log("Total records:", allRecords.length);
          console.log(
            "Medical records from health workers:",
            medicalRecordDocs.length
          );
          console.log("Uploaded documents:", uploadedDocs.length);

          setRecords(allRecords);
        } else {
          console.log("No records found or API error:", result);
          setRecords([]);
        }
      } catch (error) {
        console.error("Failed to fetch medical records:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRecords();
    }
  }, [isAuthenticated]);

  const filterTypes = [
    { value: "all", label: "All Records", icon: FileText },
    { value: "prescription", label: "Prescriptions", icon: FileText },
    { value: "report", label: "Lab Reports", icon: Heart },
    { value: "vaccine", label: "Vaccinations", icon: Syringe },
    { value: "scan", label: "Scans", icon: Eye },
    { value: "other", label: "Other", icon: FileText },
  ];
  const filteredRecords = records.filter((record) => {
    const matchesFilter =
      selectedFilter === "all" || record?.type === selectedFilter;
    const matchesSearch =
      (record?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record?.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (record?.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });
  const handleDownload = async (record: MedicalRecord) => {
    try {
      console.log(`Downloading record: ${record.lighthouse_cid}`);

      if (!record.lighthouse_cid) {
        alert("Cannot download: No IPFS hash available");
        return;
      }

      // Create download link using IPFS gateway
      const downloadUrl = `https://gateway.lighthouse.storage/ipfs/${record.lighthouse_cid}`;

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = record.title || "medical-record";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Download initiated for:", record.title);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const handleView = async (record: MedicalRecord) => {
    try {
      console.log(`Viewing record: ${record.lighthouse_cid}`);

      if (!record.lighthouse_cid) {
        alert("Cannot view: No IPFS hash available");
        return;
      }

      // Open IPFS link in new tab
      const viewUrl = `https://gateway.lighthouse.storage/ipfs/${record.lighthouse_cid}`;
      window.open(viewUrl, "_blank");

      console.log("Opened record for viewing:", record.title);
    } catch (error) {
      console.error("View failed:", error);
      alert("Failed to view record. Please try again.");
    }
  };

  const handleDelete = async (record: MedicalRecord) => {
    try {
      // Confirm deletion
      const confirmed = window.confirm(
        `Are you sure you want to delete "${record.title}"? This action cannot be undone.`
      );

      if (!confirmed) {
        return;
      }

      console.log(`Deleting record: ${record.id}`);

      // Call delete API
      const response = await fetch(`/api/patient/documents?id=${record.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setRecords((prevRecords) =>
          prevRecords.filter((r) => r.id !== record.id)
        );

        alert(`"${record.title}" has been deleted successfully.`);
        console.log("Record deleted successfully:", record.id);
      } else {
        throw new Error(result.error || "Failed to delete record");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete record. Please try again.");
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return FileText;
      case "report":
        return Heart;
      case "vaccine":
        return Syringe;
      case "scan":
        return Eye;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "prescription":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "report":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "vaccine":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30";
      case "scan":
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
            Please login to access your secure medical locker
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

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🔒 Secure Prescription Locker
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your medical records secured with blockchain technology
              </p>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-300">
                  🛡️ End-to-End Encrypted & Blockchain Secured
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your medical records are encrypted and stored on IPFS via
                  Lighthouse. Only you have access to your private key.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search records, descriptions, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Upload Button */}
            <Link href="/patient/upload">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Record
              </Button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterTypes.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedFilter === filter.value
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Records Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Loading your records...
            </span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No records found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Your secure medical locker is empty. Use the 'Upload New Record' button above to add your first medical document."}
            </p>
            {searchQuery || selectedFilter !== "all" ? (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilter("all");
                }}
                variant="outline"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => {
              const TypeIcon = getTypeIcon(record.type);
              const typeColorClass = getTypeColor(record.type);

              return (
                <div
                  key={record.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${typeColorClass}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>{" "}
                      <div className="flex items-center gap-2">
                        {record.encrypted && (
                          <div title="Encrypted">
                            <Lock className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                        {record.isShared && (
                          <div title="Shared with healthcare providers">
                            <Eye className="w-4 h-4 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {record.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {record.description}
                      </p>

                      {/* Metadata */}
                      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />{" "}
                          <span>
                            {record.date
                              ? new Date(record.date).toLocaleDateString()
                              : "N/A"}
                          </span>
                          <span>•</span>
                          <span>{record.size}</span>
                        </div>
                        <div>
                          <span>Uploaded by: {record.uploadedBy}</span>
                        </div>{" "}
                        <div className="flex flex-wrap gap-1">
                          {(record.tags || []).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>{" "}
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(record)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(record)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {/* Blockchain Info */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Shield className="w-3 h-3" />{" "}
                        <span>
                          CID:{" "}
                          {record.lighthouse_cid?.substring(0, 12) || "N/A"}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {records.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Records
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {records.filter((r) => r.encrypted).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Encrypted
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {records.filter((r) => r.isShared).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Shared</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {records
                  .reduce(
                    (sum, r) => sum + parseFloat(r.size.replace(/[^\d.]/g, "")),
                    0
                  )
                  .toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                MB Stored
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
