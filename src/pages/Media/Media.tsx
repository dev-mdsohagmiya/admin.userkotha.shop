import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  FolderOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Empty, Input, Modal, Result, Space, message } from "antd";
import React, { useCallback, useMemo, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loading/Loader";
import {
  MediaUploadModal,
  RenameMediaModal,
} from "../../components/common/Modals";
import PageHeader from "../../components/common/Navigation/PageHeader";
import FolderItem from "../../components/common/media/FolderItem";
import FolderTree from "../../components/common/media/FolderTree";
import MediaBreadcrumb from "../../components/common/media/MediaBreadcrumb";
import MediaCard from "../../components/common/media/MediaCard";
import MediaLibrarySkeleton from "../../components/skeleton/MediaLibrarySkeleton";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useDeleteMediaMutation,
  useGetAllFoldersQuery,
  useMediaListQuery,
  useRenameFolderMutation,
  useUploadImageMutation,
} from "../../redux/features/media/mediaApi";
import { FolderNode, MediaImage } from "../../types/media";
import {
  buildFolderTreeFromFolders,
  filterMediaByFolder,
  findFolderNode,
} from "../../utils/mediaHelpers";
import { useCurrentToken } from "../../redux/features/auth/authSlice";

const AllMediaList: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaImage | null>(null);
  const [openMediaUploadModal, setOpenMediaUploadModal] = useState(false);
  const [openRenameModal, setOpenRenameModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentFolder = searchParams.get("folder") || "Root";
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");

  // Update searchTerm with debounce to prevent excessive re-renders
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Sync local input if searchTerm is cleared from outside
  React.useEffect(() => {
    if (searchTerm === "") {
      setInputValue("");
    }
  }, [searchTerm]);

  const handleSetCurrentFolder = useCallback(
    (path: string) => {
      setSearchParams(
        (prev) => {
          prev.set("folder", path);
          return prev;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  const handleSetSearchTerm = useCallback((term: string) => {
    setInputValue(term);
  }, []);
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Loading states for specific operations
  const [folderOperationLoading, setFolderOperationLoading] = useState(false);
  const [imageOperationLoading, setImageOperationLoading] = useState(false);
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  // Responsive handler
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cleanup: Close mobile sidebar when component unmounts or user navigates away
  React.useEffect(() => {
    return () => {
      setIsMobileSidebarOpen(false);
      // Ensure body overflow is reset when component unmounts
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const toggleMobileSidebar = React.useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  // Backend API calls
  const {
    data: mediaResponse,
    isFetching: mediaFetching,
    refetch: refetchMedia,
  } = useMediaListQuery([]);
  const {
    data: foldersResponse,
    isFetching: foldersFetching,
    refetch: refetchFolders,
  } = useGetAllFoldersQuery(undefined);

  const [uploadImage] = useUploadImageMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const [createFolder] = useCreateFolderMutation();
  const [renameFolder] = useRenameFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const {
    hasView,
    hasCreate,
    hasUpdate,
    hasDelete,
    isProfileLoading,
    isSuperAdmin,
  } = useModulePermissions("Media Library");

  const token = useSelector(useCurrentToken);
  const permissionReady = !token || !isProfileLoading;
  // Memoize derived data to prevent unnecessary recalculations
  const mediaData: MediaImage[] = useMemo(
    () => mediaResponse?.data || [],
    [mediaResponse?.data],
  );

  const foldersList: string[] = useMemo(
    () => foldersResponse?.data || ["Root"],
    [foldersResponse?.data],
  );

  const folderTree: FolderNode[] = useMemo(
    () => buildFolderTreeFromFolders(foldersList),
    [foldersList],
  );

  const currentFolderImages = useMemo(
    () => filterMediaByFolder(mediaData, currentFolder),
    [mediaData, currentFolder],
  );

  // Memoized current sub-folders
  const currentSubFolders = useMemo(() => {
    const parentNode = findFolderNode(folderTree, currentFolder);
    return parentNode?.children || [];
  }, [folderTree, currentFolder]);

  const isSearching = searchTerm.trim().length > 0;

  const displayFolders = useMemo(() => {
    if (!isSearching) return currentSubFolders;

    // Global folder search from foldersList
    return foldersList
      .filter((path) => {
        if (path === "Root") return false;
        const name = path.split("/").pop() || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .map((path) => ({
        name: path.split("/").pop() || "",
        path: path,
      }));
  }, [currentSubFolders, foldersList, searchTerm, isSearching]);

  const displayImages = useMemo(() => {
    if (!isSearching) return currentFolderImages;

    // Global image search from all mediaData
    return mediaData.filter((img) =>
      img.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [currentFolderImages, mediaData, searchTerm, isSearching]);

  const isLoading = mediaFetching || foldersFetching;

  // Memoize event handlers to prevent unnecessary re-renders
  const handleCreateFolder = useCallback(
    async (parentPath: string, name: string) => {
      if (!hasCreate) {
        toast.error("You don't have permission to create folders.");
        return;
      }
      setFolderOperationLoading(true);
      try {
        const payload = {
          name,
          parentPath: parentPath === "Root" ? "" : parentPath,
        };

        await createFolder(payload).unwrap();
        await refetchFolders();
        toast.success(`Folder "${name}" created successfully`);
      } catch (error: any) {
        console.error("Folder creation failed:", error);
        toast.error(error?.data?.message || "Failed to create folder");
      } finally {
        setFolderOperationLoading(false);
      }
    },
    [createFolder, refetchFolders, hasCreate],
  );

  const handleRenameFolder = useCallback(
    async (oldPath: string, newName: string) => {
      if (!hasUpdate) {
        toast.error("You don't have permission to rename folders.");
        return;
      }
      setFolderOperationLoading(true);
      try {
        await renameFolder({ oldPath, newName }).unwrap();
        await refetchFolders();
        await refetchMedia();

        // Update current folder if it was renamed
        if (currentFolder === oldPath) {
          const pathParts = oldPath.split("/");
          pathParts[pathParts.length - 1] = newName;
          const newPath = pathParts.join("/");
          handleSetCurrentFolder(newPath);
        }

        toast.success(`Folder renamed to "${newName}" successfully`);
      } catch (error: any) {
        console.error("Folder rename failed:", error);
        toast.error(error?.data?.message || "Failed to rename folder");
      } finally {
        setFolderOperationLoading(false);
      }
    },
    [
      renameFolder,
      refetchFolders,
      refetchMedia,
      currentFolder,
      handleSetCurrentFolder,
      hasUpdate,
    ],
  );

  const handleDeleteFolder = useCallback(
    async (path: string) => {
      if (!hasDelete) {
        toast.error("You don't have permission to delete folders.");
        return;
      }
      if (path === "Root") {
        toast.error("Cannot delete Root folder");
        return;
      }

      // Extract folder name from path for better UX
      const folderName = path.split("/").pop() || path;

      Modal.confirm({
        title: (
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-red-500 text-xl" />
            <span className="text-lg font-semibold">Delete Folder</span>
          </div>
        ),
        content: (
          <div className="mt-3">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete the folder{" "}
              <span className="font-semibold text-gray-900">
                "{folderName}"
              </span>
              ?
            </p>
            <p className="text-sm text-red-600 font-medium">
              ⚠️ This will permanently delete all images and subfolders inside
              it.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
        ),
        icon: null,
        okText: "Yes, Delete",
        cancelText: "Cancel",
        okType: "danger",
        okButtonProps: {
          danger: true,
          size: "middle",
        },
        cancelButtonProps: {
          size: "middle",
        },
        centered: true,
        onOk: async () => {
          setFolderOperationLoading(true);
          try {
            await deleteFolder(path).unwrap();
            await refetchFolders();
            await refetchMedia();

            // Navigate to parent if current folder was deleted
            if (currentFolder === path) {
              const parentPath =
                path.split("/").slice(0, -1).join("/") || "Root";
              handleSetCurrentFolder(parentPath);
            }

            toast.success(`Folder "${folderName}" deleted successfully`);
          } catch (error: any) {
            console.error("Folder deletion failed:", error);
            toast.error(error?.data?.message || "Failed to delete folder");
          } finally {
            setFolderOperationLoading(false);
          }
        },
      });
    },
    [
      deleteFolder,
      refetchFolders,
      refetchMedia,
      currentFolder,
      handleSetCurrentFolder,
      hasDelete,
    ],
  );

  const handleUploadImage = useCallback(
    async (files: File[], folderPath: string = "") => {
      if (!hasCreate) {
        toast.error("You don't have permission to upload media.");
        return;
      }
      setImageOperationLoading(true);
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        formData.append("folder", folderPath);

        await uploadImage(formData).unwrap();
        await refetchMedia();
        await refetchFolders();
        toast.success("Images uploaded successfully");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Image upload failed");
      } finally {
        setImageOperationLoading(false);
      }
    },
    [uploadImage, refetchMedia, refetchFolders, hasCreate],
  );

  const handleDeleteImage = useCallback(
    async (id: string) => {
      if (!hasDelete) {
        toast.error("You don't have permission to delete media.");
        return;
      }
      Modal.confirm({
        title: "Confirm Delete",
        content:
          "Are you sure you want to delete this image? This action cannot be undone.",
        okText: "Yes, Delete",
        cancelText: "Cancel",
        okButtonProps: { danger: true },
        onOk: async () => {
          setImageOperationLoading(true);
          try {
            await deleteMedia(id).unwrap();
            await refetchMedia();
            await refetchFolders();
            toast.success("Image deleted successfully");
          } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Image deletion failed");
          } finally {
            setImageOperationLoading(false);
          }
        },
      });
    },
    [deleteMedia, refetchMedia, refetchFolders, hasDelete],
  );

  const handleEditImage = useCallback(
    (image: MediaImage) => {
      if (!hasUpdate) {
        toast.error("You don't have permission to rename media.");
        return;
      }
      setSelectedMedia(image);
      setOpenRenameModal(true);
    },
    [hasUpdate],
  );

  const handleCopyImageUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    message.success("Image URL copied to clipboard");
  }, []);

  const handleBack = useCallback(() => {
    if (currentFolder === "Root") return;
    const parts = currentFolder.split("/");
    if (parts.length <= 1) {
      handleSetCurrentFolder("Root");
    } else {
      parts.pop();
      handleSetCurrentFolder(parts.join("/"));
    }
  }, [currentFolder, handleSetCurrentFolder]);

  const handleOpenUploadModal = useCallback(() => {
    if (!hasCreate) {
      toast.error("You don't have permission to upload media.");
      return;
    }
    setOpenMediaUploadModal(true);
  }, [hasCreate]);

  if (isLoading || !permissionReady) {
    return <MediaLibrarySkeleton />;
  }

  if (!isSuperAdmin && !hasView) {
    return (
      <>
        <PageHeader
          title="Media Library"
          subtitle="Manage your media files and folders"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Media Library" },
          ]}
        />
        <div className="p-6">
          <Result
            status="403"
            title="Access denied"
            subTitle="You don't have permission to view the Media Library."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Media Library"
        subtitle="Manage your media files and folders"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Media Library" },
        ]}
        extra={
          <Space>
            {isMobileView && (
              <Button
                type="text"
                icon={
                  <FolderOutlined
                    className="text-primary-600 text-sm"
                    style={{
                      color: "white",
                      fontSize: "20px",
                      backgroundColor: "green",
                      borderRadius: "6px",
                      padding: "6px",
                    }}
                    size={46}
                  />
                }
                onClick={toggleMobileSidebar}
                className="w-14 h-14 flex items-center justify-center hover:bg-primary-50 border border-gray-200 rounded-lg"
                title="Open folders"
              />
            )}
            {hasCreate && (
              <Button
                onClick={handleOpenUploadModal}
                type="primary"
                className="font-semibold"
                icon={<IoMdAdd className="text-lg" />}
                disabled={
                  folderOperationLoading || imageOperationLoading
                }
              >
                Upload Media
              </Button>
            )}
          </Space>
        }
      />

      {/* Mobile Backdrop */}
      {isMobileView && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[35] transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      <div className={`flex ${isMobileView ? "h-[calc(100vh-200px)]" : ""}`}>
        {/* Left Sidebar - Folder Tree */}
        {/* ... */}
        {isMobileView ? (
          // Mobile: Only render when sidebar is open
          isMobileSidebarOpen && (
            <div className="fixed left-0 top-0 z-[36] h-full w-80 transform transition-transform duration-300 ease-in-out">
              {folderOperationLoading ? (
                <div className="border rounded-xl bg-white h-full">
                  <Loader text="Updating..." size="small" />
                </div>
              ) : (
                <FolderTree
                  data={folderTree}
                  currentPath={currentFolder}
                  onFolderSelect={(path) => {
                    handleSetCurrentFolder(path);
                    if (isMobileView) setIsMobileSidebarOpen(false);
                  }}
                  onFolderCreate={handleCreateFolder}
                  onRenameFolder={handleRenameFolder}
                  onDeleteFolder={handleDeleteFolder}
                  allowFolderCreate={hasCreate}
                  allowFolderRename={hasUpdate}
                  allowFolderDelete={hasDelete}
                  compact={false}
                  disabled={folderOperationLoading}
                  isMobile={isMobileView}
                  isOpen={isMobileSidebarOpen}
                  onToggle={toggleMobileSidebar}
                />
              )}
            </div>
          )
        ) : (
          <div></div>
        )}

        {/* Right Content - Images */}
        <div className="flex-1">
          {/* Breadcrumb and Stats */}
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Button
                icon={<ArrowLeftOutlined className="text-sm" />}
                onClick={handleBack}
                disabled={currentFolder === "Root"}
                className="rounded-lg h-8 w-8 flex items-center justify-center border-gray-200 text-gray-500 hover:text-primary-600 disabled:opacity-30"
                title="Back to parent folder"
              />
              <MediaBreadcrumb
                currentFolder={currentFolder}
                onFolderSelect={(path) => {
                  handleSetCurrentFolder(path);
                  handleSetSearchTerm(""); // Clear search when navigating
                }}
                showItemCount
                itemCount={currentFolderImages.length}
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between mt-3 gap-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  <strong className="text-gray-800">
                    {isSearching
                      ? "Search Results"
                      : currentFolder === "Root"
                        ? "All Media"
                        : currentFolder}
                  </strong>
                  {" • "}
                  {displayImages.length} item
                  {displayImages.length !== 1 ? "s" : ""}
                </span>

                <Input
                  placeholder="Search folders or images..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="w-full md:max-w-md rounded-lg border-gray-200"
                  value={inputValue}
                  onChange={(e) => handleSetSearchTerm(e.target.value)}
                  allowClear
                />
              </div>

              <div className="flex items-center gap-2">
                {isSearching && (
                  <Button
                    size="small"
                    onClick={() => handleSetSearchTerm("")}
                    type="text"
                    className="text-gray-500"
                  >
                    Clear Search
                  </Button>
                )}
                {hasCreate && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleOpenUploadModal}
                    icon={<IoMdAdd />}
                    className="h-8"
                  >
                    Upload
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Folders and Images Grid */}
          <div className="min-h-[400px]">
            {imageOperationLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader text="Loading..." size="medium" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {hasCreate && (
                    <div
                      role="button"
                      tabIndex={0}
                      className="group flex flex-col items-center justify-center w-full p-2 rounded-lg border border-transparent cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!isCreatingNewFolder) {
                          setIsCreatingNewFolder(true);
                          setNewFolderName("");
                        }
                      }}
                    >
                      <div className="flex flex-col items-center justify-center w-full pointer-events-none">
                        <div className="flex justify-center w-full mb-2">
                          <div className="w-[54px] h-[54px] flex items-center justify-center rounded-full border border-dashed border-gray-300 group-hover:border-primary-500 transition-colors">
                            <IoMdAdd className="text-3xl text-gray-400 group-hover:text-primary-500 transition-colors" />
                          </div>
                        </div>

                        {isCreatingNewFolder ? (
                          <div
                            className="w-full px-3 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Input
                              size="small"
                              autoFocus
                              value={newFolderName}
                              onChange={(e) =>
                                setNewFolderName(e.target.value)
                              }
                              onPressEnter={() => {
                                const name = newFolderName.trim();
                                if (name) {
                                  handleCreateFolder(currentFolder, name);
                                  setIsCreatingNewFolder(false);
                                  setNewFolderName("");
                                }
                              }}
                              onBlur={() => {
                                const name = newFolderName.trim();
                                if (name) {
                                  handleCreateFolder(currentFolder, name);
                                }
                                setIsCreatingNewFolder(false);
                                setNewFolderName("");
                              }}
                              className="w-full text-xs text-center border-slate-200 rounded-lg focus:ring-0 focus:border-slate-400 h-8"
                              placeholder="Name..."
                              disabled={folderOperationLoading}
                            />
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-xs font-medium text-gray-600 group-hover:text-primary-600 transition-colors">
                              New Folder
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Folders List */}
                  {displayFolders.map((folder) => (
                    <FolderItem
                      key={folder.path}
                      name={folder.name}
                      path={folder.path}
                      onClick={(path) => {
                        handleSetCurrentFolder(path);
                        handleSetSearchTerm("");
                      }}
                      onRename={
                        hasUpdate ? handleRenameFolder : undefined
                      }
                      onDelete={
                        hasDelete ? handleDeleteFolder : undefined
                      }
                    />
                  ))}

                  {/* Images List */}
                  {displayImages.map((img) => (
                    <MediaCard
                      key={img.id}
                      image={img}
                      onCopy={handleCopyImageUrl}
                      onDelete={
                        hasDelete ? handleDeleteImage : undefined
                      }
                      onEdit={hasUpdate ? handleEditImage : undefined}
                      size="default"
                      showActions={true}
                      disabled={imageOperationLoading}
                    />
                  ))}
                </div>

                {displayImages.length === 0 &&
                  displayFolders.length === 0 &&
                  !isCreatingNewFolder && (
                    <div className="flex flex-col items-center justify-center h-64 mt-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <span className="text-gray-400">
                            {isSearching
                              ? `No results found for "${searchTerm}"`
                              : "No files or folders found"}
                          </span>
                        }
                      />
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal - Only render when open */}
      {openMediaUploadModal && (
        <MediaUploadModal
          open={openMediaUploadModal}
          setOpen={setOpenMediaUploadModal}
          folders={folderTree}
          canUpload={hasCreate}
          onCreateFolder={hasCreate ? handleCreateFolder : undefined}
          onRenameFolder={hasUpdate ? handleRenameFolder : undefined}
          onDeleteFolder={hasDelete ? handleDeleteFolder : undefined}
          onUpload={hasCreate ? handleUploadImage : undefined}
          existingImages={mediaData}
          folderOperationLoading={folderOperationLoading}
          imageOperationLoading={isLoading}
          selectionMode={false}
          initialFolder={currentFolder}
          autoOpenPicker={hasCreate}
        />
      )}

      {hasUpdate && openRenameModal && (
        <RenameMediaModal
          open={openRenameModal}
          setOpen={setOpenRenameModal}
          media={selectedMedia}
          onSuccess={() => {
            refetchMedia();
            refetchFolders();
          }}
        />
      )}
    </>
  );
};

export default AllMediaList;
