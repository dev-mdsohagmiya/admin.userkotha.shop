import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FolderOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Image,
  Input,
  message,
  Modal,
  Upload,
} from "antd";
import type { RcFile } from "antd/es/upload/interface";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUploadImageMutation } from "../../../redux/features/media/mediaApi";
import { FolderNode, MediaImage } from "../../../types/media";
import { findFolderNode } from "../../../utils/mediaHelpers";
import Loader from "../Loading/Loader";
import MediaBreadcrumb from "../media/MediaBreadcrumb";
import MediaCard from "../media/MediaCard";
import FolderItem from "../media/FolderItem";
import { IoMdAdd } from "react-icons/io";

const { Dragger } = Upload;

interface MediaUploadModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onUpload?: (files: File[], folderPath: string) => void;
  folders?: FolderNode[];
  onCreateFolder?: (parentPath: string, name: string) => void;
  onRenameFolder?: (path: string, newName: string) => void;
  onDeleteFolder?: (path: string) => void;
  existingImages?: MediaImage[];
  folderOperationLoading?: boolean;
  imageOperationLoading?: boolean;
  selectionMode?: boolean;
  /** When false, hides drag-upload UI and blocks uploads (parent should disable when user lacks create). */
  canUpload?: boolean;
  multiple?: boolean;
  onSelect?: (images: MediaImage[]) => void;
  selectedImages?: MediaImage[];
  initialFolder?: string;
  autoOpenPicker?: boolean;
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  open,
  setOpen,
  onUpload,
  folders = [],
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  existingImages = [],
  folderOperationLoading = false,
  imageOperationLoading = false,
  selectionMode = false,
  canUpload = true,
  multiple = true, // Default to true for multiple uploads as requested
  onSelect,
  selectedImages = [],
  initialFolder = "Root",
  autoOpenPicker = false,
}) => {
  const [uploadFiles, setUploadFiles] = useState<RcFile[]>([]);
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [currentFolder, setCurrentFolder] = useState(initialFolder);
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");

  // Selection state
  const [internalSelectedImages, setInternalSelectedImages] =
    useState<MediaImage[]>(selectedImages);

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Infinite scroll states
  const [visibleImages, setVisibleImages] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  // New folder creation states
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Memoized current folder images
  const currentFolderImages = useMemo(() => {
    const folderImages = existingImages.filter(
      (img) =>
        img.folder === currentFolder ||
        (currentFolder === "Root" && (!img.folder || img.folder === "Root")),
    );

    if (!searchTerm.trim()) return folderImages;

    // If searching, search through ALL images (global search like in Media.tsx)
    return existingImages.filter((img) =>
      img.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [existingImages, currentFolder, searchTerm]);

  // Memoized current sub-folders
  const currentSubFolders = useMemo(() => {
    const parentNode = findFolderNode(folders, currentFolder);
    const subFolders = parentNode?.children || [];

    if (!searchTerm.trim()) return subFolders;

    // If searching, search through all folders (flat search)
    const allFolders: FolderNode[] = [];
    const traverse = (nodes: FolderNode[]) => {
      nodes.forEach((node) => {
        if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          allFolders.push(node);
        }
        if (node.children) traverse(node.children);
      });
    };
    traverse(folders);
    return allFolders;
  }, [folders, currentFolder, searchTerm]);

  const isSearching = searchTerm.trim().length > 0;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update searchTerm with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Sync local input if searchTerm is cleared
  useEffect(() => {
    if (searchTerm === "") {
      setInputValue("");
    }
  }, [searchTerm]);

  // Ref to track if auto-picker has been triggered for the current open session
  const hasAutoOpenedRef = useRef(false);

  // Reset states when modal opens
  useEffect(() => {
    if (open) {
      if (!hasAutoOpenedRef.current) {
        setVisibleImages(12);
        setCurrentFolder(initialFolder);
        setInternalSelectedImages(selectedImages);
        setIsMobileSidebarOpen(false);

        // Auto-open file picker if requested
        if (autoOpenPicker && canUpload) {
          setTimeout(() => {
            const uploadBtn = document.querySelector(
              ".ant-upload-drag-container",
            ) as HTMLElement;
            if (uploadBtn) uploadBtn.click();
          }, 300);
        }
        hasAutoOpenedRef.current = true;
      }
    } else {
      hasAutoOpenedRef.current = false;
    }
  }, [open, initialFolder, selectedImages, autoOpenPicker, canUpload]);

  // Stable scroll handler with ref-based loading state
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !open) return;

    const handleScroll = () => {
      if (isLoadingMoreRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollThreshold = 100;

      if (
        scrollTop + clientHeight >= scrollHeight - scrollThreshold &&
        visibleImages < currentFolderImages.length
      ) {
        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);

        setTimeout(() => {
          setVisibleImages((prev) => {
            const newVisible = Math.min(prev + 12, currentFolderImages.length);
            isLoadingMoreRef.current = false;
            setIsLoadingMore(false);
            return newVisible;
          });
        }, 300);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [open, visibleImages, currentFolderImages.length]); // Minimal dependencies

  // Update internal selected images only when selectedImages prop changes AND modal is closed
  useEffect(() => {
    if (!open) {
      setInternalSelectedImages(selectedImages);
    }
  }, [selectedImages, open]);

  const handleRemove = useCallback((file: RcFile) => {
    setUploadFiles((prev) => prev.filter((f) => f.uid !== file.uid));
    setCustomNames((prev) => {
      const copy = { ...prev };
      delete copy[file.name];
      return copy;
    });
  }, []);

  const uploadProps = {
    multiple: true, // Always allow multiple
    accept: "image/*",
    showUploadList: false,
    beforeUpload: (file: RcFile) => {
      setUploadFiles((prev) => [...prev, file]);
      setCustomNames((prev) => ({ ...prev, [file.name]: file.name }));
      return false;
    },
  };

  const handleUploadAll = async () => {
    if (!canUpload) return;
    setIsUploadingFiles(true);
    try {
      let uploadedImages: MediaImage[] = [];

      if (onUpload) {
        await onUpload(
          uploadFiles,
          currentFolder === "Root" ? "" : currentFolder,
        );
      } else {
        const formData = new FormData();
        uploadFiles.forEach((file) => {
          formData.append("files", file);
        });
        formData.append(
          "folder",
          currentFolder === "Root" ? "" : currentFolder,
        );

        const response = await uploadImage(formData).unwrap();
        uploadedImages = response?.data || [];
      }

      message.success(
        `${uploadFiles.length} image${
          uploadFiles.length > 1 ? "s" : ""
        } uploaded successfully`,
      );

      if (selectionMode && uploadedImages.length > 0) {
        setInternalSelectedImages((prev) => {
          if (multiple) {
            const newSelection = [...prev];
            uploadedImages.forEach((newImg) => {
              if (!newSelection.some((img) => img.id === newImg.id)) {
                newSelection.push(newImg);
              }
            });
            return newSelection;
          } else {
            return [uploadedImages[0]];
          }
        });
        message.info(
          `${uploadedImages.length} uploaded image${
            uploadedImages.length > 1 ? "s" : ""
          } added to selection`,
        );
      }

      setUploadFiles([]);
      setCustomNames({});

      if (!selectionMode) {
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
      message.error("Image upload failed");
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const handleBack = useCallback(() => {
    if (currentFolder === "Root") return;
    const parts = currentFolder.split("/");
    if (parts.length <= 1) {
      setCurrentFolder("Root");
    } else {
      parts.pop();
      setCurrentFolder(parts.join("/"));
    }
  }, [currentFolder]);

  const copyImageUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    message.success("Image URL copied to clipboard");
  }, []);

  // Selection handlers
  const handleImageSelect = useCallback(
    (image: MediaImage) => {
      if (!selectionMode) return;

      setInternalSelectedImages((prev) => {
        if (multiple) {
          const isSelected = prev.some((img) => img.id === image.id);
          if (isSelected) {
            return prev.filter((img) => img.id !== image.id);
          } else {
            return [...prev, image];
          }
        } else {
          const isSelected = prev.some((img) => img.id === image.id);
          return isSelected ? [] : [image];
        }
      });
    },
    [selectionMode, multiple],
  );

  const isImageSelected = useCallback(
    (image: MediaImage) => {
      return internalSelectedImages.some((img) => img.id === image.id);
    },
    [internalSelectedImages],
  );

  const handleConfirmSelection = useCallback(() => {
    if (onSelect) {
      onSelect(internalSelectedImages);
    }
    setOpen(false);
  }, [onSelect, internalSelectedImages, setOpen]);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setUploadFiles([]);
    setCustomNames({});
    setInternalSelectedImages([]);
    setIsMobileSidebarOpen(false);
    setSearchTerm("");
    setInputValue("");
  }, [setOpen]);

  const handleDeleteFolder = useCallback(
    (path: string) => {
      if (!onDeleteFolder) return;

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
        onOk: () => {
          onDeleteFolder(path);
        },
      });
    },
    [onDeleteFolder],
  );

  return (
    <Modal
      open={open}
      destroyOnClose={true}
      maskClosable={false}
      keyboard={true}
      width={isMobileView ? "100%" : "97%"}
      className={`!min-h-screen ${isMobileView ? "!m-0 !max-w-none" : "!max-w-[97%]"}`}
      style={isMobileView ? { top: 0, padding: 0 } : { top: 20 }}
      styles={{
        body: {
          padding: isMobileView ? "16px" : "16px 24px",
          maxHeight: isMobileView ? "100vh" : "87vh",
          overflow: "hidden",
        },
      }}
      // title={
      //   <div className="flex items-center justify-between mt-5">
      //     <div className="flex items-center gap-3">
      //       <span
      //         className={`font-semibold ${
      //           isMobileView ? "text-lg" : "text-xl"
      //         }`}
      //       >
      //         {selectionMode ? "Upload & Select Images" : "Upload Images"}
      //       </span>
      //     </div>
      //     <div className="flex items-center gap-4">
      //       {selectionMode ? (
      //         <>
      //           <div
      //             className={`text-sm text-gray-500 ${
      //               isMobileView ? "hidden" : ""
      //             }`}
      //           >
      //             {internalSelectedImages.length} image
      //             {internalSelectedImages.length !== 1 ? "s" : ""} selected
      //             {multiple ? "" : " (single selection)"}
      //           </div>
      //           {uploadFiles.length > 0 && (
      //             <div className="text-sm text-primary-600">
      //               {uploadFiles.length} file
      //               {uploadFiles.length !== 1 ? "s" : ""} to upload
      //             </div>
      //           )}
      //         </>
      //       ) : (
      //         <div className="text-sm text-gray-500">
      //           {uploadFiles.length} file{uploadFiles.length !== 1 ? "s" : ""}{" "}
      //           selected
      //         </div>
      //       )}
      //     </div>
      //   </div>
      // }
      onCancel={handleCloseModal}
      footer={null}
    >
      {/* Mobile Backdrop */}
      {isMobileView && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main container with responsive layout */}
      <div
        className={`flex gap-6 ${
          isMobileView ? "h-[calc(100vh-200px)]" : "h-[75vh] min-h-[500px]"
        }`}
      >
        {/* Folder Tree Sidebar - Removed */}

        {/* Main Content */}
        <div className="w-full flex flex-col min-h-0">
          {/* Mobile Folder Selector - More Prominent */}
          {isMobileView && (
            <div className="mb-3 flex-shrink-0">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOutlined className="text-primary-600 text-base" />
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Upload to
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {currentFolder === "Root" ? "All Media" : currentFolder}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    icon={<FolderOutlined />}
                    onClick={toggleMobileSidebar}
                    className="h-8"
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumb with reduced margin */}

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3 flex-1">
              <Button
                icon={<ArrowLeftOutlined className="text-sm" />}
                onClick={() => {
                  handleBack();
                  setSearchTerm("");
                }}
                disabled={currentFolder === "Root" || isSearching}
                className="rounded-lg h-8 w-8 flex items-center justify-center border-gray-200 text-gray-500 hover:text-primary-600 disabled:opacity-30"
                title="Back to parent folder"
              />
              <MediaBreadcrumb
                currentFolder={isSearching ? "Search Results" : currentFolder}
                onFolderSelect={(path) => {
                  setCurrentFolder(path);
                  setSearchTerm("");
                }}
              />
              <div className="flex-1 max-w-xs ml-2">
                <Input
                  placeholder="Search..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  size="middle"
                  className="rounded-lg border-gray-200"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  allowClear
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectionMode && (
                <div
                  className={`text-xs text-gray-500 mr-2 ${isMobileView ? "hidden" : ""}`}
                >
                  {internalSelectedImages.length} selected
                </div>
              )}

              {selectionMode && (
                <Button
                  onClick={handleConfirmSelection}
                  type="primary"
                  disabled={internalSelectedImages.length === 0}
                  className="bg-primary-600 hover:bg-primary-700 border-0 text-white rounded-lg h-8 px-4 text-xs font-semibold"
                >
                  Insert Selection{" "}
                  {internalSelectedImages.length > 0
                    ? `(${internalSelectedImages.length})`
                    : ""}
                </Button>
              )}

              {uploadFiles.length > 0 && canUpload && (
                <Button
                  onClick={handleUploadAll}
                  loading={isUploading || isUploadingFiles}
                  type="primary"
                  className="bg-green-600 hover:bg-green-700 border-0 text-white rounded-lg h-8 px-4 text-xs font-semibold"
                >
                  Upload ({uploadFiles.length})
                </Button>
              )}

              <Button
                onClick={handleCloseModal}
                className="rounded-lg h-8 px-4 border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-medium"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Upload Area with reduced margin */}
          {canUpload && (
            <div className="mb-3 flex-shrink-0">
              <Dragger
                {...uploadProps}
                className="transition-colors rounded-lg bg-gray-50 border-gray-300"
                style={{ padding: "4px 0" }}
              >
                <div className="py-1 flex flex-col items-center justify-center min-h-[52px]">
                  <CloudUploadOutlined
                    style={{ color: "#ff3d0a" }}
                    className="text-2xl mb-1"
                  />
                  <p className="ant-upload-text font-semibold text-gray-700 m-0 text-[11px] leading-tight">
                    {selectionMode
                      ? "Click or Drag to Upload"
                      : "Click or Drag to Upload"}
                  </p>
                  <p className="ant-upload-hint text-[10px] text-gray-400 m-0 mt-0.5">
                    Target:{" "}
                    <span className="text-gray-500 font-medium">
                      {currentFolder === "Root" ? "All Media" : currentFolder}
                    </span>
                  </p>
                </div>
              </Dragger>
            </div>
          )}

          {/* Uploaded Files Preview with reduced height */}
          {canUpload && uploadFiles.length > 0 && (
            <div className="mb-3 flex-shrink-0 max-h-32 overflow-hidden">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                Files to Upload ({uploadFiles.length})
              </h4>
              <div className="space-y-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                {uploadFiles.map((file) => (
                  <Card
                    key={file.uid}
                    size="small"
                    className="border-l-4 border-l-primary-500"
                    styles={{
                      body: {
                        padding: "8px 12px",
                      },
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded flex items-center justify-center border border-gray-200">
                        <Image
                          alt={file.name}
                          width={32}
                          height={32}
                          src={URL.createObjectURL(file)}
                          className="object-cover rounded-lg"
                          preview={{ mask: <EyeOutlined /> }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Input
                          size="small"
                          placeholder="Custom filename"
                          value={customNames[file.name] || ""}
                          onChange={(e) =>
                            setCustomNames((prev) => ({
                              ...prev,
                              [file.name]: e.target.value,
                            }))
                          }
                          className="text-xs mb-1"
                        />
                        <p className="text-xs text-gray-500 truncate">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(file)}
                        className="flex-shrink-0 w-8 h-8 hover:bg-red-50"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Existing Images Section with increased height and proper padding */}
          <div
            className={`flex-1 flex flex-col min-h-0 ${
              uploadFiles.length === 0 && !selectionMode
                ? "border-t border-gray-200 pt-3"
                : "border-t border-gray-200 pt-3"
            }`}
            style={{ minHeight: "400px" }}
          >
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h4 className="font-semibold text-gray-800 text-sm">
                {selectionMode
                  ? "Select from existing images in"
                  : "Existing Images in"}{" "}
                <span className="text-primary-600">
                  {currentFolder === "Root" ? "All Media" : currentFolder}
                </span>
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border">
                {currentFolderImages.length} image
                {currentFolderImages.length !== 1 ? "s" : ""}
              </span>
            </div>

            {imageOperationLoading ? (
              <div className="flex-1 flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <Loader text="Loading media..." size="medium" />
                </div>
              </div>
            ) : currentFolderImages.length === 0 &&
              currentSubFolders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 min-h-[300px]">
                <Empty
                  description={
                    <div className="text-center">
                      <p className="text-gray-500 mb-2 text-sm">
                        {isSearching
                          ? `No results found for "${searchTerm}"`
                          : "No items in this folder"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isSearching
                          ? "Try a different search term or clear the search"
                          : "Upload images or select a different folder"}
                      </p>
                    </div>
                  }
                />
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto min-h-0 custom-scrollbar"
                style={{
                  minHeight: "350px",
                  paddingBottom: "50px", // Added bottom padding to prevent cuttin
                }}
              >
                {/* Responsive grid */}
                <div
                  // change this field for mb 36
                  className={`grid gap-3 pb-4 mb-36 ${
                    isMobileView ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-8"
                  }`}
                >
                  {/* New Folder Card */}
                  {onCreateFolder && (
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
                              onChange={(e) => setNewFolderName(e.target.value)}
                              onPressEnter={() => {
                                const name = newFolderName.trim();
                                if (name && onCreateFolder) {
                                  onCreateFolder(currentFolder, name);
                                  setIsCreatingNewFolder(false);
                                  setNewFolderName("");
                                }
                              }}
                              onBlur={() => {
                                const name = newFolderName.trim();
                                if (name && onCreateFolder) {
                                  onCreateFolder(currentFolder, name);
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
                  {currentSubFolders.map((folder) => (
                    <FolderItem
                      key={folder.path}
                      name={folder.name}
                      path={folder.path}
                      onClick={setCurrentFolder}
                      onRename={onRenameFolder}
                      onDelete={
                        onDeleteFolder ? handleDeleteFolder : undefined
                      }
                    />
                  ))}

                  {/* Images List */}
                  {currentFolderImages
                    .slice(0, visibleImages)
                    .map((img, index) => (
                      <div
                        key={img.id || index}
                        className={`relative ${
                          selectionMode ? "cursor-pointer" : ""
                        }`}
                        onClick={
                          selectionMode
                            ? () => handleImageSelect(img)
                            : undefined
                        }
                      >
                        {selectionMode && (
                          <div
                            className={`absolute top-2 left-2 z-10 rounded-[4px]  border-2 flex items-center justify-center transition-all ${
                              isMobileView ? "w-6 h-6" : "w-5 h-5"
                            } ${
                              isImageSelected(img)
                                ? "bg-primary-600 border-primary-600"
                                : "bg-white border-gray-300 hover:border-primary hover:ring-2 hover:ring-primary/20"
                            }`}
                          >
                            {isImageSelected(img) && (
                              <svg
                                className={`${
                                  isMobileView ? "w-4 h-4" : "w-3 h-3"
                                } text-white`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        )}
                        <div
                          className={
                            selectionMode && isImageSelected(img)
                              ? "border-2 border-primary z-999 rounded-lg"
                              : ""
                          }
                        >
                          <MediaCard
                            image={img}
                            onCopy={selectionMode ? undefined : copyImageUrl}
                            onDelete={selectionMode ? undefined : undefined}
                            size={isMobileView ? "default" : "small"}
                            showActions={!selectionMode}
                            disabled={imageOperationLoading}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Load More Indicator - Reduced top padding since we added bottom padding to grid */}
                {visibleImages < currentFolderImages.length && (
                  <div className="text-center py-3 border-t border-gray-200 mt-2">
                    <Button
                      type="dashed"
                      loading={isLoadingMore}
                      onClick={() => {
                        setIsLoadingMore(true);
                        setTimeout(() => {
                          setVisibleImages((prev) =>
                            Math.min(prev + 12, currentFolderImages.length),
                          );
                          setIsLoadingMore(false);
                        }, 300);
                      }}
                      className={`border-gray-300 hover:border-primary hover:text-primary ${
                        isMobileView ? "w-full text-sm" : "w-full text-sm"
                      }`}
                    >
                      {isLoadingMore
                        ? "Loading..."
                        : `Load More (${
                            currentFolderImages.length - visibleImages
                          } remaining)`}
                    </Button>
                  </div>
                )}

                {/* End of List - Reduced padding */}
                {visibleImages >= currentFolderImages.length &&
                  currentFolderImages.length > 12 && (
                    <div className="text-center py-2 border-t border-gray-200">
                      <p
                        className={`text-gray-500 ${
                          isMobileView ? "text-sm" : "text-sm"
                        }`}
                      >
                        All {currentFolderImages.length} images loaded
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MediaUploadModal;
