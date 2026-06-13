import { Alert, Button, Popconfirm, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { Plus, RefreshCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateCouponModal from "../../components/common/Modals/CreateCouponModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteCouponMutation,
  useGetAllCouponsQuery,
} from "../../redux/features/coupon/couponApi";
import { ICoupon } from "../../types/coupon";
import { DisplayCurrency } from "../../utils/currency";

const CouponList = () => {
  const [open, setOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ICoupon | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { hasView, hasCreate, hasUpdate, hasDelete } =
    useModulePermissions("Coupons");

  const { data, isLoading, isFetching, refetch } = useGetAllCouponsQuery(
    { page, limit },
    { skip: !hasView },
  );

  const [deleteCoupon] = useDeleteCouponMutation();

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteCoupon(id).unwrap();
        toast.success("Coupon deleted successfully");
      } catch (error: unknown) {
        const message =
          error &&
          typeof error === "object" &&
          "data" in error &&
          error.data &&
          typeof error.data === "object" &&
          "message" in error.data
            ? String((error.data as { message?: string }).message)
            : "Failed to delete coupon";
        toast.error(message);
      }
    },
    [deleteCoupon],
  );

  const coupons = data?.data || [];
  const meta = data?.meta || { total: 0 };

  const columns = useMemo(() => {
    const base = [
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        render: (code: string, record: ICoupon) => (
          <Tooltip title={record.description || "No description"}>
            <Tag color="green" className="font-bold cursor-help">
              {code}
            </Tag>
          </Tooltip>
        ),
      },
      {
        title: "Products",
        key: "products",
        render: (_: unknown, record: ICoupon) => {
          const products = record.applicableProductDetails || [];
          if (products.length === 0)
            return <Tag color="blue">All Products</Tag>;

          const tooltipContent = (
            <div className="max-h-48 overflow-y-auto p-1">
              <div className="font-bold border-b border-gray-600 mb-2 pb-1 text-[11px] uppercase tracking-wider">
                Applicable Products ({products.length})
              </div>
              {products.map((p, index) => (
                <div
                  key={p.id}
                  className="mb-1.5 flex items-start gap-2 text-[11px] leading-relaxed"
                >
                  <span className="text-gray-400">{index + 1}.</span>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          );

          return (
            <Tooltip title={tooltipContent} color="#1f2937">
              <div className="flex flex-wrap gap-1 cursor-help items-center max-w-[200px]">
                <Tag
                  color="cyan"
                  className="text-[11px] truncate max-w-[120px] m-0"
                >
                  {products[0].name}
                </Tag>
                {products.length > 1 && (
                  <Tag color="cyan" className="text-[10px] m-0">
                    +{products.length - 1} more
                  </Tag>
                )}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: "Type",
        dataIndex: "discountType",
        key: "discountType",
        render: (type: string) => (
          <Tag color="green">
            {type === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
          </Tag>
        ),
      },
      {
        title: "Value",
        dataIndex: "discountValue",
        key: "discountValue",
        render: (value: number, record: ICoupon) => (
          <span>
            {record.discountType === "PERCENTAGE" ? (
              `${value}%`
            ) : (
              <DisplayCurrency amount={value} />
            )}
          </span>
        ),
      },
      {
        title: "Validity",
        key: "validity",
        render: (_: unknown, record: ICoupon) => (
          <div className="whitespace-nowrap text-xs text-gray-600">
            {dayjs(record.validFrom).format("DD MMM YYYY")} -{" "}
            {dayjs(record.validTo).format("DD MMM YYYY")}
          </div>
        ),
      },
      {
        title: "Usage",
        key: "usage",
        render: (_: unknown, record: ICoupon) => (
          <Tag color="green">
            Limit: {record.usageLimit} | Per User: {record.perUserLimit}
          </Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        render: (isActive: boolean) => (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        ),
      },
    ];

    if (!hasUpdate && !hasDelete) {
      return base;
    }

    return [
      ...base,
      {
        title: "Action",
        key: "action",
        fixed: "right" as const,
        render: (_: unknown, record: ICoupon) => (
          <div className="flex gap-2">
            {hasUpdate ? (
              <Tooltip title="Edit">
                <Button
                  icon={<FiEdit />}
                  onClick={() => {
                    setItemToEdit(record);
                    setOpen(true);
                  }}
                />
              </Tooltip>
            ) : null}
            {hasDelete ? (
              <Popconfirm
                title="Delete Coupon"
                description="Are you sure to delete this coupon?"
                onConfirm={() => handleDelete(String(record.id))}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<FiTrash2 />} />
              </Popconfirm>
            ) : null}
          </div>
        ),
      },
    ];
  }, [hasUpdate, hasDelete, handleDelete]);

  const showList = hasView;

  return (
    <div>
      <PageMeta
        title="Coupons | Amzad Food ERP"
        description="Manage Discount Coupons"
      />

      <PageHeader
        title="Coupons"
        subtitle="Manage discount coupons and promo codes"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Settings" },
          { title: "Coupons" },
        ]}
        extra={
          <>
            {showList ? (
              <CustomActionButton
                disabled={meta?.total === 0}
                onClick={() => refetch()}
                text="Refresh"
                icon={<RefreshCcw />}
                type="default"
              />
            ) : null}
            {hasCreate ? (
              <CustomActionButton
                onClick={() => {
                  setItemToEdit(null);
                  setOpen(true);
                }}
                text="Add New"
                icon={<Plus />}
                type="primary"
              />
            ) : null}
          </>
        }
      />

      {!showList ? (
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message="No access"
          description="You do not have permission to view coupons."
        />
      ) : (
        <DataTable
          loading={isLoading || isFetching}
          data={coupons}
          columns={columns}
          rowKey="id"
          currentPage={page}
          isPaginate={meta?.total > 10}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > 10}
          total={meta?.total || 0}
        />
      )}

      {(hasCreate || hasUpdate) && (
        <CreateCouponModal
          open={open}
          setOpen={setOpen}
          itemToEdit={itemToEdit}
          setItemToEdit={setItemToEdit}
        />
      )}
    </div>
  );
};

export default CouponList;
