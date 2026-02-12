import {
  Home,
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
  KanbanSquare,
  User,
  CreditCard,
  EditIcon,
  BookImageIcon,
  Plane,
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

// ─── Nav config types ─────────────────────────────────────────────────────────

interface NavChild {
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
  alwaysShow?: boolean;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
  alwaysShow?: boolean;
  activeLinks: string[];
  children: NavChild[];
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

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

  const t = useTranslations("sidebar");
  const isRTL = useIsRTL();

  // Fetch today's follow-up count on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await triggerToday();
        if (!mounted) return;
        const data = "data" in res ? (res as any).data : res;
        const count = Array.isArray(data) ? data.length : 0;
        dispatch(setTodayCount(count));
      } catch {
        // ignore badge fetch errors
      }
    })();
    return () => {
      mounted = false;
    };
  }, [triggerToday]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    return isLogin && permissions.includes(permission);
  };

  const isLinkActive = (link: string): boolean =>
    path === link || (path.startsWith(link + "/") && link !== "/");

  const isDropdownActive = (links: string[]): boolean =>
    links.some((link) => isLinkActive(link));

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Auto-open dropdown if a child is currently active
  useEffect(() => {
    const updates: Record<string, boolean> = {};
    mainNavItems.forEach((item) => {
      if (isDropdownActive(item.activeLinks)) {
        updates[item.key] = true;
      }
    });
    systemNavItems.forEach((item) => {
      if (isDropdownActive(item.activeLinks)) {
        updates[item.key] = true;
      }
    });
    if (Object.keys(updates).length > 0) {
      setOpenDropdowns((prev) => ({ ...prev, ...updates }));
    }
  }, [path]);

  // ── Nav definitions ────────────────────────────────────────────────────────

  const mainNavItems: NavItem[] = [
    {
      key: "bookings",
      label: t("bookings"),
      icon: Plane,
      permission: "ENROLLMENTS_VIEW",
      activeLinks: ["/booking", "/booking/add"],
      children: [
        {
          href: "/booking",
          label: t("allBookings"),
          icon: List,
          permission: "ENROLLMENTS_VIEW",
        },
        {
          href: "/booking/add",
          label: t("addBooking"),
          icon: Plus,
          permission: "ENROLLMENTS_CREATE",
        },
      ],
    },
    {
      key: "leads",
      label: t("leads"),
      icon: UserPlus,
      permission: "LEADS_VIEW",
      activeLinks: ["/leads/board", "/leads", "/leads/add"],
      children: [
        {
          href: "/leads/board",
          label: t("board"),
          icon: KanbanSquare,
          alwaysShow: true,
        },
        {
          href: "/leads",
          label: t("allLeads"),
          icon: List,
          permission: "LEADS_VIEW",
        },
        {
          href: "/leads/add",
          label: t("addLead"),
          icon: Plus,
          permission: "LEADS_CREATE",
        },
      ],
    },
    {
      key: "customers",
      label: t("customers"),
      icon: UserSquare,
      permission: "CUSTOMERS_VIEW",
      activeLinks: ["/customers", "/customers/add"],
      children: [
        {
          href: "/customers",
          label: t("allCustomers"),
          icon: List,
          permission: "CUSTOMERS_VIEW",
        },
      ],
    },
    {
      key: "followups",
      label: t("followUp"),
      icon: Clock,
      permission: "LEADS_VIEW",
      activeLinks: ["/follow-up", "/follow-up/add"],
      children: [
        {
          href: "/follow-up",
          label: t("allFollowUps"),
          icon: List,
          permission: "LEADS_VIEW",
        },
        {
          href: "/follow-up/add",
          label: t("addFollowUp"),
          icon: Plus,
          permission: "LEADS_EDIT",
        },
      ],
    },
    {
      key: "travelers",
      label: t("travelers"),
      icon: UserCheck,
      permission: "STUDENTS_VIEW",
      activeLinks: ["/travelers", "/travelers/add"],
      children: [
        {
          href: "/travelers",
          label: t("allTravelers"),
          icon: List,
          permission: "STUDENTS_VIEW",
        },
        {
          href: "/travelers/add",
          label: t("addTraveler"),
          icon: Plus,
          permission: "STUDENTS_CREATE",
        },
      ],
    },
    {
      key: "payments",
      label: t("payments"),
      icon: CreditCard,
      alwaysShow: true,
      activeLinks: ["/payments", "/payments/add"],
      children: [
        {
          href: "/payments",
          label: t("allPayments"),
          icon: List,
          alwaysShow: true,
        },
        {
          href: "/payments/add",
          label: t("addPayment"),
          icon: Plus,
          alwaysShow: true,
        },
      ],
    },
  ];

  const systemNavItems: NavItem[] = [
    {
      key: "users",
      label: t("users"),
      icon: UserCircle,
      permission: "USERS_VIEW",
      activeLinks: ["/users", "/users/add"],
      children: [
        {
          href: "/users",
          label: t("allUsers"),
          icon: List,
          permission: "USERS_VIEW",
        },
        {
          href: "/users/add",
          label: t("addUser"),
          icon: Plus,
          permission: "USERS_CREATE",
        },
      ],
    },
    {
      key: "roles",
      label: t("roles"),
      icon: Shield,
      permission: "ROLES_VIEW",
      activeLinks: ["/roles", "/roles/add"],
      children: [
        {
          href: "/roles",
          label: t("allRoles"),
          icon: List,
          permission: "ROLES_VIEW",
        },
        {
          href: "/roles/add",
          label: t("addRole"),
          icon: Plus,
          permission: "ROLES_CREATE",
        },
      ],
    },
    {
      key: "settings",
      label: t("settings"),
      icon: Settings,
      permission: "SETTINGS_VIEW",
      activeLinks: [
        "/dashboard/settings",
        "/dashboard/settings/config",
        "/dashboard/settings/edit",
      ],
      children: [
        {
          href: "/dashboard/settings",
          label: t("generalSettings"),
          icon: Edit,
          permission: "SETTINGS_GENERAL",
        },
        {
          href: "/dashboard/settings/config",
          label: t("systemConfig"),
          icon: Edit,
          permission: "SETTINGS_CONFIG",
        },
        {
          href: "/dashboard/settings/edit",
          label: t("editSettings"),
          icon: EditIcon,
          permission: "SETTINGS_EDIT",
        },
      ],
    },
    {
      key: "profile",
      label: t("profile"),
      icon: UserCircle2,
      alwaysShow: true,
      activeLinks: ["/profile", "/profile/reset-password", "/profile/edit"],
      children: [
        { href: "/profile", label: t("profile"), icon: User, alwaysShow: true },
        {
          href: "/profile/edit",
          label: t("editProfile"),
          icon: Edit,
          alwaysShow: true,
        },
        {
          href: "/profile/reset-password",
          label: t("changePassword"),
          icon: Edit,
          alwaysShow: true,
        },
      ],
    },
  ];

  // ── Render helpers ─────────────────────────────────────────────────────────

  const shouldShowItem = (item: NavItem | NavChild): boolean => {
    if ("alwaysShow" in item && item.alwaysShow) return true;
    if (!item.permission) return isLogin;
    return hasPermission(item.permission);
  };

  const renderNavItem = (item: NavItem) => {
    if (!shouldShowItem(item)) return null;

    const isActive = isDropdownActive(item.activeLinks);
    const isOpen = openDropdowns[item.key];
    const Icon = item.icon;
    const isBadgeItem = item.key === "followups"; //|| item.key === "payments"

    const visibleChildren = item.children.filter(shouldShowItem);
    if (visibleChildren.length === 0) return null;

    return (
      <div key={item.key}>
        <button
          onClick={() => toggleDropdown(item.key)}
          className={`cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{item.label}</span>
            {isBadgeItem && todayCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                {todayCount}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`${
              isRTL ? "mr-4 pr-4 border-r-2" : "ml-4 pl-4 border-l-2"
            } border-blue-200 space-y-1 py-1`}
          >
            {visibleChildren.map((child) => {
              const ChildIcon = child.icon;
              const childActive = isLinkActive(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    childActive
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 font-semibold border border-blue-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <ChildIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── Logout ─────────────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <aside
      className={`
        fixed ${isRTL ? "right-0" : "left-0"} top-[98px] z-30 h-[calc(100vh-98px)] w-64
        bg-white/95 backdrop-blur-xl ${isRTL ? "border-l" : "border-r"} border-blue-100
        shadow-xl shadow-blue-500/10
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : `${isRTL ? "translate-x-full" : "-translate-x-full"} lg:translate-x-0`}
      `}
    >
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700" />

      <nav className="p-4 space-y-6 h-full pb-24 overflow-y-auto">
        {/* ── MAIN SECTION ── */}
        <div>
          <p className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t("sections.main")}
          </p>
          <div className="space-y-1">
            {/* Dashboard */}
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isLinkActive("/")
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{t("dashboard")}</span>
            </Link>

            {mainNavItems.map(renderNavItem)}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-100 to-transparent" />

        {/* ── SYSTEM SECTION ── */}
        <div>
          <p className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t("sections.system")}
          </p>
          <div className="space-y-1">{systemNavItems.map(renderNavItem)}</div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl
            text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent
            hover:border-red-100 transition-all duration-200 mt-2 group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-medium">{t("signOut")}</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
