import React, { useMemo } from "react";
import { Modal, Table, Button, Tag } from "antd";
import { Printer } from "lucide-react";
import OrderPickingSheetPrint from "../../../../components/common/CommonPrintCsvAndPdf/OrderPickingSheetPrint";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import { IOrder } from "../../../../types/order";

interface Props {
  visible: boolean;
  onClose: () => void;
  orders: IOrder[];
}

const PickingListModal: React.FC<Props> = ({ visible, onClose, orders }) => {
  const aggregatedData = useMemo(() => {
    const productMap: Record<string, any> = {};
    let totalQty = 0;

    orders.forEach((order) => {
      order.orderProducts?.forEach((item) => {
        const product = item.product;
        const sku = product?.sku || "N/A";
        if (!productMap[sku]) {
          productMap[sku] = {
            key: sku,
            sku,
            name: product?.name || "N/A",
            image: product?.thumbnail?.url || "",
            qty: 0,
            orderNumbers: [],
          };
        }
        productMap[sku].qty += item.quantity;
        totalQty += item.quantity;
        const orderIdentifier =
          (order as any).sale?.invoiceNumber ||
          order.id?.substr(-8).toUpperCase();
        if (!productMap[sku].orderNumbers.includes(orderIdentifier)) {
          productMap[sku].orderNumbers.push(orderIdentifier);
        }
      });
    });

    return {
      list: Object.values(productMap),
      totalOrders: orders.length,
      totalProducts: totalQty,
    };
  }, [orders]);

  // Data for PageListPrint
  const printData = useMemo(() => {
    return aggregatedData.list.map((item, idx) => ({
      SL: idx + 1,
      Image: item.image,
      SKU: item.sku,
      Quantity: item.qty,
      "Product Name": item.name,
      "Order Numbers": item.orderNumbers.join(", "),
    }));
  }, [aggregatedData.list]);

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 70,
      render: (img: string) => (
        <img
          src={img || "https://via.placeholder.com/40"}
          alt="product"
          style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 120,
      render: (sku: string) => (
        <span className="font-bold text-gray-700">{sku}</span>
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 80,
      align: "center" as const,
      render: (qty: number) => (
        <Tag color="blue" className="font-bold text-sm px-3">
          {qty}
        </Tag>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Order Numbers",
      dataIndex: "orderNumbers",
      key: "orderNumbers",
      render: (nums: string[]) => (
        <div className="text-[11px] text-gray-500 max-w-[300px] line-clamp-2">
          {nums.join(", ")}
        </div>
      ),
    },
    {
      title: "Picked",
      key: "picked",
      width: 80,
      align: "center" as const,
      render: () => (
        <div className="w-5 h-5 border-2 border-gray-300 rounded" />
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-4 text-lg font-bold">
          <span>Order Picking List</span>
          <Tag color="cyan">{orders.length} Orders</Tag>
          <div className="flex-1" />
          <div className="mr-6">
            <PageListPrint
              tableData={printData}
              fileName={`Picking_List_${new Date().toLocaleDateString()}`}
            />
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      centered
      footer={null}
    >
      <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center justify-between border border-gray-100">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Total Orders
            </span>
            <span className="text-xl font-black text-gray-800">
              {aggregatedData.totalOrders}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Total Items
            </span>
            <span className="text-xl font-black text-[#1BA143]">
              {aggregatedData.totalProducts}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            size="large"
            icon={<Printer size={16} />}
            onClick={() => OrderPickingSheetPrint.print(orders)}
            className="flex items-center gap-2 font-bold"
          >
            Direct Print
          </Button>
          <Button size="large" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      <Table
        dataSource={aggregatedData.list}
        columns={columns}
        pagination={false}
        scroll={{ y: 500 }}
        className="picking-table-ui border border-gray-100 rounded-lg overflow-hidden"
        rowClassName="hover:bg-blue-50/30 transition-colors"
      />
    </Modal>
  );
};

export default PickingListModal;
