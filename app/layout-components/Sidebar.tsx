import {
  Home,
  Boxes,
  GraduationCap,
  UserCheck,
  UserPlus,
  UserSquare,
  Clock,
  UserCircle,
  Shield,
  Settings,
  UserCircle2,
  LogOut,
  ChevronDown,
  Plus,
  Edit,
  List,
  EditIcon,
  School,
  SchoolIcon,
  KanbanSquare,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/store/slices/auth";
import Swal from "sweetalert2";
import {
  useLogoutMutation,
  useGetFollowupsTodayMutation,
} from "@/store/api/apiSlice";
import { setTodayCount, selectTodayCount } from "@/store/slices/followups";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useIsRTL } from "@/app/i18n/LocaleProvider";

interface SidebarProps {
  sidebarOpen: boolean;
}

const Sidebar = ({ sidebarOpen }: SidebarProps) => {
  const permissions = useSelector((state: any) => state.auth.user?.permissions);
  const isLogin = useSelector((state: any) => state.auth.isAuthenticated);
  const path = usePathname();
  const dispatch = useDispatch();
  const [removeRefreshToken] = useLogoutMutation();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  );
  const todayCount = useSelector(selectTodayCount);
  const [triggerToday] = useGetFollowupsTodayMutation();

  // Fetch today's follow-up count when sidebar mounts so the badge is available across the app
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await triggerToday();
        if (!mounted) return;
        const data = "data" in res ? (res as any).data : res;
        const count = Array.isArray(data) ? data.length : 0;
        // Dispatch the update to the followups slice for immediate UI update
        dispatch(setTodayCount(count));
      } catch (e) {
        // ignore errors for the badge
      }
    })();

    return () => {
      mounted = false;
    };
  }, [triggerToday]);

  const t = useTranslations("sidebar");
  const isRTL = useIsRTL();

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isDropdownActive = (links: string[]): boolean => {
    return links.some(
      (link) => path === link || (path.startsWith(link + "/") && link !== "/"),
    );
  };

  const isLinkActive = (link: string): boolean => {
    return path === link || (path.startsWith(link + "/") && link !== "/");
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "😢 Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#e5e7eb",
    });

    if (!result.isConfirmed) return;

    try {
      await removeRefreshToken().unwrap();
      dispatch(logout());
      await Swal.fire({ title: "Logged out successfully!", icon: "success" });
    } catch {
      Swal.fire("Logout failed", "", "error");
    }
  };

  // Helper function to check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    return isLogin && permissions.includes(permission);
  };

  return (
    <aside
      className={`
        fixed ${isRTL ? "right-0" : "left-0"} top-[98px] z-30 h-[calc(100vh-98px)] w-64
        bg-white/95 backdrop-blur-xl ${isRTL ? "border-l" : "border-r"} border-blue-100 shadow-lg
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : `${isRTL ? "translate-x-full" : "-translate-x-full"} lg:translate-x-0`}
      `}
    >
      <nav className="p-4 space-y-6 h-full pb-20 overflow-y-auto">
        {/* MAIN SECTION */}
        <div>
          <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
            {t("sections.main")}
          </p>

          <div className="space-y-2">
            {/* Dashboard - Always visible */}
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isLinkActive("/")
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-700 hover:bg-blue-50"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">{t("dashboard")}</span>
            </Link>

            {/* Enrollments */}
            {hasPermission("ENROLLMENTS_VIEW") && (
              <div>
                <button
                  onClick={() => toggleDropdown("enrollments")}
                  className={`cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isDropdownActive(["/enrollments", "/enrollments/add"])
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5" />
                    <span className="font-medium">{t("enrollments")}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openDropdowns["enrollments"] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openDropdowns["enrollments"]
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`${isRTL ? "mr-4 pr-4 border-r-2" : "ml-4 pl-4 border-l-2"} border-blue-200 space-y-1`}
                  >
                    {hasPermission("ENROLLMENTS_VIEW") && (
                      <Link
                        href="/enrollments"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/enrollments")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <List className="w-4 h-4" />
                        <span>{t("allEnrollments")}</span>
                      </Link>
                    )}

                    {hasPermission("ENROLLMENTS_CREATE") && (
                      <Link
                        href="/enrollments/add"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/enrollments/add")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t("addEnrollment")}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Leads */}
            {hasPermission("LEADS_VIEW") && (
              <div>
                <button
                  onClick={() => toggleDropdown("leads")}
                  className={`cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isDropdownActive(["/leads/board", "/leads", "/leads/add"])
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5" />
                    <span className="font-medium">{t("leads")}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openDropdowns["leads"] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openDropdowns["leads"]
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`${isRTL ? "mr-4 pr-4 border-r-2" : "ml-4 pl-4 border-l-2"} border-blue-200 space-y-1`}
                  >
                    <Link
                      href="/leads/board"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isLinkActive("/leads/board")
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <KanbanSquare className="w-4 h-4" />
                      <span>{t("board")}</span>
                    </Link>

                    {hasPermission("LEADS_VIEW") && (
                      <Link
                        href="/leads"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/leads")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <List className="w-4 h-4" />
                        <span>{t("allLeads")}</span>
                      </Link>
                    )}

                    {hasPermission("LEADS_CREATE") && (
                      <Link
                        href="/leads/add"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/leads/add")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t("addLead")}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Students */}
            {hasPermission("STUDENTS_VIEW") && (
              <div>
                <button
                  onClick={() => toggleDropdown("students")}
                  className={`cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isDropdownActive(["/students", "/students/add"])
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserSquare className="w-5 h-5" />
                    <span className="font-medium">{t("students")}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openDropdowns["students"] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openDropdowns["students"]
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`${isRTL ? "mr-4 pr-4 border-r-2" : "ml-4 pl-4 border-l-2"} border-blue-200 space-y-1`}
                  >
                    {hasPermission("STUDENTS_VIEW") && (
                      <Link
                        href="/students"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/students")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <List className="w-4 h-4" />
                        <span>{t("allStudents")}</span>
                      </Link>
                    )}

                    {hasPermission("STUDENTS_CREATE") && (
                      <Link
                        href="/students/add"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/students/add")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t("addStudent")}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up */}
            {hasPermission("FOLLOWUPS_VIEW") && (
              <div>
                <button
                  onClick={() => toggleDropdown("followups")}
                  className={`cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isDropdownActive(["/follow-up", "/follow-up/add"])
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{t("followUp")}</span>
                    {todayCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        {todayCount}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openDropdowns["followups"] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openDropdowns["followups"]
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`${isRTL ? "mr-4 pr-4 border-r-2" : "ml-4 pl-4 border-l-2"} border-blue-200 space-y-1`}
                  >
                    {hasPermission("FOLLOWUPS_VIEW") && (
                      <Link
                        href="/follow-up"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/follow-up")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <List className="w-4 h-4" />
                        <span>{t("allFollowUps")}</span>
                      </Link>
                    )}

                    {hasPermission("FOLLOWUPS_CREATE") && (
                      <Link
                        href="/follow-up/add"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/follow-up/add")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t("addFollowUp")}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SYSTEM SECTION */}
        <div>
          <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
            {t("sections.system")}
          </p>

          <div className="space-y-2">
            {/* Users */}
            {hasPermission("USERS_VIEW") && (
              <div>
                <button
                  onClick={() => toggleDropdown("users")}
                  className={`cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isDropdownActive(["/users", "/users/add"])
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-5 h-5" />
                    <span className="font-medium">{t("users")}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openDropdowns["users"] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openDropdowns["users"]
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`${isRTL ? "mr-4 pr-4 border-r-2" : "ml-4 pl-4 border-l-2"} border-blue-200 space-y-1`}
                  >
                    {hasPermission("USERS_VIEW") && (
                      <Link
                        href="/users"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/users")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <List className="w-4 h-4" />
                        <span>{t("allUsers")}</span>
                      </Link>
                    )}

                    {hasPermission("USERS_CREATE") && (
                      <Link
                        href="/users/add"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/users/add")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t("addUser")}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Roles */}
            {hasPermission("ROLES_VIEW") && (
              <div>
                <button
                  onClick={() => toggleDropdown("roles")}
                  className={`cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isDropdownActive(["/roles", "/roles/add"])
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">{t("roles")}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openDropdowns["roles"] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openDropdowns["roles"]
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`${isRTL ? "mr-4 pr-4 border-r-2" : "ml-4 pl-4 border-l-2"} border-blue-200 space-y-1`}
                  >
                    {hasPermission("ROLES_VIEW") && (
                      <Link
                        href="/roles"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/roles")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <List className="w-4 h-4" />
                        <span>{t("allRoles")}</span>
                      </Link>
                    )}

                    {hasPermission("ROLES_CREATE") && (
                      <Link
                        href="/roles/add"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/roles/add")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t("addRole")}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {hasPermission("SETTINGS_VIEW") && (
              <div>
                <button
                  onClick={() => toggleDropdown("settings")}
                  className={`cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isDropdownActive([
                      "/dashboard/settings",
                      "/dashboard/settings/config",
                      "/dashboard/settings/edit",
                    ])
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">{t("settings")}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openDropdowns["settings"] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openDropdowns["settings"]
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`${isRTL ? "mr-4 pr-4 border-r-2" : "ml-4 pl-4 border-l-2"} border-blue-200 space-y-1`}
                  >
                    {hasPermission("SETTINGS_GENERAL") && (
                      <Link
                        href="/dashboard/settings"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/dashboard/settings")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                        <span>{t("generalSettings")}</span>
                      </Link>
                    )}

                    {hasPermission("SETTINGS_CONFIG") && (
                      <Link
                        href="/dashboard/settings/config"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/dashboard/settings/config")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                        <span>{t("systemConfig")}</span>
                      </Link>
                    )}

                    {hasPermission("SETTINGS_EDIT") && (
                      <Link
                        href="/dashboard/settings/edit"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isLinkActive("/dashboard/settings/edit")
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <EditIcon className="w-4 h-4" />
                        <span>{t("editSettings")}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile - Always visible for logged-in users */}
            {isLogin && (
              <div>
                <button
                  onClick={() => toggleDropdown("profile")}
                  className={`cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isDropdownActive([
                      "/dashboard/profile",
                      "/dashboard/profile/password",
                      "/dashboard/profile/edit",
                    ])
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="w-5 h-5" />
                    <span className="font-medium">{t("profile")}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openDropdowns["profile"] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openDropdowns["profile"]
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`${isRTL ? "mr-4 pr-4 border-r-2" : "ml-4 pl-4 border-l-2"} border-blue-200 space-y-1`}
                  >
                    <Link
                      href="/dashboard/profile"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isLinkActive("/dashboard/profile")
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                      <span>{t("editProfile")}</span>
                    </Link>

                    <Link
                      href="/dashboard/profile/password"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isLinkActive("/dashboard/profile/password")
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                      <span>{t("changePassword")}</span>
                    </Link>

                    <Link
                      href="/dashboard/profile/edit"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isLinkActive("/dashboard/profile/edit")
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <EditIcon className="w-4 h-4" />
                      <span>{t("advancedEdit")}</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg
          text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all mt-8"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t("signOut")}</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
