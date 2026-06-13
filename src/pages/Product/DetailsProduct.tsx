import { EyeOutlined, SettingOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Image,
  Progress,
  Result,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { TbCoinTaka, TbCurrencyTaka } from "react-icons/tb";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

const { Text } = Typography;

import { Edit } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Autoplay } from "swiper/modules";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import { Loader } from "../../components/common/Loading";
import PageMeta from "../../components/common/Meta/PageMeta";
import PackagingBOMSetupModal from "../../components/common/Modals/BOM/PackagingMaterialBOMSetupModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import RichText from "../../components/shared/RichTextPreview";
import { config } from "../../config";
import {
  useGetProductByIdQuery,
  useGetProductPackagingMaterialBOMQuery,
  useGetProductRawMaterialBOMQuery,
  useSalesProductVariantReportQuery,
  useSalesReportProductComparisonQuery,
} from "../../redux/features/product/productApi";
import { IProductVariant } from "../../types/product";
// import ImageZoomMagnifier from "../../components/common/ImageZoomMagnifier";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import VariantWiseSalesChart from "../../components/common/Charts/productDetails/VariantWiseSalesChart";
import ProductDetailsSkeleton from "../../components/skeleton/ProductDetailsSkeleton";
import { useModulePermissions } from "../../hooks/usePermissions";
import { Plan, Sales, Stock, Variant } from "../../icons";
import ProductVariantComparison from "./ProductVariantComparison";

// Taka icon component

// Mock product data with Bangladeshi Taka prices

// Mock sales data for the chart

// Mock BOM data (will be replaced with actual data from API/storage)

