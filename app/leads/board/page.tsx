"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  Users,
  DollarSign,
  Building2,
  TrendingUp,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  MessageCircle,
  PhoneCall,
  FileText,
  AlertTriangle,
  Clock,
  Tag,
  Flame,
  Zap,
  Circle,
  CheckCircle2,
  X,
  Save,
  UserPlus,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import {
  useAssignLeadMutation,
  useDeleteLeadMutation,
  useGetLeadsPipeLineQuery,
  useGetUsersQuery,
  useUpdateLeadStatusMutation,
} from "../../../store/api/apiSlice";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  assignedTo: string;
  assignedToAvatar?: string;
  dealValue: number;
  stage: string;
  status: number;
  createdAt: string;
  lastActivity: string;
  priority: "low" | "medium" | "high" | "urgent";
  source: string;
  tags: string[];
  budget: number;
  hasCall: boolean;
  hasMessage: boolean;
  hasNote: boolean;
}

interface ApiStageResponse {
  stageId: number;
  stageName: string;
  totalLeads: number;
  totalValue: number | null;
  leads: ApiLeadInStage[];
}

interface ApiLeadInStage {
  id: number;
  name: string;
  companyName: string | null;
  dealValue: number | null;
  currency: string | null;
  lastActivityAt: string | null;
  lastActivityType: string | null;
  assignedUser: { id: number; fullName: string } | string | null;
  tags: string | null;
}

interface AssignOwnerDialog {
  show: boolean;
  lead: Lead | null;
}

const STATUS_TO_STAGE: { [key: number]: string } = {
  1: "new",
  2: "contacted",
  3: "qualified",
  4: "proposal",
  7: "negotiation",
  6: "lost",
  5: "won",
};

const STAGE_TO_STATUS: { [key: string]: number } = {
  new: 1,
  contacted: 2,
  qualified: 3,
  proposal: 4,
  negotiation: 7,
  lost: 6,
  won: 5,
};

