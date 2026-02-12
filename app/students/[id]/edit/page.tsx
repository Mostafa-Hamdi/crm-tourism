"use client";

import {
  useGetStudentQuery,
  useUpdateStudentMutation,
} from "@/store/api/apiSlice";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Save,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

// Validation Schema
const studentSchema = yup.object().shape({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^[\d\s\-\+\(\)]+$/,
      "Phone number must contain only numbers and valid characters",
    )
    .min(10, "Phone number must be at least 10 characters"),
  nationalId: yup
    .string()
    .required("National ID is required")
    .min(10, "National ID must be at least 10 characters")
    .max(20, "National ID must not exceed 20 characters"),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["Male", "Female"], "Please select a valid gender"),
  dateOfBirth: yup
    .string()
    .required("Date of birth is required")
    .test("is-valid-date", "Please enter a valid date", (value) => {
      if (!value) return false;
      const date = new Date(value);
      return date instanceof Date && !isNaN(date.getTime());
    })
    .test("is-past-date", "Date of birth must be in the past", (value) => {
      if (!value) return false;
      return new Date(value) < new Date();
    }),
  relativeName: yup
    .string()
    .required("Relative name is required")
    .min(2, "Relative name must be at least 2 characters")
    .max(100, "Relative name must not exceed 100 characters"),
  parentPhoneNumber: yup
    .string()
    .required("Parent phone number is required")
    .matches(
      /^[\d\s\-\+\(\)]+$/,
      "Phone number must contain only numbers and valid characters",
    )
    .min(10, "Phone number must be at least 10 characters"),
  level: yup
    .string()
    .required("Level is required")
    .min(1, "Level must be at least 1 character")
    .max(50, "Level must not exceed 50 characters"),
});

type StudentFormData = yup.InferType<typeof studentSchema>;

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: studentData, isLoading: isLoadingStudent } = useGetStudentQuery(
    { id },
  );
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentFormData>({
    resolver: yupResolver(studentSchema),
  });

  // Populate form when student data is loaded
  useEffect(() => {
    if (studentData) {
      // Format date to YYYY-MM-DD for input[type="date"]
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      reset({
        fullName: studentData.fullName || "",
        email: studentData.email || "",
        phoneNumber: studentData.phoneNumber || "",
        nationalId: studentData.nationalId || "",
        gender: studentData.gender || "",
        dateOfBirth: formatDateForInput(studentData.dateOfBirth) || "",
        relativeName: studentData.relativeName || "",
        parentPhoneNumber: studentData.parentPhoneNumber || "",
        level: studentData.level || "",
      });
    }
  }, [studentData, reset]);

  const onSubmit = async (data: StudentFormData) => {
    try {
      // Convert date to ISO format for API
      const dateOfBirth = new Date(data.dateOfBirth).toISOString();

      await updateStudent({
        id,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        nationalId: data.nationalId,
        gender: data.gender,
        dateOfBirth: dateOfBirth,
        relativeName: data.relativeName,
        parentPhoneNumber: data.parentPhoneNumber,
        level: data.level,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Student has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/students");
    } catch (err) {
      let message = "Failed to update student.";

      if (typeof err === "object" && err !== null) {
        const maybeData = (err as any).data;
        if (typeof maybeData === "string") {
          message = maybeData;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: message,
      });
    }
  };

  // Loading state
  if (isLoadingStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-20 shadow-xl shadow-blue-500/10">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">
                Loading student data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - Student not found
  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-20 shadow-xl shadow-blue-500/10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full mb-4">
                <GraduationCap className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-4">
                Student not found
              </p>
              <Link
                href="/students"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Students
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
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  Edit Student
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Update student information
                </p>
              </div>
            </div>

            <Link
              href="/students"
              className="group relative cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register("fullName")}
                      placeholder="Enter full name"
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

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="Enter email address"
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

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      {...register("phoneNumber")}
                      placeholder="Enter phone number"
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.phoneNumber
                          ? "border-red-300"
                          : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    National ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register("nationalId")}
                      placeholder="Enter national ID"
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.nationalId ? "border-red-300" : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.nationalId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.nationalId.message}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("gender")}
                    className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                      errors.gender ? "border-red-300" : "border-gray-200"
                    } rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      {...register("dateOfBirth")}
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.dateOfBirth
                          ? "border-red-300"
                          : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register("level")}
                      placeholder="e.g., Grade 10, Year 1"
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.level ? "border-red-300" : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.level && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.level.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Guardian Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Guardian Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Relative Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register("relativeName")}
                      placeholder="Enter relative/guardian name"
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.relativeName
                          ? "border-red-300"
                          : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.relativeName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.relativeName.message}
                    </p>
                  )}
                </div>

                {/* Parent Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      {...register("parentPhoneNumber")}
                      placeholder="Enter parent phone number"
                      className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 ${
                        errors.parentPhoneNumber
                          ? "border-red-300"
                          : "border-gray-200"
                      } rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.parentPhoneNumber && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.parentPhoneNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/students")}
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
                    <span className="relative z-10">Updating Student...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Update Student</span>
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
                Editing Student #{id}
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• All fields are required for student registration</li>
                <li>• Make sure all information is accurate and up to date</li>
                <li>• Changes will be saved immediately upon submission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
