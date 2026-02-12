"use client";

import {
  useAddEnrollmentMutation,
  useGetClassesQuery,
  useGetStudentsQuery,
} from "@/store/api/apiSlice";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  UserPlus,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

interface Student {
  id: number;
  fullName: string;
}

interface Class {
  id: number;
  name: string;
  code: string;
}

// Validation schema
const enrollmentSchema = yup.object().shape({
  studentId: yup
    .number()
    .required("Student is required")
    .positive("Please select a student")
    .typeError("Please select a student"),
  courseClassId: yup
    .number()
    .required("Course is required")
    .positive("Please select a course")
    .typeError("Please select a course"),
});

// Infer the type from the schema
type EnrollmentFormData = yup.InferType<typeof enrollmentSchema>;

const Page = () => {
  const router = useRouter();
  const { data: students, isLoading: studentsLoading } = useGetStudentsQuery();
  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();
  const [addEnrollment, { isLoading }] = useAddEnrollmentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EnrollmentFormData>({
    resolver: yupResolver(enrollmentSchema),
    mode: "onChange",
    defaultValues: {
      studentId: 0,
      courseClassId: 0,
    },
  });

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      await addEnrollment({
        studentId: Number(data.studentId),
        courseClassId: Number(data.courseClassId),
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Student has been enrolled successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      reset();
      router.push("/enrollments");
    } catch (err: any) {
      let errorMessage = "Failed to enroll student.";

      if (err?.data) {
        if (typeof err.data === "string") {
          errorMessage = err.data;
        } else if (err.data?.message) {
          errorMessage = err.data.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex items-start gap-4">
            <Link
              href="/enrollments"
              className="cursor-pointer p-3 bg-white/50 hover:bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                Add Enrollment
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Enroll a student in a course by filling out the information
                below.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Enrollment Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Enrollment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Selection */}
                <div>
                  <label
                    htmlFor="studentId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Select Student <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <select
                      id="studentId"
                      {...register("studentId")}
                      disabled={studentsLoading}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.studentId
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl pl-12 pr-12 py-3.5 text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value={0}>
                        {studentsLoading
                          ? "Loading students..."
                          : "Select a student..."}
                      </option>
                      {students?.data?.map((student: Student) => (
                        <option key={student.id} value={student.id}>
                          {student?.fullName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.studentId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.studentId.message}
                    </p>
                  )}
                </div>

                {/* Course Selection */}
                <div>
                  <label
                    htmlFor="courseId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <select
                      id="classId"
                      {...register("courseClassId")}
                      disabled={classesLoading}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.courseClassId
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl pl-12 pr-12 py-3.5 text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value={0}>
                        {classesLoading
                          ? "Loading classes..."
                          : "Select a class..."}
                      </option>
                      {classes?.data?.map((cls: Class) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.courseClassId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.courseClassId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Enrollment Information
                  </h3>
                  <p className="text-sm text-blue-700">
                    Make sure to select the correct student and course before
                    submitting. The enrollment date will be set to today by
                    default.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/enrollments")}
                className="cursor-pointer flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || studentsLoading || classesLoading}
                className="cursor-pointer flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enrolling Student...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Enroll Student</span>
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
