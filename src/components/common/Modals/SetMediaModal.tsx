import { Button, Modal } from "antd";
import { useState } from "react";
import { HiPlus } from "react-icons/hi2";
import { IoCheckbox, IoImageOutline } from "react-icons/io5";
import { useMediaListQuery } from "../../../redux/features/media/mediaApi";
import AppImage from "../../shared/AppImage";
import MediaUploadModal from "./MediaUploadModal";
import Loader from "../Loading/Loader";

const SetMediaModal = ({ open, setOpen, onSelectImage }: any) => {
  const { data, isFetching: isLoading } = useMediaListQuery([]);
  const images = data?.data?.data || [];

  const [openMediaUploadModal, setOpenMediaUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleOk = () => {
    if (selectedImage) {
      onSelectImage(selectedImage);
      setSelectedImage(null);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={handleCancel}
        onOk={handleOk}
        okText="Set Image"
        confirmLoading={isLoading}
        width="100vw"
        title="📁 Select an Image from Media"
        className="rounded-lg"
        okButtonProps={{ disabled: !selectedImage }}
        centered
        destroyOnClose
        maskClosable={false}
        style={{ top: 5 }}
        bodyStyle={{
          maxHeight: "70vh",
          overflow: "hidden",
          padding: "16px",
        }}
        styles={{
          body: {
            maxHeight: "80vh",
            overflow: "hidden",
            padding: "16px",
          },
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <Button
            type="primary"
            icon={<HiPlus />}
            onClick={() => setOpenMediaUploadModal(true)}
          >
            Add New
          </Button>
        </div>

        {isLoading ? (
          <Loader text="Loading images..." size="medium" />
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-10">
            <IoImageOutline size={48} />
            <p className="mt-2 text-sm">No images available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {images.map((img: any) => {
              const isSelected = selectedImage === img.url;
              const { width, height, unit } = img?.dimensions || {};

              return (
                <div
                  key={img.name}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative rounded-lg border-2 cursor-pointer group transition-all duration-200 ease-in-out overflow-hidden ${
                    isSelected
                      ? "border-primary ring-2 ring-primary"
                      : "border-gray-200 hover:border-primary"
                  }`}
                >
                  {isSelected && (
                    <IoCheckbox
                      size={20}
                      className="absolute top-2 right-2 text-primary z-40"
                    />
                  )}
                  <AppImage
                    accessurl
                    alt={img.name}
                    src={img.url}
                    className="w-full h-32 sm:h-40 object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="p-2 bg-white">
                    <p className="text-sm font-semibold truncate">{img.name}</p>
                    {width && height && (
                      <p className="text-xs text-gray-500">
                        {width}x{height} {unit || "px"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {openMediaUploadModal && (
        <MediaUploadModal
          open={openMediaUploadModal}
          setOpen={setOpenMediaUploadModal}
        />
      )}
    </>
  );
};

export default SetMediaModal;
