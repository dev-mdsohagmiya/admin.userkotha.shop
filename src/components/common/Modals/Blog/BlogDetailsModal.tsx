"use client";

import { Image, Modal } from "antd";
import { X } from "lucide-react";
import { config } from "../../../../config";
import { IBlog } from "../../../../types/blogs";

interface BlogDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  blog: IBlog | null;
}

const BlogDetailsModal: React.FC<BlogDetailsModalProps> = ({
  open,
  setOpen,
  blog,
}) => {
  if (!blog) return null;

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={700}
      closable={false}
      className="[&_.ant-modal-content]:p-6 [&_.ant-modal-content]:rounded-xl"
    >
      <div className="space-y-6">
        {/* Header with close button */}
        <div className="flex justify-between items-start">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 pr-4">
            {blog.title}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Blog Image */}
        {blog.image?.url && (
          <div className="overflow-hidden rounded-lg shadow-md">
            <Image
              src={`${config.image_access_url}${blog.image.url}`}
              alt={blog.title}
              width="100%"
              height={350}
              className="object-cover"
              preview
            />
          </div>
        )}

        {/* Short Description */}
        {blog.shortDesc && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-gray-700 text-lg leading-relaxed italic">
              {blog.shortDesc}
            </p>
          </div>
        )}

        {/* Long Description */}
        {blog.description && (
          <div className="prose prose-lg max-w-none">
            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{
                __html: blog.description,
              }}
            />
          </div>
        )}

        {!blog.description && !blog.shortDesc && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-400 text-lg">No content available</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BlogDetailsModal;
