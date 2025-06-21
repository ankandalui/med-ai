"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Heart,
  Activity,
  Users,
  Plus,
  X,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Eye,
  Edit,
  Send,
  Loader2,
} from "lucide-react";

interface PatientMonitoring {
  id: string;
  patient: {
    user: {
      id: string;
      name: string;
      phone: string;
      email: string;
    };
  };
  status: string;
  symptoms?: string;
  diagnosis?: string;
  location?: string;
  age?: number;
  emergencyId?: string;
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  weight: number;
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    isRead: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface AddPatientForm {
  patientName: string;
  patientPhone: string;
  patientAge: string;
  location: string;
  symptoms: string;
  diagnosis: string;
  status: string;
  emergencyId?: string;
}

export default function MonitoringPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientMonitoring[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientMonitoring[]>(
    []
  );
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isSendingToHospital, setIsSendingToHospital] = useState(false);

  const [addPatientForm, setAddPatientForm] = useState<AddPatientForm>({
    patientName: "",
    patientPhone: "",
    patientAge: "",
    location: "",
    symptoms: "",
    diagnosis: "",
    status: "stable",
    emergencyId: "",
  }); // Check for auto-add emergency on page load
  useEffect(() => {
    const checkEmergencyData = async () => {
      const emergency = searchParams.get("emergency");
      const autoAdd = searchParams.get("auto_add");

      console.log("🔍 URL params:", { emergency, autoAdd });

      if (autoAdd === "true") {
        // Auto-open add dialog
        setShowAddDialog(true);

        // Check if we have a specific emergency ID
        if (emergency && emergency !== "critical") {
          console.log(
            "🚨 FETCHING SPECIFIC EMERGENCY FROM DATABASE:",
            emergency
          );

          try {
            // Fetch specific emergency from database
            const response = await fetch(
              `/api/emergency?emergencyId=${emergency}`
            );
            const result = await response.json();

            console.log("� DATABASE EMERGENCY FETCH:", result);
            if (result.success && result.data && result.data.length > 0) {
              const emergencyInfo = result.data[0];
              console.log(
                "✅ EMERGENCY INFO FOUND:",
                JSON.stringify(emergencyInfo, null, 2)
              );

              const formData = {
                patientName: "", // Let health worker enter patient name
                patientPhone: "", // Let health worker enter patient phone
                patientAge: "", // Let health worker enter patient age
                location: "", // Let health worker enter location
                symptoms: emergencyInfo.symptoms || "", // Pre-fill symptoms from AI analysis
                diagnosis: emergencyInfo.diagnosis || "", // Pre-fill diagnosis from AI analysis
                status: "critical", // Always set to critical for emergency
                emergencyId: emergencyInfo.emergencyId || "",
              };
              console.log(
                "✅ SETTING FORM DATA:",
                JSON.stringify(formData, null, 2)
              );
              setAddPatientForm(formData);
              setSelectedFilter("critical");
            } else {
              console.log("❌ NO EMERGENCY INFO FOUND FOR ID:", emergency);
            }
          } catch (error) {
            console.log("❌ Error fetching emergency data:", error);
          }
        } else if (emergency === "critical") {
          console.log("🚨 FETCHING LATEST PENDING EMERGENCY FROM DATABASE");

          try {
            // Fetch latest pending emergency from database
            const response = await fetch(
              "/api/emergency?status=PENDING&limit=1"
            );
            const result = await response.json();

            console.log("📋 DATABASE PENDING EMERGENCY FETCH:", result);
            if (result.success && result.data && result.data.length > 0) {
              const emergencyInfo = result.data[0];
              console.log(
                "✅ LATEST EMERGENCY INFO FOUND:",
                JSON.stringify(emergencyInfo, null, 2)
              );

              const formData = {
                patientName: "", // Let health worker enter patient name
                patientPhone: "", // Let health worker enter patient phone
                patientAge: "", // Let health worker enter patient age
                location: "", // Let health worker enter location
                symptoms: emergencyInfo.symptoms || "", // Pre-fill symptoms from AI analysis
                diagnosis: emergencyInfo.diagnosis || "", // Pre-fill diagnosis from AI analysis
                status: "critical", // Always set to critical for emergency
                emergencyId: emergencyInfo.emergencyId || "",
              };
              console.log(
                "✅ SETTING FORM DATA:",
                JSON.stringify(formData, null, 2)
              );
              setAddPatientForm(formData);
              setSelectedFilter("critical");
            } else {
              console.log("❌ NO PENDING EMERGENCIES FOUND");
            }
          } catch (error) {
            console.log("❌ Error fetching pending emergencies:", error);
          }
        }
      }
    }; // Run the check
    checkEmergencyData();
  }, [searchParams]);
  // Filter patients
  useEffect(() => {
    console.log("🔍 FILTERING PATIENTS:");
    console.log("  Total patients:", patients.length);
    console.log("  Selected filter:", selectedFilter);
    console.log("  Search term:", searchTerm);

    let filtered = patients;

    if (selectedFilter !== "all") {
      console.log("  Applying status filter:", selectedFilter);
      filtered = filtered.filter((p) => p.status === selectedFilter);
      console.log("  After status filter:", filtered.length);
    }

    if (searchTerm) {
      console.log("  Applying search filter:", searchTerm);
      filtered = filtered.filter(
        (p) =>
          p.patient.user.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.patient.user.phone.includes(searchTerm)
      );
      console.log("  After search filter:", filtered.length);
    }

    console.log("✅ FINAL FILTERED PATIENTS:", filtered.length);
    setFilteredPatients(filtered);
  }, [patients, selectedFilter, searchTerm]);
  // Fetch patients
  useEffect(() => {
    console.log("🚀 COMPONENT MOUNTED - FETCHING PATIENTS");
    fetchPatients();
  }, []);
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const apiUrl = `/api/health-worker/monitoring`;
      console.log("🔍 FETCHING ALL PATIENTS FROM:", apiUrl);

