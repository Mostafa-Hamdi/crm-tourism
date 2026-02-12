"use client";

import { useSelector } from "react-redux";
import { useState } from "react";
import {
  User,
  Mail,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Bell,
  Globe,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const Page = () => {
  const user = useSelector((state: any) => state.auth.user);
  console.log("User data in profile page:", user);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });

  const handleSave = () => {
    // TODO: Add API call to update user profile
    console.log("Saving profile:", editedData);
    setIsEditing(false);
    // You can add a mutation here to update the profile
  };

  const handleCancel = () => {
    setEditedData({
      fullName: user?.fullName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
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

      <div className="max-w-5xl mx-auto space-y-6">
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
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                    <span className="text-4xl font-bold text-white">
                      {user?.fullName ? getInitials(user.fullName) : "U"}
                    </span>
                  </div>
                  {/* <button className="absolute bottom-0 right-0 w-10 h-10 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <Camera className="w-5 h-5 text-blue-600" />
                  </button> */}
                </div>

                {/* Name */}
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-gray-600 mb-4">
                  {user?.email || "No email"}
                </p>

                {/* Roles */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {user?.roles && user.roles.length > 0 ? (
                    user.roles.map((role: string, index: number) => (
                      <span
                        key={index}
                        className={`px-4 py-2 bg-gradient-to-r ${getRoleBadgeColor(role)} text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2`}
                      >
                        <Shield className="w-4 h-4" />
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="px-4 py-2 bg-gradient-to-r from-gray-600 to-slate-600 text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      User
                    </span>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">User ID</p>
                    <p className="text-lg font-bold text-blue-700">
                      #{user?.id || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className="text-lg font-bold text-green-700 flex items-center gap-1 justify-center">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                <Link
                  href="/profile/edit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.fullName}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <User className="w-5 h-5 text-gray-600" />
                      <p className="font-semibold text-gray-900">
                        {user?.fullName || "Not set"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedData.email}
                      onChange={(e) =>
                        setEditedData({ ...editedData, email: e.target.value })
                      }
                      className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <p className="font-semibold text-gray-900">
                        {user?.email || "Not set"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Roles - Read Only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Roles & Permissions
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
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
                        <span className="text-gray-600">No roles assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-blue-600" />
                Security
              </h3>

              <div className="space-y-4">
                <Link
                  href="/profile/reset-password"
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Change Password
                      </p>
                      <p className="text-sm text-gray-600">
                        Update your password regularly
                      </p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                {/* <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg">
                    Not Enabled
                  </div>
                </button> */}
              </div>
            </div>

            {/* Preferences */}
            {/* <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-blue-600" />
                Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive updates via email
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Language</p>
                      <p className="text-sm text-gray-600">English (US)</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
