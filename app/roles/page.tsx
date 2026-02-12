"use client";

import { useDeleteRoleMutation, useGetRolesQuery } from "@/store/api/apiSlice";
import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Shield,
  Edit2,
  Trash2,
  Sparkles,
  Users,
  Crown,
  Key,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface Role {
  id: number;
  name: string;
}

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: roles, isLoading } = useGetRolesQuery();
  const [deleteRole] = useDeleteRoleMutation();

  const t = useTranslations("roles");

  // Search filter
  const filteredRoles = useMemo(() => {
    if (!roles) return [];

    const query = searchQuery.toLowerCase();
    return roles.filter((role: Role) =>
      role.name.toLowerCase().includes(query),
    );
  }, [roles, searchQuery]);

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: t("deleteConfirm"),
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#e5e7eb",
    });

    if (!result.isConfirmed) return;
    try {
      await deleteRole({ id }).unwrap();
      await Swal.fire({
        icon: "success",
        title: t("deleteSuccess"),
        text: "",
        timer: 2000,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: t("deleteFail"),
      });
    }
  };

  // Get color for role card
  const getRoleColor = (index: number) => {
    const colors = [
      "from-blue-600 to-cyan-600",
      "from-purple-600 to-pink-600",
      "from-green-600 to-emerald-600",
      "from-orange-600 to-red-600",
      "from-indigo-600 to-blue-600",
      "from-rose-600 to-pink-600",
      "from-teal-600 to-cyan-600",
      "from-amber-600 to-orange-600",
    ];
    return colors[index % colors.length];
  };

  // Get icon for role
  const getRoleIcon = (name: string) => {
    const icons: { [key: string]: any } = {
      Admin: Crown,
      Employee: Users,
      Manager: Shield,
      User: Users,
    };
    return icons[name] || Key;
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
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  {t("rolesAndPermissions")}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {t("manage")}
                </p>
              </div>
            </div>

            <Link
              href={"/roles/add"}
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t("addButton")}</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("totalRoles")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {roles?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Admin Roles</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {roles?.filter((r: Role) =>
                    r.name.toLowerCase().includes("admin"),
                  ).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("found")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {filteredRoles.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-green-600" />
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
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-400 rounded-xl shadow-lg shadow-blue-500/30">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">
                {filteredRoles.length} {t("title")}
              </span>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">{t("loading")}</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full mb-4">
                <Shield className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg">
                {searchQuery ? t("noRolesFound") : t("noRolesYet")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRoles.map((role: Role, index: number) => {
                const Icon = getRoleIcon(role.name);
                const colorClass = getRoleColor(index);

                return (
                  <div
                    key={role.id}
                    className="group relative bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Role Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {/* <Link
                          href={`/roles/${role.id}/permissions`}
                          className="p-2 text-purple-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 bg-purple-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                          title="Assign permissions"
                        >
                          <Key className="w-4 h-4" />
                        </Link> */}
                        <Link
                          href={`/roles/${role.id}/edit`}
                          className="p-2 text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 bg-blue-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                          title="Edit role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(role.id, role.name)}
                          className="p-2 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 bg-red-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                          title="Delete role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Role Info */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {role.name}
                      </h3>
                    </div>

                    {/* Role Badge */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span
                        className={`text-white inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${colorClass} bg-opacity-10 border border-current rounded-lg text-xs font-bold`}
                      >
                        <Key className="w-3 h-3" />
                        System Role
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Role Management Tips
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Roles define what users can access in the system</li>
                <li>• Assign appropriate permissions to each role</li>
                <li>• Regular audits ensure proper access control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