      const response = await fetch(apiUrl);
      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      const data = await response.json();
      console.log(
        "📥 API Response:",
        data.success ? `${data.data?.length || 0} patients` : data.error
      );

      if (data.success) {
        console.log("✅ PATIENTS FETCHED:", data.data?.length || 0);
        setPatients(data.data || []);
      } else {
        console.error("❌ Failed to fetch patients:", data.error);
      }
    } catch (error) {
      console.error("❌ Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddPatient = async () => {
    console.log("� HANDLE ADD PATIENT CALLED");
    console.log(
      "�🔍 Current form state:",
      JSON.stringify(addPatientForm, null, 2)
    );

    // Detailed validation logging
    console.log("🔍 Field validation:");
    console.log(
      "  patientName:",
      addPatientForm.patientName ? "✅" : "❌ MISSING"
    );
    console.log(
      "  patientPhone:",
      addPatientForm.patientPhone ? "✅" : "❌ MISSING"
    );
    console.log("  symptoms:", addPatientForm.symptoms ? "✅" : "❌ MISSING");
    console.log("  diagnosis:", addPatientForm.diagnosis ? "✅" : "❌ MISSING");
    console.log("  status:", addPatientForm.status);
    console.log("  emergencyId:", addPatientForm.emergencyId);

    if (
      !addPatientForm.patientName ||
      !addPatientForm.patientPhone ||
      !addPatientForm.symptoms ||
      !addPatientForm.diagnosis
    ) {
      console.log("❌ VALIDATION FAILED - Missing required fields");
      alert(
        "Please fill in all required fields (Name, Phone, Symptoms, Diagnosis)"
      );
      return;
    }

    console.log("✅ VALIDATION PASSED - All required fields present");

    try {
      setIsAddingPatient(true);

      const requestData = {
        patientName: addPatientForm.patientName,
        patientPhone: addPatientForm.patientPhone,
        patientAge: addPatientForm.patientAge,
        patientLocation: addPatientForm.location,
        symptoms: addPatientForm.symptoms,
        diagnosis: addPatientForm.diagnosis,
        status: addPatientForm.status,
        emergencyId: addPatientForm.emergencyId,
        healthWorkerPhone: "7074757878",
      };

      console.log("📤 Sending to API:", JSON.stringify(requestData, null, 2));

      const response = await fetch("/api/health-worker/monitoring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      const data = await response.json();
      console.log("📥 API Response:", JSON.stringify(data, null, 2));

      if (data.success) {
        console.log("✅ PATIENT ADDED SUCCESSFULLY");
        console.log("🎉 Message:", data.message);
        if (data.authoritiesNotified) {
          console.log("🚨 AUTHORITIES NOTIFIED");
          console.log("📞 Emergency contacts:", data.emergencyContacts);
        }

        alert("✅ Patient added successfully!");
        setShowAddDialog(false);
        setAddPatientForm({
          patientName: "",
          patientPhone: "",
          patientAge: "",
          location: "",
          symptoms: "",
          diagnosis: "",
          status: "stable",
          emergencyId: "",
        });
        fetchPatients();
      } else {
        console.log("❌ API ERROR:", data.error);
        alert("Failed to add patient: " + data.error);
      }
    } catch (error) {
      console.log("❌ NETWORK ERROR:", error);
      alert("Failed to add patient - Network error");
    } finally {
      setIsAddingPatient(false);
    }
  };
  const handleSendToHospital = async (patient: PatientMonitoring) => {
    if (
      !confirm(
        `Send ${patient.patient.user.name}'s details to hospital and ambulance?`
      )
    ) {
      return;
    }

    try {
      setIsSendingToHospital(true);

      // Log the hospital transmission
      console.clear();
      console.log("🏥 SENDING PATIENT DETAILS TO HOSPITAL...");
      console.log("📞 From Health Worker: 7074757878");
      console.log("🏥 To Hospital: 8100752679");
      console.log("🚑 To Ambulance: 8653015622");
      console.warn("👤 Patient:", patient.patient.user.name);
      console.log("📱 Patient Phone:", patient.patient.user.phone);
      console.log("🩺 Diagnosis:", patient.diagnosis);
      console.warn("⚠️ Status:", patient.status.toUpperCase());

      // Actually call the API to send to authorities
      const response = await fetch("/api/health-worker/send-to-hospital", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.patient.user.name,
          patientPhone: patient.patient.user.phone,
          symptoms: patient.symptoms,
          diagnosis: patient.diagnosis,
          emergencyId: patient.emergencyId,
          healthWorkerPhone: "7074757878",
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ SUCCESSFULLY SENT TO HOSPITAL & AMBULANCE");
        alert(
          "✅ Patient details sent to hospital (8100752679) and ambulance (8653015622)!"
        );
      } else {
        console.error("❌ API Error:", data.error);
        alert("❌ Failed to send to hospital: " + data.error);
      }
    } catch (error) {
      console.error("❌ Failed to send to hospital:", error);
      alert("❌ Failed to send to hospital");
    } finally {
      setIsSendingToHospital(false);
    }
  };

  const handleStatusChange = async (patientId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/health-worker/monitoring", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: patientId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchPatients();
        alert(`Patient status updated to ${newStatus}`);
      } else {
        alert("Failed to update status: " + data.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
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
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "stable":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-3 md:px-4 pt-20 md:pt-24 pb-20 md:pb-8">
        {/* Header */}{" "}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div>
            {" "}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("pages.monitoring.title")}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              {t("pages.monitoring.subtitle")}
            </p>
          </div>
          <div className="w-full md:w-auto">
            <Button
              onClick={() => setShowAddDialog(true)}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t("pages.monitoring.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "critical", "attention", "stable"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className={`capitalize flex-1 min-w-0 sm:flex-none ${
                    filter === "critical"
                      ? "hover:bg-red-50 hover:text-red-700 border-red-200"
                      : filter === "attention"
                      ? "hover:bg-yellow-50 hover:text-yellow-700 border-yellow-200"
                      : filter === "stable"
                      ? "hover:bg-green-50 hover:text-green-700 border-green-200"
                      : ""
                  }`}
                >
                  {filter === "all"
                    ? t("pages.monitoring.filters.all")
                    : filter === "critical"
                    ? t("pages.monitoring.filters.critical")
                    : filter === "attention"
                    ? t("pages.monitoring.filters.attention")
                    : filter === "stable"
                    ? t("pages.monitoring.filters.stable")
                    : filter}
                </Button>
              ))}
            </div>
          </div>
        </div>{" "}
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Total
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {patients.length}
                </p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                {" "}
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  {t("pages.monitoring.filters.critical")}
                </p>
                <p className="text-xl md:text-2xl font-bold text-red-600">
                  {patients.filter((p) => p.status === "critical").length}
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                {" "}
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  {t("pages.monitoring.filters.attention")}
                </p>
                <p className="text-xl md:text-2xl font-bold text-yellow-600">
                  {patients.filter((p) => p.status === "attention").length}
                </p>
              </div>
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Stable
                </p>
                <p className="text-xl md:text-2xl font-bold text-green-600">
                  {patients.filter((p) => p.status === "stable").length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            </div>
          </Card>
        </div>{" "}
        {/* Patient List */}
        <div className="space-y-3 md:space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading patients...
              </p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Patients Being Monitored
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 px-4">
                Connect with patients to start monitoring their health data
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="p-4 md:p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {patient.patient.user.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(
                          patient.status
                        )}`}
                      >
                        {getStatusIcon(patient.status)}
                        {patient.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {patient.patient.user.phone}
                        </span>
                      </div>
                      {patient.age && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>Age: {patient.age}</span>
                        </div>
                      )}
                      {patient.location && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{patient.location}</span>
                        </div>
                      )}
                      {patient.emergencyId && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs">
                            Emergency ID: {patient.emergencyId}
                          </span>
                        </div>
                      )}
                    </div>

                    {patient.symptoms && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Symptoms:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {patient.symptoms}
                        </p>
                      </div>
                    )}

                    {patient.diagnosis && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Diagnosis:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {patient.diagnosis}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(patient.id, "stable")}
                        disabled={patient.status === "stable"}
                        className="text-green-600 border-green-300 hover:bg-green-50 text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Stable
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(patient.id, "attention")
                        }
                        disabled={patient.status === "attention"}
                        className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 text-xs"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Attention
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(patient.id, "critical")
                        }
                        disabled={patient.status === "critical"}
                        className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Critical
                      </Button>
                    </div>

                    {patient.status === "critical" && (
                      <Button
                        size="sm"
                        onClick={() => handleSendToHospital(patient)}
                        disabled={isSendingToHospital}
                        className="bg-red-600 hover:bg-red-700 text-white w-full"
                      >
                        {isSendingToHospital ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send to Hospital
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>{" "}
      {/* Add Patient Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  Add Patient to Monitoring
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddDialog(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientName">Patient Name *</Label>
                      <Input
                        id="patientName"
                        value={addPatientForm.patientName}
                        onChange={(e) =>
                          setAddPatientForm({
                            ...addPatientForm,
                            patientName: e.target.value,
                          })
                        }
                        placeholder="Enter patient name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientPhone">Phone Number *</Label>
                      <Input
                        id="patientPhone"
                        value={addPatientForm.patientPhone}
                        onChange={(e) =>
                          setAddPatientForm({
                            ...addPatientForm,
                            patientPhone: e.target.value,
                          })
                        }
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientAge">Age</Label>
                      <Input
                        id="patientAge"
                        value={addPatientForm.patientAge}
                        onChange={(e) =>
                          setAddPatientForm({
                            ...addPatientForm,
                            patientAge: e.target.value,
                          })
                        }
                        placeholder="Enter age"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={addPatientForm.location}
                        onChange={(e) =>
                          setAddPatientForm({
                            ...addPatientForm,
                            location: e.target.value,
                          })
                        }
                        placeholder="Enter location"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="symptoms">Symptoms *</Label>
                    <Textarea
                      id="symptoms"
                      value={addPatientForm.symptoms}
                      onChange={(e) =>
                        setAddPatientForm({
                          ...addPatientForm,
                          symptoms: e.target.value,
                        })
                      }
                      placeholder="Describe symptoms"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="diagnosis">Diagnosis *</Label>
                    <Textarea
                      id="diagnosis"
                      value={addPatientForm.diagnosis}
                      onChange={(e) =>
                        setAddPatientForm({
                          ...addPatientForm,
                          diagnosis: e.target.value,
                        })
                      }
                      placeholder="Enter diagnosis"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <select
                      id="status"
                      value={addPatientForm.status}
                      onChange={(e) =>
                        setAddPatientForm({
                          ...addPatientForm,
                          status: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="stable">Stable</option>
                      <option value="attention">Needs Attention</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {addPatientForm.emergencyId && (
                    <div>
                      <Label htmlFor="emergencyId">Emergency ID</Label>
                      <Input
                        id="emergencyId"
                        value={addPatientForm.emergencyId}
                        readOnly
                        className="bg-gray-100 dark:bg-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddPatient}
                  disabled={isAddingPatient}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 order-2 sm:order-1"
                >
                  {isAddingPatient ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {addPatientForm.status === "critical"
                    ? "Send to Hospital/Authorities"
                    : "Add Patient"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 order-1 sm:order-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
