import React, { useMemo } from "react";
import { Modal, Table, Button, Tag } from "antd";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import { IOrder } from "../../../../types/order";

interface Props {
  visible: boolean;
  onClose: () => void;
  orders: IOrder[];
}

const PackingListModal: React.FC<Props> = ({ visible, onClose, orders }) => {
  const flatProductList = useMemo(() => {
    const list: any[] = [];
    let sl = 1;

    orders.forEach((order) => {
      const invoiceNo =
        (order as any).sale?.invoiceNumber ||
        order.id?.substr(-8).toUpperCase() ||
        "N/A";
      const customerName = order.user?.name || order.customer?.name || "N/A";

      order.orderProducts?.forEach((item) => {
        list.push({
          key: `${order.id}-${item.productId}-${item.variantId || "base"}`,
          sl: sl++,
          invoiceNo: invoiceNo,
          customer: customerName,
          sku: item.product?.sku || "N/A",
          name: item.product?.name || "N/A",
          image: item.product?.thumbnail?.url || "",
          qty: item.quantity,
          price: item.price,
        });
      });
    });

    return list;
  }, [orders]);

  const printData = useMemo(() => {
    return flatProductList.map((item) => ({
      SL: item.sl,
      Image: item.image?.url,
      Invoice: item.invoiceNo,
      Customer: item.customer,
      SKU: item.sku,
      Product: item.name,
      Qty: item.qty,
      Price: item.price,
    }));
  }, [flatProductList]);

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 50,
      align: "center" as const,
    },
    {
      title: "Invoice",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      width: 100,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Product",
      key: "product",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <img
            src={record.image || "https://via.placeholder.com/40"}
            alt="p"
            style={{
              width: 30,
              height: 30,
              borderRadius: 4,
              objectFit: "cover",
            }}
          />
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold leading-tight">
              {record.name}
            </span>
            <span className="text-[10px] text-gray-400">{record.sku}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 60,
      align: "center" as const,
      render: (qty: number) => <span className="font-bold">{qty}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      width: 150,
      render: (text: string) => <span className="text-[11px]">{text}</span>,
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-4 text-lg font-bold">
          <span>Detailed Packing List</span>
          <Tag color="blue">{orders.length} Orders</Tag>
          <div className="flex-1" />
          <div className="mr-6">
            <PageListPrint
              tableData={printData}
              fileName={`Packing_List_${new Date().toLocaleDateString()}`}
            />
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      centered
      footer={[
        <Button key="close" onClick={onClose} size="large">
          Close
        </Button>,
      ]}
    >
      <div className="mb-4 text-gray-500 text-sm">
        This list shows every individual product item across all selected
        orders. Use the print button above to export to PDF or CSV.
      </div>
      <Table
        dataSource={flatProductList}
        columns={columns}
        pagination={false}
        scroll={{ y: 500 }}
        size="small"
        className="packing-table-ui border border-gray-100 rounded-lg overflow-hidden"
      />
    </Modal>
  );
};

export default PackingListModal;
