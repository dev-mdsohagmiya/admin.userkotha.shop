import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <>
      <PageMeta
        title="403 Access Denied | Amzad Food ERP"
        description="You don't have permission to access this page. Contact your administrator if you believe this is an error."
      />

      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow animation-delay-4000"></div>
        </div>

        {/* Main content */}
        <div className="relative z-1 w-full max-w-md mx-auto text-center">
          {/* Animated lock icon */}
          <div className="relative mb-8">
            <div className="relative inline-block">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-red-200 rounded-full animate-ping opacity-20"></div>

              {/* Main lock container */}
              <div className="relative bg-white p-8 rounded-2xl shadow-theme-lg border border-red-100 transform hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-32 h-32 mx-auto"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Shield background */}
                  <path
                    d="M60 15C40 15 25 30 25 50V65C25 85 40 100 60 100C80 100 95 85 95 65V50C95 30 80 15 60 15Z"
                    fill="#FEF2F2"
                    stroke="#FECACA"
                    strokeWidth="2"
                  />

                  {/* Lock body */}
                  <rect
                    x="40"
                    y="55"
                    width="40"
                    height="30"
                    rx="6"
                    fill="#DC2626"
                  />

                  {/* Lock arch */}
                  <path
                    d="M50 55C50 48.3726 55.3726 43 62 43H68C74.6274 43 80 48.3726 80 55V65H50V55Z"
                    fill="#DC2626"
                  />

                  {/* Keyhole */}
                  <circle cx="65" cy="65" r="4" fill="white" />
                  <rect
                    x="63"
                    y="65"
                    width="4"
                    height="8"
                    rx="2"
                    fill="white"
                  />

                  {/* Shield border accent */}
                  <path
                    d="M60 15L70 25L65 40L75 45L70 60L60 70L50 60L45 45L55 40L50 25L60 15Z"
                    fill="none"
                    stroke="#F87171"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                </svg>

                {/* Warning symbol */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-50 border border-red-200">
                <span className="text-sm font-semibold text-red-700">
                  ERROR 403
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Access Restricted
              </h1>

              <div className="space-y-2">
                <p className="text-lg text-gray-600 leading-relaxed">
                  You've reached a secured area. This page is protected and
                  requires special permissions.
                </p>
                <p className="text-sm text-gray-500">
                  If you should have access, please contact your system
                  administrator.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 shadow-theme-sm hover:bg-gray-50 hover:shadow-theme-md transition-all duration-200 group"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Go Back
              </button>

              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-600 to-primary-700 px-6 py-3 font-medium text-white shadow-theme-sm hover:shadow-theme-md hover:from-primary-700 hover:to-primary-800 transition-all duration-200 group"
              >
                Go to Dashboard
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>

            {/* Support link */}
            <div className="pt-6 border-t border-gray-200">
              <button className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Need help? Contact Support
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 border-opacity-50">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Amzad Food ERP • Protected
              Access
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}
