import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Tooltip } from "antd";
import { RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiPhone, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteSubscribeMutation,
  useGetSubscribeListQuery,
} from "../../redux/features/subscribe/subscribeApi";
import { ISubscribe } from "../../types/subscribe";
import { debounce } from "../../utils/debounce";

const CommentsList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { hasDelete } = useModulePermissions("Comments");

  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);

  // API Hooks
  const {
    data: subscribeData,
    isLoading,
    refetch,
    isFetching,
  } = useGetSubscribeListQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    { name: "sortBy", value: sortBy },
    { name: "sortOrder", value: sortOrder },
    searchText && { name: "search", value: searchText },
  ]);

  const [deleteSubscribe] = useDeleteSubscribeMutation();

  const subscribers = subscribeData?.data || [];
  const meta = subscribeData?.meta || {};

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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this comment?",
      content: "This action cannot be undone.",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteSubscribe(id).unwrap();
          if (res.success) toast.success("Comment deleted successfully");
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to delete comment");
        }
      },
    });
  };

  const columns = [
    {
      title: "SL",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
      width: 50,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name || "N/A"}</span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => (
        <div className="flex items-center gap-2">
          <span>{phone || "N/A"}</span>
          {phone && (
            <div className="flex items-center gap-2">
              <Tooltip title="Call Now">
                <a
                  href={`tel:${phone}`}
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <FiPhone className="text-sm" />
                </a>
              </Tooltip>
              <Tooltip title="WhatsApp">
                <a
                  href={`https://wa.me/${
                    phone.replace(/\D/g, "").startsWith("88")
                      ? phone.replace(/\D/g, "")
                      : "88" + phone.replace(/\D/g, "")
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-500 hover:text-green-600 transition-colors"
                >
                  <FaWhatsapp className="text-[16px]" />
                </a>
              </Tooltip>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (comment: string) => (
        <Tooltip title={comment}>
          <span className="truncate max-w-[200px] block">
            {comment || "N/A"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date: string) => (
        <span className="text-sm">
          {new Date(date).toLocaleDateString()}{" "}
          <span className="text-gray-400">
            {new Date(date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: ISubscribe) => (
        <div className="flex gap-2">
          {hasDelete && (
            <Tooltip title="Delete">
              <Button
                icon={<FiTrash2 />}
                size="small"
                danger
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
      <PageMeta title="Comments | ERP" description="Manage Comments" />
      <PageHeader
        title="Comments"
        subtitle="Manage comments"
        breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Comments" }]}
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
          placeholder="Search comments..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          className="w-full md:max-w-md flex-1"
          allowClear
        />
        <div className="flex gap-2 items-center">
          <FilterColumn
            tableName="subscribe_table"
            columns={columns}
            onChangeSelectedKeys={setSelectedColumnKeys}
          />
        </div>
      </div>

      <DataTable
        loading={isLoading || isFetching}
        data={subscribers}
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
    </div>
  );
};

export default CommentsList;
