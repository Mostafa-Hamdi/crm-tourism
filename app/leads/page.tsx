"use client";

import {
  useConvertStatusMutation,
  useDeleteLeadMutation,
  useExportLeadsMutation,
  useGetFilteredLeadsMutation,
  useGetLeadsQuery,
  useGetSpecificLeadsMutation,
  useImportLeadsMutation,
} from "@/store/api/apiSlice";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Users,
  Edit2,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  Tag,
  Calendar,
  ChevronDown,
  User,
  TrendingUp,
  Filter,
  CheckCircle,
  XCircle,
  Pause,
  FileText,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  Download,
  AlertCircle,
  Check,
  List,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface Lead {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  status: number;
  source: string;
  assignedTo: string | null;
  createdAt: string;
}

interface courseClass {
  id: number;
  name: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const t = useTranslations("leads");
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [leadsResponse, setLeadsResponse] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const [getSpecificLeads, { isLoading }] = useGetSpecificLeadsMutation();
  const { data: classes, isLoading: classesIsLoading } = useGetLeadsQuery();
  const [deleteLead] = useDeleteLeadMutation();
  const [convertStatus, { isLoading: isConverting }] =
    useConvertStatusMutation();
  const [getFilteredLeads, { isLoading: isFilterLoading }] =
    useGetFilteredLeadsMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importLeads, { isLoading: importLoading }] = useImportLeadsMutation();
  const [exportLeads, { isLoading: exportLoading }] = useExportLeadsMutation();

  const leads = leadsResponse?.data;

  // Status mapping - now using translations
  const getStatusLabel = (status: number): string => {
    const statusKeys: { [key: number]: string } = {
      1: "status.new",
      2: "status.contacted",
      3: "status.interested",
      4: "status.followup",
      5: "status.cold",
      6: "status.lost",
      7: "status.converted",
    };
    return t(statusKeys[status] || "status.new");
  };

  // Fetch leads on mount and when page/size changes
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const result = await getSpecificLeads({
          pageNumber,
          pageSize,
        }).unwrap();
        setLeadsResponse(result);
        setDisplayedLeads(result.data);
      } catch (err) {
        console.error("Failed to fetch leads:", err);
      }
    };

    fetchLeads();
  }, [pageNumber, pageSize, getSpecificLeads]);

  // Filter by status
  const handleStatusFilter = async (statusId: number) => {
    setActiveFilter(statusId);

    if (statusId === 0) {
      try {
        const result = await getSpecificLeads({
          pageNumber,
          pageSize,
        }).unwrap();
        setDisplayedLeads(result.data);
      } catch (err) {
        console.error("Failed to fetch leads:", err);
      }
    } else {
      try {
        const filtered = await getFilteredLeads({ statusId }).unwrap();
        setDisplayedLeads(filtered.data);
      } catch (err) {
        console.error("Failed to filter leads:", err);
        Swal.fire({
          icon: "error",
          title: t("oops"),
          text: t("filterFail"),
        });
      }
    }
  };

  // Search filter
  const filteredLeads = useMemo(() => {
    if (!displayedLeads) return [];

    const query = searchQuery.toLowerCase();
    return displayedLeads.filter(
      (lead: Lead) =>
        lead.fullName.toLowerCase().includes(query) ||
        lead.phone.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.source.toLowerCase().includes(query) ||
        getStatusLabel(lead.status).toLowerCase().includes(query),
    );
  }, [displayedLeads, searchQuery]);

  const handleDelete = async (id: number) => {
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
      await deleteLead({ id }).unwrap();
      await Swal.fire({
        icon: "success",
        title: t("deleteSuccessTitle"),
        text: t("deleteSuccess"),
        timer: 2000,
      });

      const result = await getSpecificLeads({ pageNumber, pageSize }).unwrap();
      setLeadsResponse(result);
      setDisplayedLeads(result.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("oops"),
        text: t("deleteFail"),
      });
    }
  };

  const handleConvertClick = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedCourseId(0);
    setPaidAmount("");
    setShowConvertModal(true);
  };

  const handleCloseModal = () => {
    setShowConvertModal(false);
    setSelectedLead(null);
    setSelectedCourseId(0);
    setPaidAmount("");
  };

  const handleConvertSubmit = async () => {
    if (!selectedLead) return;

    if (selectedCourseId === 0) {
      Swal.fire({
        icon: "warning",
        title: t("convertModal.missingCourse"),
        text: t("convertModal.selectClassRequired"),
      });
      return;
    }

    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      Swal.fire({
        icon: "warning",
        title: t("convertModal.invalidAmount"),
        text: t("convertModal.paidAmountRequired"),
      });
      return;
    }

    try {
      await convertStatus({
        id: selectedLead.id,
        courseClassId: selectedCourseId,
        paidAmount: parseFloat(paidAmount),
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: t("convertModal.success"),
        text: t("convertModal.successText"),
        timer: 2000,
      });

      handleCloseModal();

      const result = await getSpecificLeads({ pageNumber, pageSize }).unwrap();
      setLeadsResponse(result);
      setDisplayedLeads(result.data);
    } catch (err) {
      let message = t("convertModal.fail");

      if (typeof err === "object" && err !== null) {
        const maybeData = (err as any).data;
        if (typeof maybeData === "string") {
          message = maybeData;
        }
      }
      Swal.fire({
        icon: "error",
        title: t("oops"),
        text: message,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: number) => {
    const colors: { [key: number]: string } = {
      1: "from-blue-100 to-cyan-100 border-blue-200 text-blue-700",
      2: "from-purple-100 to-pink-100 border-purple-200 text-purple-700",
      3: "from-green-100 to-emerald-100 border-green-200 text-green-700",
      4: "from-yellow-100 to-orange-100 border-yellow-200 text-yellow-700",
      5: "from-gray-100 to-slate-100 border-gray-200 text-gray-700",
      6: "from-red-100 to-rose-100 border-red-200 text-red-700",
      7: "from-emerald-100 to-teal-100 border-emerald-200 text-emerald-700",
    };
    return (
      colors[status] ||
      "from-gray-100 to-gray-100 border-gray-200 text-gray-700"
    );
  };

  const getColorForLead = (index: number) => {
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

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1); // Reset to first page when changing page size
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= (leadsResponse?.totalPages || 1)) {
      setPageNumber(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(leadsResponse?.totalPages || 1);
  const goToPreviousPage = () => goToPage(pageNumber - 1);
  const goToNextPage = () => goToPage(pageNumber + 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = leadsResponse?.totalPages || 1;
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

  // Validate file before upload
  const validateImportFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExtensions = [".csv", ".xlsx", ".xls"];

    if (file.size > maxSize) {
      return t("importModal.fileSizeError");
    }

    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      return t("importModal.fileTypeError");
    }

    return null;
  };

  const handleImportClick = () => {
    setShowImportModal(true);
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImportFile(file);
    if (error) {
      Swal.fire({
        icon: "error",
        title: t("importModal.invalidFile"),
        text: error,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Store file reference and preview info separately
    setSelectedFile(file);
    setFilePreview({
      name: file.name,
      size: file.size,
    });
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: t("importModal.noFileSelected"),
        text: t("importModal.selectFileText"),
      });
      return;
    }

    // Create FormData here, right before the API call
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const result = await importLeads(formData).unwrap();

      let successCount = 0;
      let failCount = 0;
      let errorMessages: string[] = [];

      if (typeof result === "object" && result !== null) {
        if ("imported" in result) successCount = result.imported || 0;
        if ("failed" in result) failCount = result.failed || 0;
        if ("errors" in result && Array.isArray(result.errors)) {
          errorMessages = result.errors;
        }
      }

      handleCloseImportModal();

      if (failCount > 0) {
        const errorList =
          errorMessages.length > 0
            ? `<ul class="text-left mt-2 max-h-48 overflow-y-auto">${errorMessages
                .slice(0, 10)
                .map((err) => `<li class="text-sm">• ${err}</li>`)
                .join("")}</ul>${
                errorMessages.length > 10
                  ? `<p class="text-sm mt-2">${t("importModal.andMoreErrors", { count: errorMessages.length - 10 })}</p>`
                  : ""
              }`
            : "";

        await Swal.fire({
          icon: "warning",
          title: t("importModal.partialSuccess"),
          html: `
            <div class="text-center">
              <p class="mb-2">${t("importSuccess", { successCount })}</p>
              <p class="mb-2">${t("importFail", { failCount })}</p>
              ${errorList}
            </div>
          `,
          confirmButtonColor: "#2563eb",
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: t("importModal.success"),
          html: `<p>${t("importSuccess", { successCount })}</p>`,
          timer: 2500,
          confirmButtonColor: "#2563eb",
        });
      }

      const leadsResult = await getSpecificLeads({
        pageNumber,
        pageSize,
      }).unwrap();
      setLeadsResponse(leadsResult);
      setDisplayedLeads(leadsResult.data);
    } catch (err: any) {
      handleCloseImportModal();

      let errorMessage = t("importModal.checkFormat");
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: t("importModal.failed"),
        text: errorMessage,
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleExport = async () => {
    if (!leads || leads.length === 0) {
      Swal.fire({
        icon: "info",
        title: t("exportModal.noData"),
        text: t("noLeadsToExport"),
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    try {
      const blob = await exportLeads().unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `leads-export-${timestamp}.csv`;

      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      await Swal.fire({
        icon: "success",
        title: t("exportModal.success"),
        html: `<p>${t("exportedToFile", { count: leadsResponse?.totalCount || leads.length, filename })}</p>`,
        timer: 2500,
        confirmButtonColor: "#2563eb",
      });
    } catch (err: any) {
      let errorMessage = t("exportModal.failed");
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: t("exportModal.failedTitle"),
        text: errorMessage,
        confirmButtonColor: "#2563eb",
      });
    }
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
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  {t("title")}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <Link
              href={"/leads/add"}
              className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t("addLead")}</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("totalLeads")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {leadsResponse?.totalCount || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("new")}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {leads?.filter((l: Lead) => l.status === 1).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("converted")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mt-1">
                  {leads?.filter((l: Lead) => l.status === 7).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("found")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {filteredLeads.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
          <div className="flex flex-wrap gap-3">
            {[
              {
                id: 0,
                label: t("filters.all"),
                icon: Filter,
                color: "from-gray-600 to-gray-700",
              },
              {
                id: 1,
                label: t("filters.new"),
                icon: Tag,
                color: "from-blue-600 to-cyan-600",
              },
              {
                id: 2,
                label: t("filters.contacted"),
                icon: Phone,
                color: "from-purple-600 to-pink-600",
              },
              {
                id: 3,
                label: t("filters.interested"),
                icon: Users,
                color: "from-green-600 to-emerald-600",
              },
              {
                id: 4,
                label: t("filters.followup"),
                icon: Calendar,
                color: "from-yellow-600 to-orange-600",
              },
              {
                id: 5,
                label: t("filters.cold"),
                icon: Pause,
                color: "from-gray-600 to-slate-600",
              },
              {
                id: 6,
                label: t("filters.lost"),
                icon: XCircle,
                color: "from-red-600 to-rose-600",
              },
              {
                id: 7,
                label: t("filters.converted"),
                icon: CheckCircle,
                color: "from-emerald-600 to-teal-600",
              },
            ].map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  onClick={() => handleStatusFilter(filter.id)}
                  disabled={isFilterLoading}
                  className={`group relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden cursor-pointer ${
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
                  {filter.id !== 0 && (
                    <span
                      className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? "bg-white/20" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {leads?.filter((l: Lead) => l.status === filter.id)
                        .length || 0}
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
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl">
              <List className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {t("show")}
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

            <div className="flex items-center gap-3">
              {/* Import Button */}
              <button
                onClick={handleImportClick}
                disabled={importLoading}
                className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {importLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <span>{t("import")}</span>
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {exportLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>{t("export")}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-400 rounded-xl shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">
                {filteredLeads.length} {t("leadsCount")}
              </span>
            </div>
          </div>

          {/* Pagination Info */}
          {leadsResponse && leadsResponse.totalPages > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                {t("pageInfo", {
                  page: pageNumber,
                  total: leadsResponse.totalPages,
                  count: leadsResponse.totalCount,
                  per: pageSize,
                })}
              </p>
            </div>
          )}
        </div>

        {/* Table Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
          {isLoading || isFilterLoading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">{t("loading")}</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg">
                {searchQuery ? t("noLeadsFound") : t("noLeadsYet")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 border-b border-blue-400/30">
                  <tr>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.leadInfo")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.contact")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.source")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.status")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.assignedTo")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.createdDate")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.notes")}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("table.convert")}
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
                  {filteredLeads.map((lead: Lead, index: number) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 transition-all duration-200"
                    >
                      {/* Lead Info */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${getColorForLead(
                              index,
                            )} rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30`}
                          >
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-base">
                              {lead.fullName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700 text-sm font-medium">
                              {lead.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-600 text-xs">
                              {lead.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-blue-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold shadow-sm">
                          <Tag className="w-3 h-3" />
                          {lead.source}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r border rounded-lg text-xs font-bold shadow-sm ${getStatusColor(
                            lead.status,
                          )}`}
                        >
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td className="px-6 py-5">
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-gray-700 text-sm font-medium">
                              {lead.assignedTo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            {t("unassigned")}
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 text-sm font-medium">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                          <Link
                            href={`/leads/${lead.id}/notes`}
                            className="p-2.5 text-amber-600 hover:text-white bg-amber-50 hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 group cursor-pointer"
                            title={t("viewNotes")}
                          >
                            <FileText className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>

                      {/* Convert */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleConvertClick(lead)}
                            disabled={lead.status === 7}
                            className={`p-2.5 rounded-xl transition-all duration-300 group cursor-pointer ${
                              lead.status === 7
                                ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                                : "text-emerald-600 hover:text-white bg-emerald-50 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30"
                            }`}
                            title={
                              lead.status === 7
                                ? t("alreadyConverted")
                                : t("convertLead")
                            }
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/leads/${lead.id}/edit`}
                            className="p-2.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group cursor-pointer"
                            title={t("editLead")}
                          >
                            <Edit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group cursor-pointer"
                            title={t("deleteLead")}
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

        {/* Pagination Controls */}
        {leadsResponse && leadsResponse.totalPages > 1 && (
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Previous buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToFirstPage}
                  disabled={pageNumber === 1}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title={t("firstPage")}
                >
                  <ChevronsLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={goToPreviousPage}
                  disabled={pageNumber === 1}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title={t("previousPage")}
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
                  disabled={pageNumber === leadsResponse.totalPages}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title={t("nextPage")}
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={pageNumber === leadsResponse.totalPages}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title={t("lastPage")}
                >
                  <ChevronsRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {t("importModal.title")}
                    </h2>
                    <p className="text-cyan-100 text-sm mt-1">
                      {t("importModal.subtitle")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseImportModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t("importModal.selectFile")}{" "}
                  <span className="text-red-500">
                    {t("importModal.required")}
                  </span>
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    {filePreview ? (
                      <>
                        <Check className="w-6 h-6 text-green-600 mb-2" />
                        <p className="text-gray-900 font-semibold">
                          {filePreview.name}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {(filePreview.size / 1024).toFixed(2)} KB
                        </p>
                        <p className="text-blue-600 text-sm mt-3 font-medium">
                          {t("importModal.changeFile")}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-900 font-semibold mb-1">
                          {t("importModal.clickToUpload")}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {t("importModal.fileTypes")}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">
                      {t("importModal.requirements.title")}
                    </p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• {t("importModal.requirements.maxSize")}</li>
                      <li>• {t("importModal.requirements.formats")}</li>
                      <li>• {t("importModal.requirements.requiredColumns")}</li>
                      <li>• {t("importModal.requirements.optionalColumns")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleCloseImportModal}
                disabled={importLoading}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t("importModal.cancel")}
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={!selectedFile || importLoading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {importLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("importModal.importing")}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>{t("importModal.import")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {t("convertModal.title")}
                    </h2>
                    <p className="text-cyan-100 text-sm mt-1">
                      {selectedLead.fullName}
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

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("convertModal.selectClass")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCourseId}
                    onChange={(e) =>
                      setSelectedCourseId(parseInt(e.target.value))
                    }
                    className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value={0}>{t("chooseClass")}</option>
                    {classes?.data?.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("convertModal.paidAmount")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
              >
                {t("convertModal.cancel")}
              </button>
              <button
                onClick={handleConvertSubmit}
                disabled={isConverting}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isConverting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("convertModal.converting")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{t("convertModal.convert")}</span>
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
