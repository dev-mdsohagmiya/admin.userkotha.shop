import { EyeOutlined, SettingOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Image,
  Row,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { config } from "../../config";

const { Text } = Typography;

import { Edit } from "lucide-react";
import { Autoplay } from "swiper/modules";
import RichText from "../../components/shared/RichTextPreview";
import ComboProductDetailsSkeleton from "../../components/skeleton/ComboProductDetailsSkeleton";
import { useModulePermissions } from "../../hooks/usePermissions";
import { Plan, Variant } from "../../icons";
import { useGetComboProductByIdQuery } from "../../redux/features/comboProduct/comboProductApi";
import { DisplayCurrency } from "../../utils/currency";
import { moduleHasAction } from "../../utils/permissions";

const DetailsComboProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { data: comboProductInfo, isLoading } = useGetComboProductByIdQuery(
    id as string,
  );

  const comboProduct = useMemo(
    () => comboProductInfo?.data || {},
    [comboProductInfo?.data],
  );

  const [variant, setVariant] = useState<any | null>(null);
  const [showImage, setShowImage] = useState<any>(null);

  useEffect(() => {
    if (comboProduct?.variants && comboProduct.variants.length > 0) {
      // If no variant is selected, find the one with the highest price
      if (!variant) {
        const maxPriceVariant = comboProduct.variants.reduce(
          (prev: any, current: any) => {
            return prev.sellingPrice > current.sellingPrice ? prev : current;
          },
        );
        setVariant(maxPriceVariant);
      } else {
        // Sync the current variant with the latest data from comboProduct
        const updatedVariant = comboProduct.variants.find(
          (v: any) => v.id === variant.id,
        );
        if (updatedVariant) {
          setVariant(updatedVariant);
        }
      }
    }
  }, [comboProduct, variant]);

  useEffect(() => {
    if (variant) {
      if (variant.thumbnail) {
        setShowImage(variant.thumbnail);
      } else if (variant.images && variant.images.length > 0) {
        setShowImage(variant.images[0]);
      }
    } else {
      if (comboProduct?.thumbnail) {
        setShowImage(comboProduct.thumbnail);
      } else if (comboProduct?.images && comboProduct.images.length > 0) {
        setShowImage(comboProduct.images[0]);
      }
    }
  }, [variant, comboProduct]);

  // Calculate min and max price

  // State for sales chart
  // const [salesPeriod, setSalesPeriod] = useState<
  //   "monthly" | "weekly" | "daily"
  // >("monthly");

  // Calculate statistics with safe defaults
  // const statsData = {
  //   totalStock:
  //     comboProduct?.variants?.reduce(
  //       (sum: any, v: { currentStock: any }) => sum + (v.currentStock || 0),
  //       0
  //     ) || 0,
  //   totalValue:
  //     comboProduct?.variants?.reduce(
  //       (
  //         sum: number,
  //         v: {
  //           currentStock: number;
  //           discountedPrice?: number;
  //           sellingPrice: number;
  //         }
  //       ) =>
  //         sum +
  //         (v.currentStock || 0) * (v.discountedPrice || v.sellingPrice || 0),
  //       0
  //     ) || 0,
  //   variantsCount: comboProduct?.variants?.length || 0,
  //   avgDiscount: comboProduct?.variants?.length
  //     ? comboProduct.variants.reduce(
  //         (sum: number, v: { sellingPrice: number; discountedPrice: number }) =>
  //           sum +
  //           ((v.sellingPrice - (v.discountedPrice || v.sellingPrice)) /
  //             v.sellingPrice) *
  //             100,
  //         0
  //       ) / comboProduct.variants.length
  //     : 0,
  // };

  // Format currency in Bangladeshi Taka

  const { hasUpdate, allActions, isSuperAdmin } =
    useModulePermissions("Combo Products");

  // Combine all images safely
  const allImages = (
    variant
      ? [
          ...(variant?.thumbnail ? [variant.thumbnail] : []),
          ...(variant?.images || []),
        ]
      : [
          ...(comboProduct?.thumbnail ? [comboProduct.thumbnail] : []),
          ...(comboProduct?.images || []),
        ]
  ).filter((img) => img && img.url);

  // Sales chart configuration
  // const salesChartOptions: ApexOptions = {
  //   chart: {
  //     type: "area",
  //     height: 350,
  //     toolbar: { show: false },
  //     background: "transparent",
  //   },
  //   colors: ["#3B82F6"],
  //   dataLabels: { enabled: false },
  //   stroke: {
  //     curve: "smooth",
  //     width: 3,
  //   },
  //   fill: {
  //     type: "gradient",
  //     gradient: {
  //       shade: "light",
  //       type: "vertical",
  //       opacityFrom: 0.4,
  //       opacityTo: 0.1,
  //     },
  //   },
  //   xaxis: {
  //     categories: salesData[salesPeriod].labels,
  //     labels: {
  //       style: { colors: "#64748B", fontSize: "12px" },
  //     },
  //     axisBorder: { show: false },
  //     axisTicks: { show: false },
  //   },
  //   yaxis: {
  //     labels: {
  //       style: { colors: "#64748B", fontSize: "12px" },
  //       formatter: (value) => `${value}`,
  //     },
  //   },
  //   grid: {
  //     borderColor: "#F1F5F9",
  //     strokeDashArray: 3,
  //   },
  //   tooltip: {
  //     theme: "light",
  //     y: {
  //       formatter: (value) => `${value} units`,
  //     },
  //   },
  // };

  // const salesChartSeries = [
  //   {
  //     name: "Sales Volume",
  //     data: salesData[salesPeriod].data,
  //   },
  // ];

  // Combo composition table columns
  const compositionColumns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (product: any) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{product?.name}</span>
          <Tag className="!bg-orange-600 !text-white">
            {product?.category?.name}
          </Tag>
        </div>
      ),
    },
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
      render: (variant: any) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{variant?.name}</span>
          <Tag className="!bg-green-600 !text-white">{variant?.sku}</Tag>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => (
        <div className="flex items-center gap-1">
          <span className="font-semibold text-lg">{quantity}</span>
          <span className="text-gray-500">×</span>
        </div>
      ),
    },
    {
      title: "Unit",
      dataIndex: "product",
      key: "unit",
      render: (product: any) => (
        <Tag className="!bg-primary !text-white">
          {product?.baseUnit?.symbol}
        </Tag>
      ),
    },
  ];

  const packagingBOMColumns = [
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Quantity",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage: number, record: any) => (
        <span className="font-semibold">
          {percentage} {record.unitName}
        </span>
      ),
    },
    {
      title: "Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (stock: number) => (
        <Tag color={stock > 10 ? "green" : "red"}>{stock}</Tag>
      ),
    },
  ];

  // Show loading skeleton while fetching
  if (isLoading) {
    return <ComboProductDetailsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <PageMeta
        title={`${comboProduct?.name || "Combo Product"} | ERP`}
        description="Combo Product Details"
      />

      {/* Header Section */}
      <PageHeader
        title="Combo Product Details"
        subtitle="Detailed view of the combo product"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Combo Products", path: "/combo-products" },
          { title: comboProduct?.name || "Combo Product" },
        ]}
        extra={
          <div className="flex flex-wrap items-center gap-3">
            {/* Planning */}
            {(isSuperAdmin || moduleHasAction(allActions, "planning")) &&
              comboProduct?.isPlan && (
                <Tooltip title="Production Planning">
                  <Link to={`/combo-product/${comboProduct.id}/planning`}>
                    <Button
                      type="primary"
                      className="flex items-center gap-2 hover:border-blue-600 hover:text-blue-600 transition"
                    >
                      <Plan className="!text-[18px]" /> Planning
                    </Button>
                  </Link>
                </Tooltip>
              )}

            {/* Packaging BOM */}
            {(isSuperAdmin ||
              moduleHasAction(allActions, "update packaging bom")) && (
              <Tooltip title="Manage Packaging Materials">
                <Link to={`/combo-product/${comboProduct.id}/packaging-bom`}>
                  <Button
                    type="primary"
                    className="flex items-center gap-2 hover:border-purple-600 hover:text-purple-600 transition"
                  >
                    <Variant className="!text-[18px]" /> Packaging BOM
                  </Button>
                </Link>
              </Tooltip>
            )}

            {/* Edit Combo Product */}
            {(isSuperAdmin || hasUpdate) && (
              <Tooltip title="Edit Combo Product">
                <Link
                  to={`/combo-product/update-combo-product/${comboProduct.id}`}
                >
                  <Button
                    type="primary"
                    className="flex items-center gap-2 hover:bg-blue-600 transition"
                  >
                    <Edit className="w-4 h-4" /> Edit Combo Product
                  </Button>
                </Link>
              </Tooltip>
            )}
          </div>
        }
      />

      {/* Main Content */}
      <div className="pb-8">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          {/* <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<Variant />}
              color="purple"
              title="Variants"
              value={statsData.variantsCount}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<StockOutlined />}
              color="blue"
              title="Total Stock"
              value={`${statsData.totalStock} ${
                comboProduct?.baseUnit?.symbol || ""
              }`}
            />
          </Col> */}
          {/* <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<TbCoinTaka />}
              color="green"
              title="Stock Value"
              value={formatCurrency(statsData.totalValue)}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<TbDiscountFilled />}
              color="indigo"
              title="Avg. Discount"
              value={`${statsData.avgDiscount.toFixed(1)}%`}
            />
          </Col> */}
        </Row>

        {/* Variant Selection Tabs (Top) */}

        {/* Combo Product Details */}
        <Row gutter={[24, 24]}>
          {/* Product Images */}
          <Col className="!pr-2 " xs={24} xl={10}>
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold text-xl">Combo Gallery</span>
                </div>
              }
              className="border border-gray-200"
              bodyStyle={{ padding: "20px" }}
            >
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <Image
                    width="100%"
                    height={320}
                    src={
                      showImage?.url
                        ? `${config.image_access_url}${showImage.url}`
                        : "/fallback-image.png"
                    }
                    alt={comboProduct?.name || "Combo Product"}
                    className="rounded-lg object-contain"
                    preview={{
                      maskClassName: "rounded-lg",
                      mask: (
                        <div className="flex items-center gap-2 text-white">
                          <EyeOutlined /> Preview
                        </div>
                      ),
                    }}
                  />
                </div>

                <div className="mt-4 relative">
                  {allImages.length > 0 && (
                    <div className="py-2 px-1">
                      <Swiper
                        modules={[Autoplay]}
                        navigation={false}
                        spaceBetween={12}
                        slidesPerView={4}
                        loop={allImages.length > 4}
                        autoplay={{
                          delay: 3000,
                          disableOnInteraction: false,
                        }}
                        onSlideChange={(swiper) =>
                          setShowImage(allImages[swiper.realIndex])
                        }
                        className="max-w-full mx-auto product-thumbnails-swiper"
                      >
                        {allImages
                          .slice(0, 9)
                          .map((img: any, index: number) => (
                            <SwiperSlide key={index} className="!h-auto py-1">
                              <div
                                onClick={() => setShowImage(img)}
                                className={`cursor-pointer border-2 rounded-xl overflow-hidden
              ${
                img === showImage
                  ? "border-green-600 shadow-md ring-2 ring-green-100"
                  : "border-gray-200 bg-white"
              }
            `}
                                style={{}} // Removed fixed height
                              >
                                <div className="aspect-square w-full h-full">
                                  <img
                                    src={`${config.image_access_url}${img?.url}`}
                                    alt={`${comboProduct?.name} preview ${index + 1}`}
                                    className="w-full h-full object-contain p-1 rounded-lg"
                                  />
                                </div>
                              </div>
                            </SwiperSlide>
                          ))}
                      </Swiper>
                      {/* Custom Styles for this specific swiper instance */}
                      <style>{`
                        .product-thumbnails-swiper {
                          padding: 4px;
                        }
                      `}</style>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>

          {/* Combo Product Information */}
          <Col className="!pl-2" xs={24} xl={14}>
            <Card className="border border-gray-200">
              {/* Product Title */}
              <h3
                className="!text-xl font-semibold -mb-2"
                style={{ color: "#16a34a" }}
              >
                {comboProduct?.name} {variant?.name && `- ${variant.name}`}
              </h3>

              {/* Final Price - Moved here */}
              <div className="mt-5 mb-2 flex items-center gap-6">
                <div>
                  {variant?.discountedPrice &&
                  variant.discountedPrice < variant.sellingPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-400 text-base font-semibold flex items-center">
                        <DisplayCurrency amount={variant?.sellingPrice} />
                      </span>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: "#16a34a",
                        }}
                      >
                        <DisplayCurrency amount={variant?.discountedPrice} />
                      </Text>
                    </div>
                  ) : (
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#16a34a",
                      }}
                    >
                      <DisplayCurrency amount={variant?.sellingPrice} />
                    </Text>
                  )}
                </div>

                <div className="bg-white border rounded py-0.5 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      In Stock
                    </span>
                    <span className="text-xs font-semibold text-gray-900 border-l pl-2">
                      {variant?.currentStock}
                    </span>
                  </div>
                </div>
              </div>
              <Divider
                className=""
                style={{ borderTop: "3px solid #16a34a", width: 64 }}
              />

              {/* Description */}
              {comboProduct?.shortDesc && (
                <RichText
                  content={comboProduct.shortDesc}
                  className="mb-4 text-gray-700 leading-relaxed text-base"
                />
              )}

              {/* Units Brand and Category */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all duration-300">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Category
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate m-0">
                    {comboProduct?.category?.name || "-"}
                  </p>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-300">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Brand
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate m-0">
                    {comboProduct?.brand?.name || "-"}
                  </p>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Base Unit
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate m-0">
                    {comboProduct?.baseUnit?.name || "-"}
                  </p>
                </div>
              </div>
              {/* Variant Selection Buttons */}
              <div className="flex flex-col gap-4 mt-8">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0">
                  Select Variant
                </p>
                <div className="flex gap-3 flex-wrap">
                  {comboProduct?.variants
                    ?.slice()
                    .sort(
                      (a: any, b: any) =>
                        b.conversionFactor - a.conversionFactor,
                    )
                    .map((v: any) => (
                      <Button
                        key={v.id}
                        onClick={() => setVariant(v)}
                        className={`flex items-center gap-2 h-10 px-4 rounded-lg transition-all duration-300 ${
                          v.id === variant?.id
                            ? "!border-2 !border-green-600 !bg-green-50 !text-green-700 !font-bold"
                            : "hover:!border-green-400 hover:!text-green-600 !text-gray-600 !font-medium"
                        }`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {v.name}
                        {v.packagingBOM?.length > 0 && (
                          <Badge
                            count={v.packagingBOM.length}
                            style={{
                              backgroundColor:
                                v.id === variant?.id ? "#16a34a" : "#8b5cf6",
                              fontSize: "10px",
                            }}
                            size="small"
                          />
                        )}
                      </Button>
                    ))}
                </div>
              </div>
              {/* Variant Selection */}
            </Card>
          </Col>

          {/* Combo Description */}
          <Col xs={24} className="-mt-2">
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold">Description</span>
                </div>
              }
              className="border border-gray-200"
            >
              <div className="prose max-w-none">
                {comboProduct?.detailedDesc ? (
                  <RichText
                    content={comboProduct.detailedDesc}
                    className="text-gray-700 leading-relaxed text-base"
                  />
                ) : (
                  <p className="text-gray-500">No description available.</p>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Sales Analytics Section */}
        {/* <Row gutter={[24, 24]} className="mt-4">
          <Col xs={24} xl={16} className="!pr-2">
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold">Sales Analytics</span>
                </div>
              }
              className="border-0 shadow-sm"
              extra={
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { key: "monthly", label: "Monthly" },
                    { key: "weekly", label: "Weekly" },
                    { key: "daily", label: "Daily" },
                  ].map((period) => (
                    <button
                      key={period.key}
                      onClick={() => setSalesPeriod(period.key as any)}
                      className={`px-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                        salesPeriod === period.key
                          ? "bg-white text-green-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              }
            >
              <Chart
                options={salesChartOptions}
                series={salesChartSeries}
                type="area"
                height={350}
              />
            </Card>
          </Col>

          <Col xs={24} xl={8} className="!pl-2">
            <Row>
              <Col xs={24} className="-mb-2">
                <PageHeaderCard
                  icon={<TrophyOutlined />}
                  color="green"
                  title="Total Sales"
                  value={`${salesData.monthly.data.reduce(
                    (a, b) => a + b,
                    0
                  )} ${comboProduct?.baseUnit?.name} `}
                />
              </Col>
              <Col xs={24} className="-mb-2">
                <PageHeaderCard
                  icon={<TbCoinTaka />}
                  color="cyan"
                  title="Revenue"
                  value={formatCurrency(statsData.totalValue * 1.2)}
                />
              </Col>
              <Col xs={24} className="-mb-2">
                <PageHeaderCard
                  icon={<RiseOutlined />}
                  color="orange"
                  title="Growth Rate"
                  value="12.5%"
                />
              </Col>
            </Row>
          </Col>
        </Row> */}

        {/* Combo Composition Section */}
        <Row gutter={[24, 24]} className="my-4">
          <Col xs={24}>
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold">Combo Composition</span>
                  <Badge
                    count={variant?.items?.length || 0}
                    showZero
                    color="#16a34a"
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              }
              className="border border-gray-200"
              extra={
                <div className="text-right">
                  <p className="text-sm font-semibold text-black">
                    Items in {variant?.name}
                  </p>
                  <div className="text-lg font-bold text-green-600">
                    {variant?.items?.length || 0} Products
                  </div>
                </div>
              }
            >
              {variant?.items && variant.items.length > 0 ? (
                <Table
                  columns={compositionColumns}
                  dataSource={variant.items}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <div className="flex items-center gap-2 font-semibold">
                            Total Items: {variant.items.length}
                          </div>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <div className="font-bold text-green-600">
                            {variant.name}
                          </div>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              ) : (
                <div className="text-center py-12">
                  <SettingOutlined className="text-4xl text-gray-300 mb-4" />
                  <div className="text-gray-500 mb-2">No items configured</div>
                  <div className="text-sm text-gray-400">
                    Configure combo items to show composition
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Additional Information Sections */}
        {/* <Row gutter={[24, 24]}>
          <Col xs={24} xl={12} className="!pr-2">
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold">Recent Activity</span>
                </div>
              }
              className="border-0 shadow-sm"
            >
              <Timeline
                items={[
                  {
                    color: "green",
                    children: (
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            Stock Updated
                          </div>
                          <div className="text-sm text-gray-500">
                            128GB Black Titanium variant restocked
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">2 hours ago</div>
                      </div>
                    ),
                  },
                  {
                    color: "blue",
                    children: (
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            Price Updated
                          </div>
                          <div className="text-sm text-gray-500">
                            Discounted price adjusted for all variants
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">1 day ago</div>
                      </div>
                    ),
                  },
                  {
                    color: "orange",
                    children: (
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            BOM Updated
                          </div>
                          <div className="text-sm text-gray-500">
                            Bill of Materials configuration updated
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">3 days ago</div>
                      </div>
                    ),
                  },
                  {
                    color: "red",
                    children: (
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            Low Stock Alert
                          </div>
                          <div className="text-sm text-gray-500">
                            512GB Natural Titanium running low
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">5 days ago</div>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>

          <Col xs={24} xl={12} className="!pl-2">
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold">Performance Metrics</span>
                </div>
              }
              className="border-0 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <RiseOutlined className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Sales Growth
                      </div>
                      <div className="text-sm text-gray-500">vs last month</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      +24.5%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Users className="text-gray-600 text-lg" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Customer Satisfaction
                      </div>
                      <div className="text-sm text-gray-500">
                        Average rating
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      4.8/5
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TeamOutlined className="text-gray-600 text-lg" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Market Share
                      </div>
                      <div className="text-sm text-gray-500">
                        In premium segment
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      15.2%
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row> */}

        <Row gutter={[24, 24]} className="">
          <Col xs={24}>
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <Variant className="text-purple-600" />
                  <span className="font-semibold">Packaging BOM Materials</span>
                </div>
              }
              className="border border-gray-200"
              extra={
                <Tag color="purple" className="font-bold">
                  {variant?.name}
                </Tag>
              }
            >
              <div className="animate-in slide-in-from-bottom-2 duration-500">
                {variant?.packagingBOM && variant.packagingBOM.length > 0 ? (
                  <Table
                    key={variant?.id}
                    columns={packagingBOMColumns}
                    dataSource={variant.packagingBOM}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    className="border border-gray-100 rounded-lg overflow-hidden"
                  />
                ) : (
                  <div className="text-center py-12 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
                    <SettingOutlined className="text-4xl text-gray-300 mb-3" />
                    <div className="text-gray-500 font-medium">
                      No packaging materials configured for this variant
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DetailsComboProduct;
