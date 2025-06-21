"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Syringe,
  Upload,
  Download,
  Calendar,
  Shield,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Lock,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface VaccinationRecord {
  id: string;
  vaccineName: string;
  manufacturer: string;
  batchNumber: string;
  dateAdministered: string;
  location: string;
  administrator: string;
  doseNumber: number;
  totalDoses: number;
  nextDueDate?: string;
  certificateUrl?: string;
  verified: boolean;
  notes: string;
  category: "routine" | "travel" | "emergency" | "covid" | "other";
}

export default function VaccinationPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  // Fetch real data from APIs
  useEffect(() => {
    const fetchVaccinations = async () => {
      try {
        // TODO: Replace with actual API calls
        // const response = await fetch('/api/patient/vaccinations');
        // const data = await response.json();
        // setVaccinations(data);

        // Temporary empty state until APIs are connected
        setVaccinations([]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch vaccinations:", error);
        setLoading(false);
      }
    };

    fetchVaccinations();
  }, []);

  const categories = [
    { value: "all", label: "All Vaccines", color: "gray" },
    { value: "covid", label: "COVID-19", color: "red" },
    { value: "routine", label: "Routine", color: "blue" },
    { value: "travel", label: "Travel", color: "green" },
    { value: "emergency", label: "Emergency", color: "orange" },
    { value: "other", label: "Other", color: "purple" },
  ];

  const filteredVaccinations = vaccinations.filter((vaccine) => {
    const matchesCategory =
      selectedCategory === "all" || vaccine.category === selectedCategory;
    const matchesSearch =
      vaccine.vaccineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vaccine.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vaccine.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const categoryConfig = categories.find((c) => c.value === category);
    const color = categoryConfig?.color || "gray";

    switch (color) {
      case "red":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      case "blue":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "green":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "orange":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30";
      case "purple":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const isVaccineDue = (nextDueDate?: string) => {
    if (!nextDueDate) return false;
    const dueDate = new Date(nextDueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue <= 30 && daysUntilDue >= 0;
  };

  const isVaccineOverdue = (nextDueDate?: string) => {
    if (!nextDueDate) return false;
    const dueDate = new Date(nextDueDate);
    const today = new Date();
    return dueDate < today;
  };

  const downloadCertificate = (vaccine: VaccinationRecord) => {
    if (vaccine.certificateUrl) {
      window.open(vaccine.certificateUrl, "_blank");
    } else {
      alert("Certificate not available for this vaccination");
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
            Please login to access your vaccination records
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
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <Syringe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  💉 Vaccination Records
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your immunization history and upcoming vaccinations
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vaccination
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {vaccinations.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Vaccines
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {vaccinations.filter((v) => v.verified).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verified
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {
                    vaccinations.filter((v) => isVaccineDue(v.nextDueDate))
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Due Soon
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {
                    vaccinations.filter((v) => isVaccineOverdue(v.nextDueDate))
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overdue
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
                placeholder="Search vaccines, manufacturers, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Upload Button */}
            <Link href="/patient/upload">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Certificate
              </Button>
            </Link>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.value
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vaccinations List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Loading vaccination records...
            </span>
          </div>
        ) : filteredVaccinations.length === 0 ? (
          <div className="text-center py-12">
            <Syringe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No vaccination records found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Add your first vaccination record to get started"}
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Vaccination
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVaccinations.map((vaccine) => {
              const categoryColorClass = getCategoryColor(vaccine.category);
              const isDue = isVaccineDue(vaccine.nextDueDate);
              const isOverdue = isVaccineOverdue(vaccine.nextDueDate);

              return (
                <div
                  key={vaccine.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      {/* Left side - Main info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${categoryColorClass}`}>
                          <Syringe className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {vaccine.vaccineName}
                            </h3>
                            {vaccine.verified && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                  Verified
                                </span>
                              </div>
                            )}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColorClass}`}
                            >
                              {
                                categories.find(
                                  (c) => c.value === vaccine.category
                                )?.label
                              }
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Manufacturer
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {vaccine.manufacturer}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Batch Number
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {vaccine.batchNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Date Administered
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(
                                  vaccine.dateAdministered
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Dose
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {vaccine.doseNumber} of {vaccine.totalDoses}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>📍 {vaccine.location}</span>
                            <span>👨‍⚕️ {vaccine.administrator}</span>
                          </div>

                          {vaccine.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                              "{vaccine.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {vaccine.certificateUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadCertificate(vaccine)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Certificate
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Next Due Date Alert */}
                    {vaccine.nextDueDate && (
                      <div
                        className={`p-3 rounded-lg ${
                          isOverdue
                            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            : isDue
                            ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                            : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isOverdue ? (
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          ) : isDue ? (
                            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                isOverdue
                                  ? "text-red-800 dark:text-red-200"
                                  : isDue
                                  ? "text-orange-800 dark:text-orange-200"
                                  : "text-blue-800 dark:text-blue-200"
                              }`}
                            >
                              {isOverdue
                                ? "⚠️ Next dose overdue!"
                                : isDue
                                ? "🔔 Next dose due soon!"
                                : "📅 Next dose scheduled"}
                            </p>
                            <p
                              className={`text-xs ${
                                isOverdue
                                  ? "text-red-600 dark:text-red-400"
                                  : isDue
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              Due:{" "}
                              {new Date(
                                vaccine.nextDueDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Form Modal (placeholder) */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add New Vaccination Record
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Vaccination form would go here...
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button className="flex-1">Add Vaccination</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