const transformApiLead = (apiLead: ApiLeadInStage, stageId: number): Lead => {
  const name = apiLead.name || "Unknown";
  const assignedToName =
    typeof apiLead.assignedUser === "string"
      ? apiLead.assignedUser
      : (apiLead.assignedUser?.fullName ?? "Unassigned");
  const assignedTo = assignedToName;
  const company = apiLead.companyName || "N/A";

  const getAvatar = (fullName: string) => {
    const parts = fullName?.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getPriority = (
    lastActivityType: string | null,
  ): "low" | "medium" | "high" | "urgent" => {
    if (!lastActivityType) return "low";
    if (lastActivityType === "Complaint") return "urgent";
    if (lastActivityType === "Call" || lastActivityType === "Meeting")
      return "high";
    return "medium";
  };

  const parseTags = (tags: string | null): string[] => {
    if (!tags) return [];
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [tags];
    } catch {
      return tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  };

  const dealValue =
    apiLead.dealValue || 50000 + Math.floor(Math.random() * 50000);

  return {
    id: apiLead.id,
    name: name,
    email: "",
    phone: "",
    company: company,
    assignedTo: assignedTo,
    assignedToAvatar: getAvatar(assignedTo),
    dealValue: dealValue,
    stage: STATUS_TO_STAGE[stageId] || "new",
    status: stageId,
    createdAt: new Date().toISOString(),
    lastActivity: apiLead.lastActivityAt || new Date().toISOString(),
    priority: getPriority(apiLead.lastActivityType),
    source: company,
    tags: parseTags(apiLead.tags),
    budget: dealValue + Math.floor(Math.random() * 30000),
    hasCall: apiLead.lastActivityType === "Call",
    hasMessage: apiLead.lastActivityType === "Message",
    hasNote:
      apiLead.lastActivityType === "Note" ||
      apiLead.lastActivityType === "GeneralNote",
  };
};

interface ConfirmationDialog {
  show: boolean;
  type: "backward" | "lost" | null;
  lead: Lead | null;
  targetStage: string;
  reason?: string;
}

const Page = () => {
  const t = useTranslations("leads.board");

  const {
    data: leadsData,
    error: leadsError,
    isLoading: leadsLoading,
  } = useGetLeadsPipeLineQuery();

  const { data: users, isLoading: usersLoading } = useGetUsersQuery();
  const [assignLead, { isLoading: isAssigning }] = useAssignLeadMutation();
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [showLeadMenu, setShowLeadMenu] = useState<number | null>(null);
  const [showQuickAction, setShowQuickAction] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationDialog>({
    show: false,
    type: null,
    lead: null,
    targetStage: "",
  });
  const [assignOwnerDialog, setAssignOwnerDialog] = useState<AssignOwnerDialog>(
    {
      show: false,
      lead: null,
    },
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [stageLeads, setStageLeads] = useState<{ [key: string]: Lead[] }>({
    new: [],
    contacted: [],
    qualified: [],
    proposal: [],
    negotiation: [],
    won: [],
    lost: [],
  });

  const [filters, setFilters] = useState({
    owner: "",
    source: "",
    priority: "",
    minBudget: "",
    lastActivityDays: "",
  });

  const [updateLeadStatus, { isLoading: isUpdating }] =
    useUpdateLeadStatusMutation();

  // Define stages with translations
  const STAGES = useMemo(
    () => [
      {
        id: "new",
        name: t("stages.new"),
        status: 1,
        color: "from-gray-600 to-slate-600",
        wipLimit: 10,
      },
      {
        id: "contacted",
        name: t("stages.contacted"),
        status: 2,
        color: "from-blue-600 to-cyan-600",
        wipLimit: 8,
      },
      {
        id: "qualified",
        name: t("stages.qualified"),
        status: 3,
        color: "from-purple-600 to-pink-600",
        wipLimit: 6,
      },
      {
        id: "proposal",
        name: t("stages.proposal"),
        status: 4,
        color: "from-indigo-600 to-blue-600",
        wipLimit: 5,
      },
      {
        id: "negotiation",
        name: t("stages.negotiation"),
        status: 5,
        color: "from-orange-600 to-amber-600",
        wipLimit: 4,
      },
      {
        id: "won",
        name: t("stages.won"),
        status: 7,
        color: "from-green-600 to-emerald-600",
        wipLimit: null,
      },
      {
        id: "lost",
        name: t("stages.lost"),
        status: 6,
        color: "from-red-600 to-rose-600",
        wipLimit: null,
      },
    ],
    [t],
  );

  const PRIORITY_CONFIG = useMemo(
    () => ({
      urgent: {
        color: "bg-red-500",
        label: t("priority.urgent"),
        icon: Flame,
        textColor: "text-red-700",
      },
      high: {
        color: "bg-orange-500",
        label: t("priority.high"),
        icon: Zap,
        textColor: "text-orange-700",
      },
      medium: {
        color: "bg-yellow-500",
        label: t("priority.medium"),
        icon: Circle,
        textColor: "text-yellow-700",
      },
      low: {
        color: "bg-green-500",
        label: t("priority.low"),
        icon: Circle,
        textColor: "text-green-700",
      },
    }),
    [t],
  );

  const SAVED_FILTERS = useMemo(
    () => [
      { id: "hot", name: t("savedFilters.hotLeads"), icon: Flame },
      { id: "recent", name: t("savedFilters.recentActivity"), icon: Clock },
      { id: "high-value", name: t("savedFilters.highValue"), icon: DollarSign },
    ],
    [t],
  );

  useEffect(() => {
    if (leadsData) {
      const apiResponse = leadsData as any;

      const newStageLeads: { [key: string]: Lead[] } = {
        new: [],
        contacted: [],
        qualified: [],
        proposal: [],
        negotiation: [],
        won: [],
        lost: [],
      };

      apiResponse.forEach((stageData: any) => {
        const stageId = stageData.stageId;
        const stageName = STATUS_TO_STAGE[stageId];

        if (stageName && stageData.leads && stageData.leads.length > 0) {
          const transformedLeads = stageData.leads.map((lead: any) =>
            transformApiLead(lead, stageId),
          );
          newStageLeads[stageName] = transformedLeads;
        } else if (!stageName) {
          if (stageData.leads && stageData.leads.length > 0) {
            const transformedLeads = stageData.leads.map((lead: any) =>
              transformApiLead(lead, stageId),
            );
            newStageLeads.new = [...newStageLeads.new, ...transformedLeads];
          }
        }
      });

      setStageLeads(newStageLeads);
    }
  }, [leadsData]);

  const allLeads: Lead[] = useMemo(() => {
    return Object.values(stageLeads).flat();
  }, [stageLeads]);

  const filteredLeads = useMemo(() => {
    let result = allLeads;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.company.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.assignedTo.toLowerCase().includes(query),
      );
    }

    if (filters.owner) {
      result = result.filter((lead) => lead.assignedTo === filters.owner);
    }

    if (filters.source) {
      result = result.filter((lead) => lead.source === filters.source);
    }

    if (filters.priority) {
      result = result.filter((lead) => lead.priority === filters.priority);
    }

    if (filters.minBudget) {
      result = result.filter(
        (lead) => lead.budget >= parseInt(filters.minBudget),
      );
    }

    if (filters.lastActivityDays) {
      const days = parseInt(filters.lastActivityDays);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      result = result.filter(
        (lead) => new Date(lead.lastActivity) >= cutoffDate,
      );
    }

    return result;
  }, [allLeads, searchQuery, filters]);

  const filteredLeadsByStage = useMemo(() => {
    const grouped: { [key: string]: Lead[] } = {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };

    filteredLeads.forEach((lead) => {
      if (grouped[lead.stage]) {
        grouped[lead.stage].push(lead);
      }
    });

    return grouped;
  }, [filteredLeads]);

  const stats = useMemo(() => {
    const totalLeads = allLeads.length;
    const totalValue = allLeads.reduce((sum, lead) => sum + lead.dealValue, 0);
    const wonDeals = stageLeads.won.length;
    const wonValue = stageLeads.won.reduce(
      (sum, lead) => sum + lead.dealValue,
      0,
    );

    return { totalLeads, totalValue, wonDeals, wonValue };
  }, [allLeads, stageLeads]);

  const getStageIndex = (stageId: string) => {
    return STAGES.findIndex((s) => s.id === stageId);
  };

  const isBackwardMove = (fromStage: string, toStage: string) => {
    return getStageIndex(toStage) < getStageIndex(fromStage);
  };

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (!draggedLead) return;

    if (stageId === "lost") {
      setConfirmation({
        show: true,
        type: "lost",
        lead: draggedLead,
        targetStage: stageId,
      });
      return;
    }

    if (isBackwardMove(draggedLead.stage, stageId)) {
      setConfirmation({
        show: true,
        type: "backward",
        lead: draggedLead,
        targetStage: stageId,
      });
      return;
    }

    confirmStageChange(draggedLead, stageId);
  };

  const confirmStageChange = async (
    lead: Lead,
    newStage: string,
    reason?: string,
  ) => {
    try {
      const newStatus = STAGE_TO_STATUS[newStage];

      if (!newStatus) {
        console.error(`Invalid stage: ${newStage}`);
        return;
      }

      const oldStage = lead.stage;

      if (oldStage === newStage) {
        console.log(`Lead ${lead.name} is already in ${newStage} stage`);
        setDraggedLead(null);
        return;
      }

      const updatedLead = {
        ...lead,
        stage: newStage,
        status: newStatus,
        lastActivity: new Date().toISOString(),
      };

      setStageLeads((prev) => {
        const updatedOldStage = prev[oldStage].filter((l) => l.id !== lead.id);
        const updatedNewStage = prev[newStage].some((l) => l.id === lead.id)
          ? prev[newStage]
          : [...prev[newStage], updatedLead];

        return {
          ...prev,
          [oldStage]: updatedOldStage,
          [newStage]: updatedNewStage,
        };
      });

      await updateLeadStatus({
        leadId: lead.id,
        status: newStatus,
        reason: reason || undefined,
      }).unwrap();

      setDraggedLead(null);
      setConfirmation({ show: false, type: null, lead: null, targetStage: "" });
    } catch (error) {
      console.error("Failed to update lead status:", error);

      const revertStage = lead.stage;
      setStageLeads((prev) => ({
        ...prev,
        [confirmation.targetStage]: prev[confirmation.targetStage].filter(
          (l) => l.id !== lead.id,
        ),
        [revertStage]: [...prev[revertStage], lead],
      }));

      alert("Failed to update lead status. Please try again.");
    }
  };

  const handleAssignOwner = (lead: Lead) => {
    setAssignOwnerDialog({
      show: true,
      lead: lead,
    });
    setSelectedUserId(null);
    setShowQuickAction(null);
  };

  const confirmAssignOwner = async () => {
    if (!assignOwnerDialog.lead || !selectedUserId) {
      alert(t("confirmations.assignOwner.selectUserError"));
      return;
    }

    try {
      await assignLead({
        id: assignOwnerDialog.lead.id,
        userId: selectedUserId,
      }).unwrap();

      const selectedUser = users?.find((u: any) => u.id === selectedUserId);
      if (selectedUser) {
        setStageLeads((prev) => {
          const stage = assignOwnerDialog.lead!.stage;
          const updatedLeads = prev[stage].map((l) =>
            l.id === assignOwnerDialog.lead!.id
              ? {
                  ...l,
                  assignedTo: selectedUser.fullName,
                  assignedToAvatar: selectedUser.fullName
                    .substring(0, 2)
                    .toUpperCase(),
                }
              : l,
          );
          return {
            ...prev,
            [stage]: updatedLeads,
          };
        });
      }

      setAssignOwnerDialog({ show: false, lead: null });
      setSelectedUserId(null);
    } catch (error) {
      console.error("Failed to assign lead:", error);
    }
  };

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
        title: t("deleted"),
        text: t("deleteSuccess"),
        timer: 2000,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("oops"),
        text: t("deleteFail"),
      });
    }
  };

  const applySavedFilter = (filterId: string) => {
    switch (filterId) {
      case "hot":
        setFilters({
          ...filters,
          priority: "urgent",
        });
        break;
      case "recent":
        setFilters({
          ...filters,
          lastActivityDays: "7",
        });
        break;
      case "high-value":
        setFilters({
          ...filters,
          minBudget: "100000",
        });
        break;
    }
  };

  const clearFilters = () => {
    setFilters({
      owner: "",
      source: "",
      priority: "",
      minBudget: "",
      lastActivityDays: "",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("leadCard.justNow");
    if (diffMins < 60) return t("leadCard.minutesAgo", { minutes: diffMins });
    if (diffHours < 24) return t("leadCard.hoursAgo", { hours: diffHours });
    return t("leadCard.daysAgo", { days: diffDays });
  };

  const uniqueOwners = Array.from(new Set(allLeads.map((l) => l.assignedTo)));
  const uniqueSources = Array.from(new Set(allLeads.map((l) => l.source)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-[2000px] mx-auto space-y-6">
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
                <div className="mt-2">
                  {leadsLoading ? (
                    <span className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      {t("loadingLeads")}
                    </span>
                  ) : leadsError ? (
                    <span className="inline-flex items-center gap-2 text-sm text-red-600 font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      {t("errorLoadingLeads")}
                    </span>
                  ) : allLeads.length > 0 ? (
                    <span className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {t("liveLeadsLoaded", { count: allLeads.length })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <span className="w-2 h-2 bg-gray-500 rounded-full" />
                      {t("noLeadsFound")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/leads/add"
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t("addLead")}</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("stats.totalLeads")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {stats.totalLeads}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("stats.wonDeals")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {stats.wonDeals}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("stats.pipelineValue")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-orange-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("stats.wonValue")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mt-1">
                  {formatCurrency(stats.wonValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
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
                <span>{t("search.filters")}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {SAVED_FILTERS.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => applySavedFilter(filter.id)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all cursor-pointer flex items-center gap-2 text-sm font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{filter.name}</span>
                  </button>
                );
              })}
              {(filters.owner ||
                filters.source ||
                filters.priority ||
                filters.minBudget ||
                filters.lastActivityDays) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-all cursor-pointer flex items-center gap-2 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>{t("search.clearAll")}</span>
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("filterLabels.owner")}
                  </label>
                  <select
                    value={filters.owner}
                    onChange={(e) =>
                      setFilters({ ...filters, owner: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">{t("filterLabels.allOwners")}</option>
                    {uniqueOwners.map((owner) => (
                      <option key={owner} value={owner}>
                        {owner}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("filterLabels.source")}
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) =>
                      setFilters({ ...filters, source: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">{t("filterLabels.allSources")}</option>
                    {uniqueSources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("filterLabels.priority")}
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      setFilters({ ...filters, priority: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">{t("filterLabels.allPriorities")}</option>
                    <option value="urgent">{t("priority.urgent")}</option>
                    <option value="high">{t("priority.high")}</option>
                    <option value="medium">{t("priority.medium")}</option>
                    <option value="low">{t("priority.low")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("filterLabels.minBudget")}
                  </label>
                  <input
                    type="number"
                    value={filters.minBudget}
                    onChange={(e) =>
                      setFilters({ ...filters, minBudget: e.target.value })
                    }
                    placeholder={t("filterLabels.budgetPlaceholder")}
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("filterLabels.lastActivity")}
                  </label>
                  <select
                    value={filters.lastActivityDays}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        lastActivityDays: e.target.value,
                      })
                    }
                    className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">{t("filterLabels.allTime")}</option>
                    <option value="1">{t("filterLabels.last24Hours")}</option>
                    <option value="7">{t("filterLabels.last7Days")}</option>
                    <option value="30">{t("filterLabels.last30Days")}</option>
                    <option value="90">{t("filterLabels.last90Days")}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex gap-4 min-w-full">
            {STAGES.map((stage) => {
              const currentStageLeads = filteredLeadsByStage[stage.id] || [];
              const stageValue = currentStageLeads.reduce(
                (sum, lead) => sum + lead.dealValue,
                0,
              );
              const isOverLimit =
                stage.wipLimit && currentStageLeads.length > stage.wipLimit;

              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.id)}
                >
                  {/* Stage Header */}
                  <div
                    className={`bg-white/70 backdrop-blur-2xl border ${isOverLimit ? "border-red-300" : "border-white/60"} rounded-2xl p-4 mb-4 shadow-lg shadow-blue-500/10`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.color}`}
                        />
                        <h3 className="font-bold text-gray-900">
                          {stage.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">
                          {leadsLoading ? "..." : currentStageLeads.length}
                          {stage.wipLimit && `/${stage.wipLimit}`}
                        </span>
                        {leadsError && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        {isOverLimit && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                      {formatCurrency(stageValue)}
                    </p>
                    {isOverLimit && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {t("stageWarnings.overCapacity")}
                      </p>
                    )}
                  </div>

                  {/* Stage Cards */}
                  <div className="space-y-3 min-h-[400px]">
                    {leadsLoading ? (
                      <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          {t("stageWarnings.loading")}
                        </p>
                      </div>
                    ) : currentStageLeads.length > 0 ? (
                      currentStageLeads.map((lead) => {
                        const priorityConfig = PRIORITY_CONFIG[lead.priority];
                        const PriorityIcon = priorityConfig.icon;

                        return (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={() => handleDragStart(lead)}
                            className="bg-white/70 backdrop-blur-2xl border-l-4 border-white/60 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group relative"
                            style={{
                              borderLeftColor:
                                priorityConfig.color.split("-")[1] === "red"
                                  ? "#ef4444"
                                  : priorityConfig.color.split("-")[1] ===
                                      "orange"
                                    ? "#f97316"
                                    : priorityConfig.color.split("-")[1] ===
                                        "yellow"
                                      ? "#eab308"
                                      : "#22c55e",
                            }}
                          >
                            {/* Lead Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900 text-base">
                                    {lead.name}
                                  </h4>
                                  <PriorityIcon
                                    className={`w-4 h-4 ${priorityConfig.textColor}`}
                                  />
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <Building2 className="w-3.5 h-3.5" />
                                  <span>{lead.company}</span>
                                </div>
                              </div>

                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setShowLeadMenu(
                                      showLeadMenu === lead.id ? null : lead.id,
                                    )
                                  }
                                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>

                                {showLeadMenu === lead.id && (
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-xl z-10 py-2 w-40">
                                    <Link
                                      href={`/leads/${lead.id}`}
                                      className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4" />
                                      <span>{t("leadCard.view")}</span>
                                    </Link>
                                    <Link
                                      href={`/leads/${lead.id}/edit`}
                                      className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm cursor-pointer"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      <span>{t("leadCard.edit")}</span>
                                    </Link>
                                    <button
                                      onClick={() => handleDelete(lead.id)}
                                      className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-sm w-full cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>{t("leadCard.delete")}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Last Activity */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{getTimeAgo(lead.lastActivity)}</span>
                            </div>

                            {/* Deal Value */}
                            <div className="mb-3 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-green-700">
                                  {formatCurrency(lead.dealValue)}
                                </span>
                              </div>
                            </div>

                            {/* Tags */}
                            {Array.isArray(lead.tags) &&
                              lead.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {lead.tags.map((tag: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md flex items-center gap-1"
                                    >
                                      <Tag className="w-3 h-3" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                            {/* Activity Icons */}
                            <div className="flex items-center gap-2 mb-3">
                              {lead.hasCall && (
                                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <PhoneCall className="w-4 h-4 text-blue-600" />
                                </div>
                              )}
                              {lead.hasMessage && (
                                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <MessageCircle className="w-4 h-4 text-purple-600" />
                                </div>
                              )}
                              {lead.hasNote && (
                                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-orange-600" />
                                </div>
                              )}
                            </div>

                            {/* Assigned To */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {lead.assignedToAvatar}
                                </div>
                                <span className="text-xs font-medium text-gray-700">
                                  {lead.assignedTo}
                                </span>
                              </div>
                            </div>

                            {/* Quick Actions - Show on Hover */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() =>
                                  setShowQuickAction(
                                    showQuickAction === lead.id
                                      ? null
                                      : lead.id,
                                  )
                                }
                                className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
                              >
                                <Zap className="w-4 h-4" />
                              </button>

                              {showQuickAction === lead.id && (
                                <div className="absolute right-0 bottom-10 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2 w-48">
                                  <Link
                                    href={`tel:${lead.phone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-green-50 text-gray-700 text-sm w-full cursor-pointer"
                                  >
                                    <MessageCircle className="w-4 h-4 text-green-600" />
                                    <span>{t("leadCard.whatsapp")}</span>
                                  </Link>
                                  <Link
                                    href={`/leads/${lead.id}/notes/add`}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 text-gray-700 text-sm w-full cursor-pointer"
                                  >
                                    <StickyNote className="w-4 h-4 text-orange-600" />
                                    <span>{t("leadCard.addNote")}</span>
                                  </Link>
                                  <button
                                    onClick={() => handleAssignOwner(lead)}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 text-gray-700 text-sm w-full cursor-pointer"
                                  >
                                    <UserPlus className="w-4 h-4 text-purple-600" />
                                    <span>{t("leadCard.assignOwner")}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white/50 backdrop-blur-xl border border-dashed border-gray-300 rounded-2xl p-8 text-center">
                        <p className="text-gray-400 text-sm">
                          {t("stageWarnings.dropLeadsHere")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmation.show && confirmation.lead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {confirmation.type === "lost"
                    ? t("confirmations.markAsLost.title")
                    : t("confirmations.moveBackward.title")}
                </h3>
                <p className="text-sm text-gray-600">
                  {confirmation.type === "lost"
                    ? t("confirmations.markAsLost.subtitle")
                    : t("confirmations.moveBackward.subtitle")}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>{confirmation.lead.name}</strong>{" "}
                {t("confirmations.moveBackward.from")}{" "}
                {confirmation.lead.company}
              </p>
              <p className="text-sm text-gray-600">
                {t("confirmations.markAsLost.movingTo")}{" "}
                <strong>
                  {STAGES.find((s) => s.id === confirmation.targetStage)?.name}
                </strong>
              </p>
            </div>

            {confirmation.type === "lost" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("confirmations.markAsLost.reasonLabel")}
                </label>
                <textarea
                  value={confirmation.reason || ""}
                  onChange={(e) =>
                    setConfirmation({
                      ...confirmation,
                      reason: e.target.value,
                    })
                  }
                  placeholder={t("confirmations.markAsLost.reasonPlaceholder")}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmation({
                    show: false,
                    type: null,
                    lead: null,
                    targetStage: "",
                  })
                }
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
              >
                {t("confirmations.markAsLost.cancel")}
              </button>
              <button
                onClick={() =>
                  confirmStageChange(
                    confirmation.lead!,
                    confirmation.targetStage,
                    confirmation.reason,
                  )
                }
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>{t("confirmations.markAsLost.updating")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t("confirmations.markAsLost.confirm")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Owner Dialog */}
      {assignOwnerDialog.show && assignOwnerDialog.lead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("confirmations.assignOwner.title")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("confirmations.assignOwner.subtitle")}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>{assignOwnerDialog.lead.name}</strong>{" "}
                {t("confirmations.assignOwner.from")}{" "}
                {assignOwnerDialog.lead.company}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("confirmations.assignOwner.selectUser")}{" "}
                <span className="text-red-500">
                  {t("confirmations.assignOwner.required")}
                </span>
              </label>
              <select
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              >
                <option value="">
                  {t("confirmations.assignOwner.selectUserPlaceholder")}
                </option>
                {usersLoading ? (
                  <option disabled>
                    {t("confirmations.assignOwner.loadingUsers")}
                  </option>
                ) : users && Array.isArray(users) ? (
                  users.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))
                ) : (
                  <option disabled>
                    {t("confirmations.assignOwner.noUsersAvailable")}
                  </option>
                )}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAssignOwnerDialog({ show: false, lead: null });
                  setSelectedUserId(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
              >
                {t("confirmations.assignOwner.cancel")}
              </button>
              <button
                onClick={() => confirmAssignOwner()}
                disabled={isAssigning || !selectedUserId}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>{t("confirmations.assignOwner.assigning")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t("confirmations.assignOwner.assign")}</span>
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
