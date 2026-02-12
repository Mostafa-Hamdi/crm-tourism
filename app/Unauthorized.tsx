"use client";

import { useRouter } from "next/navigation";
import {
  ShieldOff,
  Lock,
  ArrowLeft,
  Home,
  Mail,
  AlertTriangle,
  Info,
} from "lucide-react";
import Link from "next/link";

interface UnauthorizedPageProps {
  moduleName?: string;
  message?: string;
  contactEmail?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

const UnauthorizedPage = ({
  moduleName = "this module",
  message,
  contactEmail = "admin@company.com",
  showBackButton = true,
  showHomeButton = true,
}: UnauthorizedPageProps) => {
  const router = useRouter();

  const defaultMessage = `You don't have permission to access ${moduleName}. Please contact your administrator to request access.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-400/20 to-red-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-red-500/10">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/40 animate-pulse">
                <ShieldOff className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl leading-[50px]  font-bold bg-gradient-to-r from-red-700 via-orange-600 to-red-800 bg-clip-text text-transparent mb-3">
              Access Denied
            </h1>
            <p className="text-lg text-gray-700 font-medium">
              Insufficient Permissions
            </p>
          </div>

          {/* Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed">
                  {message || defaultMessage}
                </p>
              </div>
            </div>
          </div>

          {/* What to do next */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  What can you do?
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      Contact your system administrator to request access
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      Verify that you're using the correct account with proper
                      permissions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      Return to the homepage and access modules you have
                      permission for
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Admin */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Contact your administrator to request access to this module:
            </p>
            <a
              href={`mailto:${contactEmail}?subject=Access Request - ${moduleName}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-400 hover:shadow-md transition-all text-sm"
            >
              <Mail className="w-4 h-4" />
              {contactEmail}
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="flex-1 group relative cursor-pointer flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            )}
            {showHomeButton && (
              <Link
                href="/"
                className="flex-1 group relative cursor-pointer flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Home className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Go to Homepage</span>
              </Link>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Error Code:{" "}
            <span className="font-mono font-semibold text-gray-800">403</span> -
            Forbidden
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
