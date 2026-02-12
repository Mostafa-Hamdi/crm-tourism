"use client";

import { useGetLeadNotesQuery } from "@/store/api/apiSlice";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  User,
  Calendar,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Note {
  note: string;
  createdBy: string;
  createdAt: string;
}

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("leads.notes");
  const id = Number(params.id);
  const { data: notes, isLoading } = useGetLeadNotesQuery({ id });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get color for note card
  const getColorForNote = (index: number) => {
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

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.back()}
                className="cursor-pointer p-3 bg-white/50 hover:bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md"
                title={t("goBack")}
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px] font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  {t("title")}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {t("subtitle", { id })}
                </p>
              </div>
            </div>

            <Link
              href={`/leads/${id}/notes/add`}
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t("addNote")}</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("stats.totalNotes")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {notes?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("stats.lastUpdated")}
                </p>
                <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {notes?.[0]
                    ? formatDate(notes[0].createdAt)
                    : t("stats.noUpdates")}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {t("stats.contributors")}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {notes
                    ? new Set(notes.map((n: Note) => n.createdBy)).size
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Notes Timeline */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">{t("loading")}</p>
            </div>
          ) : !notes || notes.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {t("empty.title")}
              </h3>
              <p className="text-gray-500 text-sm mb-6">{t("empty.message")}</p>
              <Link
                href={`/leads/${id}/notes/add`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t("empty.addFirstNote")}</span>
              </Link>
            </div>
          ) : (
            <div className="p-8">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200"></div>

                {/* Notes */}
                <div className="space-y-8">
                  {notes.map((note: Note, index: number) => (
                    <div key={index} className="relative flex gap-6">
                      {/* Timeline dot */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${getColorForNote(
                            index,
                          )} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 z-10`}
                        >
                          <MessageSquare className="w-7 h-7 text-white" />
                        </div>
                      </div>

                      {/* Note card */}
                      <div className="flex-1 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {note.createdBy}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t("stats.author")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {formatDate(note.createdAt)}
                            </span>
                            <span className="text-gray-400">•</span>
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {formatTime(note.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Note content */}
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {note.note}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
