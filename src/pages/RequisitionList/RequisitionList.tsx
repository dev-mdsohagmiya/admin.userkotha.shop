import { Input, Tabs, Tag, Tooltip } from "antd";
import { RefreshCcw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiEye, FiFileText, FiX } from "react-icons/fi";
import { MdPending } from "react-icons/md";
import { Link, useSearchParams } from "react-router-dom";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../components/common/Meta/PageMeta";
import RequisitionStatusModal from "../../components/common/Modals/RequisitionApproval/RequisitionStatusModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useGetRequisitionStatusQuery,
  useProductRequisitionListQuery,
} from "../../redux/features/requisition/requisitionApi";
import { debounce } from "../../utils/debounce";

const RequisitionsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const { allActions, isSuperAdmin } = useModulePermissions("Requisition List");

  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryParams: { name: string; value: string }[] = [
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
  ];
  if (searchText) {
    queryParams.push({ name: "search", value: searchText });
  }
  if (statusFilter && statusFilter !== "all") {
    queryParams.push({ name: "status", value: statusFilter });
  }

  const {
    data: requisitionData,
    isLoading,
    isFetching,
    refetch,
  } = useProductRequisitionListQuery(queryParams);
  const { data: stockStatusData, isLoading: stockLoading } =
    useGetRequisitionStatusQuery(undefined);

  const requisitions = requisitionData?.data || [];
  const stats = stockStatusData?.data || {};
  const meta = requisitionData?.meta || {};

  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<string | null>(
    null,
  );

  // const [openCreatePO, setOpenCreatePO] = useState(false);
  // const [selectedRequisitionForPO, setSelectedRequisitionForPO] =
  //   useState<any>(null);

  // debounce search
  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;

    const normalized = tabParam.toLowerCase();
    const allowedTabs = ["all", "pending", "approved", "rejected"];
    if (allowedTabs.includes(normalized) && normalized !== statusFilter) {
      setStatusFilter(normalized);
    }
  }, [searchParams, statusFilter]);
  // const handleConvertToPO = (record: any) => {
  //   setSelectedRequisitionForPO(record);
  //   setOpenCreatePO(true);
  // };

  // const actionMenu = (record: any) => (
  //   <Menu>
  //     <Menu.Item key="view" icon={<FiEye />}>
  //       <Link to={`/requisition/${record.id}`}>View Details</Link>
  //     </Menu.Item>

  //     {record.status === "pending" && (
  //       <>
  //         <Menu.Item
  //           key="approve"
  //           icon={<FiCheck />}
  //           onClick={() => handleApprove(record)}
  //         >
  //           Approve
  //         </Menu.Item>
  //         <Menu.Item
  //           key="reject"
  //           icon={<FiX />}
  //           danger
  //           onClick={() => handleReject(record)}
  //         >
  //           Reject
  //         </Menu.Item>
  //       </>
  //     )}

  //     {record.status === "approved" && (
  //       <Menu.Item
  //         key="convert"
  //         icon={<FiFileText />}
  //         onClick={() => handleConvertToPO(record)}
  //       >
  //         Create Purchase Order
  //       </Menu.Item>
  //     )}
  //   </Menu>
  // );

  const columns = [
    {
      title: "Req Number",
      dataIndex: "requisitionNumber",
      key: "requisitionNumber",
      render: (num: string) => <p className="">{num}</p>,
    },

    {
      title: "Product Name",
      key: "productName",
      render: (_: any, record: any) => {
        const productName =
          record.product?.name || record.comboProduct?.name || "-";
        const isCombo = !!record.comboProductId;

        return (
          <div className="flex items-center gap-2">
            <span>{productName}</span>
            {isCombo && (
              <Tag color="purple" className="text-xs">
                COMBO
              </Tag>
            )}
          </div>
        );
      },
    },

    // {
    //   title: "Purpose",
    //   dataIndex: "purpose",
    //   key: "purpose",
    //   render: (purpose: string) => (
    //     <Tooltip title={purpose}>
    //       <Text ellipsis style={{ maxWidth: 100 }}>
    //         {purpose}
    //       </Text>
    //     </Tooltip>
    //   ),
    // },
    {
      title: "Batch Size",
      dataIndex: "batchSize",
      key: "batchSize",
      render: (size: number, record: any) => {
        const unit =
          record?.product?.unit?.symbol ||
          record?.product?.unit?.name ||
          record?.comboProduct?.baseUnit?.symbol ||
          record?.comboProduct?.baseUnit?.name ||
          "";
        return `${size} ${unit}`;
      },
      sorter: (a: { batchSize: number }, b: { batchSize: number }) =>
        a.batchSize - b.batchSize,
      defaultSortOrder: "ascend",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items: any[]) => (
        <div style={{ whiteSpace: "nowrap" }}>{items.length} materials</div>
      ),
    },
    {
      title: "Total Qty",
      key: "totalQty",
      render: (_: any, record: any) => {
        const total = record.items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        );
        return total.toFixed(2);
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "100px",
      render: (status: string, record: any) => {
        let bgColor = "";
        let textColor = "white";

        switch (status) {
          case "approved":
            bgColor = "green";
            break;
          case "pending":
            bgColor = "orange";
            break;
          case "rejected":
            bgColor = "red";
            break;
          default:
            bgColor = "gray";
            textColor = "black";
        }

        return (
          <Tag
            style={{
              backgroundColor: bgColor,
              color: textColor,
              borderRadius: 4,
            }}
          >
            <Tooltip
              title={record?.approvalComments && record?.approvalComments}
            >
              <button
                onClick={() => {
                  setOpenStatusModal(true);
                  setSelectedRequisition(record.id as string);
                }}
                disabled={status.toLowerCase() !== "pending"} // disable if status is reject
              >
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </button>
            </Tooltip>
          </Tag>
        );
      },
    },
    {
      title: "Requested Date",
      dataIndex: "requisitionDate",
      key: "requisitionDate",
      render: (requisitionDate: string) => (
        <span>
          {new Date(requisitionDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Link
              className="px-2 pt-1.5 pb-1 border border-gray-400 rounded-md"
              to={`/requisition/${record.id}`}
            >
              <FiEye className="text-gray-700" />
            </Link>
          </Tooltip>
          {/* {record.status === "approved" && (
            <Tooltip title="Create Purchase Order">
              <button
                className="px-2 pt-1.5 pb-1 border border-gray-400 rounded-md"
                onClick={() => handleConvertToPO(record)}
              >
                <FiFileText className="text-gray-700" />
              </button>
            </Tooltip>
          )} */}
        </div>
      ),
    },
  ];

  const printableData = requisitions.map((req: any) => {
    const productName = req.product?.name || req.comboProduct?.name || "-";
    const unit =
      req.product?.unit?.symbol || req.comboProduct?.baseUnit?.symbol || "";
    const isCombo = !!req.comboProductId;

    return {
      "Req Number": req.requisitionNumber,
      "Product Name": isCombo ? `${productName} (COMBO)` : productName,
      "Batch Size": `${req.batchSize} ${unit}`,
      Items: req.items.length,
      "Total Qty": req.items
        .reduce((sum: number, i: any) => sum + i.quantity, 0)
        .toFixed(2),
      Status: req.status.charAt(0).toUpperCase() + req.status.slice(1),
      "Requested Date": new Date(req.requisitionDate).toLocaleDateString(
        "en-GB",
      ),
    };
  });

  return (
    <div>
      <PageMeta
        title="Requisitions | ERP"
        description="Manage Material Requisitions"
      />
      <div className="">
        <PageHeader
          title="Material Requisitions"
          subtitle="Review, approve, and manage material requisitions"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Requisitions" },
          ]}
          extra={
            <>
              <PageListPrint
                tableData={printableData}
                fileName="requisition-list"
              />

              <CustomActionButton
                disabled={meta?.total === 0 ? true : false}
                onClick={() => {
                  refetch();
                }}
                text="Refresh"
                icon={<RefreshCcw />}
                type="primary"
              />
            </>
          }
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <PageHeaderCard
            icon={<FiFileText />}
            color="blue"
            title="Total Requisitions"
            value={stats.totalRequisitions}
          />

          <PageHeaderCard
            icon={<MdPending />}
            color="purple"
            title="Pending"
            value={stats.pendingRequisitions}
          />

          <PageHeaderCard
            icon={<FiCheck />}
            color="green"
            title="Approved"
            value={stats.approvedRequisitions}
          />

          <PageHeaderCard
            icon={<FiX />}
            color="red"
            title="Rejected"
            value={stats.rejectedRequisitions}
          />
        </div>

        {/* Status Tabs */}
        <div className="mb-2">
          {(() => {
            const tabPermissionMap: Record<string, string> = {
              all: "view_all",
              pending: "view_pending",
              approved: "view_approved",
              rejected: "view_rejected",
            };

            const fullTabItems = [
              {
                label: (
                  <span
                    className="flex items-center gap-2"
                    style={{
                      color: statusFilter === "all" ? "#ff3d0a" : "black",
                      fontWeight: statusFilter === "all" ? "600" : "500",
                    }}
                  >
                    All Requisitions
                    <Tag
                      style={{
                        backgroundColor:
                          statusFilter === "all" ? "#ff3d0a" : "#9e9e9e",
                        color: "white",
                        borderRadius: "9999px",
                        border: "none",
                        margin: 0,
                      }}
                    >
                      {stats.totalRequisitions || 0}
                    </Tag>
                  </span>
                ),
                key: "all",
              },
              {
                label: (
                  <span
                    className="flex items-center gap-2"
                    style={{
                      color: statusFilter === "pending" ? "#ff3d0a" : "black",
                      fontWeight: statusFilter === "pending" ? "600" : "500",
                    }}
                  >
                    Pending
                    <Tag
                      style={{
                        backgroundColor:
                          statusFilter === "pending" ? "#ff3d0a" : "#9e9e9e",
                        color: "white",
                        borderRadius: "9999px",
                        border: "none",
                        margin: 0,
                      }}
                    >
                      {stats.pendingRequisitions || 0}
                    </Tag>
                  </span>
                ),
                key: "pending",
              },
              {
                label: (
                  <span
                    className="flex items-center gap-2"
                    style={{
                      color: statusFilter === "approved" ? "#ff3d0a" : "black",
                      fontWeight: statusFilter === "approved" ? "600" : "500",
                    }}
                  >
                    Approved
                    <Tag
                      style={{
                        backgroundColor:
                          statusFilter === "approved" ? "#ff3d0a" : "#9e9e9e",
                        color: "white",
                        borderRadius: "9999px",
                        border: "none",
                        margin: 0,
                      }}
                    >
                      {stats.approvedRequisitions || 0}
                    </Tag>
                  </span>
                ),
                key: "approved",
              },
              {
                label: (
                  <span
                    className="flex items-center gap-2"
                    style={{
                      color: statusFilter === "rejected" ? "#ff3d0a" : "black",
                      fontWeight: statusFilter === "rejected" ? "600" : "500",
                    }}
                  >
                    Rejected
                    <Tag
                      style={{
                        backgroundColor:
                          statusFilter === "rejected" ? "#ff3d0a" : "#9e9e9e",
                        color: "white",
                        borderRadius: "9999px",
                        border: "none",
                        margin: 0,
                      }}
                    >
                      {stats.rejectedRequisitions || 0}
                    </Tag>
                  </span>
                ),
                key: "rejected",
              },
            ];

            const tabItems = fullTabItems.filter((tab) => {
              if (isSuperAdmin) return true;
              const permission = tabPermissionMap[tab.key];
              return allActions.includes(permission);
            });

            // Set initial status filter if current one is not allowed
            if (
              tabItems.length > 0 &&
              !tabItems.find((t) => t.key === statusFilter)
            ) {
              const firstTab = tabItems[0].key;
              setStatusFilter(firstTab);
              const params = new URLSearchParams(searchParams);
              params.set("tab", firstTab);
              setSearchParams(params);
            }

            return (
              <Tabs
                activeKey={statusFilter}
                onChange={(key) => {
                  setStatusFilter(key);
                  setPage(1);
                  const params = new URLSearchParams(searchParams);
                  params.set("tab", key.toLowerCase());
                  setSearchParams(params);
                }}
                className="requisition-tabs"
                items={tabItems}
              />
            );
          })()}
        </div>

        {/* Filters */}
        <div className="mb-4">
          <div className="flex justify-between flex-wrap gap-4  items-center">
            <Input
              // disabled={meta?.total < 0}
              placeholder="Search requisitions..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              onChange={(e) => debounceSearch(e.target.value)}
              className="max-w-md"
              size="middle"
              allowClear
            />
            <div className="flex gap-3">
              <FilterColumn
                tableName="Requisitions_table"
                columns={columns}
                onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
              />
            </div>
          </div>
        </div>

        {/* Requisitions Table */}

        <DataTable
          loading={isLoading || isFetching || stockLoading}
          data={requisitions}
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
          rowKey="id"
          isPaginate={meta.total > 10 === true}
          currentPage={page}
          setCurrentPage={setPage}
          showSizeChanger={meta?.total > 10}
          limit={limit}
          setLimit={setLimit}
          total={meta?.total}
        />
      </div>

      {openStatusModal && selectedRequisition && (
        <RequisitionStatusModal
          open={openStatusModal}
          setOpen={setOpenStatusModal}
          requisitionId={selectedRequisition}
        />
      )}
      {/* {openCreatePO && selectedRequisitionForPO && (
        <CreatePurchaseOrderModal
          open={openCreatePO}
          setOpen={setOpenCreatePO}
          requisition={selectedRequisitionForPO}
        />
      )} */}
    </div>
  );
};

export default RequisitionsList;
