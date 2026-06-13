import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Image,
  Input,
  Menu,
  Modal,
  Select,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiCheck, FiEdit, FiMoreVertical, FiTrash2, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../components/common/Meta/PageMeta";
import UpdateReviewModal from "../../components/common/Modals/review/UpdateReviewModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { config } from "../../config";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useConfirmReviewMutation,
  useDeleteReviewDataMutation,
  useGetAllReviewsQuery,
  useUnconfirmReviewMutation,
} from "../../redux/features/review/reviewApi";
import { IReview } from "../../types/review";
import { debounce } from "../../utils/debounce";

const ReviewList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const { hasUpdate, hasDelete } = useModulePermissions("Review");

  // API Hooks
  const {
    data: reviewData,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllReviewsQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    { name: "sortBy", value: sortBy },
    { name: "sortOrder", value: sortOrder },
    status && { name: "isConfirmed", value: status },
    searchText && { name: "search", value: searchText },
  ]);

  const [confirmReview] = useConfirmReviewMutation();
  const [unconfirmReview] = useUnconfirmReviewMutation();
  const [deleteReview] = useDeleteReviewDataMutation();

  const reviews = reviewData?.data || [];
  const meta = reviewData?.meta || {};

  // Debounce Search
  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }),
  ).current;

  // Handlers
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      setSortBy(sorter.field as string);
      setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
    }
  };

  const handleConfirm = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to confirm this review?",
      icon: <ExclamationCircleOutlined />,
      okText: "Confirm",
      okType: "primary",
      okButtonProps: {
        style: { backgroundColor: "green", borderColor: "#16a34a" },
      },
      onOk: async () => {
        try {
          const res = await confirmReview(id).unwrap();
          if (res.success) toast.success("Review confirmed successfully");
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to confirm review");
        }
      },
    });
  };

  const handleUnconfirm = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to unconfirm this review?",
      icon: <ExclamationCircleOutlined />,
      okType: "danger",
      onOk: async () => {
        try {
          const res = await unconfirmReview(id).unwrap();
          if (res.success) toast.success("Review unconfirmed successfully");
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to unconfirm review");
        }
      },
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this review?",
      content: "This action cannot be undone.",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteReview(id).unwrap();
          if (res.success) toast.success("Review deleted successfully");
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to delete review");
        }
      },
    });
  };

  const actionMenu = (record: IReview) => (
    <Menu>
      {hasUpdate && (
        <Menu.Item
          key="edit"
          icon={<FiEdit />}
          onClick={() => {
            setSelectedReview(record);
            setOpenUpdateModal(true);
          }}
        >
          Update
        </Menu.Item>
      )}
      {hasUpdate && hasDelete && <Menu.Divider />}
      {hasDelete && (
        <Menu.Item
          key="delete"
          icon={<FiTrash2 />}
          danger
          onClick={() => handleDelete(record.id)}
        >
          Delete
        </Menu.Item>
      )}
    </Menu>
  );

  const columns = [
    {
      title: "SL",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
      width: 50,
    },
    {
      title: "Product",
      key: "product",
      render: (_: any, record: IReview) => (
        <Space>
          {record.product?.thumbnail?.url ||
          record.comboProduct?.thumbnail?.url ? (
            <Link
              to={`/product/${record.product?.id || record.comboProduct?.id}`}
            >
              {" "}
              <Image
                src={`${config.image_access_url}${
                  record.product?.thumbnail?.url ||
                  record.comboProduct?.thumbnail?.url
                }`}
                width={40}
              />
            </Link>
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
          )}
          <Link
            to={`/product/${record.product?.id || record.comboProduct?.id}`}
          >
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {record.product?.name ||
                  record.comboProduct?.name ||
                  "Unknown Product"}
              </span>
              <span className="text-xs text-gray-500">
                {record.comboProductId ? "Combo" : "Regular"}
              </span>
            </div>
          </Link>
        </Space>
      ),
    },
    {
      title: "Reviewer",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: IReview) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      sorter: true,
      render: (rating: number) => <Tag color="gold">{rating} ★</Tag>,
    },
    {
      title: "Review",
      dataIndex: "review",
      key: "review",
      render: (review: string) => (
        <Tooltip title={review}>
          <div className="max-w-xs truncate">{review}</div>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "isConfirmed",
      key: "status",
      render: (isConfirmed: boolean) => (
        <Tag
          color={isConfirmed ? "green" : "orange"}
          className="flex items-center w-fit gap-1"
        >
          {isConfirmed ? "Confirmed" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: IReview) => (
        <div className="flex gap-2">
          {hasUpdate && (
            <>
              {record.isConfirmed ? (
                <Tooltip title="Unconfirm">
                  <Button
                    icon={<FiCheck />}
                    size="small"
                    style={{
                      backgroundColor: "#16a34a",
                      color: "white",
                      borderColor: "#16a34a",
                    }}
                    onClick={() => handleUnconfirm(record.id)}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Confirm">
                  <Button
                    icon={<FiX />}
                    size="small"
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      borderColor: "#ef4444",
                    }}
                    onClick={() => handleConfirm(record.id)}
                  />
                </Tooltip>
              )}
            </>
          )}
          {(hasUpdate || hasDelete) && (
            <Dropdown overlay={actionMenu(record)} trigger={["click"]}>
              <Button icon={<FiMoreVertical />} type="text" size="small" />
            </Dropdown>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageMeta title="Reviews | ERP" description="Manage Customer Reviews" />
      <PageHeader
        title="Reviews"
        subtitle="Manage customer reviews and ratings"
        breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Reviews" }]}
        extra={
          <div className="flex items-center gap-3">
            <CustomActionButton
              onClick={() => refetch()}
              text="Refresh"
              icon={<RefreshCcw />}
              type="default"
            />
          </div>
        }
      />

      <div className="flex justify-between gap-4 mb-4 flex-wrap">
        <Input
          placeholder="Search reviews..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          className="w-full md:max-w-md flex-1"
          allowClear
        />
        <div className="flex gap-2 items-center">
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setStatus(value)}
            options={[
              { label: "Confirmed", value: "true" },
              { label: "Pending", value: "false" },
            ]}
          />
          <FilterColumn
            tableName="review_table"
            columns={columns}
            onChangeSelectedKeys={setSelectedColumnKeys}
          />
        </div>
      </div>

      <DataTable
        loading={isLoading || isFetching}
        data={reviews}
        columns={columns.filter(
          (c) =>
            selectedColumnKeys.length === 0 ||
            selectedColumnKeys.includes(c.key),
        )}
        rowKey="id"
        isPaginate={meta?.total > limit}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger={true}
        total={meta?.total || 0}
        onChange={handleTableChange}
      />

      <UpdateReviewModal
        open={openUpdateModal}
        setOpen={setOpenUpdateModal}
        review={selectedReview}
      />
    </div>
  );
};

export default ReviewList;
