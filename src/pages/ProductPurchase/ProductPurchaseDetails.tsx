import { useParams, useNavigate } from "react-router-dom";
import { Button, Tag, Result, Table, Modal } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "react-toastify";
import { 
  useGetProductPurchaseQuery, 
  useDeleteProductPurchaseMutation 
} from "../../redux/features/product-purchase/productPurchaseApi";
import PageMeta from "../../components/common/Meta/PageMeta";
import UpdateProductPurchaseModal from "../../components/common/Modals/ProductPurchase/UpdateProductPurchaseModal";
import PurchaseViewSkeleton from "../../components/skeleton/PurchaseViewSkeleton";

const { confirm } = Modal;

const ProductPurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openUpdate, setOpenUpdate] = useState(false);
  
  const { data: response, isLoading, error } = useGetProductPurchaseQuery(id);
  const [deletePurchase, { isLoading: isDeleting }] = useDeleteProductPurchaseMutation();

  if (isLoading) {
    return (
      <div className="p-6">
        <PurchaseViewSkeleton />
      </div>
    );
  }

  if (error || !response?.success) {
    return (
      <Result
        status="error"
        title="Failed to Load"
        subTitle="Purchase details not found."
        extra={[
          <Button type="primary" key="back" onClick={() => navigate("/product-purchase")}>
            Back
          </Button>,
        ]}
      />
    );
  }

  const purchase = response.data;
  const supplier = purchase.supplier;

  const handleDelete = () => {
    confirm({
      title: "Are you sure you want to delete this purchase?",
      content: "This action cannot be undone and will affect your stock levels.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const res = await deletePurchase(id).unwrap();
          if (res?.success) {
            toast.success("Purchase deleted successfully");
            navigate("/product-purchase");
          } else {
            toast.error(res?.message || "Failed to delete purchase");
          }
        } catch (err: any) {
          toast.error(err?.data?.message || "Something went wrong");
        }
      },
    });
  };

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 50,
    },
    {
      title: "Product",
      dataIndex: ["product", "name"],
      key: "product",
    },
    {
      title: "SKU",
      dataIndex: ["product", "sku"],
      key: "sku",
      align: "center" as const,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (price: number) => `৳${price.toLocaleString()}`,
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "total",
      align: "right" as const,
      render: (total: number) => <b>৳{total.toLocaleString()}</b>,
    },
  ];

  return (
    <div className="p-6">
      <PageMeta 
        title="Purchase Details" 
        description="View product purchase details" 
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Purchase Details</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
            ID: {purchase.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="rounded-lg" onClick={() => window.print()}>Print</Button>
          <Button 
            onClick={() => setOpenUpdate(true)} 
            className="rounded-lg border-primary text-primary hover:bg-primary hover:text-white"
          >
            Edit
          </Button>
          <Button 
            danger 
            loading={isDeleting} 
            onClick={handleDelete} 
            className="rounded-lg"
          >
            Delete
          </Button>
          <Button type="primary" className="rounded-lg" onClick={() => navigate("/product-purchase")}>Back</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Supplier</h3>
          <p className="font-bold text-lg mb-1">{supplier?.name}</p>
          <p className="text-sm text-gray-500">{supplier?.phone1}</p>
          <p className="text-sm text-gray-500">{supplier?.email}</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Information</h3>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm font-bold">{dayjs(purchase.purchaseDate).format("DD-MM-YYYY")}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Status</span>
            <Tag color={purchase.paymentStatus === "PAID" ? "green" : "orange"}>{purchase.paymentStatus}</Tag>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Method</span>
            <span className="text-sm font-bold">{purchase.paymentMethod || "N/A"}</span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Summary</h3>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Sub Total</span>
            <span className="text-sm font-bold">৳{purchase.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Discount</span>
            <span className="text-sm font-bold">- ৳{purchase.discount?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex justify-between mb-3 pb-2 border-b border-gray-200">
            <span className="text-sm text-gray-500">Tax</span>
            <span className="text-sm font-bold">+ ৳{purchase.tax?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold  text-gray-600">Total Payable</span>
            <span className="text-xl font-bold text-primary">৳{purchase.finalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-6">
        <Table
          dataSource={purchase.items}
          columns={columns}
          pagination={false}
          rowKey="id"
          onRow={(record: any) => ({
            onClick: () => navigate(`/product/${record.productId}`),
            className: "cursor-pointer",
          })}
        />
      </div>

      {purchase.remarks && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Remarks</h3>
          <p className="text-sm text-gray-600 italic">{purchase.remarks}</p>
        </div>
      )}

      {/* Update Modal */}
      <UpdateProductPurchaseModal 
        open={openUpdate} 
        setOpen={setOpenUpdate} 
        purchase={purchase} 
      />
    </div>
  );
};

export default ProductPurchaseDetails;
