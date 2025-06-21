"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Heart,
  Thermometer,
  Scale,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Lock,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface PatientMonitoring {
  id: string;
  patientName: string;
  patientId: string;
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    weight: number;
    lastUpdated: string;
  };
  alerts: Array<{
    id: string;
    type: "critical" | "warning" | "info";
    message: string;
    timestamp: string;
  }>;
  status: "stable" | "attention" | "critical";
}

export default function MonitoringPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [patients, setPatients] = useState<PatientMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Fetch real data from APIs
  useEffect(() => {
    const fetchPatientMonitoring = async () => {
      try {
        // TODO: Replace with actual API calls
        // const response = await fetch('/api/health-worker/monitoring');
        // const data = await response.json();
        // setPatients(data);

        // Empty state until API is connected
        setPatients([]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch patient monitoring data:", error);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPatientMonitoring();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login as a health worker to access patient monitoring
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
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📊 Patient Monitoring
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time health monitoring and alerts
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: "all", label: "All Patients" },
            { value: "critical", label: "Critical" },
            { value: "attention", label: "Needs Attention" },
            { value: "stable", label: "Stable" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedFilter === filter.value
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Patient Monitoring Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded w-32 h-4 mb-4"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded w-full h-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Patients Being Monitored
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect with patients to start monitoring their health data
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patients will be displayed here when API is connected */}
          </div>
        )}
      </div>
    </div>
  );
}
