import { Tag, Card, Statistic, Row, Col, Descriptions, Spin } from "antd";
import { Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { FiPackage } from "react-icons/fi";
import PageMeta from "../../components/common/Meta/PageMeta";
import { useParams } from "react-router-dom";
import RowMaterialChart from "../../components/common/Charts/RowMataerialChart";
import { TbCoinTaka, TbCoinTakaFilled } from "react-icons/tb";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import { StockOutlined, RiseOutlined, FundOutlined } from "@ant-design/icons";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { useGetMaterialByIdQuery } from "../../redux/features/material/materialApi";
import { IMaterial } from "../../types/material";
import { DisplayCurrency } from "../../utils/currency";
// --- utility ---

const DetailsRawMaterial = () => {
  const { id } = useParams<{ id: string }>();

  const { data: rawMaterialData, isLoading } = useGetMaterialByIdQuery(
    id as string,
  );

  const rawMaterial = rawMaterialData?.data as IMaterial | undefined;

  const getStockStatus = (material: IMaterial) => {
    const currentStock = Number(material?.currentStock) || 0;
    const minStock = Number(material?.minStock) || 0;

    if (currentStock <= 0) {
      return {
        status: "Out of Stock",
        color: "red",
        icon: <XCircle className="w-3 h-3" />,
      };
    } else if (currentStock <= minStock) {
      return {
        status: "Low Stock",
        color: "orange",
        icon: <AlertTriangle className="w-3 h-3" />,
      };
    } else {
      return {
        status: "In Stock",
        color: "green",
        icon: <CheckCircle className="w-3 h-3" />,
      };
    }
  };

  const getStockPercentage = () => {
    if (!rawMaterial) return 0;
    const currentStock = Number(rawMaterial.currentStock) || 0;
    const maxStock = Number(rawMaterial.maxStock) || 1;
    return Math.min((currentStock / maxStock) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!rawMaterial) {
    return (
      <div className="text-center text-gray-600 mt-10">
        No raw material data found.
      </div>
    );
  }

  // ---- compute stats ----
  const currentStock = Number(rawMaterial.currentStock) || 0;
  const minStock = Number(rawMaterial.minStock) || 0;
  const maxStock = Number(rawMaterial.maxStock) || 0;
  const unitPrice = Number(rawMaterial.averageCost) || 0;
  const totalValue = currentStock * unitPrice;

  const stockStatus = getStockStatus(rawMaterial);

  // fake example stats for now
  const statsData = {
    totalStock: currentStock,
    totalValue: totalValue,
  };

  return (
    <div className="relative">
      <PageMeta
        title={`${rawMaterial.name} - Raw Material Details | Amzad Food ERP`}
        description={`Details for ${rawMaterial.name} raw material`}
      />

      <PageHeader
        title="Raw Material Details"
        subtitle="View and manage raw material information"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Raw Materials", path: "/raw-materials" },
          { title: rawMaterial?.name || "Unknown Material" },
        ]}
      />
      {/* === Top Stats Cards === */}

      <Row gutter={[16, 16]} className="mb-8">
        {/* Total Stock */}
        <Col xs={24} sm={12} lg={6}>
          <PageHeaderCard
            icon={<StockOutlined style={{ fontSize: "24px", color: "#fff" }} />}
            title="Total Stock"
            value={`${statsData.totalStock} ${rawMaterial.unit?.symbol || ""}`}
            color="cyan"
          />
        </Col>

        {/* Current Stock */}
        <Col xs={24} sm={12} lg={6}>
          <PageHeaderCard
            icon={<RiseOutlined style={{ fontSize: "24px", color: "#fff" }} />}
            title="Current Stock"
            value={rawMaterial.currentStock}
            color="green"
          />
        </Col>

        {/* Max Stock */}
        <Col xs={24} sm={12} lg={6}>
          <PageHeaderCard
            icon={<FundOutlined style={{ fontSize: "24px", color: "#fff" }} />}
            title="Max Stock"
            value={rawMaterial.maxStock}
            color="purple"
          />
        </Col>

        {/* Average Cost */}
        <Col xs={24} sm={12} lg={6}>
          <PageHeaderCard
            icon={
              <TbCoinTakaFilled style={{ fontSize: "24px", color: "#fff" }} />
            }
            title="Average Cost"
            value={<DisplayCurrency amount={rawMaterial?.averageCost} />}
            color="indigo"
          />
        </Col>
      </Row>
      {/* === Details Section === */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <FiPackage className="text-primary-600 text-xl" />
                </div>
                <span>Basic Information</span>
              </div>
            }
            className="h-full shadow-sm"
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Material Name">
                <span className="font-semibold text-gray-900">
                  {rawMaterial.name}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Material Code">
                <Tag color="blue" className="font-mono">
                  {rawMaterial.code || "N/A"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Category">
                <span className="text-gray-700">
                  {rawMaterial.category?.name || "Uncategorized"}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Description">
                <span className="text-gray-700">
                  {rawMaterial.description || "No description available"}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag
                  color={rawMaterial.isActive ? "green" : "red"}
                  className="text-xs"
                >
                  {rawMaterial.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Stock Status">
                <Tag
                  color={stockStatus.color}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {stockStatus.icon}
                  {stockStatus.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Package className="text-green-600 text-xl" />
                </div>
                <span>Stock & Pricing</span>
              </div>
            }
            className="h-full shadow-sm"
          >
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Card className="text-center border-0 bg-gray-50">
                  <Statistic
                    title="Current Stock"
                    value={currentStock}
                    prefix={<Package className="w-4 h-4 text-primary-600" />}
                    valueStyle={{
                      color: currentStock <= minStock ? "#ef4444" : "#10b981",
                    }}
                  />
                </Card>
              </Col>

              <Col xs={12}>
                <Card className="text-center border-0 bg-gray-50">
                  <Statistic
                    title="Unit Price"
                    value={unitPrice}
                    prefix={<TbCoinTaka className="w-4 h-4 text-green-600" />}
                    valueStyle={{ color: "#10b981" }}
                    precision={2}
                  />
                </Card>
              </Col>
            </Row>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Stock Level</span>
                <span>
                  {currentStock} / {maxStock}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    currentStock <= minStock
                      ? "bg-red-500"
                      : currentStock >= maxStock * 0.9
                        ? "bg-primary-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${getStockPercentage()}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Empty</span>
                <span>Full</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-primary-900 font-semibold">
                  Total Inventory Value:
                </span>
                <span className="text-primary-900 font-bold text-lg">
                  <DisplayCurrency amount={totalValue} />
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <Card
        style={{ marginTop: "25px" }}
        title="Purchase Chart"
        className="shadow-sm"
      >
        <RowMaterialChart />
      </Card>
      {rawMaterial.notes && (
        <Card title="Notes" className="mt-4 shadow-sm">
          <p className="text-gray-700 whitespace-pre-wrap">
            {rawMaterial.notes}
          </p>
        </Card>
      )}
    </div>
  );
};

export default DetailsRawMaterial;
