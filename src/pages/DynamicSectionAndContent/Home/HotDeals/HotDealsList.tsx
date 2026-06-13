import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Tooltip } from "antd";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../../../components/common/Button/CustomActionButton";
import PageMeta from "../../../../components/common/Meta/PageMeta";
import PageHeader from "../../../../components/common/Navigation/PageHeader";

import { FilterDropdownProps } from "antd/es/table/interface";
import dayjs from "dayjs";
import SwitchStatus2 from "../../../../components/common/Forms/SwitchStatus2";
import CreateHotDealModal from "../../../../components/common/Modals/HotDeals/CreateHotDealModal";
import DetailsHotDealModal from "../../../../components/common/Modals/HotDeals/DetailsHotDealModal";
import UpdateHotDealModal from "../../../../components/common/Modals/HotDeals/UpdateHotDealModal";
import { DataTable } from "../../../../components/common/Tables";
import { useModulePermissions } from "../../../../hooks/usePermissions";
import {
  useDeleteHotDealMutation,
  useHotDealsListQuery,
  useUpdateHotDealMutation,
} from "../../../../redux/features/hotDeals/hoteDealsApi";
import { IHotDealData } from "../../../../types/product";

const HotDealsList = () => {
  const [openCreateHotDealModal, setOpenCreateHotDealModal] = useState(false);
  const [openUpdateHotDealModal, setOpenUpdateHotDealModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedHotDeal, setSelectedHotDeal] = useState<IHotDealData | null>(
    null,
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [deleteHotDeal] = useDeleteHotDealMutation();
  const [updateStatus] = useUpdateHotDealMutation();

  const { data, isLoading, isFetching } = useHotDealsListQuery([
    { name: "page", value: page },
  ]);

  const hotDeals = data?.data || [];
  const meta = data?.meta;
  const [limit, setLimit] = useState(10);

  // Delete hot deal
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this hot deal?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteHotDeal(id).unwrap();
          if (res.success) toast.success("Hot deal deleted successfully");
        } catch (err: any) {
          toast.error(err?.message || "Failed to delete hot deal");
        }
      },
    });
  };

  const { hasUpdate, hasDelete, hasCreate, hasView } =
    useModulePermissions("Hot Deals");

  const handleStatusChange = async (record: IHotDealData) => {
    try {
      setLoadingId(record.id ?? null);

      await updateStatus({
        id: record.id,
        data: {
          isActive: !record.isActive,
        },
      }).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "500px",
      render: (title: string) => {
        const truncated =
          title?.length > 20 ? `${title.substring(0, 20)}...` : title;
        return (
          <Tooltip
            style={{ whiteSpace: "nowrap" }}
            title={title?.length > 20 ? title : ""}
          >
            <span
              style={{ whiteSpace: "nowrap" }}
              className="font-medium text-gray-800 dark:text-white cursor-pointer"
            >
              {truncated}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      width: "300px",
      render: (product: any) => {
        const productName = product?.name || "N/A";
        const truncatedName =
          productName.length > 20
            ? `${productName.substring(0, 20)}...`
            : productName;
        return (
          <Tooltip
            style={{ whiteSpace: "nowrap" }}
            title={productName.length > 20 ? productName : ""}
          >
            <div
              style={{ whiteSpace: "nowrap" }}
              className="flex flex-col cursor-pointer"
            >
              <span
                style={{ whiteSpace: "nowrap" }}
                className="font-medium whitespace-pre-line text-gray-700 dark:text-white"
              >
                {truncatedName}
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Subtitle",
      dataIndex: "subtitle",
      key: "subtitle",
      width: "180px",
      render: (subtitle: string) => {
        const text = subtitle || "-";
        const truncated =
          text.length > 20 ? `${text.substring(0, 20)}...` : text;
        return (
          <Tooltip
            style={{ whiteSpace: "nowrap" }}
            title={text.length > 20 ? text : ""}
          >
            <span
              style={{ whiteSpace: "nowrap" }}
              className="cursor-pointer text-sm text-gray-600 dark:text-gray-300"
            >
              {truncated}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center" as const,
      render: (desc: string) => {
        const text = desc || "-";
        const truncated =
          text.length > 20 ? `${text.substring(0, 20)}...` : text;
        return (
          <Tooltip
            title={text.length > 20 ? text : ""}
            overlayInnerStyle={{
              maxHeight: 200,
              maxWidth: 300,
              overflowY: "auto",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            <span className="cursor-pointer text-gray-700 dark:text-gray-300">
              {truncated}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Deal Duration",
      key: "duration",
      width: "220px",
      render: (record: IHotDealData) => (
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <span className="text-xs">From:</span>
            <span style={{ whiteSpace: "nowrap" }} className="font-medium">
              {dayjs(record.startTime).format("DD MMM YYYY, hh:mm A")}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <span className="text-xs">To:</span>
            <span style={{ whiteSpace: "nowrap" }} className="font-medium">
              {dayjs(record.endTime).format("DD MMM YYYY, hh:mm A")}
            </span>
          </div>
        </div>
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
            { text: "In Active", value: "false" },
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
                    // ✅ Clear filters and instantly show all records
                    clearFilters?.();
                    confirm({ closeDropdown: true });
                  } else {
                    // ✅ Apply filter immediately
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
        return true; // ✅ "All" or undefined returns all records
      },
      filterMultiple: false,
      render: (isActive: boolean, record: IHotDealData) => (
        <SwitchStatus2
          disabled={!hasUpdate}
          checked={isActive}
          onChange={() => handleStatusChange(record)}
          loading={record?.id === loadingId}
        />
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "180px",
      render: (date: string) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {dayjs(date).format("DD MMM YYYY, hh:mm A")}
        </span>
      ),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    ...(hasUpdate || hasDelete
      ? [
          {
            title: "Action",
            key: "action",
            width: 150,
            fixed: "right",
            render: (record: IHotDealData) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setOpenUpdateHotDealModal(true);
                        setSelectedHotDeal(record);
                      }}
                    />
                  </Tooltip>
                )}
                {hasView && (
                  <Tooltip title="View Details">
                    <Button
                      icon={<FiEye className="text-blue-500" />}
                      onClick={() => {
                        setSelectedHotDeal(record);
                        setOpenDetailsModal(true);
                      }}
                    />
                  </Tooltip>
                )}
                {hasDelete && (
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      danger
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(record.id as string)}
                      style={{
                        color: "#dc2626",
                        border: "1px solid #dc2626",
                        padding: "4px",
                      }}
                    />
                  </Tooltip>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageMeta
        title="Hot Deals | UserKotha.Shop ERP"
        description="This is Hot Deals page"
      />

      <PageHeader
        title="Hot Deals"
        subtitle="View and manage all Hot Deals"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Hot Deals" },
        ]}
        extra={
          hasCreate ? (
            <CustomActionButton
              text="Add New"
              icon={<Plus />}
              type="primary"
              onClick={() => setOpenCreateHotDealModal(true)}
            />
          ) : null
        }
      />

      <DataTable
        loading={isLoading || isFetching}
        data={hotDeals}
        columns={columns}
        rowKey="id"
        currentPage={page}
        isPaginate={meta?.total > 10 && true}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger={meta?.total > 10 && true}
        total={meta?.total || 0}
      />

      {openCreateHotDealModal && (
        <CreateHotDealModal
          open={openCreateHotDealModal}
          setOpen={setOpenCreateHotDealModal}
        />
      )}
      {openUpdateHotDealModal && selectedHotDeal && (
        <UpdateHotDealModal
          open={openUpdateHotDealModal}
          setOpen={setOpenUpdateHotDealModal}
          data={selectedHotDeal}
        />
      )}
      {openDetailsModal && selectedHotDeal && (
        <DetailsHotDealModal
          open={openDetailsModal}
          setOpen={setOpenDetailsModal}
          data={selectedHotDeal}
        />
      )}
    </div>
  );
};

export default HotDealsList;
