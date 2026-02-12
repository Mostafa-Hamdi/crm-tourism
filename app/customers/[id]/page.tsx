"use client";

import { useGetCustomerQuery } from "@/store/api/apiSlice";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Activity,
  Tag,
  Clock,
  Edit2,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  Users,
  TrendingUp,
  Hash,
  UserCircle,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerActivity {
  id: number;
  activityType: string;
  description: string;
  createdAt: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case "LeadConvertedFromStatus":
      return TrendingUp;
    case "StatusChanged":
      return Activity;
    case "ContactAdded":
      return Phone;
    case "TagAdded":
      return Tag;
    default:
      return FileText;
  }
};

const getActivityColor = (activityType: string) => {
  switch (activityType) {
    case "LeadConvertedFromStatus":
      return "from-green-600 to-emerald-600";
    case "StatusChanged":
      return "from-blue-600 to-cyan-600";
    case "ContactAdded":
      return "from-purple-600 to-pink-600";
    case "TagAdded":
      return "from-orange-600 to-red-600";
    default:
      return "from-gray-600 to-slate-600";
  }
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: customer, isLoading, error } = useGetCustomerQuery({ id });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-600 font-medium">Loading Customer...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <p className="text-gray-600 font-medium text-lg mb-4">
            Customer not found
          </p>
          <Link
            href="/customers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative blobs — matches enrollments page */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header Card — matches enrollments header card style ── */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: back + icon + title */}
            <div className="flex items-center gap-4">
              <Link
                href="/customers"
                className="p-3 bg-white/70 backdrop-blur-2xl border border-white/60 rounded-xl hover:bg-white hover:shadow-lg transition-all group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </Link>

              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                    <UserCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl leading-[50px] font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                    Customer Details
                  </h1>
                  <p className="text-gray-600 mt-0 text-sm sm:text-base">
                    View and manage customer information
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Edit button */}
            {/* <Link
              href={`/customers/edit/${customer.id}`}
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Edit2 className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Edit Customer</span>
            </Link> */}
          </div>
        </div>

        {/* ── Stats Cards — same pattern as enrollments stats row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Status */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Status</p>
                <p
                  className={`text-xl font-bold mt-1 ${customer.meta.isActive ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"} bg-clip-text text-transparent`}
                >
                  {customer.meta.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${customer.meta.isActive ? "bg-gradient-to-br from-green-100 to-emerald-100" : "bg-gradient-to-br from-red-100 to-rose-100"}`}
              >
                {customer.meta.isActive ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Activities</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {customer.activities?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Contacts</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {customer.contacts?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tags</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {customer.tags?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Profile Card ── */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
          {/* Gradient header bar */}
          <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700" />

          <div className="p-6 sm:p-8">
            {/* Avatar row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40">
                <span className="text-white font-bold text-3xl">
                  {getInitials(customer.fullName)}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {customer.fullName}
                  </h2>
                  {customer.meta.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-700 rounded-lg text-sm font-bold w-fit">
                      <CheckCircle2 className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 text-red-700 rounded-lg text-sm font-bold w-fit">
                      <XCircle className="w-4 h-4" />
                      Inactive
                    </span>
                  )}
                  {customer.meta.isArchived && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-gray-100 to-slate-100 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold w-fit">
                      <FileText className="w-4 h-4" />
                      Archived
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-base">
                  Display Name:{" "}
                  <span className="font-semibold text-gray-800">
                    {customer.displayName}
                  </span>
                </p>
                <p className="text-gray-400 text-sm font-mono mt-1">
                  Customer ID: #{customer.id}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* National ID */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    National ID
                  </h3>
                </div>
                <p className="text-gray-900 font-mono text-lg font-bold">
                  {customer.nationalId || "—"}
                </p>
              </div>

              {/* Gender */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 hover:shadow-md hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Gender
                  </h3>
                </div>
                <p className="text-gray-900 text-lg font-bold">
                  {customer.gender || "—"}
                </p>
              </div>

              {/* Date of Birth */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100 hover:shadow-md hover:shadow-green-500/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Date of Birth
                  </h3>
                </div>
                <p className="text-gray-900 text-lg font-bold">
                  {customer.dateOfBirth
                    ? formatDate(customer.dateOfBirth)
                    : "—"}
                </p>
              </div>

              {/* Joined */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-100 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Joined
                  </h3>
                </div>
                <p className="text-gray-900 text-lg font-bold">
                  {formatDate(customer.meta.createdAt)}
                </p>
              </div>

              {/* Last Interaction */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100 hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Last Interaction
                  </h3>
                </div>
                <p className="text-gray-900 text-lg font-bold">
                  {customer.meta.lastInteractionAt
                    ? formatDateTime(customer.meta.lastInteractionAt)
                    : "No interactions yet"}
                </p>
              </div>

              {/* Record Status */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:shadow-gray-500/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/30">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Record Status
                  </h3>
                </div>
                <p className="text-gray-900 text-lg font-bold">
                  {customer.meta.isArchived ? "Archived" : "Active Record"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Second Row: Contacts & Tags ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contacts */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Contacts</h3>
              <span className="ml-auto px-2.5 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold">
                {customer.contacts?.length || 0} total
              </span>
            </div>
            {customer.contacts && customer.contacts.length > 0 ? (
              <div className="space-y-3">
                {customer.contacts.map((contact: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        {contact.type}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {contact.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-blue-50 rounded-full mb-3">
                  <Phone className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  No contacts added yet
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Tags</h3>
              <span className="ml-auto px-2.5 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-bold">
                {customer.tags?.length || 0} total
              </span>
            </div>
            {customer.tags && customer.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag: any, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-700 rounded-lg text-sm font-bold hover:shadow-md hover:shadow-purple-500/20 transition-all duration-200"
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name || tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-purple-50 rounded-full mb-3">
                  <Tag className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No tags assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Activity Timeline ── */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 border-b border-blue-400/30 px-6 sm:px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Activity Timeline
                </h3>
                <p className="text-blue-100 text-sm">
                  Complete history of customer activities
                </p>
              </div>
              <span className="ml-auto px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-bold">
                {customer.activities?.length || 0} events
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {customer.activities && customer.activities.length > 0 ? (
              <div className="space-y-4">
                {customer.activities.map((activity: any, index: number) => {
                  const ActivityIcon = getActivityIcon(activity.activityType);
                  const activityColor = getActivityColor(activity.activityType);

                  return (
                    <div
                      key={activity.id}
                      className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 -translate-x-1/2 w-8 h-8 bg-gradient-to-br ${activityColor} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <ActivityIcon className="w-4 h-4 text-white" />
                      </div>

                      {/* Activity card */}
                      <div className="ml-6 bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-xl p-4 border border-gray-100 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">
                              {activity.activityType
                                .replace(/([A-Z])/g, " $1")
                                .trim()}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {activity.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 text-xs font-medium whitespace-nowrap shadow-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDateTime(activity.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-50 rounded-full mb-4">
                  <Activity className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  No activities recorded yet
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Activities will appear here as they occur
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
