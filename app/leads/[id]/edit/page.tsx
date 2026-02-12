"use client";

import { useGetLeadQuery, useUpdateLeadMutation } from "@/store/api/apiSlice";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useMemo } from "react";
import {
  User,
  Phone,
  Mail,
  Tag,
  Sparkles,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

type LeadFormData = {
  fullName: string;
  phone: string;
  email: string;
  source: string;
};

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("leads.edit");
  const id = Number(params.id);

  const { data: leadData, isLoading: isLoadingLead } = useGetLeadQuery({ id });
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();

  // Create validation schema with translations
  const leadSchema = useMemo(() => {
    return yup.object().shape({
      fullName: yup
        .string()
        .required(t("validation.fullNameRequired"))
        .min(2, t("validation.fullNameMin", { min: 2 }))
        .max(100, t("validation.fullNameMax", { max: 100 })),
      phone: yup
        .string()
        .required(t("validation.phoneRequired"))
        .matches(/^[\d\s\-\+\(\)]+$/, t("validation.phoneInvalid"))
        .min(10, t("validation.phoneMin", { min: 10 })),
      email: yup
        .string()
        .required(t("validation.emailRequired"))
        .email(t("validation.emailInvalid")),
      source: yup
        .string()
        .required(t("validation.sourceRequired"))
        .min(2, t("validation.sourceMin", { min: 2 }))
        .max(100, t("validation.sourceMax", { max: 100 })),
    });
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: yupResolver(leadSchema),
  });

  // Populate form when lead data is loaded
  useEffect(() => {
    if (leadData) {
      reset({
        fullName: leadData.fullName || "",
        phone: leadData.phone || "",
        email: leadData.email || "",
        source: leadData.source || "",
      });
    }
  }, [leadData, reset]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      await updateLead({
        id,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        source: data.source,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: t("success.title"),
        text: t("success.message"),
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/leads");
    } catch (err) {
      let message = t("error.defaultMessage");

      if (typeof err === "object" && err !== null) {
        const maybeData = (err as any).data;
        if (typeof maybeData === "string") {
          message = maybeData;
        }
      }

      Swal.fire({
        icon: "error",
        title: t("error.title"),
        text: message,
      });
    }
  };

  // Loading state
  if (isLoadingLead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl mx-auto">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-20 shadow-xl shadow-blue-500/10">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">{t("loading")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - Lead not found
  if (!leadData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl mx-auto">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-20 shadow-xl shadow-blue-500/10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full mb-4">
                <User className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-4">
                {t("notFound")}
              </p>
              <Link
                href="/leads"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("backToLeads")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                  <User className="w-8 h-8 text-white" />
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

            <Link
              href="/leads"
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{t("back")}</span>
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("form.fullName")}{" "}
                <span className="text-red-500">{t("form.required")}</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("fullName")}
                  placeholder={t("form.fullNamePlaceholder")}
                  className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                    errors.fullName ? "border-red-300" : "border-gray-200"
                  } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("form.phoneNumber")}{" "}
                <span className="text-red-500">{t("form.required")}</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder={t("form.phoneNumberPlaceholder")}
                  className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                    errors.phone ? "border-red-300" : "border-gray-200"
                  } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("form.emailAddress")}{" "}
                <span className="text-red-500">{t("form.required")}</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  placeholder={t("form.emailPlaceholder")}
                  className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("form.source")}{" "}
                <span className="text-red-500">{t("form.required")}</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Tag className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("source")}
                  placeholder={t("form.sourcePlaceholder")}
                  className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                    errors.source ? "border-red-300" : "border-gray-200"
                  } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                />
              </div>
              {errors.source && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.source.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/leads")}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
              >
                {t("form.cancel")}
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 group relative cursor-pointer flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isUpdating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                    <span className="relative z-10">
                      {t("form.updatingLead")}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">
                      {t("form.updateLead")}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                {t("info.title", { id })}
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {t("info.tip1")}</li>
                <li>• {t("info.tip2")}</li>
                <li>• {t("info.tip3")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
