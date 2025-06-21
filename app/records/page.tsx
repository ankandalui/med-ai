"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Calendar,
  Clock,
  Lock,
  Plus,
  Stethoscope,
  Heart,
  Pill,
} from "lucide-react";
import Link from "next/link";

interface PatientRecord {
  id: string;
  patientName: string;
  patientId: string;
  recordType: "prescription" | "lab_report" | "scan" | "consultation" | "other";
  title: string;
  description: string;
  date: string;
  lastAccessed: string;
  fileSize: string;
  isEncrypted: boolean;
  status: "active" | "archived" | "pending";
}

export default function RecordsPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Fetch real data from APIs
  useEffect(() => {
    const fetchPatientRecords = async () => {
      try {
        // TODO: Replace with actual API calls
        // const response = await fetch('/api/health-worker/patient-records');
        // const data = await response.json();
        // setRecords(data);

        // Empty state until API is connected
        setRecords([]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch patient records:", error);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPatientRecords();
    }
  }, [isAuthenticated]);

  const recordTypes = [
    {
      value: "prescription",
      label: "Prescriptions",
      icon: Pill,
      color: "blue",
    },
    { value: "lab_report", label: "Lab Reports", icon: Heart, color: "green" },
    { value: "scan", label: "Medical Scans", icon: Eye, color: "purple" },
    {
      value: "consultation",
      label: "Consultations",
      icon: Stethoscope,
      color: "orange",
    },
    { value: "other", label: "Other", icon: FileText, color: "gray" },
  ];

  const filterOptions = [
    { value: "all", label: "All Records" },
    { value: "prescription", label: "Prescriptions" },
    { value: "lab_report", label: "Lab Reports" },
    { value: "scan", label: "Scans" },
    { value: "consultation", label: "Consultations" },
    { value: "recent", label: "Recent" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login as a health worker to access patient records
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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📋 Patient Records
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Access and manage patient medical records
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patient records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Records Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded w-32 h-4 mb-4"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded w-full h-16 mb-3"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded w-24 h-3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Patient Records Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Patient records will appear here when they share access with you
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Request Access
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Records will be displayed here when API is connected */}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {recordTypes.map((type) => (
            <div
              key={type.value}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    type.color === "blue"
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : type.color === "green"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : type.color === "purple"
                      ? "bg-purple-100 dark:bg-purple-900/30"
                      : type.color === "orange"
                      ? "bg-orange-100 dark:bg-orange-900/30"
                      : "bg-gray-100 dark:bg-gray-900/30"
                  }`}
                >
                  <type.icon
                    className={`w-5 h-5 ${
                      type.color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : type.color === "green"
                        ? "text-green-600 dark:text-green-400"
                        : type.color === "purple"
                        ? "text-purple-600 dark:text-purple-400"
                        : type.color === "orange"
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    0
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {type.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
