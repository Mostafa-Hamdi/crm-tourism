"use client";

import { useResetPassMutation } from "@/store/api/apiSlice";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { useSelector } from "react-redux";

// ─── Validation Schema ─────────────────────────────────────────────────────────

const schema = yup.object({
  newPassword: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

type FormData = yup.InferType<typeof schema>;

// ─── Password Strength ─────────────────────────────────────────────────────────

const getStrength = (password: string) => {
  let score = 0;
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  checks.forEach((c) => c.pass && score++);

  const levels = [
    { label: "Very Weak", color: "bg-red-500", width: "w-1/5" },
    { label: "Weak", color: "bg-orange-500", width: "w-2/5" },
    { label: "Fair", color: "bg-yellow-500", width: "w-3/5" },
    { label: "Strong", color: "bg-blue-500", width: "w-4/5" },
    { label: "Very Strong", color: "bg-green-500", width: "w-full" },
  ];

  return { score, checks, level: levels[score - 1] ?? levels[0] };
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const Page = () => {
  const user = useSelector((state: any) => state.auth.user);
  const id = user?.id || "";
  console.log("User ID for password reset:", id);
  const router = useRouter();
  const [resetPassword, { isLoading, isSuccess, isError, error }] =
    useResetPassMutation();

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const watchedPassword = watch("newPassword", "");
  const strength = watchedPassword ? getStrength(watchedPassword) : null;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword({ id, newPassword: data.newPassword }).unwrap();
      setTimeout(() => router.push("/profile"), 3000);
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md space-y-4">
        {/* ── Card ── */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 shadow-2xl shadow-blue-500/10">
          {/* Icon + title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40 rotate-3">
                <KeyRound className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Create a strong new password for your account
            </p>
          </div>

          {/* ── Success banner ── */}
          {isSuccess && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">
                    Password Reset!
                  </p>
                  <p className="text-sm text-green-700">
                    Redirecting you to login...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Error banner ── */}
          {isError && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900">Reset Failed</p>
                  <p className="text-sm text-red-700">
                    {(error as any)?.data?.message ??
                      "Something went wrong. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showNew ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="Enter new password"
                  disabled={isLoading || isSuccess}
                  className={`w-full bg-white border-2 ${
                    errors.newPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } rounded-xl pl-12 pr-12 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* ── Strength meter ── */}
            {watchedPassword.length > 0 && strength && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                {/* Bar */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-gray-600">
                      Password strength
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        strength.score <= 2
                          ? "text-red-600"
                          : strength.score === 3
                            ? "text-yellow-600"
                            : strength.score === 4
                              ? "text-blue-600"
                              : "text-green-600"
                      }`}
                    >
                      {strength.level.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${strength.level.color} ${strength.level.width}`}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-2 gap-1.5">
                  {strength.checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                          c.pass ? "text-green-500" : "text-gray-300"
                        }`}
                      />
                      <span
                        className={`text-xs transition-colors ${
                          c.pass ? "text-gray-700 font-medium" : "text-gray-400"
                        }`}
                      >
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm new password"
                  disabled={isLoading || isSuccess}
                  className={`w-full bg-white border-2 ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } rounded-xl pl-12 pr-12 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.confirmPassword.message}
                </p>
              )}

              {/* Match tick */}
              {!errors.confirmPassword &&
                watch("confirmPassword") &&
                watch("confirmPassword") === watchedPassword && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Passwords match
                  </p>
                )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting Password...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Password Reset!
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom hint */}
        {/* <p className="text-center text-sm text-gray-500">
          Remember your password?{" "}
          <a
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Sign in
          </a>
        </p> */}
      </div>
    </div>
  );
};

export default Page;
