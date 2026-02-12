"use client";

import { useAddLeadTaskMutation } from "@/store/api/apiSlice";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ListTodo,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type TaskFormData = {
  title: string;
  dueDate: string;
};

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("leads.addTask");
  const id = Number(params.id);

  const [addLeadTask, { isLoading, isSuccess, isError, error }] =
    useAddLeadTaskMutation();

  // Create validation schema with translations
  const taskSchema = useMemo(() => {
    return yup.object({
      title: yup
        .string()
        .required(t("validation.titleRequired"))
        .min(3, t("validation.titleMin", { min: 3 }))
        .max(200, t("validation.titleMax", { max: 200 })),
      dueDate: yup
        .string()
        .required(t("validation.dueDateRequired"))
        .test("is-future", t("validation.dueDateFuture"), (value) => {
          if (!value) return false;
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selectedDate >= today;
        }),
    });
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: "",
      dueDate: "",
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      await addLeadTask({
        id,
        title: data.title,
        dueDate: data.dueDate,
      }).unwrap();

      reset();

      setTimeout(() => {
        router.push(`/leads/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  // Get minimum date (today) for date input
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/leads/${id}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToLead")}
          </Link>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <ListTodo className="w-8 h-8 text-white" />
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
          </div>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">
                  {t("success.title")}
                </h3>
                <p className="text-sm text-green-700">{t("success.message")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {isError && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">
                  {t("error.title")}
                </h3>
                <p className="text-sm text-red-700">
                  {(error as any)?.data?.message || t("error.defaultMessage")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t("form.taskTitle")}{" "}
                <span className="text-red-500">{t("form.required")}</span>
              </label>
              <div className="relative">
                <input
                  id="title"
                  type="text"
                  {...register("title")}
                  placeholder={t("form.taskTitlePlaceholder")}
                  className={`w-full bg-white border-2 ${
                    errors.title
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all`}
                  disabled={isLoading || isSuccess}
                />
                {errors.title && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t("form.dueDate")}{" "}
                <span className="text-red-500">{t("form.required")}</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="dueDate"
                  type="date"
                  {...register("dueDate")}
                  min={getMinDate()}
                  className={`w-full bg-white border-2 ${
                    errors.dueDate
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:ring-4 transition-all`}
                  disabled={isLoading || isSuccess}
                />
                {errors.dueDate && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.dueDate && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.dueDate.message}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {t("form.dueDateHelper")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading || isSuccess}
                className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t("form.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading || isSuccess || !isDirty}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t("form.creatingTask")}</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t("form.taskCreated")}</span>
                  </>
                ) : (
                  <>
                    <ListTodo className="w-5 h-5" />
                    <span>{t("form.createTask")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                {t("tips.title")}
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {t("tips.tip1")}</li>
                <li>• {t("tips.tip2")}</li>
                <li>• {t("tips.tip3")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
