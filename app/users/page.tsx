"use client";

import { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  Mail,
  Shield,
  Users,
  Edit2,
  Sparkles,
  Key,
} from "lucide-react";
import Link from "next/link";
import {
  useGetUsersQuery,
  useToggleUserStatusMutation,
} from "@/store/api/apiSlice";
import { useTranslations } from "next-intl";

interface User {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  roles: string[];
}

const Page = () => {
  const t = useTranslations("users");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useGetUsersQuery();
  const [toggleUserStatus] = useToggleUserStatusMutation();
  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!data) return [];

    const query = searchQuery.toLowerCase();
    return data.filter(
      (user: User) =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.roles.some((role) => role.toLowerCase().includes(query)),
    );
  }, [data, searchQuery]);

  const handleToggleStatus = async (id: number, status: boolean) => {
    try {
      await toggleUserStatus({ id, status }).unwrap();
    } catch (Err) {
      console.log(Err);
    }
  };

  const handleEdit = (userId: number) => {
    console.log(`Edit user ${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  {t("title")}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <Link
              href={"/users/add"}
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <UserPlus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t("addUser")}</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("totalUsers")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {data?.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("activeUsers")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {data?.filter((u: any) => u.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Inactive Users
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mt-1">
                  {data?.filter((u: any) => !u.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-400 rounded-xl shadow-lg shadow-blue-500/30">
              <Users className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">
                {filteredUsers.length} Users
              </span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg">
                {searchQuery
                  ? "No users found matching your search"
                  : "No users yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 border-b border-blue-400/30">
                  <tr>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        User
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Email
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Role
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Status
                      </span>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user: User) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 transition-all duration-200"
                    >
                      {/* User Name */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                              <span className="text-white font-bold text-sm">
                                {user.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </span>
                            </div>
                            {user.isActive && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-base">
                              {user.fullName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-gray-700 text-sm font-medium">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold shadow-sm"
                            >
                              <Shield className="w-3 h-3" />
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-5">
                        <button
                          onClick={() =>
                            handleToggleStatus(user.id, !user.isActive)
                          }
                          className={`cursor-pointer relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg ${
                            user.isActive
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 focus:ring-green-500/30 shadow-green-500/30"
                              : "bg-gray-300 focus:ring-gray-500/30 shadow-gray-500/20"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                              user.isActive ? "translate-x-8" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/users/${user?.id}/reset-password`}
                            className="cursor-pointer p-2.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group"
                            title="Edit user"
                          >
                            <Edit2 className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/users/${user.id}/reset-password`}
                            className="cursor-pointer p-2.5 text-blue-600 hover:text-white bg-blue-100 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50 group"
                            title="Reset password"
                          >
                            <Key className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
