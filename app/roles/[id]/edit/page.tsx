"use client";

import {
  useGetPermissionsQuery,
  useGetRolePermissionsQuery,
  useUpdateRoleMutation,
} from "@/store/api/apiSlice";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Save,
  X,
  Search,
  Check,
  Lock,
  Sparkles,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
  module: string;
}

interface RolePermissionsResponse {
  roleId: number;
  roleName: string;
  permissions: Permission[];
}

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: allPermissions, isLoading: loadingPermissions } =
    useGetPermissionsQuery();
  const { data: rolePermissions, isLoading: loadingRolePermissions } =
    useGetRolePermissionsQuery({ id });
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const t = useTranslations("roles");

  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize state when role permissions are loaded
  useEffect(() => {
    if (rolePermissions) {
      setRoleName(rolePermissions.roleName || "");
      setSelectedPermissions(
        rolePermissions.permissions?.map((p: Permission) => p.code) || [],
      );
    }
  }, [rolePermissions]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return {};

    const query = searchQuery.toLowerCase();
    const filtered = allPermissions.filter(
      (permission: Permission) =>
        permission.name.toLowerCase().includes(query) ||
        permission.code.toLowerCase().includes(query) ||
        permission.module.toLowerCase().includes(query) ||
        (permission.description &&
          permission.description.toLowerCase().includes(query)),
    );

    return filtered.reduce((acc: any, permission: Permission) => {
      const module = permission.module || "Other";
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {});
  }, [allPermissions, searchQuery]);

  // Toggle permission selection
  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  // Select all permissions in a module
  const toggleModule = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    const moduleCodes = modulePermissions.map((p: Permission) => p.code);
    const allSelected = moduleCodes.every((code: string) =>
      selectedPermissions.includes(code),
    );

    if (allSelected) {
      // Deselect all in module
      setSelectedPermissions((prev) =>
        prev.filter((code) => !moduleCodes.includes(code)),
      );
    } else {
      // Select all in module
      setSelectedPermissions((prev) => {
        const newSet = new Set([...prev, ...moduleCodes]);
        return Array.from(newSet);
      });
    }
  };

  // Select/Deselect all permissions
  const toggleAll = () => {
    if (!allPermissions) return;

    if (selectedPermissions.length === allPermissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissions.map((p: Permission) => p.code));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: t("permissions.roleNameRequired"),
      });
      return;
    }

    try {
      await updateRole({
        id,
        roleName: roleName.trim(),
        permissionCodes: selectedPermissions,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: t("permissions.updatedSuccess"),
        timer: 2000,
      });

      router.push("/roles");
    } catch (err: any) {
      console.error(err);

      const errorMessage =
        err?.data?.message || err?.error || t("permissions.updatedFail");

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: errorMessage,
      });
    }
  };

  // Get module color
  const getModuleColor = (index: number) => {
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

  const isLoading = loadingPermissions || loadingRolePermissions;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-600 font-medium">
            {t("permissions.loading")}
          </p>
        </div>
      </div>
    );
  }

  const totalPermissions = allPermissions?.length || 0;
  const selectedCount = selectedPermissions.length;

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
              <button
                onClick={() => router.push("/roles")}
                className="p-3 hover:bg-white/50 rounded-xl transition-colors cursor-pointer"
                title="Back to roles"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
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
                  {t("editRole")}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {t("permissions.title")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("permissions.totalPermissions")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {allPermissions?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Selected</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {selectedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Modules</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {Object.keys(groupedPermissions).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Name Section */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Role Information
            </h2>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name"
                required
                className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Permissions Section */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Permissions
              </h2>

              {/* Search and Select All */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    placeholder={t("permissions.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={toggleAll}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
                >
                  {selectedCount === totalPermissions
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
            </div>

            {/* Permission Modules */}
            <div className="space-y-6">
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    {searchQuery
                      ? "No permissions found matching your search"
                      : "No permissions available"}
                  </p>
                </div>
              ) : (
                Object.entries(groupedPermissions).map(
                  ([module, permissions], moduleIndex) => {
                    const modulePermissions = permissions as Permission[];
                    const moduleCodes = modulePermissions.map((p) => p.code);
                    const allSelected = moduleCodes.every((code) =>
                      selectedPermissions.includes(code),
                    );
                    const someSelected = moduleCodes.some((code) =>
                      selectedPermissions.includes(code),
                    );

                    return (
                      <div
                        key={module}
                        className="bg-white/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                      >
                        {/* Module Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${getModuleColor(
                                moduleIndex,
                              )} rounded-xl flex items-center justify-center shadow-lg`}
                            >
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">
                                {module}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {modulePermissions.length} permission
                                {modulePermissions.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleModule(module)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                              allSelected
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                                : someSelected
                                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg"
                                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500"
                            }`}
                          >
                            {allSelected
                              ? "Deselect All"
                              : someSelected
                                ? "Select All"
                                : "Select All"}
                          </button>
                        </div>

                        {/* Permissions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {modulePermissions.map((permission) => {
                            const isSelected = selectedPermissions.includes(
                              permission.code,
                            );

                            return (
                              <button
                                key={permission.id}
                                type="button"
                                onClick={() =>
                                  togglePermission(permission.code)
                                }
                                className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500 shadow-lg shadow-blue-500/20"
                                    : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900 text-sm truncate">
                                        {permission.name}
                                      </span>
                                    </div>
                                    {permission.description && (
                                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                        {permission.description}
                                      </p>
                                    )}
                                  </div>

                                  <div
                                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "bg-blue-600 border-blue-600"
                                        : "border-gray-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  },
                )
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.push("/roles")}
                disabled={isUpdating}
                className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2">
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </div>
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating...</span>
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
      </div>
    </div>
  );
};

export default Page;
