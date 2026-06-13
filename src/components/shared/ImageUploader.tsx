import { Button } from "antd";
import { UploadIcon } from "lucide-react";
import { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { MediaUploadModal } from "../common/Modals";
import AntImage from "./AntImage";
import {
  useMediaListQuery,
  useGetAllFoldersQuery,
  useCreateFolderMutation,
  useRenameFolderMutation,
  useDeleteFolderMutation,
  useUploadImageMutation,
} from "../../redux/features/media/mediaApi";
import { buildFolderTreeFromFolders } from "../../utils/mediaHelpers";
import { MediaImage } from "../../types/media";

interface ImageUploaderProps {
  form: any;
  isThumbnail?: boolean;
  fieldPath: string; // Field to set image ID
  multiple?: boolean; // Support for multiple image selection
  /** Hide upload/remove controls (view-only CMS). */
  disabled?: boolean;
}

const ImageUploader = ({
  form,
  fieldPath,
  multiple = false,
  isThumbnail = false,
  disabled = false,
}: ImageUploaderProps) => {
  const [openMediaModal, setOpenMediaModal] = useState(false);
  const idPathArray = fieldPath
    .split(".")
    .map((key) => (/^\d+$/.test(key) ? Number(key) : key));

  // API hooks
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
  const [createFolder] = useCreateFolderMutation();
  const [renameFolder] = useRenameFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [uploadImage] = useUploadImageMutation();

  const mediaData = mediaResponse?.data || [];
  const foldersList = foldersResponse?.data || ["Root"];
  const folderTree = buildFolderTreeFromFolders(foldersList);
  const isLoading = mediaFetching || foldersFetching;

  // Get image ID from form
  const imageIdValue = form.getFieldValue(idPathArray);

  // Find image(s) by ID for preview
  let selectedImages: string[] = [];
  if (multiple) {
    if (Array.isArray(imageIdValue)) {
      selectedImages = imageIdValue
        .map((id: any) => {
          const img = mediaData.find((img: MediaImage) => img.id === id);
          return img ? img.url : null;
        })
        .filter(Boolean);
    }
  } else {
    if (imageIdValue) {
      const img = mediaData.find((img: MediaImage) => img.id === imageIdValue);
      if (img) selectedImages = [img.url];
    }
  }

  const handleDelete = (e: any, indexToRemove?: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (multiple && typeof indexToRemove === "number") {
      if (Array.isArray(imageIdValue)) {
        const newIds = imageIdValue.filter(
          (_: any, idx: number) => idx !== indexToRemove,
        );
        form.setFieldValue(idPathArray, newIds.length > 0 ? newIds : null);
      }
    } else {
      form.setFieldValue(idPathArray, null);
    }
  };

  const handleImageSelect = (images: MediaImage[]) => {
    if (multiple) {
      const imageIds = images.map((img) => img.id);
      form.setFieldValue(idPathArray, imageIds.length > 0 ? imageIds : null);
    } else {
      const imageId = images.length > 0 ? images[0].id : null;
      form.setFieldValue(idPathArray, imageId);
    }
    setOpenMediaModal(false);
  };

  const handleFolderOperations = {
    createFolder: async (parentPath: string, name: string) => {
      await createFolder({
        name,
        parentPath: parentPath === "Root" ? "" : parentPath,
      }).unwrap();
      await refetchFolders();
    },
    renameFolder: async (oldPath: string, newName: string) => {
      await renameFolder({ oldPath, newName }).unwrap();
      await refetchFolders();
      await refetchMedia();
    },
    deleteFolder: async (path: string) => {
      await deleteFolder(path).unwrap();
      await refetchFolders();
      await refetchMedia();
    },
    uploadImage: async (files: File[], folderPath: string) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", folderPath);
      const result = await uploadImage(formData).unwrap();
      await refetchMedia();
      await refetchFolders();
      return result;
    },
  };

  return (
    <div className="space-y-2">
      {multiple ? (
        // Multiple images display - USING SAME STYLING AS SINGLE
        <div className="space-y-2">
          {selectedImages.length > 0 && (
            <div
              className={`flex flex-wrap items-start gap-4 ${
                isThumbnail ? "flex-col" : "flex-row"
              }`}
            >
              {selectedImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative box-border h-32 w-32 shrink-0"
                >
                  {/* Fixed frame so absolute delete anchors to this tile (antd Image wrapper was breaking layout). */}
                  <div
                    className="h-full w-full overflow-hidden rounded-md border border-gray-100 bg-gray-100 [&_.ant-image]:!block [&_.ant-image]:!h-full [&_.ant-image]:!max-h-full [&_.ant-image]:!w-full [&_.ant-image]:!max-w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!max-h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!max-w-full [&_.ant-image-img]:!object-cover"
                  >
                    <AntImage
                      width={128}
                      height={128}
                      src={imageUrl}
                      accessurl={true}
                      alt={`Preview ${index + 1}`}
                      className="!rounded-none bg-gray-100"
                    />
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={(e) => handleDelete(e, index)}
                      className="absolute right-1 top-1 z-[5] flex h-6 w-6 min-h-6 min-w-6 cursor-pointer items-center justify-center rounded-sm border-0 bg-red-500 p-0 text-white shadow-sm hover:bg-red-600"
                    >
                      <RiDeleteBinLine size={15} className="shrink-0" />
                    </button>
                  )}
                </div>
              ))}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => setOpenMediaModal(true)}
                  className="flex shrink-0 flex-col items-center justify-center w-32 h-32 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-primary-400 transition-colors duration-200 cursor-pointer"
                >
                  <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 text-center">
                    Add More Images
                  </span>
                </button>
              )}
            </div>
          )}

          {/* When no images selected - same styling as single */}
          {selectedImages.length === 0 && !disabled && (
            <div
              className={`flex gap-5 ${isThumbnail ? "flex-col" : "flex-row"}`}
            >
              <div>
                <button
                  type="button"
                  onClick={() => setOpenMediaModal(true)}
                  className="flex flex-col items-center justify-center w-32 h-32 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-primary-400 transition-colors duration-200 cursor-pointer"
                >
                  <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 text-center">
                    Upload Images
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Single image display - EXACTLY AS BEFORE
        <>
          <div
            className={`flex gap-5 ${
              isThumbnail === true ? "flex-col" : "flex-row"
            }`}
          >
            {/* Hide uploader if image is selected */}
            {!disabled && (
            <div className={`${selectedImages.length > 0 ? "hidden" : ""}`}>
              <button
                type="button"
                onClick={() => setOpenMediaModal(true)}
                className="flex flex-col items-center  justify-center w-32 h-32 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-primary-400 transition-colors duration-200 cursor-pointer"
              >
                <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 text-center">
                  Upload Image
                </span>
              </button>
            </div>
            )}

            {selectedImages.length > 0 && (
              <div className="relative">
                <AntImage
                  width={128}
                  height={128}
                  src={selectedImages[0]}
                  accessurl={true}
                  alt="Preview"
                  className="bg-gray-100 border !rounded-sm overflow-hidden w-32 h-32 object-cover"
                />
                {!disabled && (
                <Button
                  type="primary"
                  size="small"
                  danger
                  onClick={handleDelete}
                  icon={<RiDeleteBinLine size={15} className="shrink-0" />}
                  className={`absolute ${
                    isThumbnail
                      ? "-top-[126px] -right-[98px]"
                      : "-top-[105px] right-[30px]"
                  } !h-6 !w-6 !min-h-6 !min-w-6 flex items-center justify-center !rounded-sm p-0`}
                />
                )}
              </div>
            )}
          </div>
        </>
      )}

      {openMediaModal && !disabled && (
        <MediaUploadModal
          open={openMediaModal}
          setOpen={setOpenMediaModal}
          folders={folderTree}
          onCreateFolder={handleFolderOperations.createFolder}
          onRenameFolder={handleFolderOperations.renameFolder}
          onDeleteFolder={handleFolderOperations.deleteFolder}
          onUpload={handleFolderOperations.uploadImage}
          existingImages={mediaData}
          imageOperationLoading={isLoading}
          selectionMode={true}
          multiple={multiple}
          onSelect={handleImageSelect}
          selectedImages={
            selectedImages
              .map((url) =>
                mediaData.find((img: MediaImage) => img.url === url),
              )
              .filter(Boolean) as MediaImage[]
          }
        />
      )}
    </div>
  );
};

export default ImageUploader;
