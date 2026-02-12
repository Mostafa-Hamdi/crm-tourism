"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import whats from "@/public/whats.png";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  User,
  MapPin,
  Tag,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Sparkles,
  Target,
  Activity,
  Bell,
  ExternalLink,
  Flag,
} from "lucide-react";
import Link from "next/link";
import {
  useConvertLeadStatusMutation,
  useDeleteLeadMutation,
  useGetLeadDetailsQuery,
} from "@/store/api/apiSlice";
import Image from "next/image";
import Swal from "sweetalert2";

const Page = () => {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const {
    data: leadDetails,
    isLoading,
    error,
  } = useGetLeadDetailsQuery({ id });
  const [deleteLead] = useDeleteLeadMutation();
  const [convertLeadStatus] = useConvertLeadStatusMutation();
  const [activeTab, setActiveTab] = useState("timeline");
  const [showStageConfirm, setShowStageConfirm] = useState(false);
  const [targetStage, setTargetStage] = useState<any>(null);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">
            {t("leads.details.loading")}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !leadDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-bold text-xl mb-2">
            {t("leads.details.error.title")}
          </p>
          <p className="text-gray-600 mb-4">
            {t("leads.details.error.message")}
          </p>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("leads.details.backToLeads")}
          </Link>
        </div>
      </div>
    );
  }

  // The API returns { data: ... } so normalize here and provide safe defaults
  const rawDetails = (leadDetails as any)?.data ?? leadDetails ?? {};
  const {
    leadInfo = {},
    currentStage = { id: 0, name: "0" },
    allStages = [],
    stageHistory = [],
    activityTimeline = [],
    metrics = {},
  } = rawDetails;

  // assignedUser can be either a string or an object { id, fullName } depending on API
  const assignedName =
    typeof leadInfo.assignedUser === "string"
      ? leadInfo.assignedUser
      : (leadInfo.assignedUser?.fullName ??
        t("leads.details.leadDetailsSection.unassigned"));

  // Map stage colors
  const stageColorMap: { [key: string]: string } = {
    New: "blue",
    Contacted: "purple",
    Interested: "green",
    FollowUp: "yellow",
    Cold: "gray",
    Lost: "red",
    Converted: "emerald",
  };

  const stages = allStages.map((stage: any) => ({
    ...stage,
    color: stageColorMap[stage.name] || "blue",
  }));

  const currentStageIndex = stages.findIndex(
    (s: any) => s.id === currentStage.id,
  );
  const progressPercentage =
    currentStageIndex >= 0
      ? ((currentStageIndex + 1) / stages.length) * 100
      : 0;

  // Handle stage click
  const handleStageClick = (stage: any) => {
    setTargetStage(stage);
    setShowStageConfirm(true);
  };

  // Confirm stage change
  const confirmStageChange = () => {
    if (targetStage && leadInfo?.id) {
      // Call API to update the lead stage (guarding on lead id)
      convertLeadStatus({ id: leadInfo.id, status: targetStage.id });
      setShowStageConfirm(false);
      setTargetStage(null);
    }
  };

  const cancelStageChange = () => {
    setShowStageConfirm(false);
    setTargetStage(null);
  };

  const getActivityIcon = (type: string) => {
    const icons: any = {
      //   Call: Phone,
      WhatsApp: MessageSquare,
      Email: Mail,
      Note: Edit,
      StageChange: TrendingUp,
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors: any = {
      //   Call: "text-blue-600 bg-blue-50",
      WhatsApp: "text-green-600 bg-green-50",
      Email: "text-purple-600 bg-purple-50",
      Note: "text-amber-600 bg-amber-50",
      StageChange: "text-cyan-600 bg-cyan-50",
    };
    return colors[type] || "text-gray-600 bg-gray-50";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("leads.details.timeAgo.justNow");
    if (diffMins < 60)
      return t("leads.details.timeAgo.minutesAgo", { minutes: diffMins });
    if (diffHours < 24)
      return t("leads.details.timeAgo.hoursAgo", { hours: diffHours });
    return t("leads.details.timeAgo.daysAgo", { days: diffDays });
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: t("leads.details.deleteConfirm.title"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("leads.details.deleteConfirm.confirmYes"),
      cancelButtonText: t("leads.details.deleteConfirm.confirmNo"),
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#e5e7eb",
    });

    if (!result.isConfirmed) return;
    try {
      await deleteLead({ id }).unwrap();
      await Swal.fire({
        icon: "success",
        title: t("leads.details.deleteConfirm.successTitle"),
        text: t("leads.details.deleteConfirm.successMessage"),
        timer: 2000,
      });
      router.push("/leads");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("leads.details.deleteConfirm.errorTitle"),
        text: t("leads.details.deleteConfirm.errorMessage"),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl text-gray-700 font-semibold hover:bg-white transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("leads.details.backToLeads")}
        </Link>

        {/* HEADER - First Impression */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Lead Info */}
            <div className="flex-1 space-y-4">
              {/* Name & Score */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-black text-gray-900">
                      {leadInfo.name}
                    </h1>
                    {metrics.leadScore && (
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 rounded-lg text-yellow-700 text-sm font-bold flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {t("leads.details.header.score")}: {metrics.leadScore}
                      </span>
                    )}
                    {currentStage.name !== "0" && (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg text-green-700 text-sm font-bold">
                        {currentStage.name}
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <a
                      href={`tel:${leadInfo.phone}`}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="font-semibold">{leadInfo.phone}</span>
                    </a>
                    {leadInfo.email && (
                      <a
                        href={`mailto:${leadInfo.email}`}
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span>{leadInfo.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Last Activity */}
                  {metrics.lastActivityAt && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t("leads.details.header.lastActivity")}:{" "}
                      {formatTimeAgo(metrics.lastActivityAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Bar - Interactive Journey */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">
                    {t("leads.details.header.journey.title")}
                  </span>
                  <span className="text-gray-500">
                    {Math.round(progressPercentage)}%{" "}
                    {t("leads.details.header.journey.complete")}
                  </span>
                </div>

                {/* Interactive Stage Journey */}
                <div className="relative">
                  {/* Background Track */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Interactive Stage Points */}
                  <div className="absolute -top-3 left-0 right-0 flex justify-between px-1">
                    {stages.map((stage: any, index: any) => {
                      const isCompleted = index < currentStageIndex;
                      const isCurrent = index === currentStageIndex;
                      const position = (index / (stages.length - 1)) * 100;

                      const stageColors: any = {
                        blue: "from-blue-600 to-cyan-600",
                        purple: "from-purple-600 to-pink-600",
                        green: "from-green-600 to-emerald-600",
                        yellow: "from-yellow-600 to-orange-600",
                        emerald: "from-emerald-600 to-teal-600",
                        red: "from-red-600 to-rose-600",
                        gray: "from-gray-600 to-slate-600",
                      };

                      return (
                        <div
                          key={stage.id}
                          className="relative flex flex-col items-center cursor-pointer group"
                          style={{
                            position: "absolute",
                            left: `${position}%`,
                            transform: "translateX(-50%)",
                          }}
                          onClick={() => handleStageClick(stage)}
                        >
                          {/* Clickable Stage Circle */}
                          <button
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCurrent
                                ? `bg-gradient-to-br ${stageColors[stage.color]} shadow-lg shadow-${stage.color}-500/50 ring-4 ring-white scale-125 animate-pulse`
                                : isCompleted
                                  ? `bg-gradient-to-br ${stageColors[stage.color]} shadow-md`
                                  : "bg-white border-2 border-gray-300 hover:border-gray-400 hover:scale-110"
                            } group-hover:scale-125 group-hover:shadow-xl`}
                          >
                            {isCompleted || isCurrent ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-gray-400 group-hover:bg-gray-600" />
                            )}
                          </button>

                          {/* Stage Label - Shows on Hover or if Current */}
                          <div
                            className={`absolute top-10 whitespace-nowrap transition-all duration-300 ${
                              isCurrent
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                            }`}
                          >
                            <div
                              className={`px-3 py-1.5 rounded-lg shadow-lg font-bold text-xs ${
                                isCurrent
                                  ? `bg-gradient-to-r ${stageColors[stage.color]} text-white`
                                  : "bg-white border-2 border-gray-200 text-gray-700"
                              }`}
                            >
                              {stage.name}
                            </div>
                            {/* Arrow pointer */}
                            <div
                              className={`absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45 ${
                                isCurrent
                                  ? `bg-gradient-to-br ${stageColors[stage.color]}`
                                  : "bg-white border-l-2 border-t-2 border-gray-200"
                              }`}
                            />
                          </div>

                          {/* Completed Checkmark Badge */}
                          {isCompleted && !isCurrent && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stage Labels Below (Always Visible) */}
                <div className="flex justify-between mt-8 px-1">
                  {stages.map((stage: any, index: any) => {
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;

                    return (
                      <div
                        key={stage.id}
                        className={`text-xs font-medium transition-colors ${
                          isCurrent
                            ? "text-blue-600 font-bold"
                            : isCompleted
                              ? "text-gray-700"
                              : "text-gray-400"
                        }`}
                      >
                        {stage.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              <Link
                href={`https://wa.me/${leadInfo.phone}`}
                target="_blank"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-green-500/40 transition-all"
              >
                <Image src={whats} alt="WhatsApp" className="w-5 h-5" />
                {t("leads.details.quickActions.whatsApp")}
              </Link>
              <Link
                href={`/leads/${leadInfo.id}/notes`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-amber-500/40 transition-all"
              >
                <Edit className="w-5 h-5" />
                {t("leads.details.quickActions.addNote")}
              </Link>
              <Link
                href={`/leads/${leadInfo.id}/task`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/40 transition-all"
              >
                <Bell className="w-5 h-5" />
                {t("leads.details.quickActions.addTask")}
              </Link>
              <button
                onClick={() => handleDelete(leadInfo.id)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-red-500/40 transition-all"
              >
                <Trash2 className="w-5 h-5" />
                {t("leads.details.quickActions.archive")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* STAGE VIEW - Interactive & Colorful */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {t("leads.details.stages.title")}
              </h2>

              {/* Interactive Stage Pills */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {stages.map((stage: any, index: any) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;

                  const stageColors: any = {
                    blue: {
                      bg: "from-blue-500 to-cyan-500",
                      border: "border-blue-400",
                      text: "text-blue-700",
                      lightBg: "bg-blue-50",
                      completed: "from-blue-600 to-cyan-600",
                    },
                    purple: {
                      bg: "from-purple-500 to-pink-500",
                      border: "border-purple-400",
                      text: "text-purple-700",
                      lightBg: "bg-purple-50",
                      completed: "from-purple-600 to-pink-600",
                    },
                    green: {
                      bg: "from-green-500 to-emerald-500",
                      border: "border-green-400",
                      text: "text-green-700",
                      lightBg: "bg-green-50",
                      completed: "from-green-600 to-emerald-600",
                    },
                    yellow: {
                      bg: "from-yellow-500 to-orange-500",
                      border: "border-yellow-400",
                      text: "text-yellow-700",
                      lightBg: "bg-yellow-50",
                      completed: "from-yellow-600 to-orange-600",
                    },
                    emerald: {
                      bg: "from-emerald-500 to-teal-500",
                      border: "border-emerald-400",
                      text: "text-emerald-700",
                      lightBg: "bg-emerald-50",
                      completed: "from-emerald-600 to-teal-600",
                    },
                    red: {
                      bg: "from-red-500 to-rose-500",
                      border: "border-red-400",
                      text: "text-red-700",
                      lightBg: "bg-red-50",
                      completed: "from-red-600 to-rose-600",
                    },
                    gray: {
                      bg: "from-gray-500 to-slate-500",
                      border: "border-gray-400",
                      text: "text-gray-700",
                      lightBg: "bg-gray-50",
                      completed: "from-gray-600 to-slate-600",
                    },
                  };

                  const colors = stageColors[stage.color];

                  return (
                    <button
                      key={stage.id}
                      onClick={() => handleStageClick(stage)}
                      className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                        isCurrent
                          ? `bg-gradient-to-r ${colors.bg} border-transparent shadow-xl hover:shadow-2xl hover:scale-105`
                          : isCompleted
                            ? `bg-gradient-to-r ${colors.completed} border-transparent shadow-lg hover:shadow-xl hover:scale-105 opacity-90`
                            : `${colors.lightBg} ${colors.border} hover:shadow-lg hover:scale-105`
                      }`}
                    >
                      {/* Status Icon */}
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCurrent || isCompleted
                              ? "bg-white/30"
                              : "bg-white border-2 " + colors.border
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle
                              className={`w-5 h-5 ${isCurrent || isCompleted ? "text-white" : colors.text}`}
                            />
                          ) : isCurrent ? (
                            <Activity
                              className={`w-5 h-5 ${isCurrent || isCompleted ? "text-white" : colors.text}`}
                            />
                          ) : (
                            <span
                              className={`text-sm font-bold ${colors.text}`}
                            >
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {isCurrent && (
                          <span className="px-2 py-1 bg-white/30 backdrop-blur-sm text-white text-xs font-bold rounded-full animate-pulse">
                            {t("leads.details.stages.current")}
                          </span>
                        )}
                      </div>

                      {/* Stage Name */}
                      <h3
                        className={`font-bold text-sm mb-1 ${
                          isCurrent || isCompleted ? "text-white" : colors.text
                        }`}
                      >
                        {stage.name}
                      </h3>

                      {/* Hover Effect */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity -z-10`}
                      />

                      {/* Click Indicator */}
                      {!isCurrent && (
                        <p
                          className={`text-xs font-medium ${
                            isCompleted ? "text-white/80" : colors.text
                          }`}
                        >
                          {t("leads.details.stages.clickToMove")}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stage Timeline with Details */}
              {stageHistory.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 mb-4">
                    {t("leads.details.stageHistory.title")}
                  </h3>
                  {stageHistory.map((history: any, index: number) => {
                    const stageInfo = stages.find(
                      (s: any) => s.id === history.stageId,
                    );
                    const colors: any = {
                      blue: "from-blue-500 to-cyan-500",
                      purple: "from-purple-500 to-pink-500",
                      green: "from-green-500 to-emerald-500",
                      yellow: "from-yellow-500 to-orange-500",
                      emerald: "from-emerald-500 to-teal-500",
                      red: "from-red-500 to-rose-500",
                      gray: "from-gray-500 to-slate-500",
                    };

                    return (
                      <div key={index} className="relative pl-8 pb-6 last:pb-0">
                        {/* Timeline Line */}
                        {index < stageHistory.length - 1 && (
                          <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-transparent" />
                        )}

                        {/* Timeline Dot */}
                        <div
                          className={`absolute left-0 top-2 w-8 h-8 rounded-full bg-gradient-to-br ${
                            colors[stageInfo?.color || "blue"]
                          } flex items-center justify-center shadow-lg`}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>

                        {/* Content */}
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">
                                {stageInfo?.name ||
                                  t("leads.details.stageHistory.unknownStage")}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(history.changedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}{" "}
                                at{" "}
                                {new Date(history.changedAt).toLocaleTimeString(
                                  "en-US",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {t("leads.details.stageHistory.changedBy")}{" "}
                                {history.changedByName}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ACTIVITY TIMELINE */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                {t("leads.details.activityTimeline.title")}
              </h2>
              <div className="space-y-4">
                {activityTimeline.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {t("leads.details.activityTimeline.noActivities")}
                  </p>
                ) : (
                  activityTimeline.map((activity: any, index: number) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);

                    return (
                      <div key={index} className="flex gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pb-4 border-b border-gray-200 last:border-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  {activity.type}
                                  {activity.interactionType &&
                                    activity.interactionType !==
                                      activity.type && (
                                      <span className="text-sm text-gray-600 font-normal ml-2">
                                        ({activity.interactionType})
                                      </span>
                                    )}
                                </h3>
                                {activity.description && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    {activity.description}
                                  </p>
                                )}
                                {activity.durationSeconds && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {t(
                                      "leads.details.activityTimeline.duration",
                                    )}
                                    :{" "}
                                    {Math.floor(activity.durationSeconds / 60)}{" "}
                                    {t("leads.details.activityTimeline.min")}{" "}
                                    {activity.durationSeconds % 60}{" "}
                                    {t("leads.details.activityTimeline.sec")}
                                  </p>
                                )}
                                {activity.result && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {t("leads.details.activityTimeline.result")}
                                    : {activity.result}
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                  activity.createdAt,
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  activity.createdAt,
                                ).toLocaleTimeString()}{" "}
                                • {t("leads.details.activityTimeline.by")}{" "}
                                {activity.createdByName}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* LEAD DETAILS */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {t("leads.details.leadDetailsSection.title")}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("leads.details.leadDetailsSection.source")}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {leadInfo.source ||
                        t("leads.details.leadDetailsSection.unknown")}
                    </p>
                  </div>
                </div>
                {leadInfo.budget && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("leads.details.leadDetailsSection.budget")}
                      </p>
                      <p className="font-semibold text-gray-900">
                        ${leadInfo.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {leadInfo.interestedIn && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Sparkles className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("leads.details.leadDetailsSection.interestedIn")}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {leadInfo.interestedIn}
                      </p>
                    </div>
                  </div>
                )}
                {leadInfo.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("leads.details.leadDetailsSection.location")}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {leadInfo.location}
                      </p>
                    </div>
                  </div>
                )}
                {leadInfo.assignedUser && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("leads.details.leadDetailsSection.assignedTo")}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {assignedName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SMART INFO */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t("leads.details.smartInsights.title")}
              </h2>
              <div className="space-y-4">
                {metrics.leadScore && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-gray-700 font-medium">
                      {t("leads.details.smartInsights.leadScore")}
                    </span>
                    <span className="text-2xl font-black text-purple-600">
                      {metrics.leadScore}/100
                    </span>
                  </div>
                )}
                {metrics.lastActivityAt && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-gray-700 font-medium">
                      {t("leads.details.smartInsights.lastActivity")}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatTimeAgo(metrics.lastActivityAt)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-gray-700 font-medium">
                    {t("leads.details.smartInsights.daysInPipeline")}
                  </span>
                  <span className="font-bold text-gray-900">
                    {Math.ceil(metrics.daysInPipeline)}{" "}
                    {t("leads.details.smartInsights.days")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Change Confirmation Modal */}
      {showStageConfirm && targetStage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t("leads.details.stageChangeConfirm.title")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("leads.details.stageChangeConfirm.message")}{" "}
              <span className="font-bold">{targetStage.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmStageChange}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                {t("leads.details.stageChangeConfirm.confirm")}
              </button>
              <button
                onClick={cancelStageChange}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
              >
                {t("leads.details.stageChangeConfirm.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
