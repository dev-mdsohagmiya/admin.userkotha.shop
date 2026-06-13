import {
  ExclamationCircleOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Image, Input, InputRef, Modal, Tooltip } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { ImageOff, Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import BlogDetailsModal from "../../components/common/Modals/Blog/BlogDetailsModal";
import CreateBlogModel from "../../components/common/Modals/Blog/CreateBlogModel";
import UpdateBlogModel from "../../components/common/Modals/Blog/UpdateBlogModel";
import MultipleDeleteAndStatusChanges from "../../components/common/MultipleDeleteAndStatusChanges/MultipleDeleteAndStatusChanges";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { config } from "../../config";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteBlogMutation,
  useGetAllBlogsQuery,
  useToggleBlogStatusMutation,
} from "../../redux/features/blogs/blogApi";
import { IBlog } from "../../types/blogs";
import { MediaImage } from "../../types/media";
import { debounce } from "../../utils/debounce";

// --------- Main Blogs List Page ---------
const BlogsList = () => {
  const [selectedBlogIds, setSelectedBlogIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedBlog, setSelectedBlog] = useState<IBlog | null>(null);

  const searchInput = useRef<InputRef | null>(null);
  const {
    data: blogData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllBlogsQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    searchText && { name: "search", value: searchText },
  ]);

  const blogs = blogData?.data || [];
  const meta = blogData?.meta || {};

  const [openCreateBlogModal, setOpenCreateBlogModal] = useState(false);
  const [openUpdateBlogModal, setOpenUpdateBlogModal] = useState(false);
  const [openDetailsBlogModal, setOpenDetailsBlogModal] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toggleBlogStatus] = useToggleBlogStatusMutation();
  const [deleteBlog] = useDeleteBlogMutation();

  // permissions
  const { hasCreate, hasUpdate, hasDelete } =
    useModulePermissions("Blogs List");

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this blog?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteBlog(id).unwrap();
          if (res.success) {
            toast.success("Blog deleted successfully.");
          }
        } catch (err: any) {
          console.error("Error deleting blog:", err);
          toast.error("Failed to delete blog.");
        }
      },
    });
  };

  // View Details (Always public)
  const handleViewDetails = (record: IBlog) => {
    setSelectedBlog(record);
    setOpenDetailsBlogModal(true);
  };

  // Toggle Status
  const handleStatusChange = async (id: string) => {
    try {
      setLoadingId(id);
      await toggleBlogStatus(id).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const getTitleColumnSearchProps = () => ({
    filterDropdown: () => (
      <div>
        <Input
          placeholder="Search blog by title..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title="Search Title">
        <SearchOutlined
          className={`!rounded-full !bg-transparent 
          ${
            filtered ? "!bg-green-100 !text-green-600" : "!bg-gray-100"
          } cursor-pointer`}
        />
      </Tooltip>
    ),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },
  });

  const getSlugColumnSearchProps = () => ({
    filterDropdown: () => (
      <div>
        <Input
          placeholder="Search blog by slug..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title="Search Slug">
        <SearchOutlined
          className={`!rounded-full !bg-transparent 
          ${
            filtered ? "!bg-blue-100 !text-blue-600" : "!bg-gray-100"
          } cursor-pointer`}
        />
      </Tooltip>
    ),
  });

  const printableBlogs = blogs.map((blog: IBlog, index: number) => {
    const createdAt = blog.createdAt ? new Date(blog.createdAt) : null;

    return {
      SL: index + 1,
      Title: blog.title || "-",
      Slug: blog.slug || "-",
      "Short Description": blog.shortDesc || "-",
      Status: blog.isActive ? "Active" : "Inactive",
      "Created At": createdAt
        ? `${String(createdAt.getDate()).padStart(2, "0")}-${String(
            createdAt.getMonth() + 1,
          ).padStart(2, "0")}-${createdAt.getFullYear()}`
        : "-",
    };
  });

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: MediaImage) =>
        image?.url ? (
          <Image
            src={`${config.image_access_url}${image.url}`}
            alt="Blog Image"
            width={48}
            height={48}
            style={{
              objectFit: "cover",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            preview={{
              mask: "Preview",
              maskClassName: "bg-black bg-opacity-50 text-white text-xs",
            }}
            fallback="/default-image.png"
          />
        ) : (
          <div
            style={{
              width: 35,
              height: 35,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #fafafa, #e9e9e9)",
              border: "1px dashed #1890ff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#1890ff",
              fontSize: "5px",
              fontWeight: 500,
            }}
          >
            <ImageOff className="!h-[20px] !w-[20px]" />
          </div>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "238px",
      ...getTitleColumnSearchProps(),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: "150px",
      ...getSlugColumnSearchProps(),
    },
    {
      title: "Short Description",
      dataIndex: "shortDesc",
      key: "shortDesc",
      render: (shortDesc: string) => (
        <Tooltip
          title={shortDesc}
          overlayInnerStyle={{
            maxHeight: 200,
            maxWidth: 1050,
            overflowY: "auto",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          <span className="line-clamp-2 cursor-pointer">
            {shortDesc?.slice(0, 50) || "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          {[
            { text: "All", value: "all" },
            { text: "Active", value: "true" },
            { text: "Inactive", value: "false" },
          ].map((item) => (
            <label
              key={item.value}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="statusFilter"
                value={item.value}
                checked={selectedKeys[0] === item.value}
                style={{
                  marginRight: 8,
                  accentColor: "green",
                  cursor: "pointer",
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "all") {
                    clearFilters?.();
                    confirm({ closeDropdown: true });
                  } else {
                    setSelectedKeys([value]);
                    confirm({ closeDropdown: true });
                  }
                }}
              />
              {item.text}
            </label>
          ))}
        </div>
      ),
      onFilter: (value: string, record: { isActive: boolean }) => {
        if (value === "true") return record.isActive === true;
        if (value === "false") return record.isActive === false;
        return true;
      },
      filterMultiple: false,
      render: (isActive: boolean, record: { id: string }) => (
        <SwitchStatus2
          checked={isActive}
          onChange={() => handleStatusChange(record.id)}
          loading={record?.id === loadingId}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: IBlog) => (
        <div className="flex gap-2">
          {/* View Details - Always Public */}
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              type="default"
            />
          </Tooltip>

          {/* Edit Button - Based on Permissions */}
          {hasUpdate && (
            <Tooltip title="Edit">
              <Button
                icon={<FiEdit />}
                onClick={() => {
                  setSelectedBlog(record);
                  setOpenUpdateBlogModal(true);
                }}
              />
            </Tooltip>
          )}

          {/* Delete Button - Based on Permissions */}
          {hasDelete && (
            <Tooltip title="Delete">
              <Button
                danger
                icon={<FiTrash2 />}
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Blogs | UserKotha.Shop ERP"
        description="Manage and view all blog posts"
      />
      <div className="">
        <PageHeader
          title="Blogs"
          subtitle="View and manage all blog posts"
          breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Blogs" }]}
          extra={
            <>
              <PageListPrint tableData={printableBlogs} fileName="Blog-list" />
              <MultipleDeleteAndStatusChanges
                text="Blogs"
                iDs={selectedBlogIds}
                deleteMutation={deleteBlog}
                statusChangeMutation={toggleBlogStatus}
                setIDs={setSelectedBlogIds}
              />
              <CustomActionButton
                disabled={meta?.total === 0}
                onClick={() => {
                  refetch();
                }}
                text="Refresh"
                icon={<RefreshCcw />}
                type="default"
              />
              {hasCreate && (
                <CustomActionButton
                  onClick={() => setOpenCreateBlogModal(true)}
                  text="Add New"
                  icon={<Plus />}
                  type="primary"
                />
              )}
            </>
          }
        />

        <DataTable
          loading={isLoading || isFetching}
          data={blogs}
          columns={columns}
          selectRow={true}
          rowKey="id"
          isPaginate={meta?.total > 10 && true}
          currentPage={page}
          showSizeChanger={meta?.total > 10 && true}
          clearSelectionTrigger={selectedBlogIds.length === 0 && true}
          limit={limit}
          setLimit={setLimit}
          setCurrentPage={setPage}
          total={meta?.total || 0}
          onSelectRowsChange={(selectedRows: any[]) => {
            const ids = selectedRows.map((row) => row.id);
            setSelectedBlogIds(ids);
          }}
        />
      </div>

      {/* Create Blog Modal */}
      {openCreateBlogModal && (
        <CreateBlogModel
          open={openCreateBlogModal}
          setOpen={setOpenCreateBlogModal}
        />
      )}

      {/* Update Blog Modal */}
      {openUpdateBlogModal && selectedBlog && (
        <UpdateBlogModel
          open={openUpdateBlogModal}
          setOpen={setOpenUpdateBlogModal}
          data={selectedBlog}
        />
      )}

      {/* View Blog Details Modal (Always accessible) */}
      {openDetailsBlogModal && selectedBlog && (
        <BlogDetailsModal
          open={openDetailsBlogModal}
          setOpen={setOpenDetailsBlogModal}
          blog={selectedBlog}
        />
      )}
    </div>
  );
};

export default BlogsList;
