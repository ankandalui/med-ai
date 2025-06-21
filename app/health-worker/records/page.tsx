"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Search,
  Calendar,
  User,
  Phone,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Filter,
  Download,
  Eye,
} from "lucide-react";

interface MedicalRecord {
  id: string;
  patientName: string;
  patientId: string;
  patientPhone: string;
  recordType: string;
  title: string;
  description: string;
  diagnosis: string;
  treatment?: string;
  medications?: string[];
  notes?: string;
  date: string;
  lastAccessed: string;
  status: string;
  healthWorker?: string;
  healthWorkerPhone?: string;
}

interface PatientMonitoring {
  id: string;
  patientName: string;
  patientId: string;
  patientPhone: string;
  recordType: string;
  title: string;
  description: string;
  diagnosis?: string;
  symptoms?: string;
  location?: string;
  age?: number;
  emergencyId?: string;
  status: string;
  heartRate?: number;
  bloodPressure?: string;
  temperature?: number;
  weight?: number;
  date: string;
  lastAccessed: string;
  healthWorkerPhone?: string;
  alerts?: any[];
}

export default function HealthWorkerRecordsPage() {
  const { t } = useTranslation();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [monitoringRecords, setMonitoringRecords] = useState<
    PatientMonitoring[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [searchTerm, selectedType]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedType !== "all") params.append("type", selectedType);

      const response = await fetch(`/api/health-worker/records?${params}`);
      const data = await response.json();
      if (data.success) {
        // Filter the records by type from the unified data array
        const allRecords = data.data || [];
        setMedicalRecords(
          allRecords.filter(
            (record: any) => record.recordType === "medical_record"
          )
        );
        setMonitoringRecords(
          allRecords.filter(
            (record: any) =>
              record.recordType === "monitoring" ||
              record.recordType === "emergency"
          )
        );
      } else {
        console.error("Failed to fetch records:", data.error);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "attention":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "stable":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "attention":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "stable":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const allRecords = [...medicalRecords, ...monitoringRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredRecords =
    selectedType === "all"
      ? allRecords
      : selectedType === "medical"
      ? medicalRecords
      : monitoringRecords;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-3 md:px-4 pt-20 md:pt-24 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Patient Records
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              View and manage all patient medical records and monitoring data
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by patient name or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "medical", "monitoring"].map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="capitalize flex-1 min-w-0 sm:flex-none"
                >
                  {type === "all"
                    ? "All Records"
                    : type === "medical"
                    ? "Medical Records"
                    : "Monitoring Records"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Total Records
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {allRecords.length}
                </p>
              </div>
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Medical Records
                </p>
                <p className="text-xl md:text-2xl font-bold text-green-600">
                  {medicalRecords.length}
                </p>
              </div>
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Monitoring Records
                </p>
                <p className="text-xl md:text-2xl font-bold text-orange-600">
                  {monitoringRecords.length}
                </p>
              </div>
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Records List */}
        <div className="space-y-3 md:space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading records...
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Records Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 px-4">
                No patient records match your current search criteria
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="p-4 md:p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        {" "}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {record.patientName}
                        </h3>
                        {"status" in record && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {getStatusIcon(record.status)}
                            {record.status.toUpperCase()}
                          </span>
                        )}{" "}
                        {record.recordType === "emergency" && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-300 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            EMERGENCY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(record.date)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{record.patientPhone}</span>
                      </div>
                      {"age" in record && record.age && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span>Age: {record.age}</span>
                        </div>
                      )}
                      {"location" in record && record.location && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{record.location}</span>
                        </div>
                      )}
                      {"emergencyId" in record && record.emergencyId && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs">
                            Emergency ID: {record.emergencyId}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {record.diagnosis && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Diagnosis:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {record.diagnosis}
                          </p>
                        </div>
                      )}

                      {"symptoms" in record && record.symptoms && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Symptoms:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {record.symptoms}
                          </p>
                        </div>
                      )}

                      {"treatment" in record && record.treatment && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Treatment:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {record.treatment}
                          </p>
                        </div>
                      )}

                      {"medications" in record && record.medications && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Medications:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {record.medications}
                          </p>
                        </div>
                      )}

                      {"notes" in record && record.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {record.notes}{" "}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
