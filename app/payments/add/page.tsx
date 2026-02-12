"use client";

import { useAddPaymentMutation } from "@/store/api/apiSlice";
import { useState, useCallback } from "react";
import {
  ArrowLeft,
  CreditCard,
  Sparkles,
  Hash,
  RefreshCw,
  DollarSign,
  FileText,
  Wallet,
  Building2,
  Smartphone,
  Banknote,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentPayload {
  enrollmentId: number | "";
  amount: number | "";
  method: number;
  referenceNumber: string;
}

// ─── Payment Methods (mirrors backend enum) ───────────────────────────────────

const paymentMethods = [
  {
    id: 1,
    label: "Cash",
    icon: Banknote,
    activeGradient: "from-green-600 to-emerald-600",
    activeBg: "from-green-50 to-emerald-50",
    activeBorder: "border-green-300",
    activeText: "text-green-700",
  },
  {
    id: 2,
    label: "Vodafone Cash",
    icon: Smartphone,
    activeGradient: "from-red-600 to-rose-600",
    activeBg: "from-red-50 to-rose-50",
    activeBorder: "border-red-300",
    activeText: "text-red-700",
  },
  {
    id: 3,
    label: "Bank Transfer",
    icon: Building2,
    activeGradient: "from-blue-600 to-cyan-600",
    activeBg: "from-blue-50 to-cyan-50",
    activeBorder: "border-blue-300",
    activeText: "text-blue-700",
  },
];

// ─── Reference Generator ──────────────────────────────────────────────────────

const generateReference = (): string => {
  const prefix = "PAY";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
  const router = useRouter();
  const [addPayment, { isLoading }] = useAddPaymentMutation();

  const [form, setForm] = useState<PaymentPayload>({
    enrollmentId: "",
    amount: "",
    method: 0,
    referenceNumber: generateReference(),
  });

  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(() => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
    setForm((prev) => ({ ...prev, referenceNumber: generateReference() }));
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(form.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [form.referenceNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.enrollmentId || Number(form.enrollmentId) <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter a valid Enrollment ID.",
      });
    }
    if (!form.amount || Number(form.amount) <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter a valid amount.",
      });
    }
    if (!form.method) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please select a payment method.",
      });
    }
    if (!form.referenceNumber.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Reference number is required.",
      });
    }

    try {
      await addPayment({
        enrollmentId: Number(form.enrollmentId),
        amount: Number(form.amount),
        method: form.method,
        referenceNumber: form.referenceNumber.trim(),
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Payment Added!",
        text: "The payment has been recorded successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/payments");
    } catch (err: any) {
      const message =
        typeof err?.data === "string"
          ? err.data
          : "Failed to add payment. Please try again.";
      Swal.fire({ icon: "error", title: "Oops!", text: message });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── Header Card ── */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/payments"
                className="p-3 bg-white/70 border border-white/60 rounded-xl hover:bg-white hover:shadow-lg transition-all group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </Link>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 hover:rotate-6 transition-transform duration-300">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                    Add Payment
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Record a new payment transaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Enrollment ID */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-md flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              Booking ID
              <span className="text-red-500 normal-case font-semibold tracking-normal">
                *
              </span>
            </label>
            <input
              type="number"
              min={1}
              placeholder="Enter booking ID..."
              value={form.enrollmentId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  enrollmentId:
                    e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
              className="w-full bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all font-mono text-base"
            />
          </div>

          {/* Amount */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-green-500/10">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-md flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-white" />
              </div>
              Amount
              <span className="text-red-500 normal-case font-semibold tracking-normal">
                *
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg select-none pointer-events-none">
                $
              </span>
              <input
                type="number"
                min={0.01}
                step={0.01}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    amount: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                className="w-full bg-gradient-to-r from-gray-50 to-green-50/50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 focus:bg-white transition-all font-mono text-base"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-md flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 text-white" />
              </div>
              Payment Method
              <span className="text-red-500 normal-case font-semibold tracking-normal">
                *
              </span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = form.method === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, method: method.id }))
                    }
                    className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? `bg-gradient-to-br ${method.activeBg} ${method.activeBorder} shadow-md`
                        : "bg-white/50 border-gray-200 hover:border-gray-300 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {/* Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-all duration-200 ${
                        isSelected
                          ? `bg-gradient-to-br ${method.activeGradient}`
                          : "bg-gray-100 group-hover:bg-gray-200"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`text-xs font-bold text-center leading-tight ${
                        isSelected ? method.activeText : "text-gray-600"
                      }`}
                    >
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference Number */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-orange-500/10">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                <Hash className="w-3.5 h-3.5 text-white" />
              </div>
              Reference Number
              <span className="text-red-500 normal-case font-semibold tracking-normal">
                *
              </span>
            </label>

            <div className="flex gap-2">
              {/* Input */}
              <input
                type="text"
                value={form.referenceNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    referenceNumber: e.target.value,
                  }))
                }
                placeholder="PAY-XXXXXXX-XXXXX"
                className="flex-1 min-w-0 bg-gradient-to-r from-gray-50 to-orange-50/30 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 focus:bg-white transition-all font-mono text-sm tracking-widest"
              />

              {/* Copy button */}
              <button
                type="button"
                onClick={handleCopy}
                title="Copy to clipboard"
                className="flex-shrink-0 w-12 flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white/80 hover:bg-gray-50 hover:border-gray-300 transition-all group"
              >
                {copied ? (
                  <Check className="w-4.5 h-4.5 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                )}
              </button>

              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerate}
                title="Generate random reference"
                className="group relative flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-100 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <RefreshCw
                  className={`w-4 h-4 relative z-10 transition-transform duration-500 ${
                    isSpinning ? "rotate-180" : ""
                  }`}
                />
                <span className="relative z-10 text-sm hidden sm:inline">
                  Generate
                </span>
              </button>
            </div>

            {/* Helper hint */}
            <p className="mt-2 text-xs text-gray-400">
              Auto-generated — you can edit it or click{" "}
              <strong>Generate</strong> for a new one.
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4">
            <Link
              href="/payments"
              className="flex-1 flex items-center justify-center px-6 py-4 bg-white/70 backdrop-blur-xl border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-100 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                  <span className="relative z-10">Processing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Add Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
