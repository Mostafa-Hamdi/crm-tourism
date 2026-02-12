"use client";

import {
  useDeleteStudentMutation,
  useGetSpecificStudentsMutation,
  useSearchStudentsMutation,
} from "@/store/api/apiSlice";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  GraduationCap,
  Edit2,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  UserCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  List,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

interface Student {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  nationalId: string | null;
  gender: string | null;
  dateOfBirth: string;
  relativeName: string | null;
  parentPhoneNumber: string | null;
  level: string | null;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  data: Student[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [getSpecificStudents, { isLoading }] = useGetSpecificStudentsMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const [searchStudents, { isLoading: isSearchLoading }] =
    useSearchStudentsMutation();

  // Fetch paginated students
  useEffect(() => {
    const fetchStudents = async () => {
      if (isSearchMode) return; // Don't fetch if in search mode

      try {
        const result = await getSpecificStudents({
          pageNumber: currentPage,
          pageSize: pageSize,
        }).unwrap();

        setStudents(result?.data || []);
        setTotalCount(result.totalCount || 0);
        setTotalPages(result.totalPages || 0);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setStudents([]);
      }
    };

    fetchStudents();
  }, [currentPage, pageSize, getSpecificStudents, isSearchMode]);

  // Handle search with debounce
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        // Exit search mode and go back to pagination
        setIsSearchMode(false);
        setCurrentPage(1);
        return;
      }

      setIsSearchMode(true);

      try {
        const result = await searchStudents({ name: searchQuery }).unwrap();
        console.log("Search result:", result);
        setStudents(result);
        setTotalCount(result.length);
        setTotalPages(1);
      } catch (error) {
        console.error("Search failed:", error);
        setStudents([]);
        setTotalCount(0);
      }
    };

    // Debounce search by 500ms
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStudents]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "😢 Are you sure you want to delete this student?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#e5e7eb",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteStudent({ id }).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Student has been deleted successfully.",
        timer: 2000,
      });

      // Refresh current page
      if (isSearchMode && searchQuery) {
        // Re-trigger search
        const result = await searchStudents({ name: searchQuery }).unwrap();
        setStudents(result);
        setTotalCount(result.length);
      } else {
        // Re-fetch current page
        const result = await getSpecificStudents({
          pageNumber: currentPage,
          pageSize: pageSize,
        }).unwrap();
        setStudents(result.data || []);
        setTotalCount(result.totalCount || 0);
        setTotalPages(result.totalPages || 0);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Failed to delete student.",
      });
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && !isSearchMode) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Format date (without time)
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate random colors for student icons
  const getColorForStudent = (index: number) => {
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

  // Calculate stats
  const activeStudents = students?.filter((s) => s.isActive).length;
  const inactiveStudents = students?.filter((s) => !s.isActive).length;
  console.log("Students:", students);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  Students
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Manage and track all enrolled students
                </p>
              </div>
            </div>

            <Link
              href={"/students/add"}
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add Student</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Students
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {totalCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {activeStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Inactive</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mt-1">
                  {inactiveStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {isSearchMode ? "Found" : "On Page"}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {students?.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar with Page Size Selector */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
              {isSearchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Page Size Selector */}
            {!isSearchMode && (
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
            )}

            <div className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-400 rounded-xl shadow-lg shadow-blue-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">
                {students?.length} Students
              </span>
            </div>
          </div>

          {/* Pagination Info - Only show when not searching */}
          {!isSearchMode && totalPages > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Showing page{" "}
                <span className="font-bold text-blue-600">{currentPage}</span>{" "}
                of <span className="font-bold text-blue-600">{totalPages}</span>{" "}
                ({totalCount} total students, {pageSize} per page)
              </p>
            </div>
          )}
        </div>

        {/* Table Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
          {isLoading || isSearchLoading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading students...</p>
            </div>
          ) : students?.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full mb-4">
                <GraduationCap className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg">
                {searchQuery
                  ? "No students found matching your search"
                  : "No students yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 border-b border-blue-400/30">
                  <tr>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Student Info
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Contact
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        National ID
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Gender
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Date of Birth
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Parent Info
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Level
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Status
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
                  {students?.map((student: Student, index: number) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 transition-all duration-200"
                    >
                      {/* Student Info */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${getColorForStudent(
                              index,
                            )} rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30`}
                          >
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-base">
                              {student.fullName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700 text-sm font-medium">
                              {student.email}
                            </span>
                          </div>
                          {student.phoneNumber && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-600 text-xs">
                                {student.phoneNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* National ID */}
                      <td className="px-6 py-5">
                        {student.nationalId ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 text-sm font-mono font-medium">
                              {student.nationalId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            Not provided
                          </span>
                        )}
                      </td>

                      {/* Gender */}
                      <td className="px-6 py-5">
                        {student.gender ? (
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 text-sm font-medium capitalize">
                              {student.gender}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            Not specified
                          </span>
                        )}
                      </td>

                      {/* Date of Birth */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 text-sm font-medium">
                            {formatDate(student.dateOfBirth)}
                          </span>
                        </div>
                      </td>

                      {/* Parent Info */}
                      <td className="px-6 py-5">
                        {student.relativeName || student.parentPhoneNumber ? (
                          <div className="space-y-1">
                            {student.relativeName && (
                              <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-gray-700 text-sm font-medium">
                                  {student.relativeName}
                                </span>
                              </div>
                            )}
                            {student.parentPhoneNumber && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-gray-600 text-xs">
                                  {student.parentPhoneNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            Not provided
                          </span>
                        )}
                      </td>

                      {/* Level */}
                      <td className="px-6 py-5">
                        {student.level ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-blue-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold shadow-sm">
                            <GraduationCap className="w-3 h-3" />
                            {student.level}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            Not assigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r border rounded-lg text-xs font-bold shadow-sm ${
                            student.isActive
                              ? "from-green-100 to-emerald-100 border-green-200 text-green-700"
                              : "from-red-100 to-rose-100 border-red-200 text-red-700"
                          }`}
                        >
                          {student.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/students/${student.id}/edit`}
                            className="cursor-pointer p-2.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group"
                            title="Edit student"
                          >
                            <Edit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="cursor-pointer p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group"
                            title="Delete student"
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

        {/* Pagination Controls - Only show when not searching */}
        {!isSearchMode && totalPages > 1 && (
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Previous buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="First page"
                >
                  <ChevronsLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
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
                    disabled={page === "..." || page === currentPage}
                    className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                      page === currentPage
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
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
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
    </div>
  );
};

export default Page;
