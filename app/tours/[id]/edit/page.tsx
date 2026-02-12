"use client";

import {
  useGetCourseQuery,
  useUpdateCourseMutation,
  useGetCategoriesQuery,
} from "@/store/api/apiSlice";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  Save,
  ChevronDown,
  AlertCircle,
  Clock,
  Hash,
  Target,
  Award,
  Globe,
  Tag,
  Image,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

// Validation schema is defined in the component so we can use translated messages.
interface Category {
  id: number;
  name: string;
}

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const t = useTranslations("courses");

  // Validation schema using localized validation messages
  const courseSchema = yup.object().shape({
    name: yup
      .string()
      .required(t("validation.nameRequired"))
      .min(3, t("validation.nameMin", { min: 3 }))
      .max(200, t("validation.nameMax", { max: 200 }))
      .trim(),
    code: yup
      .string()
      .required(t("validation.codeRequired"))
      .min(2, t("validation.codeMin", { min: 2 }))
      .max(50, t("validation.codeMax", { max: 50 }))
      .matches(/^[A-Z0-9-]+$/, t("validation.codePattern"))
      .trim(),
    description: yup
      .string()
      .required(t("validation.descriptionRequired"))
      .min(10, t("validation.descriptionMin", { min: 10 }))
      .max(1000, t("validation.descriptionMax", { max: 1000 }))
      .trim(),
    estimatedDurationHours: yup
      .number()
      .required(t("validation.durationRequired"))
      .positive(t("validation.durationPositive"))
      .integer(t("validation.durationInteger"))
      .max(10000, t("validation.durationMax", { max: 10000 }))
      .typeError(t("validation.durationType")),
    level: yup
      .number()
      .required(t("validation.levelRequired"))
      .oneOf([1, 2, 3], t("validation.levelOneOf"))
      .typeError(t("validation.levelType")),
    learningOutcomes: yup
      .string()
      .required(t("validation.learningOutcomesRequired"))
      .min(10, t("validation.learningOutcomesMin", { min: 10 }))
      .max(2000, t("validation.learningOutcomesMax", { max: 2000 }))
      .trim(),
    prerequisites: yup
      .string()
      .nullable()
      .transform((value) => (value === "" ? null : value))
      .max(1000, t("validation.prerequisitesMax", { max: 1000 }))
      .default(null),
    language: yup
      .string()
      .nullable()
      .transform((value) => (value === "" ? null : value))
      .max(50, t("validation.languageMax", { max: 50 }))
      .default(null),
    tags: yup
      .string()
      .nullable()
      .transform((value) => (value === "" ? null : value))
      .max(500, t("validation.tagsMax", { max: 500 }))
      .default(null),
    thumbnailUrl: yup
      .string()
      .nullable()
      .transform((value) => (value === "" ? null : value))
      .url(t("validation.thumbnailUrl"))
      .max(500, t("validation.thumbnailMax", { max: 500 }))
      .default(null),
    categoryId: yup
      .number()
      .required(t("validation.categoryRequired"))
      .positive(t("validation.categoryPositive"))
      .typeError(t("validation.categoryType")),
  });

  type CourseFormData = yup.InferType<typeof courseSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseFormData>({
    resolver: yupResolver(courseSchema),
  });

  const { data: courseData, isLoading: isLoadingCourse } = useGetCourseQuery({
    id,
  });
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoriesQuery();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();

  // Populate form when course data is loaded
  useEffect(() => {
    if (courseData) {
      reset({
        name: courseData.name || "",
        code: courseData.code || "",
        description: courseData.description || "",
        estimatedDurationHours: courseData.estimatedDurationHours || 0,
        level: courseData.level || 1,
        learningOutcomes: courseData.learningOutcomes || "",
        prerequisites: courseData.prerequisites || null,
        language: courseData.language || null,
        tags: courseData.tags || null,
        thumbnailUrl: courseData.thumbnailUrl || null,
        categoryId: courseData.categoryId || 0,
      });
    }
  }, [courseData, reset]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      await updateCourse({
        id,
        name: data.name,
        code: data.code,
        description: data.description,
        estimatedDurationHours: data.estimatedDurationHours,
        level: data.level,
        learningOutcomes: data.learningOutcomes,
        prerequisites: data.prerequisites || null,
        language: data.language || null,
        tags: data.tags || null,
        thumbnailUrl: data.thumbnailUrl || null,
        categoryId: data.categoryId,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: t("updateSuccessTitle"),
        text: t("updateSuccessText"),
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/courses");
    } catch (err) {
      let message = "Failed to update course.";

      if (typeof err === "object" && err !== null) {
        const maybeData = (err as any).data;
        if (typeof maybeData === "string") {
          message = maybeData;
        } else if (maybeData?.message) {
          message = maybeData.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: t("oops"),
        text: message,
      });
    }
  };

  // Loading state
  if (isLoadingCourse || isLoadingCategories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-20 shadow-xl shadow-blue-500/10">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">{t("loadingCourse")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - Course not found
  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-20 shadow-xl shadow-blue-500/10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full mb-4">
                <BookOpen className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-4">
                {t("courseNotFound")}
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("backToCourses")}
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

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  {t("editTitle")}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {t("editSubtitle")}
                </p>
              </div>
            </div>

            <Link
              href="/courses"
              className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{t("goBack")}</span>
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {t("basicInformation")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("courseNameLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder={t("courseNamePlaceholder")}
                    className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    } rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Course Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("codeLabel")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      {...register("code")}
                      placeholder={t("codePlaceholder")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.code
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all uppercase`}
                    />
                  </div>
                  {errors.code && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.code.message}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("categoryLabel")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("categoryId")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.categoryId
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all appearance-none cursor-pointer`}
                    >
                      <option value={0}>{t("selectCategory")}</option>
                      {categories?.data?.map((category: Category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.categoryId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("descriptionLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    placeholder={t("descriptionPlaceholder")}
                    className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                      errors.description
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    } rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all resize-none`}
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Course Details Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {t("courseDetails")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("durationLabel")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      {...register("estimatedDurationHours")}
                      placeholder="0"
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.estimatedDurationHours
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.estimatedDurationHours && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.estimatedDurationHours.message}
                    </p>
                  )}
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("levelLabel")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      {...register("level")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.level
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all appearance-none cursor-pointer`}
                    >
                      <option value={1}>{t("level.1")}</option>
                      <option value={2}>{t("level.2")}</option>
                      <option value={3}>{t("level.3")}</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.level && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.level.message}
                    </p>
                  )}
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      {...register("language")}
                      placeholder={t("languagePlaceholder")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.language
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.language && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.language.message}
                    </p>
                  )}
                </div>

                {/* Learning Outcomes */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Learning Outcomes <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Target className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <textarea
                      {...register("learningOutcomes")}
                      rows={4}
                      placeholder={t("learningOutcomesPlaceholder")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.learningOutcomes
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all resize-none`}
                    />
                  </div>
                  {errors.learningOutcomes && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.learningOutcomes.message}
                    </p>
                  )}
                </div>

                {/* Prerequisites */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prerequisites
                  </label>
                  <textarea
                    {...register("prerequisites")}
                    rows={3}
                    placeholder={t("prerequisitesPlaceholder")}
                    className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                      errors.prerequisites
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    } rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all resize-none`}
                  />
                  {errors.prerequisites && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.prerequisites.message}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      {...register("tags")}
                      placeholder={t("tagsPlaceholder")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.tags
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.tags && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.tags.message}
                    </p>
                  )}
                </div>

                {/* Thumbnail URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thumbnail URL
                  </label>
                  <div className="relative">
                    <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      {...register("thumbnailUrl")}
                      placeholder={t("thumbnailPlaceholder")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.thumbnailUrl
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.thumbnailUrl && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.thumbnailUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/courses")}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 group relative flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isUpdating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                    <span className="relative z-10">{t("updating")}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">{t("updateButton")}</span>
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
                {t("editingCourse")}
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {t("editingTips.0")}</li>
                <li>• {t("editingTips.1")}</li>
                <li>• {t("editingTips.2")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
