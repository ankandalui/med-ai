"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Bell,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Heart,
  Pill,
  Stethoscope,
  Syringe,
  Lock,
  BellRing,
} from "lucide-react";
import Link from "next/link";

interface HealthReminder {
  id: string;
  type:
    | "medication"
    | "appointment"
    | "checkup"
    | "vaccination"
    | "exercise"
    | "other";
  title: string;
  description: string;
  date: string;
  time: string;
  frequency: "once" | "daily" | "weekly" | "monthly" | "yearly";
  status: "active" | "completed" | "missed" | "snoozed";
  priority: "high" | "medium" | "low";
  createdAt: string;
  lastNotified?: string;
}

export default function HealthRemindersPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState<HealthReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<HealthReminder | null>(
    null
  );

  // Fetch real data from APIs
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        // TODO: Replace with actual API calls
        // const response = await fetch('/api/patient/reminders');
        // const data = await response.json();
        // setReminders(data);

        // Empty state until API is connected
        setReminders([]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch reminders:", error);
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const reminderTypes = [
    { value: "medication", label: "Medication", icon: Pill, color: "blue" },
    {
      value: "appointment",
      label: "Appointment",
      icon: Stethoscope,
      color: "green",
    },
    { value: "checkup", label: "Health Check", icon: Heart, color: "red" },
    {
      value: "vaccination",
      label: "Vaccination",
      icon: Syringe,
      color: "purple",
    },
    { value: "exercise", label: "Exercise", icon: Clock, color: "orange" },
    { value: "other", label: "Other", icon: Bell, color: "gray" },
  ];

  const filterOptions = [
    { value: "all", label: "All Reminders" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "missed", label: "Missed" },
    { value: "today", label: "Today" },
    { value: "upcoming", label: "Upcoming" },
  ];

  const filteredReminders = reminders.filter((reminder) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "today") {
      return reminder.date === new Date().toISOString().split("T")[0];
    }
    if (selectedFilter === "upcoming") {
      return new Date(reminder.date) > new Date();
    }
    return reminder.status === selectedFilter;
  });

  const getTypeIcon = (type: string) => {
    return reminderTypes.find((t) => t.value === type)?.icon || Bell;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = reminderTypes.find((t) => t.value === type);
    const color = typeConfig?.color || "gray";

    switch (color) {
      case "blue":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "green":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "red":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      case "purple":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30";
      case "orange":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "completed":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "missed":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      case "snoozed":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-orange-600 dark:text-orange-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const markAsCompleted = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, status: "completed" as const }
          : reminder
      )
    );
  };

  const snoozeReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, status: "snoozed" as const }
          : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
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
            Please login to manage your health reminders
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
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/patient">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Mobile-first responsive header */}
          <div className="space-y-4 sm:space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  Health Reminders
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Stay on top of your health with smart reminders
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {reminders.filter((r) => r.status === "active").length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Active
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {
                    reminders.filter(
                      (r) => r.date === new Date().toISOString().split("T")[0]
                    ).length
                  }
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Today
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {reminders.filter((r) => r.status === "missed").length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Missed
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {reminders.filter((r) => r.status === "completed").length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Done
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition-all duration-200 ${
                  selectedFilter === filter.value
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Loading reminders...
            </span>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No reminders found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedFilter === "all"
                ? "Create your first health reminder to get started"
                : `No ${selectedFilter} reminders at the moment`}
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Reminder
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => {
              const TypeIcon = getTypeIcon(reminder.type);
              const typeColorClass = getTypeColor(reminder.type);
              const statusColorClass = getStatusColor(reminder.status);
              const priorityColorClass = getPriorityColor(reminder.priority);

              return (
                <div
                  key={reminder.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      {/* Left side - Icon and content */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${typeColorClass}`}
                        >
                          <TypeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {reminder.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}
                              >
                                {reminder.status.charAt(0).toUpperCase() +
                                  reminder.status.slice(1)}
                              </span>
                              <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColorClass.replace(
                                  "text-",
                                  "bg-"
                                )}`}
                              ></div>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                            {reminder.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>
                                {new Date(reminder.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{reminder.time}</span>
                            </div>
                            <span className="capitalize">
                              {reminder.frequency}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                        {reminder.status === "active" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsCompleted(reminder.id)}
                              className="text-green-600 hover:text-green-700 text-xs sm:text-sm px-2 sm:px-3"
                            >
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="hidden sm:inline">Done</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => snoozeReminder(reminder.id)}
                              className="text-orange-600 hover:text-orange-700 text-xs sm:text-sm px-2 sm:px-3"
                            >
                              <BellRing className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="hidden sm:inline">Snooze</span>
                            </Button>
                          </>
                        )}

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingReminder(reminder)}
                            className="p-1 sm:p-2"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReminder(reminder.id)}
                            className="text-red-500 hover:text-red-700 p-1 sm:p-2"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Additional info for high priority or overdue */}
                    {(reminder.priority === "high" ||
                      reminder.status === "missed") && (
                      <div
                        className={`p-3 rounded-lg ${
                          reminder.status === "missed"
                            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            : "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle
                            className={`w-4 h-4 ${
                              reminder.status === "missed"
                                ? "text-red-600 dark:text-red-400"
                                : "text-orange-600 dark:text-orange-400"
                            }`}
                          />
                          <p
                            className={`text-sm font-medium ${
                              reminder.status === "missed"
                                ? "text-red-800 dark:text-red-200"
                                : "text-orange-800 dark:text-orange-200"
                            }`}
                          >
                            {reminder.status === "missed"
                              ? "This reminder was missed. Please take action."
                              : "High priority - Don't forget this important task!"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Form Modal (frontend only) */}
        {(showAddForm || editingReminder) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingReminder ? "Edit Reminder" : "Add New Reminder"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowAddForm(false);
                  setEditingReminder(null);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g. Take medicine, Doctor appointment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {reminderTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Frequency
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Add any notes or instructions..."
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingReminder(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingReminder ? "Update" : "Create"} Reminder
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
