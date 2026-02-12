"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  DollarSign,
  CreditCard,
  Calendar,
  TrendingUp,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  User,
  BookOpen,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useGetPaymentsQuery } from "@/store/api/apiSlice";
import Link from "next/link";

// Payment interface based on API response
interface Payment {
  id: number;
  enrollmentId: number;
  studentName: string;
  courseName: string;
  className: string;
  amount: number;
  method: number;
  status: number;
  paymentDate: string;
  referenceNumber: string;
  createdBy: string;
}

// Payment method mapping
const PAYMENT_METHOD: { [key: number]: { name: string; icon: string } } = {
  1: { name: "Cash", icon: "💵" },
  2: { name: "Credit Card", icon: "💳" },
  3: { name: "Bank Transfer", icon: "🏦" },
  4: { name: "PayPal", icon: "💰" },
  5: { name: "Other", icon: "📝" },
};

// Payment status mapping
const PAYMENT_STATUS: {
  [key: number]: {
    name: string;
    color: string;
    bgColor: string;
    icon: any;
  };
} = {
  1: {
    name: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle2,
  },
  2: {
    name: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  3: {
    name: "Failed",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
  4: {
    name: "Refunded",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: AlertCircle,
  },
};

const PaymentsPage = () => {
  const { data, isLoading, error } = useGetPaymentsQuery();
  const payments: Payment[] = data || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Payment;
    direction: "asc" | "desc";
  } | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    method: "",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
  });

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.studentName.toLowerCase().includes(query) ||
          payment.courseName.toLowerCase().includes(query) ||
          payment.className.toLowerCase().includes(query) ||
          payment.referenceNumber.toLowerCase().includes(query) ||
          payment.createdBy.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter(
        (payment) => payment.status === parseInt(filters.status),
      );
    }

    // Method filter
    if (filters.method) {
      result = result.filter(
        (payment) => payment.method === parseInt(filters.method),
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(
        (payment) => new Date(payment.paymentDate) >= fromDate,
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(
        (payment) => new Date(payment.paymentDate) <= toDate,
      );
    }

    // Amount range filter
    if (filters.minAmount) {
      result = result.filter(
        (payment) => payment.amount >= parseFloat(filters.minAmount),
      );
    }

    if (filters.maxAmount) {
      result = result.filter(
        (payment) => payment.amount <= parseFloat(filters.maxAmount),
      );
    }

    return result;
  }, [payments, searchQuery, filters]);

  // Sort payments
  const sortedPayments = useMemo(() => {
    if (!sortConfig) return filteredPayments;

    return [...filteredPayments].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredPayments, sortConfig]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const completed = filteredPayments.filter((p) => p.status === 1);
    const pending = filteredPayments.filter((p) => p.status === 2);
    const failed = filteredPayments.filter((p) => p.status === 3);

    const completedAmount = completed.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    return {
      total,
      count: filteredPayments.length,
      completed: completed.length,
      completedAmount,
      pending: pending.length,
      failed: failed.length,
      avgAmount:
        filteredPayments.length > 0 ? total / filteredPayments.length : 0,
    };
  }, [filteredPayments]);

  // Handle sorting
  const handleSort = (key: keyof Payment) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: "",
      method: "",
      dateFrom: "",
      dateTo: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get unique values for filters
  const uniqueMethods = Array.from(new Set(payments.map((p) => p.method)));
  const uniqueStatuses = Array.from(new Set(payments.map((p) => p.status)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-[2000px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/40 rotate-3 transition-transform hover:rotate-6">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  Payments
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Track and manage all payment transactions
                </p>
                {!isLoading && payments.length > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {payments.length} payments loaded
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/payments/add"
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add Payment</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {formatCurrency(stats.total)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 text-green-600">EGP</div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {stats.completed}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(stats.completedAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-yellow-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Payment</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {formatCurrency(stats.avgAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
          <div className="space-y-4">
            {/* Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by student, course, reference, or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3.5 ${showFilters ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"} border-2 font-semibold rounded-xl hover:border-gray-300 transition-all cursor-pointer flex items-center gap-2`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {PAYMENT_STATUS[status]?.name || "Unknown"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Method
                  </label>
                  <select
                    value={filters.method}
                    onChange={(e) =>
                      setFilters({ ...filters, method: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">All Methods</option>
                    {uniqueMethods.map((method) => (
                      <option key={method} value={method}>
                        {PAYMENT_METHOD[method]?.name || "Unknown"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.minAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, minAmount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, maxAmount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(filters.status ||
              filters.method ||
              filters.dateFrom ||
              filters.dateTo ||
              filters.minAmount ||
              filters.maxAmount) && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-all cursor-pointer text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-lg shadow-blue-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">Loading payments...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">Error loading payments</p>
                </div>
              </div>
            ) : sortedPayments.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payments found</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center gap-2">
                        ID
                        {sortConfig?.key === "id" && (
                          <>
                            {sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleSort("studentName")}
                    >
                      <div className="flex items-center gap-2">
                        Traveler
                        {sortConfig?.key === "studentName" && (
                          <>
                            {sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Trip
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center gap-2">
                        Amount
                        {sortConfig?.key === "amount" && (
                          <>
                            {sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleSort("paymentDate")}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {sortConfig?.key === "paymentDate" && (
                          <>
                            {sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedPayments.map((payment) => {
                    const statusConfig = PAYMENT_STATUS[payment.status];
                    const methodConfig = PAYMENT_METHOD[payment.method];
                    const StatusIcon = statusConfig?.icon || AlertCircle;

                    return (
                      <tr
                        key={payment.id}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            #{payment.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {payment.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {payment.studentName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {payment.courseName}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {payment.className}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-green-700">
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {methodConfig?.icon || "📝"}
                            </span>
                            <span className="text-sm text-gray-700">
                              {methodConfig?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig?.bgColor || "bg-gray-100"} ${statusConfig?.color || "text-gray-700"}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig?.name || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(payment.paymentDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                            {payment.referenceNumber}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <User className="w-3.5 h-3.5" />
                            {payment.createdBy}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          {sortedPayments.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {sortedPayments.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {payments.length}
                  </span>{" "}
                  payments
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-lg font-bold text-green-700">
                    {formatCurrency(stats.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
