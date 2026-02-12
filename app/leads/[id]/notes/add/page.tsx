"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMemo } from "react";
import {
  StickyNote,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Target,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useAddLeadNoteMutation } from "@/store/api/apiSlice";
import { useTranslations } from "next-intl";

type NoteFormData = {
  note: string;
  interactionType: number;
};

const Page = () => {
  const params = useParams();
  const leadId = Number(params.id);
  const router = useRouter();
  const t = useTranslations("leads.addNote");
  const [addLeadNote, { isLoading }] = useAddLeadNoteMutation();

  // Interaction types with their integer values
  const INTERACTION_TYPES = useMemo(
    () => [
      { value: 0, label: t("interactionTypes.generalNote"), icon: StickyNote },
      { value: 1, label: t("interactionTypes.phoneCall"), icon: Phone },
      { value: 2, label: t("interactionTypes.email"), icon: Mail },
      { value: 3, label: t("interactionTypes.whatsapp"), icon: MessageSquare },
      { value: 4, label: t("interactionTypes.meeting"), icon: Calendar },
      { value: 5, label: t("interactionTypes.followUp"), icon: Target },
      { value: 6, label: t("interactionTypes.other"), icon: FileText },
    ],
    [t],
  );

  // Create validation schema with translations
  const noteSchema = useMemo(() => {
    return yup.object({
      note: yup
        .string()
        .required(t("validation.noteRequired"))
        .min(5, t("validation.noteMin", { min: 5 }))
        .max(500, t("validation.noteMax", { max: 500 }))
        .trim(),
      interactionType: yup
        .number()
        .required(t("validation.interactionTypeRequired"))
        .min(0, t("validation.interactionTypeValid")),
    });
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<NoteFormData>({
    resolver: yupResolver(noteSchema),
    mode: "onChange",
    defaultValues: {
      interactionType: 0, // Default to General Note
    },
  });

  const selectedInteractionType = watch("interactionType");

  const onSubmit = async (data: NoteFormData) => {
    try {
      await addLeadNote({
        id: leadId,
        note: data.note,
        interactionType: data.interactionType,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: t("success.title"),
        text: t("success.message"),
        timer: 2000,
        showConfirmButton: false,
      });

      reset();
      router.push(`/leads/${leadId}`);
    } catch (err: any) {
      let errorMessage = t("error.defaultMessage");

      if (err?.data) {
        if (typeof err.data === "string") {
          errorMessage = err.data;
        } else if (err.data?.message) {
          errorMessage = err.data.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: t("error.title"),
        text: errorMessage,
      });
    }
  };

  // Get the selected interaction type details
  const selectedType = INTERACTION_TYPES.find(
    (type) => type.value === Number(selectedInteractionType),
  );
  const SelectedIcon = selectedType?.icon || StickyNote;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex items-start gap-4">
            <Link
              href={`/leads/${leadId}`}
              className="cursor-pointer p-3 bg-white/50 hover:bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md"
              title={t("goBack")}
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                <SelectedIcon className="w-8 h-8 text-white" />
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
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Note Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {t("form.interactionDetails")}
              </h2>

              {/* Interaction Type Cards - Visual Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t("form.interactionType")}{" "}
                  <span className="text-red-500">{t("form.required")}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {INTERACTION_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedInteractionType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setValue("interactionType", type.value, {
                            shouldValidate: true,
                          });
                        }}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-600 shadow-lg shadow-blue-500/40 scale-105"
                            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 mx-auto mb-2 ${
                            isSelected ? "text-white" : "text-gray-600"
                          }`}
                        />
                        <p
                          className={`text-xs font-semibold ${
                            isSelected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {type.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {errors.interactionType && (
                  <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.interactionType.message}
                  </p>
                )}
              </div>

              {/* Note Field */}
              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {t("form.note")}{" "}
                  <span className="text-red-500">{t("form.required")}</span>
                </label>
                <textarea
                  id="note"
                  rows={6}
                  placeholder={t("form.notePlaceholder", {
                    type: selectedType?.label.toLowerCase() || "note",
                  })}
                  {...register("note")}
                  className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                    errors.note
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all resize-none`}
                />
                {errors.note && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.note.message}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  {t("form.maxCharacters")}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <SelectedIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    {t("infoBox.title", {
                      type: selectedType?.label || "Interaction",
                    })}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {t("infoBox.message", {
                      type: selectedType?.label.toLowerCase() || "interaction",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(`/leads/${leadId}`)}
                disabled={isLoading}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t("form.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("form.addingNote")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{t("form.addNote")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
