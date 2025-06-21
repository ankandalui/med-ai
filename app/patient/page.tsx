"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Upload,
  Download,
  Bell,
  Heart,
  Calendar,
  AlertCircle,
  FileText,
  Syringe,
  Phone,
  User,
  Lock,
  Plus,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "reminder" | "appointment" | "alert";
  title: string;
  message: string;
  date: string;
  priority: "high" | "medium" | "low";
}

export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    completedChecks: 0,
    pendingReminders: 0,
    secureStorage: 100,
  });
  const [emergencyInfo, setEmergencyInfo] = useState({
    name: "",
    bloodType: "",
    allergies: "",
    emergencyContact: "",
    medicalConditions: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch real data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual API calls
        // const notificationsResponse = await fetch('/api/patient/notifications');
        // const statsResponse = await fetch('/api/patient/stats');
        //
        // const notificationsData = await notificationsResponse.json();
        // const statsData = await statsResponse.json();
        //
        // setNotifications(notificationsData);
        // setStats({
        //   totalRecords: statsData.totalRecords,
        //   completedChecks: statsData.completedChecks,
        //   pendingReminders: statsData.pendingReminders,
        //   secureStorage: 100 // Always 100% for blockchain storage
        // });

        // Temporary empty state until APIs are connected
        setNotifications([]);
        setStats({
          totalRecords: 0,
          completedChecks: 0,
          pendingReminders: 0,
          secureStorage: 100,
        });
        setEmergencyInfo({
          name: user?.name || "",
          bloodType: "",
          allergies: "",
          emergencyContact: "",
          medicalConditions: "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user?.name]);

  // Fetch emergency info from API
  useEffect(() => {
    const fetchEmergencyInfo = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/patient/emergency-info');
        // const emergencyData = await response.json();
        // setEmergencyInfo(emergencyData);

        // Initialize with user data and empty values until API is connected
        setEmergencyInfo({
          name: user?.name || "",
          bloodType: "",
          allergies: "",
          emergencyContact: "",
          medicalConditions: "",
        });
      } catch (error) {
        console.error("Failed to fetch emergency info:", error);
      }
    };

    if (isAuthenticated) {
      fetchEmergencyInfo();
    }
  }, [isAuthenticated, user?.name]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to access your medical dashboard
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
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name?.split(" ")[0] || "Patient"}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your personal health dashboard
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalRecords}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Medical Records
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.completedChecks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed Checks
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingReminders}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Reminders
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.secureStorage}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Secure Storage
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg w-8 h-8"></div>
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-32 h-4"></div>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No notifications yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Notifications will appear here when available
                </p>
              </div>
            ) : (
              notifications.slice(0, 2).map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        notification.priority === "high"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : notification.priority === "medium"
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}
                    >
                      {notification.type === "appointment" && (
                        <Calendar
                          className={`w-4 h-4 ${
                            notification.priority === "high"
                              ? "text-red-600 dark:text-red-400"
                              : notification.priority === "medium"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        />
                      )}
                      {notification.type === "reminder" && (
                        <Clock
                          className={`w-4 h-4 ${
                            notification.priority === "high"
                              ? "text-red-600 dark:text-red-400"
                              : notification.priority === "medium"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        />
                      )}
                      {notification.type === "alert" && (
                        <AlertCircle
                          className={`w-4 h-4 ${
                            notification.priority === "high"
                              ? "text-red-600 dark:text-red-400"
                              : notification.priority === "medium"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {notification.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency Info Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    🚨 Emergency Info
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Critical medical information
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Name:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {emergencyInfo.name || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Blood Type:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {emergencyInfo.bloodType || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Emergency Contact:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {emergencyInfo.emergencyContact || "Not set"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/patient/emergency" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/patient/reminders">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Health Reminders
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Manage medication and appointment reminders
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {stats.pendingReminders} pending
                </span>
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link href="/patient/vaccination">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Syringe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Vaccination Records
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Track and manage your vaccination history
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  View records
                </span>
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Download Records
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Export your medical records securely
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
