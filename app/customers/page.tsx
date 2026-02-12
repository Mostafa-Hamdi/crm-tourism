"use client";

import {
  useDeleteCustomersMutation,
  useGetSpecificCustomersMutation,
} from "@/store/api/apiSlice";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Users,
  Trash2,
  Sparkles,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  UserCheck,
  UserX,
  View,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: number;
  fullName: string;
  displayName: string;
  gender: string | null;
  dateOfBirth: string | null;
  nationalId: string | null;
  profile: string | null;
  meta: {
    isActive: boolean;
    isArchived: boolean;
    createdAt: string;
    lastInteractionAt: string | null;
  };
}

interface PaginatedResponse {
  data: Customer[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getAvatarGradient = (index: number) => {
  const gradients = [
    "from-blue-600 to-cyan-600",
    "from-purple-600 to-pink-600",
    "from-green-600 to-emerald-600",
    "from-orange-600 to-red-600",
    "from-indigo-600 to-blue-600",
    "from-rose-600 to-pink-600",
    "from-teal-600 to-cyan-600",
    "from-amber-600 to-orange-600",
  ];
  return gradients[index % gradients.length];
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
  const [getData, { isLoading }] = useGetSpecificCustomersMutation();
  const [deleteCustomer] = useDeleteCustomersMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [response, setResponse] = useState<PaginatedResponse | any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCustomers = async (page = pageNumber, size = pageSize) => {
    try {
      const result = await getData({
        pageNumber: page,
        pageSize: size,
      }).unwrap();
      setResponse(result);
      setCustomers(result.data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]);

  // ── Search Filter (client-side on current page) ────────────────────────────

  const filtered = useMemo(() => {
    if (!customers) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(q) ||
        c.displayName?.toLowerCase().includes(q) ||
        c.nationalId?.toLowerCase().includes(q),
    );
  }, [customers, searchQuery]);

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "😢 Delete this customer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#e5e7eb",
    });
    if (!confirm.isConfirmed) return;

    try {
      await deleteCustomer({ id }).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Customer has been removed.",
        timer: 2000,
        showConfirmButton: false,
      });
      fetchCustomers();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete customer.",
      });
    }
  };

  // ── Pagination ─────────────────────────────────────────────────────────────

  const totalPages = response
    ? Math.ceil(response.totalCount / response.pageSize)
    : 1;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setPageNumber(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (pageNumber <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (pageNumber >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "...",
        pageNumber - 1,
        pageNumber,
        pageNumber + 1,
        "...",
        totalPages,
      );
    }
    return pages;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px] font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  Customers
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Manage your customer base and relationships
                </p>
              </div>
            </div>

            {/* <Link
              href="/customers/add"
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add Customer</span>
            </Link> */}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Customers
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {response?.totalCount ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Page</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {customers.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <List className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Search Results
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {filtered.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Filter className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Search + Page-size ── */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search input */}
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by name or national ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>

            {/* Page-size buttons */}
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

            {/* Count badge */}
            <div className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-400 rounded-xl shadow-lg shadow-blue-500/30">
              <Users className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">
                {filtered.length} Customers
              </span>
            </div>
          </div>

          {/* Pagination summary */}
          {response && totalPages > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Showing page{" "}
                <span className="font-bold text-blue-600">{pageNumber}</span> of{" "}
                <span className="font-bold text-blue-600">{totalPages}</span> (
                {response.totalCount} total customers, {pageSize} per page)
              </p>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading Customers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg">
                {searchQuery
                  ? "No customers match your search"
                  : "No customers yet"}
              </p>
              {!searchQuery && (
                <Link
                  href="/customers/add"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add First Customer
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 border-b border-blue-400/30">
                  <tr>
                    {[
                      "Customer",
                      "Display Name",
                      "National ID",
                      "Status",
                      "Joined",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-5 ${h === "Actions" ? "text-center" : "text-left"}`}
                      >
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {h}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filtered.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 transition-all duration-200"
                    >
                      {/* Customer */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${getAvatarGradient(index)} rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0`}
                          >
                            <span className="text-white font-bold text-sm">
                              {getInitials(customer.fullName)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-base">
                              {customer.fullName || "—"}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              #{customer.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Display Name */}
                      <td className="px-6 py-5">
                        <span className="text-gray-700 text-sm">
                          {customer.displayName || "—"}
                        </span>
                      </td>

                      {/* National ID */}
                      <td className="px-6 py-5">
                        {customer.nationalId ? (
                          <span className="text-gray-700 text-sm font-mono">
                            {customer.nationalId}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {customer.meta.isActive ? (
                            <>
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <UserCheck className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-green-700 text-sm font-medium">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <UserX className="w-4 h-4 text-red-600" />
                              </div>
                              <span className="text-red-700 text-sm font-medium">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 text-sm font-medium">
                            {formatDate(customer.meta.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="cursor-pointer p-2.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
                            title="View customer"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="cursor-pointer p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                            title="Delete customer"
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

        {/* ── Pagination Controls ── */}
        {response && totalPages > 1 && (
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* First / Prev */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={pageNumber === 1}
                  title="First page"
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronsLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => goToPage(pageNumber - 1)}
                  disabled={pageNumber === 1}
                  title="Previous page"
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Page numbers */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {getPageNumbers().map((page, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    disabled={page === "..." || page === pageNumber}
                    className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold transition-all ${
                      page === pageNumber
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 cursor-default"
                        : page === "..."
                          ? "cursor-default text-gray-400"
                          : "border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 cursor-pointer"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next / Last */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                  title="Next page"
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={pageNumber === totalPages}
                  title="Last page"
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
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
