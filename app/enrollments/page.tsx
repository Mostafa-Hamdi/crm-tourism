"use client";

import {
  useConvertEnrollmentStatusMutation,
  useDeleteEnrollmentMutation,
  useGetSpecificEnrollmentsMutation,
  useGetFilteredEnrollmentsMutation,
} from "@/store/api/apiSlice";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  UserCheck,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Pause,
  Clock,
  RefreshCw,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  List,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

interface Enrollment {
  id: number;
  studentName: string;
  courseName: string;
  className: string;
  status: string;
  enrollmentDate: string;
}

interface PaginatedResponse {
  data: Enrollment[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [displayedEnrollments, setDisplayedEnrollments] = useState<
    Enrollment[]
  >([]);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [enrollmentsResponse, setEnrollmentsResponse] =
    useState<PaginatedResponse | null>(null);

  const [getSpecificEnrollments, { isLoading }] =
    useGetSpecificEnrollmentsMutation();
  const [deleteEnrollment] = useDeleteEnrollmentMutation();
  const [convertStatus, { isLoading: isConverting }] =
    useConvertEnrollmentStatusMutation();
  const [getFilteredEnrollments, { isLoading: isFilterLoading }] =
    useGetFilteredEnrollmentsMutation();

  // Fetch enrollments on mount and when page/size changes
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const result = await getSpecificEnrollments({
          pageNumber,
          pageSize,
        }).unwrap();
        setEnrollmentsResponse(result);
        setDisplayedEnrollments(result.data);
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      }
    };

    fetchEnrollments();
  }, [pageNumber, pageSize, getSpecificEnrollments]);

  // Filter by status
  const handleStatusFilter = async (statusId: number) => {
    setActiveFilter(statusId);

    if (statusId === 0) {
      try {
        const result = await getSpecificEnrollments({
          pageNumber,
          pageSize,
        }).unwrap();
        setDisplayedEnrollments(result.data);
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      }
    } else {
      try {
        const filtered = await getFilteredEnrollments({ statusId }).unwrap();
        setDisplayedEnrollments(filtered);
      } catch (err) {
        console.error("Failed to filter enrollments:", err);
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Failed to filter enrollments.",
        });
      }
    }
  };

  // Search filter
  const filteredEnrollments = useMemo(() => {
    if (!displayedEnrollments) return [];

    const query = searchQuery.toLowerCase();
    return displayedEnrollments.filter(
      (enrollment: Enrollment) =>
        enrollment.studentName.toLowerCase().includes(query) ||
        enrollment.courseName.toLowerCase().includes(query) ||
        enrollment.className.toLowerCase().includes(query) ||
        enrollment.status.toLowerCase().includes(query),
    );
  }, [displayedEnrollments, searchQuery]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "😢 Are you sure you want to delete this enrollment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#e5e7eb",
    });

    if (!result.isConfirmed) return;
    try {
      await deleteEnrollment({ id }).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Enrollment has been deleted successfully.",
        timer: 2000,
      });

      // Refresh current page
      const result = await getSpecificEnrollments({
        pageNumber,
        pageSize,
      }).unwrap();
      setEnrollmentsResponse(result);
      setDisplayedEnrollments(result.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Failed to delete enrollment.",
      });
    }
  };

  // Open convert modal
  const handleConvertClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setSelectedStatusId(0);
    setShowConvertModal(true);
  };

  // Close convert modal
  const handleCloseModal = () => {
    setShowConvertModal(false);
    setSelectedEnrollment(null);
    setSelectedStatusId(0);
  };

  // Submit status conversion
  const handleConvertSubmit = async () => {
    if (!selectedEnrollment) return;

    if (selectedStatusId === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Status",
        text: "Please select a status.",
      });
      return;
    }

    try {
      await convertStatus({
        id: selectedEnrollment.id,
        status: selectedStatusId,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Status Updated!",
        text: "Enrollment status has been updated successfully.",
        timer: 2000,
      });

      handleCloseModal();

      // Refresh current page
      const result = await getSpecificEnrollments({
        pageNumber,
        pageSize,
      }).unwrap();
      setEnrollmentsResponse(result);
      setDisplayedEnrollments(result.data);
    } catch (err) {
      let message = "Failed to update enrollment status.";

      if (typeof err === "object" && err !== null) {
        const maybeData = (err as any).data;
        if (typeof maybeData === "string") {
          message = maybeData;
        }
      }
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: message,
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Active: "from-green-100 to-emerald-100 border-green-200 text-green-700",
      Completed: "from-blue-100 to-cyan-100 border-blue-200 text-blue-700",
      Frozen: "from-yellow-100 to-orange-100 border-yellow-200 text-yellow-700",
      Canceled: "from-red-100 to-rose-100 border-red-200 text-red-700",
    };
    return (
      colors[status] ||
      "from-gray-100 to-gray-100 border-gray-200 text-gray-700"
    );
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: any } = {
      Active: CheckCircle,
      Completed: CheckCircle,
      Frozen: Pause,
      Canceled: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-3.5 h-3.5" />;
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1); // Reset to first page when changing page size
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= (enrollmentsResponse?.totalPages || 1)) {
      setPageNumber(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(enrollmentsResponse?.totalPages || 1);
  const goToPreviousPage = () => goToPage(pageNumber - 1);
  const goToNextPage = () => goToPage(pageNumber + 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = enrollmentsResponse?.totalPages || 1;
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pageNumber <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (pageNumber >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(pageNumber - 1);
        pages.push(pageNumber);
        pages.push(pageNumber + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Status options for conversion
  const statusOptions = [
    { id: 1, label: "Active", color: "text-green-700" },
    { id: 2, label: "Completed", color: "text-blue-700" },
    { id: 3, label: "Cancelled", color: "text-red-700" },
    { id: 4, label: "Frozen", color: "text-yellow-700" },
  ];

  // Status filter buttons
  const statusFilters = [
    { id: 0, label: "All", icon: Filter, color: "from-gray-600 to-gray-700" },
    {
      id: 1,
      label: "Active",
      icon: CheckCircle,
      color: "from-green-600 to-emerald-600",
    },
    {
      id: 2,
      label: "Completed",
      icon: CheckCircle,
      color: "from-blue-600 to-cyan-600",
    },
    {
      id: 3,
      label: "Canceled",
      icon: XCircle,
      color: "from-red-600 to-rose-600",
    },
    {
      id: 4,
      label: "Frozen",
      icon: Pause,
      color: "from-yellow-600 to-orange-600",
    },
  ];

  // Generate random colors for enrollment icons
  const getColorForEnrollment = (index: number) => {
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
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  Deals
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Manage Deals and track progress
                </p>
              </div>
            </div>

            <Link
              href={"/enrollments/add"}
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add Deal</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Deals</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {enrollmentsResponse?.totalCount || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {displayedEnrollments?.filter(
                    (e: Enrollment) => e.status === "Active",
                  ).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {displayedEnrollments?.filter(
                    (e: Enrollment) => e.status === "Completed",
                  ).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Found</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {filteredEnrollments.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
          <div className="flex flex-wrap gap-3">
            {statusFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter?.id;

              return (
                <button
                  key={filter.label}
                  onClick={() => handleStatusFilter(filter?.id)}
                  disabled={isFilterLoading}
                  className={`group relative cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-r ${filter.color} text-white shadow-lg hover:shadow-xl`
                      : "bg-white/50 text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{filter.label}</span>
                  {filter.label !== "All" && (
                    <span
                      className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? "bg-white/20" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {displayedEnrollments?.filter(
                        (e: Enrollment) => e.status === filter.label,
                      ).length || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar with Page Size Selector */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by student, course, class or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl">
              <List className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Show:
              </span>
              <div className="flex items-center gap-2">
                {[5, 10, 20, 50].map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      pageSize === size
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-400 rounded-xl shadow-lg shadow-blue-500/30">
              <UserCheck className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">
                {filteredEnrollments.length} Deals
              </span>
            </div>
          </div>

          {/* Pagination Info */}
          {enrollmentsResponse && enrollmentsResponse.totalPages > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Showing page{" "}
                <span className="font-bold text-blue-600">{pageNumber}</span> of{" "}
                <span className="font-bold text-blue-600">
                  {enrollmentsResponse.totalPages}
                </span>{" "}
                ({enrollmentsResponse.totalCount} total enrollments, {pageSize}{" "}
                per page)
              </p>
            </div>
          )}
        </div>

        {/* Table Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
          {isLoading || isFilterLoading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading Deals...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full mb-4">
                <UserCheck className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg">
                {searchQuery
                  ? "No enrollments found matching your search"
                  : "No enrollments yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 border-b border-blue-400/30">
                  <tr>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Student
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Course
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Class
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Status
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Enrollment Date
                      </span>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Convert Status
                      </span>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Operations
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEnrollments.map(
                    (enrollment: Enrollment, index: number) => (
                      <tr
                        key={enrollment.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 transition-all duration-200"
                      >
                        {/* Student */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 bg-gradient-to-br ${getColorForEnrollment(
                                index,
                              )} rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30`}
                            >
                              <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-base">
                                {enrollment.studentName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-gray-700 text-sm font-medium">
                              {enrollment.courseName}
                            </span>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-gray-700 text-sm font-medium">
                              {enrollment.className}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r border rounded-lg text-xs font-bold shadow-sm ${getStatusColor(
                              enrollment.status,
                            )}`}
                          >
                            {getStatusIcon(enrollment.status)}
                            {enrollment.status}
                          </span>
                        </td>

                        {/* Enrollment Date */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 text-sm font-medium">
                              {formatDate(enrollment.enrollmentDate)}
                            </span>
                          </div>
                        </td>

                        {/* Convert Status */}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleConvertClick(enrollment)}
                              className="cursor-pointer p-2.5 text-purple-600 hover:text-white bg-purple-50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 group"
                              title="Convert status"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/enrollments/edit/${enrollment.id}`}
                              className="cursor-pointer p-2.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group"
                              title="Edit enrollment"
                            >
                              <Edit2 className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(enrollment.id)}
                              className="cursor-pointer p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group"
                              title="Delete enrollment"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {enrollmentsResponse && enrollmentsResponse.totalPages > 1 && (
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Previous buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToFirstPage}
                  disabled={pageNumber === 1}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="First page"
                >
                  <ChevronsLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={goToPreviousPage}
                  disabled={pageNumber === 1}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Page numbers */}
              <div className="flex items-center gap-2">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    disabled={page === "..." || page === pageNumber}
                    className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                      page === pageNumber
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                        : page === "..."
                          ? "cursor-default"
                          : "border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToNextPage}
                  disabled={pageNumber === enrollmentsResponse.totalPages}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={pageNumber === enrollmentsResponse.totalPages}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Last page"
                >
                  <ChevronsRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Convert Status Modal */}
      {showConvertModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Convert Status
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedEnrollment.studentName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Current Status Info */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Current Status</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedEnrollment.status}
                </p>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedStatusId}
                    onChange={(e) =>
                      setSelectedStatusId(parseInt(e.target.value))
                    }
                    className="w-full bg-gradient-to-r from-gray-50 to-purple-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value={0}>Choose a status...</option>
                    {statusOptions.map((status) => (
                      <option
                        key={status.id}
                        value={status.id}
                        className={status.color}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="cursor-pointer flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertSubmit}
                disabled={isConverting}
                className="cursor-pointer flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Update Status</span>
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
