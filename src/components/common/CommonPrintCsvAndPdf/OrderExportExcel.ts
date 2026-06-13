import * as XLSX from "xlsx";
import { IOrder } from "../../../types/order";

export const exportOrdersToExcel = (
  orders: IOrder[],
  fileName: string = "Orders_Export",
) => {
  const data = orders.map((order: any) => {
    const customer = order.user || order.customer || {};
    const products = order.orderProducts
      ?.map((p: any) => `${p.product?.name} (${p.quantity}x)`)
      .join(", ");

    return {
      Date: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "N/A",
      "Invoice No":
        order.sale?.invoiceNumber ||
        order.id?.substr(-8).toUpperCase() ||
        "N/A",
      "Customer Name": customer.name || "N/A",
      Phone: customer.phone || "N/A",
      Address: order.address || customer.address || "N/A",
      Products: products || "N/A",
      Subtotal: order.subTotal || 0,
      Delivery: order.deliveryCharge || 0,
      Total: order.totalPrice || 0,
      Method: order.deliveryMethod || "N/A",
      Status: order.status || "N/A",
      Note: order.shippingNote || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  // Clean filename
  const cleanFileName = `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`;

  XLSX.writeFile(workbook, cleanFileName);
};

export const exportOrdersToCSV = (
  orders: IOrder[],
  fileName: string = "Orders_Export",
) => {
  const data = orders.map((order: any) => {
    const customer = order.user || order.customer || {};
    const products = order.orderProducts
      ?.map((p: any) => `${p.product?.name} (${p.quantity}x)`)
      .join("; "); // Using semicolon to avoid CSV issues

    return {
      Date: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "N/A",
      "Invoice No":
        order.sale?.invoiceNumber ||
        order.id?.substr(-8).toUpperCase() ||
        "N/A",
      "Customer Name": customer.name || "N/A",
      Phone: customer.phone || "N/A",
      Address: order.address || customer.address || "N/A",
      Products: products || "N/A",
      Subtotal: order.subTotal || 0,
      Delivery: order.deliveryCharge || 0,
      Total: order.totalPrice || 0,
      Method: order.deliveryMethod || "N/A",
      Status: order.status || "N/A",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${fileName}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
