"use client";

import {
  useGetClassQuery,
  useUpdateClassMutation,
  useGetCoursesQuery,
} from "@/store/api/apiSlice";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import {
  BookOpen,
  Code,
  DollarSign,
  User,
  Calendar,
  Clock,
  Users,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

type ClassFormData = {
  courseId: number;
  name: string;
  code: string;
  price: number;
  instructorName: string;
  startDate: string;
  endDate: string;
  daysOfWeek: (string | undefined)[];
  timeFrom: string;
  timeTo: string;
  maxStudents: number;
};

interface Course {
  id: number;
  name: string;
}

const DAYS_OF_WEEK = [
  { value: "Sunday", label: "Sun", fullLabel: "Sunday" },
  { value: "Monday", label: "Mon", fullLabel: "Monday" },
  { value: "Tuesday", label: "Tue", fullLabel: "Tuesday" },
  { value: "Wednesday", label: "Wed", fullLabel: "Wednesday" },
  { value: "Thursday", label: "Thu", fullLabel: "Thursday" },
  { value: "Friday", label: "Fri", fullLabel: "Friday" },
  { value: "Saturday", label: "Sat", fullLabel: "Saturday" },
];

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: classData, isLoading: isLoadingClass } = useGetClassQuery({
    id,
  });
  const { data: courses, isLoading: isLoadingCourses } = useGetCoursesQuery();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();

  const t = useTranslations("classes");

  const classSchema = yup.object().shape({
    courseId: yup
      .number()
      .required(t("validation.courseRequired"))
      .min(1, t("validation.selectCourse"))
      .typeError(t("validation.courseType")),
    name: yup
      .string()
      .required(t("validation.nameRequired"))
      .min(2, t("validation.nameMin", { min: 2 }))
      .max(200, t("validation.nameMax", { max: 200 })),
    code: yup
      .string()
      .required(t("validation.codeRequired"))
      .min(2, t("validation.codeMin", { min: 2 }))
      .max(50, t("validation.codeMax", { max: 50 })),
    price: yup
      .number()
      .required(t("validation.priceRequired"))
      .min(0, t("validation.priceMin", { min: 0 }))
      .typeError(t("validation.priceType")),
    instructorName: yup
      .string()
      .required(t("validation.instructorRequired"))
      .min(2, t("validation.instructorMin", { min: 2 }))
      .max(100, t("validation.instructorMax", { max: 100 })),
    startDate: yup
      .string()
      .required(t("validation.startDateRequired"))
      .test("is-valid-date", t("validation.validDate"), (value) => {
        if (!value) return false;
        const date = new Date(value);
        return date instanceof Date && !isNaN(date.getTime());
      }),
    endDate: yup
      .string()
      .required(t("validation.endDateRequired"))
      .test("is-valid-date", t("validation.validDate"), (value) => {
        if (!value) return false;
        const date = new Date(value);
        return date instanceof Date && !isNaN(date.getTime());
      })
      .test("is-after-start", t("validation.endAfterStart"), function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return new Date(value) > new Date(startDate);
      }),
    daysOfWeek: yup
      .array()
      .of(yup.string())
      .min(1, t("validation.minDays"))
      .required(t("validation.daysRequired")),
    timeFrom: yup
      .string()
      .required(t("validation.timeFromRequired"))
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, t("validation.validTime")),
    timeTo: yup
      .string()
      .required(t("validation.timeToRequired"))
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, t("validation.validTime"))
      .test(
        "is-after-start-time",
        t("validation.timeAfterStart"),
        function (value) {
          const { timeFrom } = this.parent;
          if (!value || !timeFrom) return true;

          const [startHour, startMin] = timeFrom.split(":").map(Number);
          const [endHour, endMin] = value.split(":").map(Number);

          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          return endMinutes > startMinutes;
        },
      ),
    maxStudents: yup
      .number()
      .required(t("validation.maxStudentsRequired"))
      .min(1, t("validation.maxStudentsMin", { min: 1 }))
      .typeError(t("validation.maxStudentsType")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<ClassFormData>({
    resolver: yupResolver(classSchema),
    defaultValues: {
      courseId: 0,
      name: "",
      code: "",
      price: 0,
      instructorName: "",
      startDate: "",
      endDate: "",
      daysOfWeek: [],
      timeFrom: "",
      timeTo: "",
      maxStudents: 0,
    },
  });

  // Populate form when class data is loaded
  useEffect(() => {
    if (classData) {
      // Convert ISO date to YYYY-MM-DD format for date input
      const formatDateForInput = (isoDate: string) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        return date.toISOString().split("T")[0];
      };

      // Convert "HH:MM:SS" to "HH:MM" for time input
      const formatTimeForInput = (time: string) => {
        if (!time) return "";
        return time.substring(0, 5); // Get only HH:MM part
      };

      // Convert comma-separated days string to array
      const daysArray = classData.daysOfWeek
        ? classData.daysOfWeek.split(",").map((day: string) => day.trim())
        : [];

      setValue("courseId", classData.course?.id || 0);
      setValue("name", classData.name || "");
      setValue("code", classData.code || "");
      setValue("price", classData.price || 0);
      setValue("instructorName", classData.instructorName || "");
      setValue("startDate", formatDateForInput(classData.startDate));
      setValue("endDate", formatDateForInput(classData.endDate));
      setValue("daysOfWeek", daysArray);
      setValue("timeFrom", formatTimeForInput(classData.timeFrom));
      setValue("timeTo", formatTimeForInput(classData.timeTo));
      setValue("maxStudents", classData.maxStudents || 0);
    }
  }, [classData, setValue]);

  const onSubmit = async (data: ClassFormData) => {
    try {
      // Convert dates to ISO format for API
      const startDate = new Date(data.startDate).toISOString();
      const endDate = new Date(data.endDate).toISOString();

      // Convert days array to comma-separated string
      const daysOfWeekString = data.daysOfWeek.join(", ");

      await updateClass({
        id: id,
        courseId: data.courseId,
        name: data.name,
        code: data.code,
        price: data.price,
        instructorName: data.instructorName,
        startDate: startDate,
        endDate: endDate,
        daysOfWeek: daysOfWeekString,
        timeFrom: data.timeFrom + ":00",
        timeTo: data.timeTo + ":00",
        maxStudents: data.maxStudents,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: t("updateSuccessTitle"),
        text: t("updateSuccessText"),
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/classes");
    } catch (err) {
      let message = "Failed to update class.";

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

  const handleDateClicker = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.showPicker();
  };

  // Show loading state
  if (isLoadingClass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{t("loadingClass")}</p>
        </div>
      </div>
    );
  }

  // Show error if class not found
  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full mb-4">
            <BookOpen className="w-10 h-10 text-red-600" />
          </div>
          <p className="text-gray-600 font-medium text-lg mb-4">
            {t("classNotFound")}
          </p>
          <Link
            href="/classes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("backToClasses")}
          </Link>
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
              href="/classes"
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
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
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {t("basicInformation")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("courseId")}
                      disabled={isLoadingCourses}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.courseId ? "border-red-300" : "border-gray-200"
                      } rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer`}
                    >
                      <option value={0}>
                        {isLoadingCourses
                          ? t("loadingCourses")
                          : t("selectCourse")}
                      </option>
                      {courses?.data?.map((course: Course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.courseId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.courseId.message}
                    </p>
                  )}
                </div>

                {/* Class Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("classNameLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register("name")}
                      placeholder={t("enterClassName")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.name ? "border-red-300" : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Class Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("classCodeLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Code className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register("code")}
                      placeholder={t("codePlaceholder")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.code ? "border-red-300" : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.code && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.code.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("priceLabel")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("price")}
                      placeholder={t("pricePlaceholder")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.price ? "border-red-300" : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Instructor Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("instructorLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register("instructorName")}
                      placeholder={t("instructorPlaceholder")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.instructorName
                          ? "border-red-300"
                          : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.instructorName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.instructorName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {t("schedule")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("startDateLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      onClick={handleDateClicker}
                      {...register("startDate")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.startDate ? "border-red-300" : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("endDateLabel")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      onClick={handleDateClicker}
                      type="date"
                      {...register("endDate")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.endDate ? "border-red-300" : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.endDate.message}
                    </p>
                  )}
                </div>

                {/* Days of Week */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("daysOfWeekLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="daysOfWeek"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-7 gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSelected = field.value?.includes(day.value);
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => {
                                const currentValue = field.value || [];
                                if (isSelected) {
                                  field.onChange(
                                    currentValue.filter((d) => d !== day.value),
                                  );
                                } else {
                                  field.onChange([...currentValue, day.value]);
                                }
                              }}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                                isSelected
                                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-600 text-white shadow-lg"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              <span className="text-xs font-bold">
                                {day.label}
                              </span>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 mt-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.daysOfWeek && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.daysOfWeek.message}
                    </p>
                  )}
                </div>

                {/* Time From */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("startTimeLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      onClick={handleDateClicker}
                      type="time"
                      {...register("timeFrom")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.timeFrom ? "border-red-300" : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.timeFrom && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.timeFrom.message}
                    </p>
                  )}
                </div>

                {/* Time To */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("endTimeLabel")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      onClick={handleDateClicker}
                      type="time"
                      {...register("timeTo")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.timeTo ? "border-red-300" : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.timeTo && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.timeTo.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Capacity Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {t("capacityTitle")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Max Students */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("maxStudentsLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      {...register("maxStudents")}
                      placeholder={t("maxStudentsPlaceholder")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.maxStudents
                          ? "border-red-300"
                          : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.maxStudents && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.maxStudents.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/classes")}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancel
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
                    <span className="relative z-10">Updating Class...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Update Class</span>
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
                {t("quickTipsTitle")}
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                {(t.raw("quickTips") as unknown as string[]).map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
