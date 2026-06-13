import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, { useEffect, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useCurrentToken } from "../redux/features/auth/authSlice";
import { logoutUser } from "../redux/features/auth/logoutUser";
import { useAppDispatch, useAppSelector } from "../redux/features/hooks";

import { Loader } from "../components/common/Loading";
import { useMyProfileQuery } from "../redux/features/user/userApi";

import {
  checkAccess,
  findFirstAccessibleStaticPath,
  isAdminUser,
  isSuperAdminUser,
  type RouteAccessUser,
} from "./routeAccess";

interface ProtectedRouteProps {
  roles?: string[];
  employeePermissions?: {
    module: string;
    action: string;
  };
  /** ADMIN access if designation includes any of these actions for the module (e.g. Delivery Orders). */
  employeeModuleAnyOfActions?: {
    module: string;
    actions: string[];
  };
  children?: React.ReactNode;
}

const LogoutAndRedirectToLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(logoutUser());
  }, [dispatch]);
  return <Navigate to="/login" replace />;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles,
  employeePermissions,
  employeeModuleAnyOfActions,
  children,
}) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const token = useAppSelector(useCurrentToken);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useMyProfileQuery(undefined);

  const hasToken = useMemo(() => {
    try {
      const localToken = localStorage.getItem("token");
      return Boolean(token && localToken);
    } catch (error) {
      console.error("Token read error:", error);
      return false;
    }
  }, [token]);

  const profileReady = !isLoading;
  const profileOk = Boolean(data?.success);

  const profileAuthFailure = useMemo(() => {
    if (!profileReady || !hasToken) {
      return false;
    }
    if (isError) {
      const status =
        (error as FetchBaseQueryError | undefined)?.status ??
        (error as { status?: number } | undefined)?.status;
      return status === 401 || status === 403;
    }
    return !profileOk;
  }, [profileReady, hasToken, isError, error, profileOk]);

  useEffect(() => {
    if (!profileReady) {
      return;
    }
    if (!hasToken || profileAuthFailure) {
      void dispatch(logoutUser());
    }
  }, [profileReady, hasToken, profileAuthFailure, dispatch]);

  const hasAccess = useMemo(() => {
    const user = data?.data as RouteAccessUser | undefined;
    if (!user) {
      return false;
    }
    return checkAccess(
      user,
      roles,
      employeePermissions,
      employeeModuleAnyOfActions,
    );
  }, [data?.data, roles, employeePermissions, employeeModuleAnyOfActions]);

  const loginRedirect = (
    <Navigate to="/login" replace state={{ from: location }} />
  );

  if (isLoading) {
    return <Loader text="Loading..." fullHeight />;
  }

  if (isError && !profileAuthFailure) {
    const status = (error as FetchBaseQueryError | undefined)?.status;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-md text-sm font-medium text-gray-600">
          {status === 429
            ? "Too many requests. Please wait a moment, then try again."
            : "Unable to load your session. Please check your connection and try again."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isFetching ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  if (!profileOk) {
    return loginRedirect;
  }

  if (!hasToken) {
    return loginRedirect;
  }

  if (!hasAccess) {
    const user = data?.data as RouteAccessUser | undefined;
    const needsModuleGuard =
      Boolean(employeePermissions) || Boolean(employeeModuleAnyOfActions);

    if (
      user &&
      needsModuleGuard &&
      isAdminUser(user) &&
      !isSuperAdminUser(user)
    ) {
      const first = findFirstAccessibleStaticPath(user);
      if (first && first !== location.pathname) {
        return <Navigate to={first} replace />;
      }
      return <LogoutAndRedirectToLogin />;
    }

    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
