import {
  Badge,
  Button,
  Card,
  Dropdown,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { DisplayCurrency } from "../../utils/currency";
import {
  CheckCircle,
  MoreVertical,
  PackageCheck,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FiCheck, FiEye, FiShoppingCart, FiTruck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import MaterialReceivingModal from "../../components/common/Modals/material-receive/MaterialReceivingModal";
import PODetailsModal from "../../components/common/Modals/purchase-order/PODetailsModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { purchaseOrderStorage } from "../../moc/localStorageUtils";

const { Title, Text } = Typography;
const { Option } = Select;

const PurchaseOrdersList = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openReceiving, setOpenReceiving] = useState(false);
  const [selectedPOForReceiving, setSelectedPOForReceiving] =
    useState<any>(null);

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = () => {
    const allPOs = purchaseOrderStorage.getAllPOs();
    setPurchaseOrders(allPOs);
  };

  const handleReceiveMaterials = (po: any) => {
    setSelectedPOForReceiving(po);
    setOpenReceiving(true);
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchText.toLowerCase()) ||
      po.requisitionNumber.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === "all" || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (poId: string, newStatus: string) => {
    const updated = purchaseOrderStorage.updatePOStatus(poId, newStatus as any);
    if (updated) {
      toast.success(`PO ${updated.poNumber} status updated to ${newStatus}!`);
      loadPurchaseOrders();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "default";
      case "sent":
        return "blue";
      case "confirmed":
        return "orange";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FiShoppingCart />;
      case "sent":
        return <FiTruck />;
      case "confirmed":
        return <FiCheck />;
      case "delivered":
        return <CheckCircle size={14} />;
      case "cancelled":
        return <XCircle size={14} />;
      default:
        return <ShoppingCart size={14} />;
    }
  };

  const getActionMenuItems = (record: any) => {
    const items = [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => {
          setSelectedPO(record);
          setOpenDetails(true);
        },
      },
    ];

    if (record.status === "draft") {
      items.push({
        key: "send",
        icon: <FiTruck />,
        label: "Mark as Sent",
        onClick: () => handleStatusUpdate(record.id, "sent"),
      });
    }

    if (record.status === "sent") {
      items.push({
        key: "confirm",
        icon: <FiCheck />,
        label: "Mark as Confirmed",
        onClick: () => handleStatusUpdate(record.id, "confirmed"),
      });
    }

    if (record.status === "confirmed") {
      items.push({
        key: "deliver",
        icon: <CheckCircle size={14} />,
        label: "Mark as Delivered",
        onClick: () => handleStatusUpdate(record.id, "delivered"),
      });
    }

    if (record.status === "confirmed" || record.status === "delivered") {
      items.push({
        key: "receive",
        icon: <PackageCheck size={14} />,
        label: "Receive Materials",
        onClick: () => handleReceiveMaterials(record),
      });
    }

    if (record.status === "draft" || record.status === "sent") {
      items.push({
        key: "cancel",
        icon: <FiX />,
        label: "Cancel PO",
        onClick: () => handleStatusUpdate(record.id, "cancelled"),
      });
    }

    return items;
  };

  const columns = [
    {
      title: "PO Number",
      dataIndex: "poNumber",
      key: "poNumber",
      render: (num: string) => <Tag color="blue">{num}</Tag>,
    },
    {
      title: "Requisition",
      dataIndex: "requisitionNumber",
      key: "requisitionNumber",
      render: (num: string) => <Text type="secondary">{num}</Text>,
    },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items: any[]) => `${items.length} items`,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <Text strong>
          <DisplayCurrency amount={amount} />
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          color={getStatusColor(status)}
          text={
            <Space>
              {getStatusIcon(status)}
              <span>{status.toUpperCase()}</span>
            </Space>
          }
        />
      ),
    },
    {
      title: "PO Date",
      dataIndex: "poDate",
      key: "poDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Expected Delivery",
      dataIndex: "expectedDelivery",
      key: "expectedDelivery",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button
              icon={<FiEye />}
              size="small"
              onClick={() => {
                setSelectedPO(record);
                setOpenDetails(true);
              }}
            />
          </Tooltip>

          {record.status === "draft" && (
            <Tooltip title="Mark as Sent">
              <Button
                icon={<FiTruck />}
                size="small"
                type="primary"
                onClick={() => handleStatusUpdate(record.id, "sent")}
              />
            </Tooltip>
          )}

          {record.status === "sent" && (
            <Tooltip title="Mark as Confirmed">
              <Button
                icon={<FiCheck />}
                size="small"
                type="primary"
                onClick={() => handleStatusUpdate(record.id, "confirmed")}
              />
            </Tooltip>
          )}

          {record.status === "confirmed" && (
            <Tooltip title="Mark as Delivered">
              <Button
                icon={<CheckCircle size={14} />}
                size="small"
                type="primary"
                onClick={() => handleStatusUpdate(record.id, "delivered")}
              />
            </Tooltip>
          )}

          {(record.status === "confirmed" || record.status === "delivered") && (
            <Tooltip title="Receive Materials">
              <Button
                icon={<PackageCheck size={14} />}
                size="small"
                type="primary"
                onClick={() => handleReceiveMaterials(record)}
              >
                Receive
              </Button>
            </Tooltip>
          )}

          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={["click"]}
          >
            <Button icon={<MoreVertical size={14} />} size="small" />
          </Dropdown>
        </div>
      ),
    },
  ];

  const stats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter((po) => po.status === "draft").length,
    sent: purchaseOrders.filter((po) => po.status === "sent").length,
    confirmed: purchaseOrders.filter((po) => po.status === "confirmed").length,
    delivered: purchaseOrders.filter((po) => po.status === "delivered").length,
  };

  return (
    <div>
      <PageMeta
        title="Purchase Orders | ERP"
        description="Manage Purchase Orders"
      />

      <PageHeader
        title="Purchase Orders"
        subtitle="Manage and track all purchase orders"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Purchase Orders" },
        ]}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Card className="text-center">
          <Title level={3} className="text-gray-600">
            {stats.total}
          </Title>
          <Text>Total POs</Text>
        </Card>
        <Card className="text-center">
          <Title level={3} className="text-primary-500">
            {stats.draft}
          </Title>
          <Text>Draft</Text>
        </Card>
        <Card className="text-center">
          <Title level={3} className="text-orange-500">
            {stats.sent}
          </Title>
          <Text>Sent</Text>
        </Card>
        <Card className="text-center">
          <Title level={3} className="text-green-500">
            {stats.confirmed}
          </Title>
          <Text>Confirmed</Text>
        </Card>
        <Card className="text-center">
          <Title level={3} className="text-purple-500">
            {stats.delivered}
          </Title>
          <Text>Delivered</Text>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <Input
            placeholder="Search POs by number, supplier..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
            allowClear
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full md:w-40"
            placeholder="Filter by status"
          >
            <Option value="all">All Status</Option>
            <Option value="draft">Draft</Option>
            <Option value="sent">Sent</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>

          <div className="flex-1" />

          <Text type="secondary">
            Showing {filteredPOs.length} of {purchaseOrders.length} POs
          </Text>
        </div>
      </Card>

      {/* POs Table */}
      <Card>
        <DataTable
          data={filteredPOs}
          columns={columns}
          rowKey="id"
          isPaginate={true}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          total={filteredPOs.length}
        />
      </Card>

      {/* PO Details Modal */}
      {openDetails && selectedPO && (
        <PODetailsModal
          open={openDetails}
          setOpen={setOpenDetails}
          purchaseOrder={selectedPO}
          onStatusChange={loadPurchaseOrders}
        />
      )}

      {/* Material Receiving Modal */}
      {openReceiving && selectedPOForReceiving && (
        <MaterialReceivingModal
          open={openReceiving}
          setOpen={setOpenReceiving}
          purchaseOrder={selectedPOForReceiving}
          onSuccess={loadPurchaseOrders}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersList;
