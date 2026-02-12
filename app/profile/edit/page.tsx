"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Save,
  X,
  Camera,
  Power,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { useUpdateProfileMutation } from "@/store/api/apiSlice";
import Link from "next/link";
import { setAuth } from "@/store/slices/auth";

const Page = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const userId = user?.id;
  const router = useRouter();
  console.log("User data in edit profile page:", user);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    isActive: user?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile({
        id: userId,
        fullName: formData.fullName,
        email: formData.email,
        isActive: formData.isActive,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Profile updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      dispatch(
        setAuth({
          ...user,
          fullName: formData.fullName,
          email: formData.email,
        }),
      ); // Update Redux store with new profile data
      // Redirect back to profile page
      router.push("/profile");
    } catch (err: any) {
      let errorMessage = "Failed to update profile.";

      if (err?.data) {
        if (typeof err.data === "string") {
          errorMessage = err.data;
        } else if (err.data?.message) {
          errorMessage = err.data.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: errorMessage,
      });
    }
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      SuperAdmin: "from-purple-600 to-pink-600",
      Admin: "from-blue-600 to-cyan-600",
      Manager: "from-green-600 to-emerald-600",
      User: "from-gray-600 to-slate-600",
    };
    return colors[role] || "from-gray-600 to-slate-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl text-gray-700 font-semibold hover:bg-white transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                Edit Profile
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Update your account information
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Preview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10 sticky top-6">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-600 mb-4">
                  Profile Preview
                </h3>

                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                    <span className="text-4xl font-bold text-white">
                      {getInitials(formData.fullName)}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <Camera className="w-5 h-5 text-blue-600" />
                  </button>
                </div>

                {/* Name & Email */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {formData.fullName || "Enter your name"}
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                  {formData.email || "Enter your email"}
                </p>

                {/* Roles */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {user?.roles && user.roles.length > 0 ? (
                    user.roles.map((role: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 bg-gradient-to-r ${getRoleBadgeColor(role)} text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-slate-600 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      User
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                    formData.isActive
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300"
                      : "bg-gradient-to-r from-red-100 to-rose-100 border border-red-300"
                  }`}
                >
                  {formData.isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-green-700">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-bold text-red-700">
                        Inactive
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Account Status Toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Status
                    </label>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.isActive ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          <Power
                            className={`w-5 h-5 ${
                              formData.isActive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formData.isActive ? "Active" : "Inactive"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formData.isActive
                              ? "Your account is currently active"
                              : "Your account is currently inactive"}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Roles - Read Only */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Roles & Permissions
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-gray-100 border-2 border-gray-200 rounded-xl">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <div className="flex flex-wrap gap-2">
                        {user?.roles && user.roles.length > 0 ? (
                          user.roles.map((role: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 text-purple-700 text-sm font-bold rounded-lg"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-600">
                            No roles assigned
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Contact your administrator to change roles
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Profile Information
                  </h3>
                  <p className="text-sm text-blue-700">
                    Keep your profile information up to date. Your name and
                    email will be visible to other team members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
