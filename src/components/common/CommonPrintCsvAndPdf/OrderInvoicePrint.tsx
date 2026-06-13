import React from "react";
import { Printer, Download } from "lucide-react";
import { Tooltip } from "antd";
import CustomActionButton from "../Button/CustomActionButton";
import { IOrder } from "../../../types/order";
import { config } from "../../../config";

interface PrintProps {
  order: IOrder;
  fileName?: string;
  buttonType?: string;
  iconOnly?: boolean;
}

const primaryColor = "#1BA143";

const commonStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0;
      font-family: 'Inter', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      color: #1a1a1a;
      line-height: 1.25;
      background: #fff;
    }
    
    .invoice-container {
      width: 210mm;
      min-height: 297mm;
      padding: 10mm;
      margin: 0 auto;
      background: white;
    }
    
    .content { page-break-after: always; }
    .content:last-child { page-break-after: auto; }
    
    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2px;
      padding-bottom: 2px;
      border-bottom: 1px solid #eee;
    }
    
    .brand-name {
      font-size: 16px;
      font-weight: 800;
      color: ${primaryColor};
    }
    
    .hotline { font-size: 9px; font-weight: 700; color: #1a1a1a; display: flex; align-items: center; gap: 2px; }
    
    .header-right { text-align: right; }
    .meta-item { font-size: 9px; font-weight: 800; color: #1a1a1a; }
    .page-num { font-size: 8px; color: #666; }

    /* Top Grid Section */
    .top-section {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      margin-top: 2px;
      margin-bottom: 6px;
      overflow: hidden;
    }
    
    .section-box { padding: 6px; }
    .section-box:first-child { border-right: 1px solid #e2e8f0; }
    
    .section-label {
      font-size: 11px;
      font-weight: 800;
      color: ${primaryColor};
      margin-bottom: 3px;
    }

    .info-row { font-size: 10px; margin-bottom: 1px; display: flex; gap: 4px; color: #333; }
    .info-row strong { font-weight: 700; color: #1a1a1a; min-width: 45px; }
    .info-row span { color: #1a1a1a; font-weight: 500; }

    .invoice-id-large {
      font-size: 13px;
      font-weight: 800;
      text-align: right;
      margin-bottom: 2px;
    }
    
    .barcode-container { text-align: right; margin-bottom: 2px; }
    .barcode-container img { height: 28px; width: 110px; }
    
    .date-row { text-align: right; font-size: 9px; font-weight: 700; color: #1a1a1a; }

    /* Table Styling */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    
    .items-table th {
      text-align: left;
      padding: 4px 6px;
      font-size: 10px;
      font-weight: 800;
      color: ${primaryColor};
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .items-table td {
      padding: 4px 6px;
      font-size: 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    
    .product-img-box {
      width: 50px;
      height: 50px;
      border: 1px solid #edf2f7;
      border-radius: 3px;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .product-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .product-info { display: flex; flex-direction: column; gap: 1px; }
    .product-name { font-size: 10px; font-weight: 700; color: #1a1a1a; line-height: 1.2; }
    .sku-text { font-size: 8px; font-weight: 700; color: #666; margin-top: 1px; }

    .unit-price, .qty, .total-cell { font-weight: 700; font-size: 10px; }

    /* Bottom Section Grid */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .bordered-box {
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 6px;
    }
    
    .shipping-note-box { min-height: 60px; }
    .shipping-note-box p { font-size: 9.5px; font-weight: 600; color: #1a1a1a; line-height: 1.3; }

    .totals-box { display: flex; flex-direction: column; gap: 3px; }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #1a1a1a;
      font-weight: 700;
    }
    
    .grand-total-section {
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px solid #edf2f7;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .grand-total-label { font-size: 12px; font-weight: 800; color: ${primaryColor}; }
    .grand-total-value { font-size: 16px; font-weight: 800; color: #000; }

    @media print {
      @page { margin: 0; size: A4 portrait; }
      body { margin: 0; padding: 0; background: #fff !important; }
      .no-print { display: none !important; }
      .invoice-container { 
        margin: 0 !important; 
        padding: 10mm !important; 
        width: 210mm;
        height: 297mm;
        page-break-after: always !important;
        page-break-inside: avoid !important;
        display: block !important;
      }
      .invoice-container:last-child { page-break-after: auto !important; }
    }
  `;

const generateInvoiceHTML = (data: IOrder) => {
  if (!data) return "<div>No invoice data available</div>";

  const items = data.orderProducts || [];
  const customerData: any =
    data.customer || data.user?.customerProfile || data.user || {};
  const customerName = customerData.name || "N/A";
  const customerPhone = customerData.phone || "N/A";
  const customerAddress = data.address || customerData.address || "N/A";
  const deliveryMethod = data.deliveryMethod || "N/A";
  const invoiceNo = data.id?.substr(-8).toUpperCase() || "N/A";
  const date = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-GB")
    : new Date().toLocaleDateString("en-GB");

  const deliveryCharge = Number(data.deliveryCharge || 0);
  const couponDiscount = Number(data.couponDiscount || 0);
  const extraDiscount = Number(data.extraDiscount || 0);
  const totalDiscount = couponDiscount + extraDiscount;

  // Get advance from last payment in orderPayments array (following OrderDetails flow)
  const lastPayment = data.orderPayments?.length
    ? Number(data.orderPayments[data.orderPayments.length - 1]?.amount || 0)
    : 0;
  const advance = lastPayment;

  const calculatedSubtotal = items.reduce((acc: number, item: any) => {
    const isCombo = !!item.comboProduct;
    const mainItem = isCombo ? item.comboProduct : item.product;
    const mainVariant = isCombo ? item.comboVariant : item.variant;

    const price = Number(
      (item as any).discountPrice > 0
        ? (item as any).discountPrice
        : mainVariant?.sellingPrice ||
            mainItem?.sellingPrice ||
            item.price ||
            0,
    );
    const qty = Number(item.quantity || 0);
    return acc + price * qty;
  }, 0);

  const subtotal = calculatedSubtotal;
  const grandTotal = subtotal + deliveryCharge - totalDiscount;

  return `
      <div class="content">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <h1 class="brand-name">Amzad Food</h1>
            <p class="hotline">📞 Mobile: 09613824072</p>
          </div>
          <div class="header-right">
            <div class="meta-item">Invoice: ${invoiceNo}</div>
            <div class="page-num">Page 1 of 1</div>
          </div>
        </div>

        <!-- Top Details Box -->
        <div class="top-section">
          <div class="section-box">
            <div class="section-label">Bill To</div>
            <div class="info-row"><strong>Name:</strong> <span>${customerName}</span></div>
            <div class="info-row"><strong>Address:</strong> <span>${customerAddress}</span></div>
            <div class="info-row"><strong>Mobile:</strong> <span>${customerPhone}</span></div>
            <div class="info-row"><strong>Delivery:</strong> <span>${deliveryMethod}</span></div>
          </div>
          <div class="section-box">
            <div class="section-label" style="text-align: right;">Invoice</div>
            <div class="invoice-id-large">${invoiceNo}</div>
            <div class="barcode-container">
              <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${invoiceNo}&scale=2&rotate=N&includetext=false" alt="Barcode" />
            </div>
            <div class="date-row">Date: ${date}</div>
          </div>
        </div>
        
        <!-- Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th width="70">Image</th>
              <th>Product</th>
              <th width="90" style="text-align: right;">Unit Price</th>
              <th width="40" style="text-align: center;">Qty</th>
              <th width="90" style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((item: any) => {
                const isCombo = !!item.comboProduct;
                const mainItem = isCombo ? item.comboProduct : item.product;
                const mainVariant = isCombo ? item.comboVariant : item.variant;

                const unitPrice = Number(
                  (item as any).discountPrice > 0
                    ? (item as any).discountPrice
                    : mainVariant?.sellingPrice ||
                        mainItem?.sellingPrice ||
                        item.price ||
                        0,
                );
                const qty = Number(item.quantity || 0);
                const rowTotal = unitPrice * qty;
                const imgUrl = mainItem?.thumbnail?.url || "";
                const sku = mainVariant?.sku || mainItem?.sku || "N/A";

                return `
                    <tr>
                      <td align="center">
                        <div class="product-img-box">
                          ${imgUrl ? `<img src="${imgUrl.startsWith("http") ? imgUrl : config.image_access_url + imgUrl}" class="product-img" />` : `<div style="font-size:6px; color:#999;">No Image</div>`}
                        </div>
                      </td>
                      <td>
                        <div class="product-info">
                          <div class="product-name">${mainItem?.name || item.productName || "Product"} ${mainVariant?.name ? `(${mainVariant.name})` : ""}</div>
                          <div class="sku-text">• SKU: ${sku}</div>
                        </div>
                      </td>
                      <td align="right" class="unit-price">${unitPrice.toLocaleString()}</td>
                      <td align="center" class="qty">${qty}</td>
                      <td align="right" class="total-cell">${rowTotal.toLocaleString()}</td>
                    </tr>
                  `;
              })
              .join("")}
          </tbody>
        </table>
        
        <!-- Bottom Section -->
        <div class="bottom-grid">
          <div class="bordered-box shipping-note-box">
            <div class="section-label">Shipping Note</div>
            <p>${data.shippingNote || "N/A"}</p>
          </div>
          <div class="bordered-box totals-box">
            <div class="total-row">
              <span style="color: #4a5568;">Sub Total</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span style="color: #4a5568;">Delivery Charge</span>
              <span>${deliveryCharge.toLocaleString()}</span>
            </div>
            ${
              couponDiscount > 0
                ? `
            <div class="total-row" style="color: #4a5568;">
              <span>Coupon Discount</span>
              <span>-${couponDiscount.toLocaleString()}</span>
            </div>
            `
                : ""
            }
            ${
              extraDiscount > 0
                ? `
            <div class="total-row" style="color: #4a5568;">
              <span>Extra Discount</span>
              <span>-${extraDiscount.toLocaleString()}</span>
            </div>
            `
                : ""
            }
            <div class="grand-total-section">
              <span class="grand-total-label">Total Amount</span>
              <span class="grand-total-value">${grandTotal.toLocaleString()}</span>
            </div>
            ${
              advance > 0
                ? `
            <div class="total-row" style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #edf2f7;">
              <span style="color: #4a5568;">Advance Paid</span>
              <span>${advance.toLocaleString()}</span>
            </div>
            <div class="total-row" style="margin-top: 2px;">
              <span style="font-size: 11px; font-weight: 800; color: ${primaryColor};">Due Amount</span>
              <span style="font-size: 13px; font-weight: 800; color: #d32f2f;">${(grandTotal - advance).toLocaleString()}</span>
            </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;
};

type OrderInvoicePrintComponent = React.FC<PrintProps> & {
  printBulk: (orders: IOrder[]) => void;
};

const OrderInvoicePrint: OrderInvoicePrintComponent = ({
  order,
  buttonType,
  iconOnly,
}) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const invoiceHTML = generateInvoiceHTML(order);
    const orderId = order?.id || "N/A";
    console.log("Printing Single Order ID:", orderId);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${orderId.substr(-8).toUpperCase() || ""}</title>
        <style>
          ${commonStyles}
          .print-btn {
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${primaryColor};
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <button class="print-btn no-print" onclick="console.log('Printing Order ID:', '${orderId}'); window.print()">Print Invoice</button>
        <div class="invoice-container">
          ${invoiceHTML}
        </div>
        <script>
          console.log("Invoice Loaded for ID:", "${orderId}");
          window.onload = () => setTimeout(() => window.print(), 500);
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownload = async () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = generateInvoiceHTML(order);

    const styles = document.createElement("style");
    styles.textContent = commonStyles;

    const container = document.createElement("div");
    container.className = "invoice-container";
    container.appendChild(styles);
    container.appendChild(tempDiv);

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

      script.onload = () => {
        const options = {
          margin: [0, 0, 0, 0],
          filename: `invoice-${order?.id?.substr(-8).toUpperCase() || "unknown"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        // @ts-expect-error print
        html2pdf()
          .set(options)
          .from(container)
          .save()
          .then(() => resolve(true));
      };

      document.head.appendChild(script);
    });
  };

  if (buttonType) {
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        <Tooltip title={iconOnly ? "Download PDF" : ""}>
          <CustomActionButton
            text={iconOnly ? undefined : "Download PDF"}
            type="primary"
            onClick={handleDownload}
            icon={<Download size={14} />}
          />
        </Tooltip>
        <Tooltip title={iconOnly ? "Print Invoice" : ""}>
          <CustomActionButton
            text={iconOnly ? undefined : "Print Invoice"}
            onClick={handlePrint}
            icon={<Printer size={14} />}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="-mr-2 flex flex-col items-start">
      <button
        onClick={handleDownload}
        style={{
          color: "#000",
          border: "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          fontSize: "13px",
          padding: "6px 0px",
        }}
      >
        <Download size={12} />
        Download PDF
      </button>
      <button
        onClick={handlePrint}
        style={{
          color: "#000",
          border: "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          fontSize: "13px",
          padding: "6px 0px",
        }}
      >
        <Printer size={12} />
        Print Invoice
      </button>
    </div>
  );
};

OrderInvoicePrint.printBulk = (orders: IOrder[]) => {
  const orderIds = orders.map((o) => o.id);
  console.log("Bulk Printing Order IDs:", orderIds);

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const orderIdsString = JSON.stringify(orderIds);
  console.log("Sending IDs to Print Window:", orderIds);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bulk Invoices - ${orders.length} orders</title>
      <style>
        ${commonStyles}
        .print-btn {
          position: fixed;
          top: 10px;
          right: 10px;
          background: ${primaryColor};
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          z-index: 1000;
        }
      </style>
    </head>
    <body style="background: #fff;">
      <button class="print-btn no-print" onclick="console.log('Printing Order IDs list:', ${orderIdsString.replace(/"/g, "'")}); window.print();">Print All Invoices</button>
      ${orders.map((order) => `<div class="invoice-container" style="margin-bottom: 0px;">${generateInvoiceHTML(order)}</div>`).join("")}
      <script>
        console.log("Bulk Invoices Loaded. Total IDs:", ${orders.length});
        console.log("Order ID List:", ${orderIdsString});
        window.onload = () => setTimeout(() => window.print(), 500);
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
};

export default OrderInvoicePrint;
