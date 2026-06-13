import { Button } from "antd";
import { useState } from "react";
import ChangePasswordModal from "../../components/common/Modals/ChangePassword/ChangePasswordModal";
import UpdateProfileModal from "../../components/common/Modals/UpdateProfile/UpdateProfileModal";
import ProfileSkeleton from "../../components/skeleton/ProfileSkeleton";
import { useModulePermissions } from "../../hooks/usePermissions";
import { useMyProfileQuery } from "../../redux/features/user/userApi";

const Profile = () => {
  const { data, isLoading } = useMyProfileQuery(undefined);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [openUpdateProfileInfoModal, setOpenUpdateProfileInfoModal] =
    useState(false);
  const { hasUpdate } = useModulePermissions("Profile");

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleChangePassword = () => {
    setOpenChangePasswordModal(true);
  };

  const handleUpdateProfile = () => {
    setOpenUpdateProfileInfoModal(true);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-2">⚠️</div>
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const user = data.data;

  return (
    <div className="min-h-screen">
      <div className="border rounded-sm">
        {/* Single Card Container */}
        <div className="bg-white rounded-lg p-6">
          {/* Profile Header inside card */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-semibold text-green-600">
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {user.name}
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              {user.role && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                  {user.role}
                </span>
              )}
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  user.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-900">
                  {user.name}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-900 flex justify-between items-center">
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Last Login
                </label>
                <div className="text-sm text-gray-700">
                  {formatDate(user.lastLogin)}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Member Since
                </label>
                <div className="text-sm text-gray-700">
                  {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-5 border-gray-100 space-y-3">
            {hasUpdate && (
              <Button
                onClick={handleUpdateProfile}
                disabled={!hasUpdate}
                type="primary"
                size="middle"
                className="w-full py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Update Profile
              </Button>
            )}
            {hasUpdate && (
              <Button
                disabled={!hasUpdate}
                size="middle"
                onClick={handleChangePassword}
                className="w-full py-2 border border-green-600 text-green-600 rounded text-sm font-medium hover:bg-green-50 transition-colors"
              >
                Change Password
              </Button>
            )}
          </div>

          {/* Permissions Section */}
          {user.designation?.permissions &&
            user.designation.permissions.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Role Permissions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.designation.permissions.map(
                    (permission: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                      >
                        <h3 className="font-medium text-gray-900 mb-2 text-sm">
                          {permission.module}
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {permission.actions.map(
                            (action: string, actionIndex: number) => (
                              // Modern Design 10: Premium Tag
                              <span
                                key={actionIndex}
                                className="relative bg-gradient-to-br from-primary to-primary text-white px-3 py-1.5 rounded-sm text-xs font-bold shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-500 hover:scale-105 group"
                              >
                                <div className="absolute inset-0 bg-white/10 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                {action}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
      {openChangePasswordModal && (
        <ChangePasswordModal
          open={openChangePasswordModal}
          setOpen={setOpenChangePasswordModal}
        />
      )}
      {openUpdateProfileInfoModal && (
        <UpdateProfileModal
          open={openUpdateProfileInfoModal}
          setOpen={setOpenUpdateProfileInfoModal}
        />
      )}
    </div>
  );
};

export default Profile;
