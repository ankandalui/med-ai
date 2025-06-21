"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Activity,
  Brain,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  User,
  Lock,
  Stethoscope,
  Heart,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingReports: number;
  criticalAlerts: number;
}

interface RecentActivity {
  id: string;
  type: "appointment" | "diagnosis" | "report" | "alert";
  patientName: string;
  description: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
}

export default function HealthWorkerDashboard() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    criticalAlerts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual API calls
        // const statsResponse = await fetch('/api/health-worker/stats');
        // const activityResponse = await fetch('/api/health-worker/recent-activity');
        //
        // const statsData = await statsResponse.json();
        // const activityData = await activityResponse.json();
        //
        // setStats(statsData);
        // setRecentActivity(activityData);

        // Empty state until API is connected
        setStats({
          totalPatients: 0,
          todayAppointments: 0,
          pendingReports: 0,
          criticalAlerts: 0,
        });
        setRecentActivity([]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
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
            Please login as a health worker to access the dashboard
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
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome, Dr. {user?.name?.split(" ")[0] || "Health Worker"}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your health worker dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPatients}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Patients
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.todayAppointments}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Today's Appointments
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingReports}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Reports
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.criticalAlerts}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Critical Alerts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* AI Tools */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      🤖 AI Medical Tools
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Advanced AI-powered diagnostic tools
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/symptom-prediction">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                          Symptom Analysis
                        </h4>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        AI-powered symptom analysis with voice input and
                        multilingual support
                      </p>
                    </div>
                  </Link>

                  <Link href="/disease-prediction">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-semibold text-green-900 dark:text-green-300">
                          Disease Prediction
                        </h4>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ML-based disease prediction from skin images and
                        symptoms
                      </p>
                    </div>
                  </Link>

                  <Link href="/ai">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="font-semibold text-purple-900 dark:text-purple-300">
                          AI Hub
                        </h4>
                      </div>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        Access all AI diagnostic tools in one place
                      </p>
                    </div>
                  </Link>

                  <Link href="/diagnosis">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Stethoscope className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h4 className="font-semibold text-orange-900 dark:text-orange-300">
                          Diagnosis Hub
                        </h4>
                      </div>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        Comprehensive diagnostic tools and analysis
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </h3>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded w-full h-16"></div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      No recent activity
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Activity will appear here when available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-1.5 rounded-lg ${
                              activity.type === "appointment"
                                ? "bg-blue-100 dark:bg-blue-900/30"
                                : activity.type === "diagnosis"
                                ? "bg-green-100 dark:bg-green-900/30"
                                : activity.type === "report"
                                ? "bg-purple-100 dark:bg-purple-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                            }`}
                          >
                            {activity.type === "appointment" && (
                              <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            )}
                            {activity.type === "diagnosis" && (
                              <Brain className="w-3 h-3 text-green-600 dark:text-green-400" />
                            )}
                            {activity.type === "report" && (
                              <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            )}
                            {activity.type === "alert" && (
                              <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {activity.patientName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {activity.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/monitoring">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Patient Monitoring
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Monitor patient vital signs and health metrics
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {stats.totalPatients} patients
                </span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link href="/records">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Patient Records
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Access and manage patient medical records
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Secure access
                </span>
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link href="/profile">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Profile Settings
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Manage your professional profile and settings
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Update profile
                </span>
                <User className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