const DetailsProduct = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: productInfo,
    isLoading,
    isFetching,
  } = useGetProductByIdQuery(id as string, { skip: !id });
  const product = useMemo(() => productInfo?.data || {}, [productInfo?.data]);
  const { data: bomInfo } = useGetProductRawMaterialBOMQuery(product?.id, {
    skip: !product?.id,
  });
  const boms = bomInfo?.data || [];

  const [openBOMSetup, setOpenBOMSetup] = useState(false);

  // Variant Set
  const [variant, setVariant] = useState<IProductVariant | null>(null);
  const [showImage, setShowImage] = useState<any>(null);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      // Find the variant with the highest price
      const maxPriceVariant = product.variants.reduce(
        (prev: any, current: any) => {
          return prev.conversionFactor > current.conversionFactor
            ? prev
            : current;
        },
      );
      setVariant(maxPriceVariant);
    }
  }, [product]);

  // slider---------------------------------------------

  useEffect(() => {
    if (variant) {
      if (variant.thumbnail) {
        setShowImage(variant.thumbnail);
      } else if (variant.images && variant.images.length > 0) {
        setShowImage(variant.images[0]);
      }
    } else {
      if (product?.defaultImage) {
        setShowImage(product.defaultImage);
      } else if (product?.images && product.images.length > 0) {
        setShowImage(product.images[0]);
      }
    }
  }, [variant, product]);

  //product sales report

  const { data: productSalesReportData, isLoading: productDetailLoading } =
    useSalesProductVariantReportQuery([
      { name: "productId", value: id },
      { name: "variantId", value: variant?.id },
    ]);

  const productSalesReport = productSalesReportData?.data || {};

  const {
    data: salesReportProductComparisonData,
    isLoading: salesReportProductComparisonLoading,
  } = useSalesReportProductComparisonQuery([
    { name: "productId", value: id },
    { name: "variantId", value: variant?.id },
  ]);

  const salesReportProductComparison =
    salesReportProductComparisonData?.data || {};

  const productSummery = salesReportProductComparison.summary || {};

  // Calculate min and max price

  // State for sales chart

  // Get BOM data

  // Packaging Bom setup
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants?.[0]?.id || "",
  );

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product]);

  const handleSelect = (id: string) => {
    setSelectedVariantId(id);
  };

  const { data: bomData } = useGetProductPackagingMaterialBOMQuery(
    {
      productId: product?.id,
      selectedVariantId,
    },
    { skip: !product?.id },
  );

  const productByBom = bomData?.data || [];

  // Calculate statistics with safe defaults
  const statsData = {
    totalStock:
      product?.variants?.reduce(
        (sum: any, v: { currentStock: any }) => sum + (v.currentStock || 0),
        0,
      ) || 0,

    totalValue:
      product?.variants?.reduce(
        (sum: number, v: { currentStock: number; discountedPrice: number }) =>
          sum + (v.currentStock || 0) * (v.discountedPrice || 0),
        0,
      ) || 0,
    variantsCount: product?.variants?.length || 0,
    avgDiscount: product?.variants?.length
      ? product.variants.reduce(
          (sum: number, v: { sellingPrice: number; discountedPrice: number }) =>
            sum + ((v.sellingPrice - v.discountedPrice) / v.sellingPrice) * 100,
          0,
        ) / product.variants.length
      : 0,
  };

  // Format currency in Bangladeshi Taka

  // Combine all images safely
  const allImages = (
    variant
      ? [
          ...(variant?.thumbnail ? [variant.thumbnail] : []),
          ...(variant?.images || []),
        ]
      : [
          ...(product?.defaultImage ? [product.defaultImage] : []),
          ...(product?.images || []),
        ]
  ).filter((img) => img && img.url);

  const { hasUpdate } = useModulePermissions("Products");

  // BOM table columns
  const packagingBom = [
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "percentage",
      key: "percentage",
      render: (_: any, record: { percentage: number; unit: string }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{record?.percentage}</span>
          <Tag className="!bg-green-600 !text-white">{record?.unit}</Tag>
        </div>
      ),
    },
    // {
    //   title: "Unit",
    //   dataIndex: "unit",
    //   key: "unit",
    //   render: (unit: string) => (
    //     <Tag className="!bg-green-600 !text-white">{unit}</Tag>
    //   ),
    // },
    // {
    //   title: "Current Stock",
    //   dataIndex: "currentStock",
    //   key: "currentStock",
    //   render: (currentStock: number) => (
    //     <div className="flex items-center gap-1">
    //       <span className="font-semibold text-green-600">
    //         {formatCurrency(currentStock)}
    //       </span>
    //     </div>
    //   ),
    // },
  ];
  const bomColumns = [
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={percentage}
            size="small"
            strokeColor="#16a34a"
            showInfo={false}
            className="w-16"
          />
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      render: (unit: string) => (
        <Tag className="!bg-green-600 !text-white">{unit}</Tag>
      ),
    },
    // {
    //   title: "Current Stock",
    //   dataIndex: "currentStock",
    //   key: "currentStock",
    //   render: (currentStock: number) => (
    //     <div className="flex items-center gap-1">
    //       <span className="font-semibold text-green-600">
    //         {formatCurrency(currentStock)}
    //       </span>
    //     </div>
    //   ),
    // },
  ];

  // Show loading skeleton while fetching
  if (
    isLoading ||
    productDetailLoading ||
    salesReportProductComparisonLoading ||
    isFetching
  ) {
    return <ProductDetailsSkeleton />;
  }

  if (!productInfo?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-gray-100 shadow-sm m-6 p-10">
        <Result
          status="404"
          title={
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Product Not Found
              </h2>
              <p className="text-gray-500 font-normal max-w-md mx-auto">
                The product record you are trying to access might have been
                deleted or you may have followed an outdated link.
              </p>
            </div>
          }
          extra={
            <Button
              type="primary"
              size="large"
              className="bg-primary hover:!bg-primary-600 border-none h-12 px-10 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/20"
              onClick={() => (window.location.href = "/products")}
            >
              Back to Products
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <PageMeta
        title={`${product?.name || "Product Details"} | ERP`}
        description="Product Details"
      />

      {/* Header Section */}
      <PageHeader
        title="Product Details"
        subtitle="Detailed view of the product"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Products", path: "/products" },
          { title: product?.name || "Product" },
        ]}
        extra={
          <div className="flex flex-wrap items-center gap-3">
            {hasUpdate && (
              <>
                {/* BOM Setup */}
                <Tooltip
                  title={product?.hasBOM ? "Update BOM" : "Configure BOM"}
                >
                  <CustomActionButton
                    type={"primary"}
                    icon={<Variant className=" text-white" />}
                    text="Packaging BOM"
                    onClick={() => setOpenBOMSetup(true)}
                  />
                </Tooltip>

                {/* Planning */}
                <Tooltip title="Plan Production">
                  <Link to={`/product/${product.id}/planning`}>
                    <CustomActionButton
                      disabled={product?.bomCount === 0 ? true : false}
                      type="primary"
                      icon={<Plan />}
                      text=" Planning"
                    />
                  </Link>
                </Tooltip>

                {/* Edit Product */}
                <Tooltip title="Edit Product">
                  <Link to={`/product/update-product/${product.id}`}>
                    <CustomActionButton
                      type="primary"
                      icon={<Edit />}
                      text=" Edit Product"
                    ></CustomActionButton>
                  </Link>
                </Tooltip>
              </>
            )}
          </div>
        }
      />

      {/* Main Content */}
      <div className="pb-8">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<Variant className="text-2xl" />}
              color="blue"
              title="Variants"
              value={productSummery?.totalVariantsCompared || 0}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<Stock className="!text-2xl" />}
              color="purple"
              title="Total Stock"
              value={`${statsData.totalStock} ${
                product?.baseUnit?.symbol || ""
              }`}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<Sales className="!text-white" />}
              color="cyan"
              title="Total Sales"
              value={productSummery?.totalQuantitySold || 0}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<TbCoinTaka className="text-2xl" />}
              color="green"
              title="Total Revenue"
              value={`${productSummery?.totalRevenue || 0}`}
            />
          </Col>
        </Row>

        {/* Product Details */}
        <Row className="" gutter={[24, 24]}>
          {/* Product Images */}
          <Col className="!pr-2 -mb-2" xs={24} xl={10}>
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold text-xl">Product Gallery</span>
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
                    alt={product?.name || "Product"}
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
                                    alt={`${product?.name} preview ${index + 1}`}
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

          {/* Product Information */}
          <Col className="!pl-2" xs={24} xl={14}>
            <Card className="border border-gray-200">
              {/* Product Title */}
              <h3
                className="!text-xl font-semibold -mb-2"
                style={{ color: "#16a34a" }}
              >
                {product?.name} {variant?.name && `- ${variant.name}`}
              </h3>

              {/* Final Price - Moved here */}
              <div className="mt-5 mb-2 flex items-center gap-6">
                <div>
                  {variant?.discountedPrice &&
                  variant.discountedPrice < variant.sellingPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-400 text-base font-semibold flex items-center">
                        <TbCurrencyTaka /> {variant?.sellingPrice}
                      </span>
                      <Text
                        style={{
                          fontSize: 18, // Adjusted font size
                          fontWeight: "600",
                          color: "#16a34a",
                        }}
                      >
                        <div className="flex items-center">
                          <TbCurrencyTaka /> {variant?.discountedPrice}
                        </div>
                      </Text>
                    </div>
                  ) : (
                    <Text
                      style={{
                        fontSize: 18, // Adjusted font size
                        fontWeight: "bold",
                        color: "#16a34a",
                      }}
                    >
                      <div className="flex items-center">
                        <TbCurrencyTaka /> {variant?.sellingPrice}
                      </div>
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
              {product?.shortDesc && (
                <RichText
                  content={product.shortDesc}
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
                    {product?.category?.name || "-"}
                  </p>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-300">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Brand
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate m-0">
                    {product?.brand?.name || "-"}
                  </p>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Base Unit
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate m-0">
                    {product?.baseUnit?.name || "-"}
                  </p>
                </div>
              </div>

              {/* Variant Selection */}
              <Space
                size="middle"
                style={{ marginBottom: 16, marginTop: "25px" }}
              >
                <div className="flex flex-col gap-4">
                  {/* change */}

                  {product?.variants?.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {product?.variants
                        ?.slice()
                        .sort(
                          (a: any, b: any) =>
                            b.conversionFactor - a.conversionFactor,
                        )
                        .map((v: any) => (
                          <Button
                            key={v.id}
                            onClick={() => setVariant(v)}
                            type="default"
                            className={`${
                              v.id === variant?.id
                                ? "!border !border-green-600 !font-bold !text-green-600"
                                : ""
                            }`}
                            style={{
                              borderColor:
                                v.id === variant?.id ? "#16a34a" : "#d1d5db",
                              color: "#374151",
                              fontWeight: 600,
                            }}
                          >
                            {v.name}
                          </Button>
                        ))}
                    </div>
                  )}
                </div>
              </Space>
            </Card>
          </Col>

          {/* Product Description */}
          <Col xs={24}>
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold">Description</span>
                </div>
              }
              className="border border-gray-200"
            >
              <div className="prose max-w-none">
                {product?.detailedDesc ? (
                  <RichText
                    content={product.detailedDesc}
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
        <Row gutter={[24, 24]} className="mt-4">
          <Col xs={24} xl={24} className="!pr-2">
            {productDetailLoading ? (
              <Loader />
            ) : productSalesReport?.variants?.length > 0 ? (
              <VariantWiseSalesChart
                sales={productSalesReport.variants[0].sales}
              />
            ) : (
              <div className=" bg-gradient-to-br  from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Sales Data
                </h3>
                <p className="text-gray-500 text-sm">
                  This product doesn't have any sales records yet.
                </p>
              </div>
            )}
          </Col>
        </Row>

        <ProductVariantComparison data={salesReportProductComparison} />

        {/* Bill of Materials Section */}
        <Row gutter={[24, 24]} className="my-4">
          <Col xs={24}>
            <Card
              title={
                <div className="flex items-center cursor-pointer gap-2 text-gray-900">
                  <span className="font-semibold">
                    {" "}
                    Bill of Row Materials (BOM)
                  </span>
                  <Tooltip title={`Total Materials: ${boms?.length || 0}`}>
                    <Badge
                      count={boms?.length || 0}
                      showZero
                      color="#16a34a"
                      style={{ fontFamily: "monospace" }}
                    />
                  </Tooltip>
                </div>
              }
              className="border border-gray-200"
            >
              {boms && boms.length > 0 ? (
                <Table
                  columns={bomColumns}
                  dataSource={
                    boms as Array<{
                      id: string;
                      materialId: string;
                      materialName: string;
                      percentage: number;
                      unit: string;
                      cost: number;
                    }>
                  }
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        {/* <Table.Summary.Cell index={0} colSpan={3}>
                          <div className="flex items-center gap-2 font-semibold">
                            Total Materials: {boms.length}
                          </div>
                        </Table.Summary.Cell> */}
                        {/* <Table.Summary.Cell index={1}>
                          <div className="flex items-center gap-1 font-bold text-green-600">
                            <TakaIcon />
                            {formatCurrency(boms?.totalCost || 0)}
                          </div>
                        </Table.Summary.Cell> */}
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              ) : (
                <div className="text-center py-12">
                  <SettingOutlined className="text-4xl text-gray-300 mb-4" />
                  <div className="text-gray-500 mb-2">No BOM configured</div>
                  <div className="text-sm text-gray-400">
                    Configure Bill of Materials to track production costs
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]} className="my-4">
          <Col xs={24}>
            <Card
              title={
                <div className="flex items-center cursor-pointer gap-2  text-gray-900">
                  <span className="font-semibold">
                    Bill of Packaging Materials (BOM)
                  </span>
                  <Tooltip
                    title={`Total Materials: ${product?.variants?.length || 0}`}
                  >
                    <Badge
                      count={productByBom?.length || 0}
                      showZero
                      color="#16a34a"
                      style={{ fontFamily: "monospace" }}
                    />
                  </Tooltip>
                </div>
              }
              className="border border-gray-200"
            >
              <div className="flex flex-wrap mb-5 gap-2">
                {product?.variants?.map((variant: any) => {
                  const isSelected = variant.id === selectedVariantId;

                  return (
                    <div
                      key={variant.id}
                      onClick={() => handleSelect(variant.id)}
                      className={`flex gap-2 items-center justify-center p-1 w-20 rounded border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-400 hover:bg-gray-50"
                      }`}
                    >
                      <h4
                        className={`text-xs font-medium truncate ${
                          isSelected ? "text-green-700" : "text-gray-800"
                        }`}
                      >
                        {variant.name || "Variant"}
                      </h4>
                      {isSelected && (
                        <IoCheckmarkCircleOutline className="text-green-600 text-sm " />
                      )}
                    </div>
                  );
                })}
              </div>
              {productByBom && productByBom.length > 0 ? (
                <Table
                  columns={packagingBom}
                  dataSource={
                    productByBom as Array<{
                      id: string;
                      materialId: string;
                      materialName: string;
                      percentage: number;
                      unit: string;
                      cost: number;
                    }>
                  }
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        {/* <Table.Summary.Cell index={0} colSpan={3}>
                          <div className="flex items-center gap-2 font-semibold">
                            Total Materials: {boms.length}
                          </div>
                        </Table.Summary.Cell> */}
                        {/* <Table.Summary.Cell index={1}>
                          <div className="flex items-center gap-1 font-bold text-green-600">
                            <TakaIcon />
                            {formatCurrency(boms?.totalCost || 0)}
                          </div>
                        </Table.Summary.Cell> */}
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              ) : (
                <div className="text-center py-12">
                  <SettingOutlined className="text-4xl text-gray-300 mb-4" />
                  <div className="text-gray-500 mb-2">No BOM configured</div>
                  <div className="text-sm text-gray-400">
                    Configure Bill of Materials to track production costs
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Additional Information Sections */}
        <Row gutter={[24, 24]}>
          {/* Recent Activity Timeline */}
          {/* <Col xs={24} xl={12} className="!pr-2">
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold">Recent Activity</span>
                </div>
              }
              className="border border-gray-200"
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
          </Col> */}

          {/* Performance Metrics */}
          {/* <Col xs={24} xl={12} className="!pl-2">
            <Card
              title={
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-semibold">Performance Metrics</span>
                </div>
              }
              className="border border-gray-200"
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
          </Col> */}
        </Row>
      </div>

      {openBOMSetup && (
        <PackagingBOMSetupModal
          open={openBOMSetup}
          setOpen={setOpenBOMSetup}
          product={product}
        />
      )}
    </div>
  );
};

export default DetailsProduct;
