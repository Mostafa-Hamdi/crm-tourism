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
  Calendar,
  Clock,
  Briefcase,
  PhoneCall,
  Mail,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Crown,
  Star,
  Flame,
  Trophy,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  User,
} from "lucide-react";

// Mock data for dashboard
const DASHBOARD_DATA = {
  revenue: {
    current: 2847500,
    previous: 2345000,
    target: 3000000,
    won: 1950000,
    pipeline: 897500,
  },
  deals: {
    total: 156,
    won: 45,
    lost: 23,
    active: 88,
    avgDealSize: 62500,
    avgCycleTime: 34, // days
  },
  leads: {
    total: 342,
    qualified: 156,
    contacted: 98,
    new: 88,
    conversionRate: 28.9,
  },
  activities: {
    calls: 234,
    meetings: 89,
    emails: 567,
    messages: 345,
  },
  team: [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      role: "Senior Account Executive",
      deals: 12,
      revenue: 845000,
      target: 800000,
      performance: 105.6,
      activities: 156,
    },
    {
      id: 2,
      name: "Mike Wilson",
      avatar: "MW",
      role: "Account Executive",
      deals: 15,
      revenue: 675000,
      target: 700000,
      performance: 96.4,
      activities: 189,
    },
    {
      id: 3,
      name: "John Davis",
      avatar: "JD",
      role: "Sales Representative",
      deals: 10,
      revenue: 430000,
      target: 500000,
      performance: 86.0,
      activities: 142,
    },
    {
      id: 4,
      name: "Emily Chen",
      avatar: "EC",
      role: "Account Executive",
      deals: 8,
      revenue: 385000,
      target: 400000,
      performance: 96.3,
      activities: 128,
    },
  ],
  topDeals: [
    {
      id: 1,
      company: "Tech Innovations Inc",
      value: 350000,
      stage: "Negotiation",
      probability: 85,
      owner: "Sarah Johnson",
      closeDate: "2024-02-15",
    },
    {
      id: 2,
      company: "Global Solutions Ltd",
      value: 280000,
      stage: "Proposal",
      probability: 70,
      owner: "Mike Wilson",
      closeDate: "2024-02-20",
    },
    {
      id: 3,
      company: "Enterprise Systems",
      value: 245000,
      stage: "Negotiation",
      probability: 90,
      owner: "Sarah Johnson",
      closeDate: "2024-02-10",
    },
    {
      id: 4,
      company: "Digital Dynamics",
      value: 195000,
      stage: "Qualified",
      probability: 60,
      owner: "John Davis",
      closeDate: "2024-03-01",
    },
    {
      id: 5,
      company: "Smart Tech Corp",
      value: 175000,
      stage: "Proposal",
      probability: 75,
      owner: "Emily Chen",
      closeDate: "2024-02-25",
    },
  ],
  pipelineByStage: [
    {
      stage: "New",
      count: 28,
      value: 1400000,
      color: "from-gray-600 to-slate-600",
    },
    {
      stage: "Contacted",
      count: 35,
      value: 2100000,
      color: "from-blue-600 to-cyan-600",
    },
    {
      stage: "Qualified",
      count: 42,
      value: 2940000,
      color: "from-purple-600 to-pink-600",
    },
    {
      stage: "Proposal",
      count: 25,
      value: 1875000,
      color: "from-indigo-600 to-blue-600",
    },
    {
      stage: "Negotiation",
      count: 15,
      value: 1575000,
      color: "from-orange-600 to-amber-600",
    },
  ],
  revenueByMonth: [
    { month: "Aug", revenue: 245000, target: 250000 },
    { month: "Sep", revenue: 298000, target: 250000 },
    { month: "Oct", revenue: 312000, target: 250000 },
    { month: "Nov", revenue: 285000, target: 250000 },
    { month: "Dec", revenue: 356000, target: 250000 },
    { month: "Jan", revenue: 421000, target: 300000 },
  ],
  leadSources: [
    {
      source: "Website",
      count: 89,
      percentage: 26,
      color: "from-blue-500 to-cyan-500",
    },
    {
      source: "Referral",
      count: 76,
      percentage: 22,
      color: "from-purple-500 to-pink-500",
    },
    {
      source: "LinkedIn",
      count: 68,
      percentage: 20,
      color: "from-indigo-500 to-blue-500",
    },
    {
      source: "Cold Call",
      count: 54,
      percentage: 16,
      color: "from-orange-500 to-amber-500",
    },
    {
      source: "Partner",
      count: 32,
      percentage: 9,
      color: "from-green-500 to-emerald-500",
    },
    {
      source: "Other",
      count: 23,
      percentage: 7,
      color: "from-gray-500 to-slate-500",
    },
  ],
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  // Calculate metrics
  const revenueGrowth = useMemo(() => {
    const growth =
      ((DASHBOARD_DATA.revenue.current - DASHBOARD_DATA.revenue.previous) /
        DASHBOARD_DATA.revenue.previous) *
      100;
    return growth.toFixed(1);
  }, []);

  const targetProgress = useMemo(() => {
    return (
      (DASHBOARD_DATA.revenue.current / DASHBOARD_DATA.revenue.target) *
      100
    ).toFixed(1);
  }, []);

  const winRate = useMemo(() => {
    const total = DASHBOARD_DATA.deals.won + DASHBOARD_DATA.deals.lost;
    return ((DASHBOARD_DATA.deals.won / total) * 100).toFixed(1);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Format percentage
  const formatPercentage = (num: number) => {
    return `${num}%`;
  };

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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  Executive Dashboard
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Premium insights & real-time analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Revenue */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-yellow-500/20 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm font-bold">
                  +{revenueGrowth}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Total Revenue
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                {formatCurrency(DASHBOARD_DATA.revenue.current)}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${targetProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-700 font-medium">
                  {targetProgress}%
                </span>
              </div>
              <p className="text-gray-600 text-xs mt-1">
                Target: {formatCurrency(DASHBOARD_DATA.revenue.target)}
              </p>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm font-bold">
                  {DASHBOARD_DATA.deals.won}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Win Rate</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {winRate}%
              </p>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  {DASHBOARD_DATA.deals.won} Won
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-600" />
                  {DASHBOARD_DATA.deals.lost} Lost
                </span>
              </div>
            </div>
          </div>

          {/* Active Pipeline */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 text-sm font-bold">
                  {DASHBOARD_DATA.deals.active}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Active Pipeline
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {formatCurrency(DASHBOARD_DATA.revenue.pipeline)}
              </p>
              <p className="text-gray-600 text-xs">
                Avg Deal: {formatCurrency(DASHBOARD_DATA.deals.avgDealSize)}
              </p>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-full">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700 text-sm font-bold">
                  {DASHBOARD_DATA.leads.qualified}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Conversion Rate
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {DASHBOARD_DATA.leads.conversionRate}%
              </p>
              <p className="text-gray-600 text-xs">
                {DASHBOARD_DATA.leads.qualified} of {DASHBOARD_DATA.leads.total}{" "}
                qualified
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Revenue Trend
                </h3>
                <p className="text-gray-600 text-sm">
                  Monthly performance vs target
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <LineChart className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {/* Chart */}
            <div className="space-y-4">
              {DASHBOARD_DATA.revenueByMonth.map((item, idx) => {
                const percentage = (item.revenue / item.target) * 100;
                const isAboveTarget = item.revenue >= item.target;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        {item.month}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(item.revenue)}
                        </span>
                        {isAboveTarget ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isAboveTarget ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-orange-500 to-amber-500"}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3 justify-between">
                        <span className="text-xs font-bold text-white drop-shadow">
                          {percentage.toFixed(0)}%
                        </span>
                        <span className="text-xs text-gray-700">
                          Target: {formatCurrency(item.target)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline by Stage */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Pipeline Distribution
                </h3>
                <p className="text-gray-600 text-sm">Deals by stage</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>

            <div className="space-y-4">
              {DASHBOARD_DATA.pipelineByStage.map((item, idx) => {
                const maxValue = Math.max(
                  ...DASHBOARD_DATA.pipelineByStage.map((s) => s.value),
                );
                const percentage = (item.value / maxValue) * 100;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {item.stage}
                        </span>
                        <span className="text-xs text-gray-600">
                          ({item.count})
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lead Sources & Top Deals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Sources */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Lead Sources
                </h3>
                <p className="text-gray-600 text-sm">Where leads come from</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                <PieChart className="w-5 h-5 text-orange-600" />
              </div>
            </div>

            <div className="space-y-3">
              {DASHBOARD_DATA.leadSources.map((source, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {source.source}
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {source.count}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${source.color} rounded-full transition-all duration-500`}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-12 text-right">
                    {source.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Deals */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Top Opportunities
                </h3>
                <p className="text-gray-600 text-sm">
                  Highest value deals in pipeline
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>

            <div className="space-y-3">
              {DASHBOARD_DATA.topDeals.map((deal, idx) => (
                <div
                  key={deal.id}
                  className="bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-white">
                            #{idx + 1}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900">
                          {deal.company}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {deal.owner}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(deal.closeDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                      <div className="px-3 py-1 bg-blue-100 rounded-lg border border-blue-200">
                        <span className="text-xs font-medium text-blue-700">
                          {deal.stage}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-green-600">
                        {deal.probability}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-blue-500/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Team Performance
              </h3>
              <p className="text-gray-600 text-sm">
                Individual contributor insights
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DASHBOARD_DATA.team.map((member, idx) => {
              const isTopPerformer = member.performance >= 100;
              return (
                <div
                  key={member.id}
                  className={`relative group ${isTopPerformer ? "ring-2 ring-yellow-400" : ""}`}
                >
                  {isTopPerformer && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <Flame className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-blue-300 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm mb-0.5">
                          {member.name}
                        </h4>
                        <p className="text-xs text-gray-600">{member.role}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Revenue</span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(member.revenue)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${member.performance >= 100 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"}`}
                            style={{
                              width: `${Math.min(member.performance, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-600">Deals</p>
                          <p className="text-sm font-bold text-gray-900">
                            {member.deals}
                          </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-600">Target</p>
                          <p
                            className={`text-sm font-bold ${member.performance >= 100 ? "text-green-600" : "text-blue-600"}`}
                          >
                            {member.performance}%
                          </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-600">Activity</p>
                          <p className="text-sm font-bold text-gray-900">
                            {member.activities}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-5 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <PhoneCall className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Calls Made</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(DASHBOARD_DATA.activities.calls)}
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-5 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Meetings</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(DASHBOARD_DATA.activities.meetings)}
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-5 shadow-lg shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Emails Sent</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(DASHBOARD_DATA.activities.emails)}
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-5 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Messages</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(DASHBOARD_DATA.activities.messages)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
