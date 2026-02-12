// "use client";

// import {
//   useGetFollowupOverdueMutation,
//   useGetFollowupRangeMutation,
//   useGetFollowupTodayQuery,
//   useGetLeadFollowupQuery,
// } from "@/store/api/apiSlice";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import {
//   Calendar,
//   Clock,
//   AlertCircle,
//   Search,
//   Sparkles,
//   User,
//   Phone,
//   Mail,
//   MessageSquare,
//   RefreshCw,
//   Filter,
// } from "lucide-react";
// import { useParams } from "next/navigation";

// // Validation Schema for Date Range
// const dateRangeSchema = yup.object().shape({
//   from: yup
//     .string()
//     .required("Start date is required")
//     .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
//   to: yup
//     .string()
//     .required("End date is required")
//     .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
//     .test(
//       "is-after-from",
//       "End date must be after start date",
//       function (value) {
//         const { from } = this.parent;
//         if (!from || !value) return true;
//         return new Date(value) >= new Date(from);
//       },
//     ),
// });

// type DateRangeFormData = yup.InferType<typeof dateRangeSchema>;

// type FilterMode = "today" | "overdue" | "range";

// const Page = () => {
//   const params = useParams();
//   const routeId = params.id;
//   const id = routeId ? Number(routeId) : undefined;
//   const [filterMode, setFilterMode] = useState<FilterMode>("today");
//   const [displayedFollowups, setDisplayedFollowups] = useState<any[]>([]);
//   const { data: allFollowups, isLoading: allLoading } = useGetLeadFollowupQuery(
//     id ? { id } : (undefined as any),
//     { skip: !id },
//   );
//   const {
//     data: todayFollowups,
//     isLoading: todayLoading,
//     refetch: refetchToday,
//   } = useGetFollowupTodayQuery();
//   const [getFollowupOverdue, { isLoading: overdueLoading }] =
//     useGetFollowupOverdueMutation();
//   const [getFollowupRange, { isLoading: rangeLoading }] =
//     useGetFollowupRangeMutation();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<DateRangeFormData>({
//     resolver: yupResolver(dateRangeSchema),
//   });

//   // Update displayed followups when today data changes
//   useEffect(() => {
//     if (filterMode === "today" && todayFollowups) {
//       setDisplayedFollowups(todayFollowups);
//     }
//   }, [todayFollowups, filterMode]);

//   const handleShowToday = () => {
//     setFilterMode("today");
//     setDisplayedFollowups(todayFollowups || []);
//     refetchToday();
//   };

//   const handleShowOverdue = async () => {
//     try {
//       const result = await getFollowupOverdue().unwrap();
//       setFilterMode("overdue");
//       setDisplayedFollowups(result || []);
//     } catch (error) {
//       console.error("Failed to fetch overdue followups:", error);
//       setDisplayedFollowups([]);
//     }
//   };

//   const onSubmitDateRange = async (data: DateRangeFormData) => {
//     try {
//       const result = await getFollowupRange({
//         from: data.from,
//         to: data.to,
//       }).unwrap();
//       setFilterMode("range");
//       setDisplayedFollowups(result || []);
//     } catch (error) {
//       console.error("Failed to fetch followups by range:", error);
//       setDisplayedFollowups([]);
//     }
//   };

//   const isLoading =
//     todayLoading || overdueLoading || rangeLoading || allLoading;
//   const followups =
//     filterMode === "today" && todayFollowups
//       ? todayFollowups
//       : displayedFollowups;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
//       {/* Decorative Elements */}
//       <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
//       <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
//           <div className="flex items-start gap-4">
//             <div className="relative">
//               <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
//                 <Calendar className="w-8 h-8 text-white" />
//               </div>
//               <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
//                 <Sparkles className="w-3 h-3 text-white" />
//               </div>
//             </div>
//             <div>
//               <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
//                 Follow-up Management
//               </h1>
//               <p className="text-gray-600 mt-2 text-sm sm:text-base">
//                 Track and manage your lead follow-ups
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Filter Controls */}
//         <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
//           <div className="space-y-6">
//             {/* Quick Filter Buttons */}
//             <div className="flex flex-wrap gap-3">
//               <button
//                 type="button"
//                 onClick={handleShowToday}
//                 className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
//                   filterMode === "today"
//                     ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/40"
//                     : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
//                 }`}
//               >
//                 <Calendar className="w-5 h-5" />
//                 Today's Follow-ups
//               </button>

//               <button
//                 type="button"
//                 onClick={handleShowOverdue}
//                 disabled={overdueLoading}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
//                   filterMode === "overdue"
//                     ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/40"
//                     : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
//                 }`}
//               >
//                 {overdueLoading ? (
//                   <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
//                 ) : (
//                   <AlertCircle className="w-5 h-5" />
//                 )}
//                 Overdue
//               </button>
//             </div>

