"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  ArrowLeft,
  Check,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAddUserMutation, useGetRolesQuery } from "@/store/api/apiSlice";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Validation Schema
const schema = yup
  .object({
    fullName: yup
      .string()
      .required("Full name is required")
      .min(3, "Name must be at least 3 characters")
      .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number"),
    roleId: yup
      .number()
      .typeError("Please select a role")
      .min(1, "Please select a role")
      .required("Role selection is required"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const Page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<number | undefined>(
    undefined,
  );

  const { data: roles, isLoading } = useGetRolesQuery();
  const t = useTranslations("users");
  const [addUser] = useAddUserMutation();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      roleId: undefined, // <-- TS-safe
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await addUser(data).unwrap();
      setSubmitSuccess(true);
      reset();
      setSelectedRole(undefined);
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href={"/users"}
          className="cursor-pointer group w-fit flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold">Back to Users</span>
        </Link>

        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex items-start gap-4">
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
                {t("addTitle")}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Create a new team member account with roles and permissions
              </p>
            </div>
          </div>
        </div>

        {submitSuccess && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-xl shadow-emerald-500/30">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Success!</p>
                <p className="text-white/90">{t("addSuccess")}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-bold text-sm uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-600" />
                Full Name
              </label>
              <div className="relative">
                <input
                  {...register("fullName")}
                  type="text"
                  placeholder="Enter full name"
                  className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 rounded-xl px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all font-medium ${
                    errors.fullName
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white"
                  }`}
                />
                {errors.fullName && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm font-semibold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-bold text-sm uppercase tracking-wider">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    {...register("email")}
                    type="email"
                    placeholder={t("enterEmail")}
                    className={`w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 rounded-xl px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all font-medium ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white"
                    }`}
                  />
                  {errors.email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-bold text-sm uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="Enter password"
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
                {errors.password && (
                  <p className="text-red-500 text-sm font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-gray-700 font-bold text-sm uppercase tracking-wider">
                <Shield className="w-4 h-4 text-blue-600" />
                Assign Roles
              </label>

              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {isLoading ? (
                      <div className="col-span-full flex justify-center py-8">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                      </div>
                    ) : (
                      roles?.map((role: any) => {
                        const isSelected = field.value === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => {
                              field.onChange(role.id);
                              setSelectedRole(role.id);
                            }}
                            className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-300 font-bold text-sm ${
                              isSelected
                                ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-600 text-white shadow-xl shadow-blue-500/40 scale-105"
                                : "bg-white/80 border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-lg"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isSelected && <Check className="w-4 h-4" />}
                              {role.name}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              />

              {errors.roleId && (
                <p className="text-red-500 text-sm font-semibold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.roleId.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer group relative cursor-pointer flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                    <span className="relative z-10">{t("creating")}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">{t("create")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  reset();
                  setSelectedRole(undefined);
                }}
                className="cursor-pointer flex-1 sm:flex-none px-8 py-4 bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
              >
                {t("resetForm")}
              </button>
            </div>
          </form>
        </div>

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
                <li>• Minimum 8 characters long</li>
                <li>• At least one uppercase letter (A-Z)</li>
                <li>• At least one lowercase letter (a-z)</li>
                <li>• At least one number (0-9)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
