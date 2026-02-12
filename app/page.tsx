"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Award,
  Zap,
  Activity,
  Crown,
  Sparkles,
  Trophy,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Flame,
  Layers,
  Star,
} from "lucide-react";
import { useGetDashboardQuery } from "@/store/api/apiSlice";

// ─── Types (mirrors API response) ────────────────────────────────────────────

interface Summary {
  totalRevenue: number;
  revenueTarget: number;
  revenuePercentage: number;
  winRate: number;
  conversionRate: number;
  activePipelineValue: number;
  avgDealSize: number;
  qualifiedLeads: number;
}

interface RevenueTrendItem {
  month: string;
  revenue: number;
  target?: number;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

interface DashboardData {
  summary: Summary;
  revenueTrend: RevenueTrendItem[];
  pipeline: PipelineStage[];
}

// ─── Stage Color Map ──────────────────────────────────────────────────────────

const STAGE_COLORS: Record<
  string,
  { gradient: string; bg: string; text: string; border: string }
> = {
  New: {
    gradient: "from-slate-500 to-gray-600",
    bg: "from-slate-50 to-gray-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  Contacted: {
    gradient: "from-blue-600 to-cyan-600",
    bg: "from-blue-50 to-cyan-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Qualified: {
    gradient: "from-violet-600 to-purple-600",
    bg: "from-violet-50 to-purple-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  Proposal: {
    gradient: "from-indigo-600 to-blue-600",
    bg: "from-indigo-50 to-blue-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  Negotiation: {
    gradient: "from-orange-500 to-amber-500",
    bg: "from-orange-50 to-amber-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  Won: {
    gradient: "from-green-600 to-emerald-600",
    bg: "from-green-50 to-emerald-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  Lost: {
    gradient: "from-red-500 to-rose-600",
    bg: "from-red-50 to-rose-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

const getStageColor = (stage: string) =>
  STAGE_COLORS[stage] ?? STAGE_COLORS["New"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `EGP ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `EGP ${(n / 1_000).toFixed(0)}K`;
  return `EGP ${n}`;
};

const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl ${className}`}
  />
);

// ─── Circular Progress ────────────────────────────────────────────────────────

const CircularProgress = ({
  value,
  size = 80,
  strokeWidth = 7,
  gradient,
  label,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  gradient: string;
  label: string;
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const gradId = `grad-${label.replace(/\s/g, "")}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              stopColor={
                gradient === "gold"
                  ? "#f59e0b"
                  : gradient === "green"
                    ? "#10b981"
                    : gradient === "blue"
                      ? "#3b82f6"
                      : "#8b5cf6"
              }
            />
            <stop
              offset="100%"
              stopColor={
                gradient === "gold"
                  ? "#f97316"
                  : gradient === "green"
                    ? "#059669"
                    : gradient === "blue"
                      ? "#06b6d4"
                      : "#ec4899"
              }
            />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-gray-900 leading-none">
          {value.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { data, isLoading, error } = useGetDashboardQuery();
  const dashboard = data as DashboardData | undefined;

  const summary = dashboard?.summary;
  const revenueTrend = dashboard?.revenueTrend ?? [];
  const pipeline = dashboard?.pipeline ?? [];

  // Max pipeline value for bar scaling
  const maxPipelineValue = useMemo(
    () => Math.max(...pipeline.map((s) => s.value), 1),
    [pipeline],
  );

  const maxTrendRevenue = useMemo(
    () => Math.max(...revenueTrend.map((r) => r.revenue), 1),
    [revenueTrend],
  );

  const totalPipelineDeals = useMemo(
    () => pipeline.reduce((acc, s) => acc + s.count, 0),
    [pipeline],
  );

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[2000px] mx-auto space-y-6">
          <Skeleton className="h-28 w-full rounded-3xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-300/10 to-blue-300/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-[2000px] mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40 rotate-3 hover:rotate-6 transition-transform duration-300">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent leading-[50px]">
                  Executive Dashboard
                </h1>
                <p className="text-gray-500 text-sm">
                  Live insights · Real-time analytics
                </p>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl w-fit">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-green-700 text-sm font-semibold">
                Live Data
              </span>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Revenue */}
          <div className="group bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-yellow-500/10 hover:shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  (summary?.revenuePercentage ?? 0) > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                {(summary?.revenuePercentage ?? 0).toFixed(1)}%
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Revenue
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
              {fmtCompact(summary?.totalRevenue ?? 0)}
            </p>

            {/* Progress bar toward target */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>vs Target</span>
                <span className="font-semibold text-gray-700">
                  {fmtCompact(summary?.revenueTarget ?? 0)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(summary?.revenuePercentage ?? 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="group bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <CircularProgress
                value={summary?.winRate ?? 0}
                gradient="green"
                label="winrate"
                size={52}
                strokeWidth={5}
              />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Win Rate</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {(summary?.winRate ?? 0).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Closed deals performance
            </p>
          </div>

          {/* Active Pipeline */}
          <div className="group bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                <Layers className="w-3 h-3" />
                {totalPipelineDeals} deals
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Active Pipeline
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {fmtCompact(summary?.activePipelineValue ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Avg deal:{" "}
              <span className="font-semibold text-gray-700">
                {fmtCompact(summary?.avgDealSize ?? 0)}
              </span>
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="group bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-violet-500/10 hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-violet-600" />
              </div>
              <CircularProgress
                value={summary?.conversionRate ?? 0}
                gradient="purple"
                label="conversion"
                size={52}
                strokeWidth={5}
              />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Conversion Rate
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {(summary?.conversionRate ?? 0).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              <span className="font-semibold text-gray-700">
                {fmtNum(summary?.qualifiedLeads ?? 0)}
              </span>{" "}
              qualified leads
            </p>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Revenue Trend — wider */}
          <div className="lg:col-span-3 bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Revenue Trend
                </h3>
                <p className="text-gray-500 text-sm mt-0.5">
                  Monthly performance over time
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <LineChart className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {revenueTrend.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <LineChart className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No trend data yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Revenue trend will appear as data accumulates
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {revenueTrend.map((item, idx) => {
                  const targetVal = item.target ?? 0;
                  const pct =
                    targetVal > 0 ? (item.revenue / targetVal) * 100 : 100;
                  const barPct = (item.revenue / maxTrendRevenue) * 100;
                  const above = targetVal === 0 || item.revenue >= targetVal;
                  return (
                    <div key={idx} className="group/bar">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-700">
                          {item.month}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900">
                            {fmt(item.revenue)}
                          </span>
                          {targetVal > 0 &&
                            (above ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-orange-500" />
                            ))}
                        </div>
                      </div>
                      <div className="relative h-9 bg-gray-100 rounded-xl overflow-hidden">
                        <div
                          className={`h-full rounded-xl transition-all duration-700 ${
                            above
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-orange-400 to-amber-500"
                          }`}
                          style={{ width: `${barPct}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-4 justify-between">
                          <span className="text-xs font-bold text-white drop-shadow">
                            {barPct.toFixed(0)}%
                          </span>
                          {targetVal > 0 && (
                            <span className="text-xs text-gray-600">
                              Target: {fmt(targetVal)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pipeline Distribution — narrower */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Pipeline</h3>
                <p className="text-gray-500 text-sm mt-0.5">Deals by stage</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
            </div>

            {pipeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-purple-50 rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No pipeline data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pipeline.map((item, idx) => {
                  const colors = getStageColor(item.stage);
                  const barWidth = (item.value / maxPipelineValue) * 100;
                  const stageTotal = pipeline.reduce((a, s) => a + s.count, 0);
                  const pct =
                    stageTotal > 0
                      ? ((item.count / stageTotal) * 100).toFixed(0)
                      : "0";

                  return (
                    <div key={idx} className="group/stage">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${colors.gradient}`}
                          />
                          <span className="text-sm font-semibold text-gray-800">
                            {item.stage}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border}`}
                          >
                            {item.count}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">
                            {fmtCompact(item.value)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-700`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Total row */}
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-500" />
                      Total Pipeline
                    </span>
                    <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {fmtCompact(pipeline.reduce((a, s) => a + s.value, 0))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    {totalPipelineDeals} deals across {pipeline.length} stages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Summary Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Revenue Target",
              value: fmtCompact(summary?.revenueTarget ?? 0),
              sub: `${(summary?.revenuePercentage ?? 0).toFixed(1)}% achieved`,
              icon: Target,
              gradient: "from-yellow-600 to-orange-600",
              iconBg: "from-yellow-100 to-orange-100",
              iconColor: "text-yellow-600",
              shadow: "shadow-yellow-500/10",
            },
            {
              label: "Avg Deal Size",
              value: fmtCompact(summary?.avgDealSize ?? 0),
              sub: "per closed deal",
              icon: DollarSign,
              gradient: "from-green-600 to-emerald-600",
              iconBg: "from-green-100 to-emerald-100",
              iconColor: "text-green-600",
              shadow: "shadow-green-500/10",
            },
            {
              label: "Qualified Leads",
              value: fmtNum(summary?.qualifiedLeads ?? 0),
              sub: `${(summary?.conversionRate ?? 0).toFixed(1)}% conversion`,
              icon: Users,
              gradient: "from-blue-600 to-cyan-600",
              iconBg: "from-blue-100 to-cyan-100",
              iconColor: "text-blue-600",
              shadow: "shadow-blue-500/10",
            },
            {
              label: "Win Rate",
              value: `${(summary?.winRate ?? 0).toFixed(1)}%`,
              sub: "closed won ratio",
              icon: Award,
              gradient: "from-violet-600 to-purple-600",
              iconBg: "from-violet-100 to-purple-100",
              iconColor: "text-violet-600",
              shadow: "shadow-violet-500/10",
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`group bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-5 shadow-lg ${card.shadow} hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${card.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
                <p className="text-gray-500 text-xs font-medium mb-1">
                  {card.label}
                </p>
                <p
                  className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
                >
                  {card.value}
                </p>
                <p className="text-gray-400 text-xs mt-1">{card.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
