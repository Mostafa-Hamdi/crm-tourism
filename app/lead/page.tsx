"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

// Mock data - replace with actual API call
const leadData = {
  id: 1,
  fullName: "Ahmed Mohamed",
  phone: "+20 123 456 7890",
  email: "ahmed@example.com",
  currentStage: 3,
  score: 85,
  source: "Facebook Ads",
  budget: 15000,
  interestedCourse: "Web Development Bootcamp",
  city: "Cairo",
  country: "Egypt",
  assignedTo: "Sarah Hassan",
  createdAt: "2026-01-20T10:00:00Z",
  lastActivity: "2026-01-29T14:30:00Z",
  stages: [
    { id: 1, name: "New", date: "2026-01-20T10:00:00Z", by: "System" },
    {
      id: 2,
      name: "Contacted",
      date: "2026-01-20T15:30:00Z",
      by: "Sarah Hassan",
    },
    {
      id: 3,
      name: "Interested",
      date: "2026-01-25T11:00:00Z",
      by: "Sarah Hassan",
      current: true,
    },
  ],
  activities: [
    {
      type: "call",
      duration: "5 min",
      result: "Interested",
      date: "2026-01-29T14:30:00Z",
      by: "Sarah Hassan",
    },
    {
      type: "note",
      content: "Very interested in payment plans",
      date: "2026-01-25T16:00:00Z",
      by: "Sarah Hassan",
    },
    {
      type: "stage",
      from: "Contacted",
      to: "Interested",
      date: "2026-01-25T11:00:00Z",
      by: "Sarah Hassan",
    },
    {
      type: "whatsapp",
      content: "Sent course brochure",
      date: "2026-01-21T09:00:00Z",
      by: "Sarah Hassan",
    },
    {
      type: "call",
      duration: "3 min",
      result: "No Answer",
      date: "2026-01-20T16:00:00Z",
      by: "Sarah Hassan",
    },
    {
      type: "stage",
      from: "New",
      to: "Contacted",
      date: "2026-01-20T15:30:00Z",
      by: "Sarah Hassan",
    },
  ],
  tasks: [
    {
      id: 1,
      title: "Send pricing details",
      dueDate: "2026-01-30T10:00:00Z",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      title: "Follow up call",
      dueDate: "2026-02-01T14:00:00Z",
      status: "pending",
      priority: "medium",
    },
  ],
};

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("timeline");
  const [currentStage, setCurrentStage] = useState(leadData.currentStage);
  const [showStageConfirm, setShowStageConfirm] = useState(false);
  const [targetStage, setTargetStage] = useState<any>(null);

  const stages = [
    { id: 1, name: "New", color: "blue" },
    { id: 2, name: "Contacted", color: "purple" },
    { id: 3, name: "Interested", color: "green" },
    { id: 4, name: "Proposal", color: "yellow" },
    { id: 5, name: "Won", color: "emerald" },
    { id: 6, name: "Lost", color: "red" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === currentStage);
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100;

  // Handle stage click
  const handleStageClick = (stage: any) => {
    setTargetStage(stage);
    setShowStageConfirm(true);
  };

  // Confirm stage change
  const confirmStageChange = () => {
    if (targetStage) {
      setCurrentStage(targetStage.id);
      // Here you would call your API to update the lead stage
      // await updateLeadStage({ id: leadData.id, stageId: targetStage.id });
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
      call: Phone,
      whatsapp: MessageSquare,
      email: Mail,
      note: Edit,
      stage: TrendingUp,
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors: any = {
      call: "text-blue-600 bg-blue-50",
      whatsapp: "text-green-600 bg-green-50",
      email: "text-purple-600 bg-purple-50",
      note: "text-amber-600 bg-amber-50",
      stage: "text-cyan-600 bg-cyan-50",
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

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
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
          Back to Leads
        </Link>

        {/* 1️⃣ HEADER - First Impression */}
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
                      {leadData.fullName}
                    </h1>
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 rounded-lg text-yellow-700 text-sm font-bold flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Score: {leadData.score}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg text-green-700 text-sm font-bold">
                      {stages[currentStageIndex]?.name}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <a
                      href={`tel:${leadData.phone}`}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="font-semibold">{leadData.phone}</span>
                    </a>
                    {leadData.email && (
                      <a
                        href={`mailto:${leadData.email}`}
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span>{leadData.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Last Activity */}
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last activity: {formatTimeAgo(leadData.lastActivity)}
                  </p>
                </div>
              </div>

              {/* Progress Bar - Interactive Journey */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">
                    Lead Journey - Click any stage to change
                  </span>
                  <span className="text-gray-500">
                    {Math.round(progressPercentage)}% Complete
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
                    {stages.map((stage, index) => {
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
                  {stages.map((stage, index) => {
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
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-green-500/40 transition-all">
                <Phone className="w-5 h-5" />
                Call
              </button>
              {/* <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-green-500/40 transition-all">
                <MessageSquare className="w-5 h-5" />
                WhatsApp
              </button> */}
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-amber-500/40 transition-all">
                <Edit className="w-5 h-5" />
                Add Note
              </button>
              <Link
                href={`/leads/${leadData.id}/task`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/40 transition-all"
              >
                <Bell className="w-5 h-5" />
                Add Task
              </Link>
              {/* <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-cyan-500/40 transition-all">
                <TrendingUp className="w-5 h-5" />
                Change Stage
              </button> */}
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-red-500/40 transition-all">
                <Trash2 className="w-5 h-5" />
                Archive
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3️⃣ STAGE VIEW - Interactive & Colorful */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Lead Journey - Click to Change Stage
              </h2>

              {/* Interactive Stage Pills */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {stages.map((stage, index) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const isFuture = index > currentStageIndex;

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
                  };

                  const colors = stageColors[stage.color];

                  return (
                    <button
                      key={stage.id}
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
                            Current
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
                          Click to move
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stage Timeline with Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 mb-4">Stage History</h3>
                {leadData.stages.map((stageHistory, index) => {
                  const stageInfo = stages.find(
                    (s) => s.id === stageHistory.id,
                  );
                  const colors: any = {
                    blue: "from-blue-500 to-cyan-500",
                    purple: "from-purple-500 to-pink-500",
                    green: "from-green-500 to-emerald-500",
                    yellow: "from-yellow-500 to-orange-500",
                    emerald: "from-emerald-500 to-teal-500",
                    red: "from-red-500 to-rose-500",
                  };

                  return (
                    <div key={index} className="relative pl-8 pb-6 last:pb-0">
                      {/* Timeline Line */}
                      {index < leadData.stages.length - 1 && (
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
                      <div
                        className={`p-4 rounded-xl ${
                          stageHistory.current
                            ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-md"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                              {stageHistory.name}
                              {stageHistory.current && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                                  Active
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(stageHistory.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}{" "}
                              at{" "}
                              {new Date(stageHistory.date).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Changed by {stageHistory.by}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4️⃣ ACTIVITY TIMELINE */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Activity Timeline
              </h2>
              <div className="space-y-4">
                {leadData.activities.map((activity, index) => {
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
                            {activity.type === "call" && (
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  Phone Call
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Duration: {activity.duration} • Result:{" "}
                                  {activity.result}
                                </p>
                              </div>
                            )}
                            {activity.type === "note" && (
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  Note Added
                                </h3>
                                <p className="text-sm text-gray-700 mt-1">
                                  {activity.content}
                                </p>
                              </div>
                            )}
                            {activity.type === "stage" && (
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  Stage Changed
                                </h3>
                                <p className="text-sm text-gray-600">
                                  From{" "}
                                  <span className="font-semibold">
                                    {activity.from}
                                  </span>{" "}
                                  to{" "}
                                  <span className="font-semibold">
                                    {activity.to}
                                  </span>
                                </p>
                              </div>
                            )}
                            {activity.type === "whatsapp" && (
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  WhatsApp Message
                                </h3>
                                <p className="text-sm text-gray-700 mt-1">
                                  {activity.content}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.date).toLocaleDateString()} at{" "}
                              {new Date(activity.date).toLocaleTimeString()} •
                              by {activity.by}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 5️⃣ LEAD DETAILS */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Lead Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="font-semibold text-gray-900">
                      {leadData.source}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-semibold text-gray-900">
                      ${leadData.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Interested In</p>
                    <p className="font-semibold text-gray-900">
                      {leadData.interestedCourse}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">
                      {leadData.city}, {leadData.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Assigned To</p>
                    <p className="font-semibold text-gray-900">
                      {leadData.assignedTo}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6️⃣ TASKS & FOLLOW-UPS */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Tasks
                </h2>
                <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                  <Plus className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              <div className="space-y-3">
                {leadData.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border-2 ${
                      isOverdue(task.dueDate)
                        ? "bg-red-50 border-red-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      {isOverdue(task.dueDate) && (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                      {task.priority === "high" && !isOverdue(task.dueDate) && (
                        <Flag className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7️⃣ SMART INFO */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Smart Insights
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-gray-700 font-medium">Lead Score</span>
                  <span className="text-2xl font-black text-purple-600">
                    {leadData.score}/100
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-gray-700 font-medium">
                    Last Activity
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatTimeAgo(leadData.lastActivity)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-gray-700 font-medium">
                    Days in Pipeline
                  </span>
                  <span className="font-bold text-gray-900">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(leadData.createdAt).getTime()) /
                        86400000,
                    )}{" "}
                    days
                  </span>
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
