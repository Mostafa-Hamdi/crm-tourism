"use client";

import {
  useConvertClassStatusMutation,
  useDeleteClassMutation,
  useGetCourseClassesQuery,
} from "@/store/api/apiSlice";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Sparkles,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Code,
  ArrowLeft,
  Plus,
  RefreshCw,
  X,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface Class {
  id: number;
  name: string;
  code: string;
  price: number;
  instructorName: string;
  status: number;
  startDate: string;
  endDate: string;
  daysOfWeek: string;
  timeFrom: string;
  timeTo: string;
  maxStudents: number;
  course: {
    courseId: number;
    name: string;
  };
}

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);

  const { data: classes, isLoading } = useGetCourseClassesQuery({
    courseId: id,
  });
  const [convertClassStatus, { isLoading: isConverting }] =
    useConvertClassStatusMutation();
  const [deleteClass] = useDeleteClassMutation();

  const t = useTranslations("classes");

  // Status mapping (labels are localized)
  const statusOptions = [
    {
      value: 0,
      label: t("status.0"),
      color: "from-gray-100 to-slate-100 border-gray-200 text-gray-700",
    },
    {
      value: 1,
      label: t("status.1"),
      color: "from-green-100 to-emerald-100 border-green-200 text-green-700",
    },
    {
      value: 2,
      label: t("status.2"),
      color: "from-yellow-100 to-orange-100 border-yellow-200 text-yellow-700",
    },
    {
      value: 3,
      label: t("status.3"),
      color: "from-red-100 to-rose-100 border-red-200 text-red-700",
    },
  ];

  const getStatusInfo = (status: number) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  // Get course name from first class
  const courseName = classes?.data?.[0]?.course?.name || "Course";

  // Search filter
  const filteredClasses = useMemo(() => {
    if (!classes?.data) return [];

    if (!searchQuery.trim()) return classes?.data;

    const query = searchQuery.toLowerCase();
    return classes?.data?.filter(
      (cls: Class) =>
        cls.name.toLowerCase().includes(query) ||
        cls.code?.toLowerCase().includes(query) ||
        cls.instructorName?.toLowerCase().includes(query) ||
        cls.daysOfWeek?.toLowerCase().includes(query),
    );
  }, [classes, searchQuery]);

  // Open status conversion modal
  const handleOpenStatusModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setSelectedStatus(classItem.status);
    setShowStatusModal(true);
  };

  // Close status modal
  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedClass(null);
    setSelectedStatus(0);
  };

  // Submit status conversion
  const handleStatusConversion = async () => {
    if (!selectedClass) return;

    if (selectedStatus === selectedClass.status) {
      Swal.fire({
        icon: "info",
        title: t("noChangeTitle"),
        text: t("noChangeText"),
      });
      return;
    }

    try {
      await convertClassStatus({
        id: selectedClass.id,
        status: selectedStatus,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: t("statusUpdatedTitle"),
        text: t("statusUpdatedText", {
          status: getStatusInfo(selectedStatus).label,
        }),
        timer: 2000,
      });

      handleCloseStatusModal();
    } catch (err: any) {
      let errorMessage = "Failed to update class status.";

      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: errorMessage,
      });
    }
  };

  const handleDelete = async (classId: number) => {
    const result = await Swal.fire({
      title: t("deleteConfirm"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("confirmYes"),
      cancelButtonText: t("confirmNo"),
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#e5e7eb",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteClass({ id: classId }).unwrap();

      await Swal.fire({
        icon: "success",
        title: t("deleteSuccessTitle"),
        text: t("deleteSuccessText"),
        timer: 2000,
      });
    } catch (err: any) {
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        "Something went wrong while deleting the class.";

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: errorMessage,
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time from "HH:mm:ss" to "HH:mm AM/PM"
  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate random colors for class icons
  const getColorForClass = (index: number) => {
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

  // Count by status
  const openClasses =
    classes?.data?.filter((c: Class) => c.status === 1).length || 0;
  const fullClasses =
    classes?.data?.filter((c: Class) => c.status === 2).length || 0;
  const closedClasses =
    classes?.data?.filter((c: Class) => c.status === 3).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.push("/courses")}
                className="cursor-pointer p-3 bg-white/50 hover:bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  {courseName} {t("title")}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {t("manageCourseClassesSubtitle")}
                </p>
              </div>
            </div>

            <Link
              href={`/classes/add?courseId=${id}`}
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t("addButton")}</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("totalClasses")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {classes?.data?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("open")}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {openClasses}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-yellow-500/10 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("full")}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mt-1">
                  {fullClasses}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("closed")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mt-1">
                  {closedClasses}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-red-600" />
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
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">
                {filteredClasses.length} {t("title")}
              </span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">{t("loading")}</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-2">
                {searchQuery ? t("noClassesFound") : t("noClassesYet")}
              </p>
              {!searchQuery && (
                <Link
                  href={`/classes/add?courseId=${id}`}
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  {t("addFirstClass")}
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 border-b border-blue-400/30">
                  <tr>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.classInfo")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.instructor")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.schedule")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.duration")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.price")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.capacity")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.status")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.changeStatus")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.operations")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClasses.map((classItem: Class, index: number) => (
                    <tr
                      key={classItem.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 transition-all duration-200"
                    >
                      {/* Class Info */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${getColorForClass(
                              index,
                            )} rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30`}
                          >
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-base">
                              {classItem.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Code className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {classItem.code}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="px-6 py-5">
                        {classItem.instructorName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-gray-700 text-sm font-medium">
                              {classItem.instructorName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            {t("notAssigned")}
                          </span>
                        )}
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 text-sm font-medium">
                              {classItem.daysOfWeek || t("notScheduled")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 text-sm">
                              {formatTime(classItem.timeFrom)} -{" "}
                              {formatTime(classItem.timeTo)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">
                            {t("start")}
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            {formatDate(classItem.startDate)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t("end")}
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            {formatDate(classItem.endDate)}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {classItem.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 text-sm font-medium">
                            {classItem.maxStudents || 0} {t("students")}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r border rounded-lg text-xs font-bold shadow-sm ${
                            getStatusInfo(classItem.status).color
                          }`}
                        >
                          {getStatusInfo(classItem.status).label}
                        </span>
                      </td>

                      {/* Change Status */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleOpenStatusModal(classItem)}
                            className="cursor-pointer p-2.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group"
                            title={t("changeStatus")}
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        </div>
                      </td>

                      {/* Operations */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/classes/${classItem.id}/edit`}
                            className="cursor-pointer p-2.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 group"
                            title={t("editClass")}
                          >
                            <Edit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(classItem.id)}
                            className="cursor-pointer p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group"
                            title={t("deleteClass")}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
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

      {/* Status Conversion Modal */}
      {showStatusModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {t("changeStatusTitle")}
                    </h2>
                    <p className="text-cyan-100 text-sm mt-1">
                      {selectedClass.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseStatusModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Current Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("currentStatus")}
                </label>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r border rounded-lg text-sm font-bold ${
                    getStatusInfo(selectedClass.status).color
                  }`}
                >
                  {getStatusInfo(selectedClass.status).label}
                </div>
              </div>

              {/* New Status Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("newStatus")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(parseInt(e.target.value))
                    }
                    className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">
                      {t("statusMeaningsTitle")}
                    </p>
                    <ul className="space-y-1 text-blue-800 text-xs">
                      <li>• {t("statusMeanings.planned")}</li>
                      <li>• {t("statusMeanings.open")}</li>
                      <li>• {t("statusMeanings.full")}</li>
                      <li>• {t("statusMeanings.closed")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleCloseStatusModal}
                disabled={isConverting}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleStatusConversion}
                disabled={isConverting}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isConverting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("updating")}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>{t("updateStatus")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
