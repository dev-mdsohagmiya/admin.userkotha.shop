import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import PageMeta from "../../components/common/Meta/PageMeta";
import { useAppSelector } from "../../redux/features/hooks";
import { useCurrentToken } from "../../redux/features/auth/authSlice";
import { useMyProfileQuery } from "../../redux/features/user/userApi";
import { getBackToHomeDestination } from "../../routes/routeAccess";

export default function NotFound() {
  const navigate = useNavigate();
  const token = useAppSelector(useCurrentToken);

  const hasToken = useMemo(() => {
    try {
      const localToken = localStorage.getItem("token");
      return Boolean(token && localToken);
    } catch {
      return Boolean(token);
    }
  }, [token]);

  const { data, isLoading, isSuccess } = useMyProfileQuery(undefined, {
    skip: !hasToken,
  });

  const handleBackToHome = useCallback(() => {
    if (!hasToken) {
      navigate("/");
      return;
    }
    if (isLoading) {
      return;
    }
    if (!isSuccess || !data?.data) {
      navigate("/login");
      return;
    }
    navigate(getBackToHomeDestination(data.data, true));
  }, [hasToken, isLoading, isSuccess, data?.data, navigate]);

  const backDisabled = hasToken && isLoading;

  return (
    <>
      <PageMeta
        title="404 Page Not Found | Amzad Food ERP"
        description="The page you are looking for cannot be found in Amzad Food ERP. Return to the dashboard or check the URL."
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-gray-50">
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-gray-800 text-title-md xl:text-title-2xl">
            ERROR 404
          </h1>

          <img src="/images/error/404.svg" alt="404" className="mx-auto" />

          <p className="mt-10 mb-4 text-base text-gray-700 sm:text-lg">
            Oops! We can’t seem to find the page you are looking for.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={backDisabled}
              onClick={handleBackToHome}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:pointer-events-none disabled:opacity-50"
            >
              {backDisabled ? "Loading…" : "Back to Dashboard"}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800"
            >
              Refresh
            </button>
          </div>

          <p className="text-sm text-center text-gray-500 mt-5">
            &copy; {new Date().getFullYear()} - Amzad Food ERP
          </p>
        </div>
      </div>
    </>
  );
}
