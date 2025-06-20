"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageDropdown } from "@/components/language-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Upload,
  User,
  Phone,
  CreditCard,
  MapPin,
  Building,
  UserCheck,
  Camera,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface FormData {
  fullName: string;
  mobileNumber: string;
  aadharNumber: string;
  govHealthWorkerId: string;
  areaVillage: string;
  phcSubcenter: string;
  designation: string;
  profilePhoto: File | null;
  // Patient-specific fields
  gender: string;
  age: string;
  dateOfBirth: string;
  location: string;
  familyId: string;
}

interface FormErrors {
  [key: string]: string;
}

interface OTPData {
  otp: string;
  isOTPSent: boolean;
  isVerifying: boolean;
  resendTimer: number;
}

export default function SignUpPage() {
  const { t } = useTranslation();
  const [userType, setUserType] = useState<"patient" | "health-worker">("health-worker");  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobileNumber: "",
    aadharNumber: "",
    govHealthWorkerId: "",
    areaVillage: "",
    phcSubcenter: "",
    designation: "",
    profilePhoto: null,
    // Patient-specific fields
    gender: "",
    age: "",
    dateOfBirth: "",
    location: "",
    familyId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [otpData, setOTPData] = useState<OTPData>({
    otp: "",
    isOTPSent: false,
    isVerifying: false,
    resendTimer: 0,
  });
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const designationOptions = [
    { value: "ASHA", label: t("signup.designationOptions.ASHA") },
    { value: "ANM", label: t("signup.designationOptions.ANM") },
    { value: "GNM", label: t("signup.designationOptions.GNM") },
    { value: "MO", label: t("signup.designationOptions.MO") },
  ];

  // Validation functions
  const validateMobileNumber = (mobile: string): boolean => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const validateAadharNumber = (aadhar: string): boolean => {
    return /^\d{12}$/.test(aadhar);
  };

  const validateOTP = (otp: string): boolean => {
    return /^\d{6}$/.test(otp);
  };
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("signup.validationErrors.fullNameRequired");
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = t(
        "signup.validationErrors.mobileNumberRequired"
      );
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = t("signup.validationErrors.invalidMobileNumber");
    }

    if (!formData.aadharNumber) {
      newErrors.aadharNumber = t(
        "signup.validationErrors.aadharNumberRequired"
      );
    } else if (!validateAadharNumber(formData.aadharNumber)) {
      newErrors.aadharNumber = t("signup.validationErrors.invalidAadharNumber");
    }    // Only validate health worker fields when userType is "health-worker"
    if (userType === "health-worker") {
      if (!formData.govHealthWorkerId.trim()) {
        newErrors.govHealthWorkerId = t(
          "signup.validationErrors.govHealthWorkerIdRequired"
        );
      }

      if (!formData.areaVillage.trim()) {
        newErrors.areaVillage = t("signup.validationErrors.areaVillageRequired");
      }

      if (!formData.phcSubcenter.trim()) {
        newErrors.phcSubcenter = t(
          "signup.validationErrors.phcSubcenterRequired"
        );
      }

      if (!formData.designation) {
        newErrors.designation = t("signup.validationErrors.designationRequired");
      }
    }

    // Only validate patient fields when userType is "patient"
    if (userType === "patient") {
      if (!formData.gender) {
        newErrors.gender = t("signup.validationErrors.genderRequired");
      }

      if (!formData.age.trim()) {
        newErrors.age = t("signup.validationErrors.ageRequired");
      } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
        newErrors.age = t("signup.validationErrors.invalidAge");
      }

      if (!formData.location.trim()) {
        newErrors.location = t("signup.validationErrors.locationRequired");
      }
    }

    if (otpData.isOTPSent && !otpData.otp) {
      newErrors.otp = t("signup.validationErrors.otpRequired");
    } else if (otpData.isOTPSent && !validateOTP(otpData.otp)) {
      newErrors.otp = t("signup.validationErrors.invalidOTP");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhoto: null }));
    setProfilePhotoPreview(null);
  };

  const sendOTP = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call for OTP
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOTPData((prev) => ({ ...prev, isOTPSent: true, resendTimer: 30 }));

      // Start countdown timer
      const timer = setInterval(() => {
        setOTPData((prev) => {
          if (prev.resendTimer <= 1) {
            clearInterval(timer);
            return { ...prev, resendTimer: 0 };
          }
          return { ...prev, resendTimer: prev.resendTimer - 1 };
        });
      }, 1000);
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOTPAndCreateAccount = async () => {
    if (!validateForm()) return;

    setOTPData((prev) => ({ ...prev, isVerifying: true }));
    try {
      // Simulate API call for account creation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Redirect to dashboard or success page
      console.log("Account created successfully!");
    } catch (error) {
      console.error("Error creating account:", error);
    } finally {
      setOTPData((prev) => ({ ...prev, isVerifying: false }));
    }
  };

  const resendOTP = async () => {
    setOTPData((prev) => ({ ...prev, resendTimer: 30 }));
    await sendOTP();
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
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-12 md:pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Form Container */}
          <div className="bg-card backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-muted px-8 py-6 border-b">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      !otpData.isOTPSent
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-primary text-primary-foreground shadow-lg"
                    }`}
                  >
                    {!otpData.isOTPSent ? (
                      "1"
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {t("signup.title")}
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-border mx-4">
                  {" "}
                  <div
                    className={`h-full transition-all duration-500 ${
                      otpData.isOTPSent ? "bg-primary w-full" : "bg-primary w-0"
                    }`}
                  ></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      otpData.isOTPSent
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {t("signup.verifyOTP")}
                  </span>
                </div>
              </div>
            </div>            <div className="p-8 md:p-12">
              <form className="space-y-8">
                {/* User Type Toggle */}
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {t("signup.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      Choose your account type and fill in your details
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
                  
                  {userType === "patient" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Patient Registration:</strong> Please fill in your personal details. Health Worker fields will be hidden.
                      </p>
                    </div>
                  )}
                </div>

                {/* Profile Photo Section */}
                <div className="text-center">
                  <div className="relative inline-block">
                    {profilePhotoPreview ? (
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                        <Image
                          src={profilePhotoPreview}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-border hover:border-primary transition-colors cursor-pointer group">
                        <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    )}{" "}
                    <label
                      htmlFor="profilePhoto"
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                  </div>
                  <input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                    {t("signup.profilePhotoDesc")}
                  </p>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      {t("signup.fullName")}{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        placeholder={t("signup.fullNamePlaceholder")}
                        className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      {errors.fullName && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-blue-500" />
                      {t("signup.mobileNumber")}{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) =>
                          handleInputChange("mobileNumber", e.target.value)
                        }
                        placeholder={t("signup.mobileNumberPlaceholder")}
                        maxLength={10}
                        className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      {errors.mobileNumber && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.mobileNumber && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.mobileNumber}
                      </p>
                    )}
                  </div>

                  {/* Aadhar Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                      {t("signup.aadharNumber")}{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.aadharNumber}
                        onChange={(e) =>
                          handleInputChange("aadharNumber", e.target.value)
                        }
                        placeholder={t("signup.aadharNumberPlaceholder")}
                        maxLength={12}
                        className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      {errors.aadharNumber && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.aadharNumber && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.aadharNumber}
                      </p>
                    )}
                  </div>

                  {/* Patient-specific fields - Only for Patients */}
                  {userType === "patient" && (
                    <>
                      {/* Gender */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          {t("signup.patient.gender")}{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={formData.gender}
                            onChange={(e) =>
                              handleInputChange("gender", e.target.value)
                            }
                            className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">
                              {t("signup.patient.genderPlaceholder")}
                            </option>
                            <option value="male">{t("signup.patient.genderOptions.male")}</option>
                            <option value="female">{t("signup.patient.genderOptions.female")}</option>
                            <option value="other">{t("signup.patient.genderOptions.other")}</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                          {errors.gender && (
                            <div className="absolute inset-y-0 right-8 flex items-center pr-3">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                          )}
                        </div>
                        {errors.gender && (
                          <p className="text-sm text-red-500 flex items-center mt-1">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.gender}
                          </p>
                        )}
                      </div>

                      {/* Age */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          {t("signup.patient.age")}{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.age}
                            onChange={(e) =>
                              handleInputChange("age", e.target.value)
                            }
                            placeholder={t("signup.patient.agePlaceholder")}
                            min="1"
                            max="120"
                            className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          {errors.age && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                          )}
                        </div>
                        {errors.age && (
                          <p className="text-sm text-red-500 flex items-center mt-1">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.age}
                          </p>
                        )}
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          {t("signup.patient.location")}{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                            placeholder={t("signup.patient.locationPlaceholder")}
                            className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          {errors.location && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                          )}
                        </div>
                        {errors.location && (
                          <p className="text-sm text-red-500 flex items-center mt-1">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.location}
                          </p>
                        )}
                      </div>

                      {/* Family ID (Optional) */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                          {t("signup.patient.familyId")}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.familyId}
                            onChange={(e) =>
                              handleInputChange("familyId", e.target.value)
                            }
                            placeholder={t("signup.patient.familyIdPlaceholder")}
                            className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Government Health Worker ID - Only for Health Workers */}
                  {userType === "health-worker" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                        <UserCheck className="w-4 h-4 mr-2 text-blue-500" />
                        {t("signup.govHealthWorkerId")}{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.govHealthWorkerId}
                          onChange={(e) =>
                            handleInputChange("govHealthWorkerId", e.target.value)
                          }
                          placeholder={t("signup.govHealthWorkerIdPlaceholder")}
                          className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        {errors.govHealthWorkerId && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {errors.govHealthWorkerId && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.govHealthWorkerId}
                        </p>
                      )}
                    </div>
                  )}                  {/* Area/Village Name - Only for Health Workers */}
                  {userType === "health-worker" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        {t("signup.areaVillage")}{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.areaVillage}
                          onChange={(e) =>
                            handleInputChange("areaVillage", e.target.value)
                          }
                          placeholder={t("signup.areaVillagePlaceholder")}
                          className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        {errors.areaVillage && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {errors.areaVillage && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.areaVillage}
                        </p>
                      )}
                    </div>
                  )}                  {/* PHC/Sub-center Name - Only for Health Workers */}
                  {userType === "health-worker" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                        <Building className="w-4 h-4 mr-2 text-blue-500" />
                        {t("signup.phcSubcenter")}{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.phcSubcenter}
                          onChange={(e) =>
                            handleInputChange("phcSubcenter", e.target.value)
                          }
                          placeholder={t("signup.phcSubcenterPlaceholder")}
                          className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        {errors.phcSubcenter && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {errors.phcSubcenter && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.phcSubcenter}
                        </p>
                      )}
                    </div>
                  )}
                </div>                {/* Designation - Full Width - Only for Health Workers */}
                {userType === "health-worker" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                      <UserCheck className="w-4 h-4 mr-2 text-blue-500" />
                      {t("signup.designation")}{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.designation}
                        onChange={(e) =>
                          handleInputChange("designation", e.target.value)
                        }
                        className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">
                          {t("signup.designationPlaceholder")}
                        </option>
                        {designationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      {errors.designation && (
                        <div className="absolute inset-y-0 right-8 flex items-center pr-3">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.designation && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.designation}
                      </p>
                    )}
                  </div>
                )}

                {/* OTP Section */}
                {otpData.isOTPSent && (
                  <div className="bg-muted rounded-2xl p-8 border-2 border-border">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        {t("signup.verifyOTP")}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {t("signup.otpSentTo")} +91 {formData.mobileNumber}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={otpData.otp}
                          onChange={(e) =>
                            setOTPData((prev) => ({
                              ...prev,
                              otp: e.target.value,
                            }))
                          }
                          placeholder={t("signup.otpPlaceholder")}
                          maxLength={6}
                          className="w-full px-6 py-4 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center text-2xl font-mono tracking-widest"
                        />
                        {errors.otp && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {errors.otp && (
                        <p className="text-sm text-red-500 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.otp}
                        </p>
                      )}
                      <div className="text-center">
                        {otpData.resendTimer > 0 ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t("signup.resendOTP")} {otpData.resendTimer}s
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={resendOTP}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
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
                  {!otpData.isOTPSent ? (
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
                      onClick={verifyOTPAndCreateAccount}
                      disabled={otpData.isVerifying}
                      className="w-full font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 shadow-xl"
                      size="lg"
                    >
                      {otpData.isVerifying ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          {t("signup.createAccount")}...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-3" />
                          {t("signup.createAccount")}
                        </>
                      )}
                    </Button>
                  )}
                  {/* Terms and Conditions */}
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                      {t("signup.termsAndConditions")}
                    </p>
                  </div>
                  {/* Login Link */}{" "}
                  <div className="text-center pt-6 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      {t("signup.alreadyHaveAccount")}{" "}
                    </span>
                    <Link
                      href="/login"
                      className="text-sm text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                    >
                      {t("signup.login")}
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
