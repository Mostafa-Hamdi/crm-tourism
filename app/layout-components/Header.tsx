"use client";
import {
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.png";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { logout } from "@/store/slices/auth";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/store/api/apiSlice";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = ({ sidebarOpen, setSidebarOpen }: any) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const [removeRefreshToken] = useLogoutMutation();
  const user = useSelector((state: any) => state.auth.user);
  const t = useTranslations("header");
  // Sample notifications data with types
  const notifications = [
    {
      id: 1,
      type: "appointment",
      title: "New appointment scheduled",
      message:
        "Patient John Doe has booked an appointment for tomorrow at 10:00 AM",
      time: "5 min ago",
      unread: true,
      icon: Clock,
      color: "blue",
    },
    {
      id: 2,
      type: "success",
      title: "Lab results available",
      message: "Test results for Patient Jane Smith are now ready for review",
      time: "1 hour ago",
      unread: true,
      icon: CheckCircle2,
      color: "green",
    },
    {
      id: 3,
      type: "alert",
      title: "Urgent: Patient waiting",
      message: "Patient Mike Johnson has been waiting for 20 minutes",
      time: "2 hours ago",
      unread: true,
      icon: AlertCircle,
      color: "red",
    },
    {
      id: 4,
      type: "appointment",
      title: "Prescription renewed",
      message: "Prescription for Patient Sarah Williams has been renewed",
      time: "3 hours ago",
      unread: false,
      icon: CheckCircle2,
      color: "blue",
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      red: "bg-red-100 text-red-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: t("logout.confirmTitle"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("logout.confirmYes"),
      cancelButtonText: t("logout.confirmNo"),
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#e5e7eb",
    });

    if (!result.isConfirmed) return;

    try {
      await removeRefreshToken().unwrap();
      dispatch(logout());

      router.replace("/login");

      await Swal.fire({
        title: t("logout.success"),
        icon: "success",
      });
    } catch (error) {
      Swal.fire(t("logout.failed"), "", "error");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 py-2">
      <div className="flex items-center justify-between px-4 sm:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cursor-pointer lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
          <div className="logo">
            <Image src={logo} alt="MyClinic logo" className="w-50" />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <div className="flex items-center">
            {/* simple select for en/ar */}
            <LanguageSwitcher />
          </div>
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setUserMenuOpen(false);
              }}
              className={`cursor-pointer relative p-2 rounded-xl transition-all duration-200 ${
                notificationOpen
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-5 duration-200">
                <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {t("notifications.title")}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {t("notifications.youHave", { count: unreadCount })}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button className="cursor-pointer text-xs text-blue-600 font-semibold hover:text-blue-700 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                        {t("notifications.markAllRead")}
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto ">
                  {notifications.map((notification) => {
                    const IconComponent = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                          notification.unread ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getColorClasses(
                              notification.color,
                            )}`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </p>
                              {notification.unread && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
                  <button className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    {t("notifications.viewAll")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationOpen(false);
              }}
              className={`cursor-pointer flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-xl transition-all duration-200 ${
                userMenuOpen ? "bg-blue-50 shadow-md" : "hover:bg-gray-100"
              }`}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 text-sm">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {user?.fullName || "User Name"}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {user?.roles[0] || ""}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-5 duration-200">
                <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user?.fullName || "User Name"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button className="cursor-pointer w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{t("profile.myProfile")}</span>
                  </button>
                  <button className="cursor-pointer w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span>{t("profile.settings")}</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="cursor-pointer w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span>{t("profile.signOut")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