//             {/* Date Range Filter */}
//             <div className="border-t border-gray-200 pt-6">
//               <div className="flex items-center gap-2 mb-4">
//                 <Filter className="w-5 h-5 text-blue-600" />
//                 <h3 className="text-lg font-bold text-gray-800">
//                   Filter by Date Range
//                 </h3>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     From Date <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     {...register("from")}
//                     className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
//                       errors.from ? "border-red-300" : "border-gray-200"
//                     } rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
//                   />
//                   {errors.from && (
//                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                       <span className="w-1 h-1 bg-red-600 rounded-full"></span>
//                       {errors.from.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     To Date <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     {...register("to")}
//                     className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
//                       errors.to ? "border-red-300" : "border-gray-200"
//                     } rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
//                   />
//                   {errors.to && (
//                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                       <span className="w-1 h-1 bg-red-600 rounded-full"></span>
//                       {errors.to.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="flex items-end">
//                   <button
//                     type="button"
//                     onClick={handleSubmit(onSubmitDateRange)}
//                     disabled={rangeLoading}
//                     className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                   >
//                     {rangeLoading ? (
//                       <>
//                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                         <span>Searching...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Search className="w-5 h-5" />
//                         <span>Search</span>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Results Section */}
//         <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-blue-500/10">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//               <MessageSquare className="w-5 h-5 text-blue-600" />
//               {filterMode === "today" && "Today's Follow-ups"}
//               {filterMode === "overdue" && "Overdue Follow-ups"}
//               {filterMode === "range" && "Follow-ups in Range"}
//               <span className="text-sm font-normal text-gray-500">
//                 ({followups?.length || 0} results)
//               </span>
//             </h2>

//             {filterMode === "today" && (
//               <button
//                 type="button"
//                 onClick={() => refetchToday()}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 title="Refresh"
//               >
//                 <RefreshCw className="w-5 h-5 text-gray-600" />
//               </button>
//             )}
//           </div>

//           {/* Loading State */}
//           {isLoading && (
//             <div className="flex flex-col items-center justify-center py-12">
//               <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
//               <p className="text-gray-600">Loading follow-ups...</p>
//             </div>
//           )}

//           {/* Empty State */}
//           {!isLoading && (!followups || followups.length === 0) && (
//             <div className="flex flex-col items-center justify-center py-12">
//               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                 <Calendar className="w-10 h-10 text-gray-400" />
//               </div>
//               <p className="text-gray-600 text-lg font-medium">
//                 No follow-ups found
//               </p>
//               <p className="text-gray-500 text-sm">
//                 {filterMode === "today" &&
//                   "There are no follow-ups scheduled for today"}
//                 {filterMode === "overdue" &&
//                   "Great! You have no overdue follow-ups"}
//                 {filterMode === "range" &&
//                   "No follow-ups found in the selected date range"}
//               </p>
//             </div>
//           )}

//           {/* Follow-ups List */}
//           {!isLoading && followups && followups.length > 0 && (
//             <div className="grid grid-cols-1 gap-4">
//               {followups.map((followup: any, index: number) => (
//                 <div
//                   key={followup.id || index}
//                   className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
//                 >
//                   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div className="flex-1 space-y-3">
//                       {/* Lead Name */}
//                       <div className="flex items-center gap-2">
//                         <User className="w-5 h-5 text-blue-600" />
//                         <span className="font-semibold text-gray-900">
//                           {followup.leadName ||
//                             followup.fullName ||
//                             "Unknown Lead"}
//                         </span>
//                       </div>

//                       {/* Contact Info */}
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
//                         {(followup.phone || followup.phoneNumber) && (
//                           <div className="flex items-center gap-2 text-gray-600">
//                             <Phone className="w-4 h-4" />
//                             <span>
//                               {followup.phone || followup.phoneNumber}
//                             </span>
//                           </div>
//                         )}
//                         {followup.email && (
//                           <div className="flex items-center gap-2 text-gray-600">
//                             <Mail className="w-4 h-4" />
//                             <span>{followup.email}</span>
//                           </div>
//                         )}
//                       </div>

//                       {/* Note */}
//                       {followup.note && (
//                         <div className="flex items-start gap-2 text-sm text-gray-700 bg-white/50 rounded-lg p-3">
//                           <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
//                           <span>{followup.note}</span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Follow-up Date */}
//                     <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
//                       <Clock className="w-5 h-5 text-blue-600" />
//                       <div className="text-sm">
//                         <div className="font-semibold text-gray-900">
//                           {followup.followUpDate
//                             ? new Date(
//                                 followup.followUpDate,
//                               ).toLocaleDateString()
//                             : "No date set"}
//                         </div>
//                         {followup.followUpDate && (
//                           <div className="text-gray-500">
//                             {new Date(followup.followUpDate).toLocaleTimeString(
//                               [],
//                               {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                               },
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;
import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;
