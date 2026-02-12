"use client";

import {
  useGetClassesQuery,
  useGetCoursesQuery,
  useGetEnrollmentQuery,
  useGetStudentsQuery,
  useUpdateEnrollmentMutation,
} from "@/store/api/apiSlice";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
import {
  UserCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  User,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

interface Student {
  id: number;
  fullName: string;
  email?: string;
}

interface Class {
  id: number;
  name: string;
  code?: string;
}

// Validation Schema
const enrollmentSchema = yup.object().shape({
  studentId: yup
    .number()
    .required("Student is required")
    .positive("Please select a student")
    .typeError("Please select a student"),
  courseClassId: yup
    .number()
    .required("Class is required")
    .positive("Please select a class")
    .typeError("Please select a class"),
});

type EnrollmentFormData = yup.InferType<typeof enrollmentSchema>;

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const { data: students, isLoading: loadingStudents } = useGetStudentsQuery();
  const { data: classes, isLoading: loadingClasses } = useGetClassesQuery();
  const { data: enrollmentData, isLoading: loadingEnrollment } =
    useGetEnrollmentQuery({ id });
  const [updateEnrollment, { isLoading: updating }] =
    useUpdateEnrollmentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EnrollmentFormData>({
    resolver: yupResolver(enrollmentSchema),
    defaultValues: {
      studentId: 0,
      courseClassId: 0,
    },
  });

  // Set default values when enrollment data loads
  useEffect(() => {
    if (enrollmentData) {
      reset({
        studentId: enrollmentData.studentId || 0,
        courseClassId: enrollmentData.courseClassId || 0,
      });
    }
  }, [enrollmentData, reset]);

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      await updateEnrollment({
        id,
        studentId: data.studentId,
        courseClassId: data.courseClassId,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Enrollment has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/enrollments");
    } catch (err: any) {
      let errorMessage = "Failed to update enrollment.";

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

  const isLoading = loadingEnrollment || loadingStudents || loadingClasses;

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
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  Edit Enrollment
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Update student enrollment information
                </p>
              </div>
            </div>

            <Link
              href="/enrollments"
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-12 shadow-xl shadow-blue-500/10">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 text-lg">
                Loading enrollment data...
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        {!isLoading && enrollmentData && (
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
            <div className="space-y-6">
              {/* Student Selection */}
              <div>
                <label
                  htmlFor="studentId"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Student <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <select
                    id="studentId"
                    {...register("studentId", { valueAsNumber: true })}
                    disabled={loadingStudents}
                    className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                      errors.studentId
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    } rounded-xl pl-12 pr-10 py-3.5 text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value={0}>Select a student...</option>
                    {students?.data?.map((student: Student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName}
                        {student.email ? ` (${student.email})` : ""}
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
                  Class <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <select
                    id="courseId"
                    {...register("courseClassId", { valueAsNumber: true })}
                    disabled={loadingClasses}
                    className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                      errors.courseClassId
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    } rounded-xl pl-12 pr-10 py-3.5 text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value={0}>Select a course...</option>
                    {classes?.data?.map((course: Class) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
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

              {/* Current Enrollment Info */}
              {enrollmentData && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Current Enrollment
                  </h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    {enrollmentData.studentName && (
                      <p>
                        <span className="font-medium">Student:</span>{" "}
                        {enrollmentData.studentName}
                      </p>
                    )}
                    {enrollmentData.courseName && (
                      <p>
                        <span className="font-medium">Course:</span>{" "}
                        {enrollmentData.courseName}
                      </p>
                    )}
                    {enrollmentData.enrollmentDate && (
                      <p>
                        <span className="font-medium">Enrolled:</span>{" "}
                        {new Date(
                          enrollmentData.enrollmentDate,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/enrollments")}
                  className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={updating}
                  className="flex-1 group relative cursor-pointer flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {updating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                      <span className="relative z-10">Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Update Enrollment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        {!isLoading && enrollmentData && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Important Notes
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Changing the student will reassign this enrollment</li>
                  <li>• Changing the course will update the enrolled course</li>
                  <li>
                    • Make sure the student is eligible for the selected course
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
