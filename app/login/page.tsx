"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Phone, Shield, X, User, UserCheck, AlertCircle } from "lucide-react";

interface LoginData {
  mobileNumber: string;
  otp: string;
  isOTPSent: boolean;
  isVerifying: boolean;
  resendTimer: number;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [userType, setUserType] = useState<"patient" | "health-worker">(
    "patient"
  );
  const [loginData, setLoginData] = useState<LoginData>({
    mobileNumber: "",
    otp: "",
    isOTPSent: false,
    isVerifying: false,
    resendTimer: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateMobileNumber = (mobile: string): boolean => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const validateOTP = (otp: string): boolean => {
    return /^\d{6}$/.test(otp);
  };

  const sendOTP = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!loginData.mobileNumber) {
      newErrors.mobileNumber = t(
        "signup.validationErrors.mobileNumberRequired"
      );
    } else if (!validateMobileNumber(loginData.mobileNumber)) {
      newErrors.mobileNumber = t("signup.validationErrors.invalidMobileNumber");
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: loginData.mobileNumber,
          email: `${loginData.mobileNumber}@temp.com`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      } // Store token
      localStorage.setItem("token", data.token);

      // Store user data if available
      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
      }

      if (data.otpBypass) {
        // If OTP is bypassed, redirect directly to profile
        router.push("/profile");
      } else {
        // Show OTP form
        setLoginData((prev) => ({ ...prev, isOTPSent: true, resendTimer: 30 }));

        // Start countdown timer
        const timer = setInterval(() => {
          setLoginData((prev) => {
            if (prev.resendTimer <= 1) {
              clearInterval(timer);
              return { ...prev, resendTimer: 0 };
            }
            return { ...prev, resendTimer: prev.resendTimer - 1 };
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrors({
        general: error instanceof Error ? error.message : "Login failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOTPAndLogin = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!loginData.otp) {
      newErrors.otp = t("signup.validationErrors.otpRequired");
    } else if (!validateOTP(loginData.otp)) {
      newErrors.otp = t("signup.validationErrors.invalidOTP");
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoginData((prev) => ({ ...prev, isVerifying: true }));
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: `${loginData.mobileNumber}@temp.com`,
          phone: loginData.mobileNumber,
          otp: loginData.otp,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      // Store user data if available
      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
      }

      // Redirect to profile page
      router.push("/profile");
    } catch (error) {
      console.error("Error logging in:", error);
      setErrors({
        otp: error instanceof Error ? error.message : "OTP verification failed",
      });
    } finally {
      setLoginData((prev) => ({ ...prev, isVerifying: false }));
    }
  };
  const resendOTP = async () => {
    setLoginData((prev) => ({ ...prev, resendTimer: 30 }));

    // For development, we'll just restart the timer since OTP is bypassed
    const timer = setInterval(() => {
      setLoginData((prev) => {
        if (prev.resendTimer <= 1) {
          clearInterval(timer);
          return { ...prev, resendTimer: 0 };
        }
        return { ...prev, resendTimer: prev.resendTimer - 1 };
      });
    }, 1000);
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>{" "}
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pt-20 pb-12 md:pt-24">
        {" "}
        <div className="w-full max-w-md">
          {/* Form Container */}
          <div className="bg-card backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden">
            {" "}
            <div className="p-8">
              {/* User Type Toggle */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {t("navbar.login")}
                  </h1>
                  <p className="text-muted-foreground">
                    Choose your account type and enter your mobile number
                  </p>
                </div>

                <div className="flex rounded-lg border border-border overflow-hidden mb-6">
                  <button
                    type="button"
                    onClick={() => setUserType("patient")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                      userType === "patient"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("health-worker")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                      userType === "health-worker"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Health Worker</span>
                  </button>
                </div>
              </div>

              <form className="space-y-6">
                {/* General Error Display */}
                {errors.general && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {errors.general}
                      </p>
                    </div>
                  </div>
                )}
                {/* Mobile Number */}
                <div className="space-y-2">
                  {" "}
                  <label className="text-sm font-semibold text-foreground flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    {t("signup.mobileNumber")}{" "}
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={loginData.mobileNumber}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          mobileNumber: e.target.value,
                        }))
                      }
                      placeholder={t("signup.mobileNumberPlaceholder")}
                      maxLength={10}
                      disabled={loginData.isOTPSent}
                      className="w-full px-4 py-4 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />{" "}
                    {errors.mobileNumber && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>{" "}
                  {errors.mobileNumber && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>
                {/* OTP Section */}{" "}
                {loginData.isOTPSent && (
                  <div className="bg-muted rounded-2xl p-6 border-2 border-border">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Phone className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {t("signup.verifyOTP")}
                      </h3>{" "}
                      <p className="text-sm text-muted-foreground">
                        {t("signup.otpSentTo")} +91 {loginData.mobileNumber}
                      </p>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
                        <p className="text-xs text-green-700 dark:text-green-300 text-center">
                          <strong>Development Mode:</strong> Use OTP code
                          "123456" for testing
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={loginData.otp}
                          onChange={(e) =>
                            setLoginData((prev) => ({
                              ...prev,
                              otp: e.target.value,
                            }))
                          }
                          placeholder={t("signup.otpPlaceholder")}
                          maxLength={6}
                          className="w-full px-4 py-4 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all text-center text-xl font-mono tracking-widest"
                        />{" "}
                        {errors.otp && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>{" "}
                      {errors.otp && (
                        <p className="text-sm text-red-500 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.otp}
                        </p>
                      )}
                      <div className="text-center">
                        {loginData.resendTimer > 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {t("signup.resendOTP")} {loginData.resendTimer}s
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={resendOTP}
                            className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                          >
                            {t("signup.resendOTP")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* Submit Button */}
                <div className="space-y-6">
                  {!loginData.isOTPSent ? (
                    <Button
                      type="button"
                      onClick={sendOTP}
                      disabled={isSubmitting}
                      className="w-full font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 shadow-xl"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          {t("signup.sendOTP")}...
                        </div>
                      ) : (
                        <>
                          <Phone className="w-5 h-5 mr-3" />
                          {t("signup.sendOTP")}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={verifyOTPAndLogin}
                      disabled={loginData.isVerifying}
                      className="w-full font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 shadow-xl"
                      size="lg"
                    >
                      {loginData.isVerifying ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          {t("navbar.login")}...
                        </div>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-3" />
                          {t("navbar.login")}
                        </>
                      )}
                    </Button>
                  )}

                  {/* API Error Message */}
                  {apiError && (
                    <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-destructive flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {apiError}
                        </p>
                        <button
                          onClick={() => setApiError(null)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sign Up Link */}
                  <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-600">
                    {" "}
                    <span className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                    </span>
                    <Link
                      href="/signup"
                      className="text-sm text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                    >
                      {t("navbar.signUp")}
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
