"use client";

import {
  useGetFollowupsQuery,
  useGetFollowupsTodayMutation,
  useGetFollowupsOverdueMutation,
  useGetFollowupsByDateRangeMutation,
} from "@/store/api/apiSlice";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Calendar,
  Clock,
  AlertCircle,
  Search,
  Sparkles,
  User,
  Phone,
  MessageSquare,
  RefreshCw,
  Filter,
} from "lucide-react";

// Validation Schema for Date Range
const dateRangeSchema = yup.object().shape({
  from: yup
    .string()
    .required("Start date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  to: yup
    .string()
    .required("End date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .test(
      "is-after-from",
      "End date must be after start date",
      function (value) {
        const { from } = this.parent;
        if (!from || !value) return true;
        return new Date(value) >= new Date(from);
      },
    ),
});

type DateRangeFormData = yup.InferType<typeof dateRangeSchema>;

type FilterMode = "all" | "today" | "overdue" | "range";

interface FollowUp {
  id: number;
  fullName: string;
  phone: string;
  status: number;
  followUpDate: string;
  followUpReason: string;
}

const Page = () => {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [displayedFollowups, setDisplayedFollowups] = useState<FollowUp[]>([]);

  // Query for all follow-ups (auto-fetch on mount)
  const {
    data: allFollowups,
    isLoading: allLoading,
    refetch: refetchAll,
  } = useGetFollowupsQuery();

  // Mutations for filtered queries (manual trigger)
  const [triggerToday, { isLoading: todayLoading }] =
    useGetFollowupsTodayMutation();
  const [triggerOverdue, { isLoading: overdueLoading }] =
    useGetFollowupsOverdueMutation();
  const [triggerDateRange, { isLoading: dateRangeLoading }] =
    useGetFollowupsByDateRangeMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DateRangeFormData>({
    resolver: yupResolver(dateRangeSchema),
  });

  // Update displayed followups when all followups data changes
  useEffect(() => {
    if (filterMode === "all" && allFollowups) {
      setDisplayedFollowups(allFollowups);
    }
  }, [allFollowups, filterMode]);

  const handleShowAll = () => {
    setFilterMode("all");
    setDisplayedFollowups(allFollowups || []);
    refetchAll();
  };

  const handleShowToday = async () => {
    try {
      const response = await triggerToday();

      if ("data" in response && response.data) {
        setFilterMode("today");
        setDisplayedFollowups(response.data);
      } else {
        setDisplayedFollowups([]);
      }
    } catch (error) {
      console.error("Failed to fetch today's followups:", error);
      setDisplayedFollowups([]);
    }
  };

  const handleShowOverdue = async () => {
    try {
      const response = await triggerOverdue();

      if ("data" in response && response.data) {
        setFilterMode("overdue");
        setDisplayedFollowups(response.data);
      } else {
        setDisplayedFollowups([]);
      }
    } catch (error) {
      console.error("Failed to fetch overdue followups:", error);
      setDisplayedFollowups([]);
    }
  };

  const onSubmitDateRange = async (data: DateRangeFormData) => {
    try {
      const response = await triggerDateRange({
        from: data.from,
        to: data.to,
      });

      if ("data" in response && response.data) {
        setFilterMode("range");
        setDisplayedFollowups(response.data);
      } else {
        setDisplayedFollowups([]);
      }
    } catch (error) {
      console.error("Failed to fetch followups by range:", error);
      setDisplayedFollowups([]);
    }
  };

  const isLoading =
    allLoading || todayLoading || overdueLoading || dateRangeLoading;
  const followups =
    filterMode === "all" && allFollowups ? allFollowups : displayedFollowups;
  const statusMap: { [key: number]: string } = {
    1: "New",
    2: "Contacted",
    3: "Interested",
    4: "Followup",
    5: "Cold",
    6: "Lost",
    7: "Converted",
  };
  const handleDatePicker = (e: any) => {
    e.target.showPicker();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                Follow-up Management
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Track and manage your lead follow-ups
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
          <div className="space-y-6">
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleShowAll}
                className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  filterMode === "all"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <Calendar className="w-5 h-5" />
                All Follow-ups
              </button>

              <button
                type="button"
                onClick={handleShowToday}
                disabled={todayLoading}
                className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  filterMode === "today"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/40"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {todayLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
                Today's Follow-ups
              </button>

              <button
                type="button"
                onClick={handleShowOverdue}
                disabled={overdueLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  filterMode === "overdue"
                    ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/40"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {overdueLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                Overdue
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  Filter by Date Range
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    onClick={handleDatePicker}
                    type="date"
                    {...register("from")}
                    className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                      errors.from ? "border-red-300" : "border-gray-200"
                    } rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                  />
                  {errors.from && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.from.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    onClick={handleDatePicker}
                    type="date"
                    {...register("to")}
                    className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                      errors.to ? "border-red-300" : "border-gray-200"
                    } rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                  />
                  {errors.to && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.to.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmitDateRange)}
                    disabled={dateRangeLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {dateRangeLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              {filterMode === "all" && "All Follow-ups"}
              {filterMode === "today" && "Today's Follow-ups"}
              {filterMode === "overdue" && "Overdue Follow-ups"}
              {filterMode === "range" && "Follow-ups in Range"}
              <span className="text-sm font-normal text-gray-500">
                ({followups?.length || 0} results)
              </span>
            </h2>

            {filterMode === "all" && (
              <button
                type="button"
                onClick={() => refetchAll()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Loading follow-ups...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!followups || followups.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium">
                No follow-ups found
              </p>
              <p className="text-gray-500 text-sm">
                {filterMode === "all" && "No follow-ups available"}
                {filterMode === "today" &&
                  "There are no follow-ups scheduled for today"}
                {filterMode === "overdue" &&
                  "Great! You have no overdue follow-ups"}
                {filterMode === "range" &&
                  "No follow-ups found in the selected date range"}
              </p>
            </div>
          )}

          {/* Follow-ups List */}
          {!isLoading && followups && followups.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {followups.map((followup: FollowUp, index: number) => (
                <div
                  key={followup.id || index}
                  className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Lead Name & Status */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {followup.fullName || "Unknown Lead"}
                          </span>
                        </div>
                        {followup.status && (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                followup.status === 1
                                  ? "bg-blue-100 text-blue-700"
                                  : followup.status === 2
                                    ? "bg-green-100 text-green-700"
                                    : followup.status === 3
                                      ? "bg-yellow-100 text-yellow-700"
                                      : followup.status === 4
                                        ? "bg-purple-100 text-purple-700"
                                        : followup.status === 5
                                          ? "bg-orange-100 text-orange-700"
                                          : followup.status === 6
                                            ? "bg-emerald-100 text-emerald-700"
                                            : followup.status === 7
                                              ? "bg-red-100 text-red-700"
                                              : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              Status: {statusMap[followup.status] || "Unknown"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{followup.phone}</span>
                      </div>

                      {/* Follow-up Reason */}
                      {followup.followUpReason && (
                        <div className="flex items-start gap-2 text-sm text-gray-700 bg-white/50 rounded-lg p-3">
                          <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                          <div>
                            <span className="font-medium text-gray-900">
                              Reason:{" "}
                            </span>
                            <span>{followup.followUpReason}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Follow-up Date */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 min-w-fit">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">
                          {followup.followUpDate
                            ? new Date(
                                followup.followUpDate,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "No date set"}
                        </div>
                        {followup.followUpDate && (
                          <div className="text-gray-500">
                            {new Date(followup.followUpDate).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
