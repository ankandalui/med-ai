"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  name: string;
  userType: "PATIENT" | "HEALTH_WORKER";
  isVerified: boolean;
  patient?: {
    id: string;
    age?: number;
    gender?: string;
    aadharNumber?: string;
    familyId?: string;
    dateOfBirth?: string;
    address?: string;
  };
  healthWorker?: {
    id: string;
    licenseNumber: string;
    specialization: string;
    hospital?: string;
    areaVillage?: string;
    aadharNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data.user);
        setEditForm(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfile(data.user);
      setIsEditing(false);
      setError("");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => router.push("/login")} className="mt-4">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (!profile) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage your profile and account settings
              </p>
            </div>
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile.name}</h2>{" "}
                    <p className="text-muted-foreground capitalize">
                      {profile.userType.replace("_", " ").toLowerCase()}
                    </p>
                  </div>
                </div>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="outline">
                    Edit Profile
                  </Button>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      />
                    ) : (
                      <p className="text-muted-foreground">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <p className="text-muted-foreground">{profile.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <p className="text-muted-foreground">{profile.phone}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Member Since
                    </label>
                    <p className="text-muted-foreground">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Role-specific Information */}
                <div className="space-y-4">
                  {" "}
                  <h3 className="text-lg font-semibold">
                    {profile.userType === "PATIENT"
                      ? "Patient Information"
                      : "Health Worker Information"}
                  </h3>
                  {profile.userType === "PATIENT" && profile.patient && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Age
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.patient?.age || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                patient: {
                                  ...editForm.patient,
                                  age: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                          />
                        ) : (
                          <p className="text-muted-foreground">
                            {profile.patient.age} years
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Gender
                        </label>
                        {isEditing ? (
                          <select
                            value={editForm.patient?.gender || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                patient: {
                                  ...editForm.patient,
                                  gender: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <p className="text-muted-foreground capitalize">
                            {profile.patient.gender}
                          </p>
                        )}
                      </div>{" "}
                      {profile.patient.aadharNumber && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Aadhar Number
                          </label>
                          <p className="text-muted-foreground">
                            {profile.patient.aadharNumber}
                          </p>
                        </div>
                      )}
                      {profile.patient.familyId && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Family ID
                          </label>
                          <p className="text-muted-foreground">
                            {profile.patient.familyId}
                          </p>
                        </div>
                      )}
                      {profile.patient.address && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Address
                          </label>
                          <p className="text-muted-foreground">
                            {profile.patient.address}
                          </p>
                        </div>
                      )}
                      {profile.patient.dateOfBirth && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Date of Birth
                          </label>
                          <p className="text-muted-foreground">
                            {new Date(
                              profile.patient.dateOfBirth
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  {profile.userType === "HEALTH_WORKER" &&
                    profile.healthWorker && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Specialization
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={
                                editForm.healthWorker?.specialization || ""
                              }
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  healthWorker: {
                                    ...editForm.healthWorker,
                                    specialization: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                            />
                          ) : (
                            <p className="text-muted-foreground">
                              {profile.healthWorker.specialization}
                            </p>
                          )}
                        </div>{" "}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            License Number
                          </label>
                          <p className="text-muted-foreground">
                            {profile.healthWorker.licenseNumber}
                          </p>
                        </div>
                        {profile.healthWorker.hospital && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Hospital/PHC Subcenter
                            </label>
                            <p className="text-muted-foreground">
                              {profile.healthWorker.hospital}
                            </p>
                          </div>
                        )}
                        {profile.healthWorker.areaVillage && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Area/Village
                            </label>
                            <p className="text-muted-foreground">
                              {profile.healthWorker.areaVillage}
                            </p>
                          </div>
                        )}
                        {profile.healthWorker.aadharNumber && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Aadhar Number
                            </label>
                            <p className="text-muted-foreground">
                              {profile.healthWorker.aadharNumber}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              )}
            </div>{" "}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
