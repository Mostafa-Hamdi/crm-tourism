"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import {
  Lock,
  ArrowLeft,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
  Key,
  TrendingUp,
} from "lucide-react";
import { useResetPassMutation } from "@/store/api/apiSlice";
import { useParams } from "next/navigation";

// Validation Schema
const schema = yup
  .object({
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords must match"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const Page = () => {
  const { id } = useParams();
  console.log(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [resetPass] = useResetPassMutation();
  // Mock API - replace with: const [resetPass] = useResetPassMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Replace with actual API call: await resetPass(data).unwrap();
      await resetPass({
        id: Number(id),
        newPassword: data?.confirmPassword,
      }).unwrap();
      setSubmitSuccess(true);
      reset();

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  // Password strength checker
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^A-Za-z0-9]/)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength === 3)
      return { strength, label: "Fair", color: "bg-orange-500" };
    if (strength === 4)
      return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold">Back</span>
        </button>

        {/* Header Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 transition-transform hover:rotate-6">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                Change Password
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Set a new secure password for your account
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-xl shadow-emerald-500/30">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Success!</p>
                <p className="text-white/90">
                  Password has been changed successfully
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-bold text-sm uppercase tracking-wider">
                <Lock className="w-4 h-4 text-blue-600" />
                New Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Enter new password"
                  className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 rounded-xl px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all font-medium ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white"
                  }`}
                />
                {errors.password && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>

              {/* Password Strength Indicator */}
              {password && !errors.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-600">Password Strength</span>
                    <span
                      className={`${
                        passwordStrength.label === "Weak"
                          ? "text-red-600"
                          : passwordStrength.label === "Fair"
                            ? "text-orange-600"
                            : passwordStrength.label === "Good"
                              ? "text-blue-600"
                              : "text-green-600"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-sm font-semibold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-bold text-sm uppercase tracking-wider">
                <Shield className="w-4 h-4 text-blue-600" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Confirm new password"
                  className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 rounded-xl px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all font-medium ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white"
                  }`}
                />
                {errors.confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm font-semibold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className="group relative cursor-pointer flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                    <span className="relative z-10">Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Change Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => reset()}
                className="flex-1 sm:flex-none px-8 py-4 bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                Password Requirements
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${password?.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  Minimum 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${password?.match(/[A-Z]/) ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  At least one uppercase letter (A-Z)
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${password?.match(/[a-z]/) ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  At least one lowercase letter (a-z)
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${password?.match(/[0-9]/) ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  At least one number (0-9)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
