import { Printer } from "lucide-react";
import dayjs from "dayjs";
import { Button, Tooltip } from "antd";

interface PrintProps {
  returnData: any;
  buttonType?: string;
}

const PurchaseReturnPrint: React.FC<PrintProps> = ({
  returnData,
  buttonType,
}) => {
  const logoUrl = "/images/logo/logo.png";
  const backgroundImageUrl = "/images/logo/logo2.png";

  const generatePurchaseReturnHTML = (data: any) => {
    if (!data) return "<div>No purchase return data available</div>";

    // Safely get items array with fallback
    const items = data.items || data.returnItems || [];

    return `
      <div class="content">
        <div class="watermark">
          <img src="${backgroundImageUrl}" alt="Watermark" />
        </div>   
        
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <img src="${logoUrl}" alt="Company Logo" class="logo-img" />
            <p>
              Address: Block B, Bosila, House 15, 1 / B, Rd 9<br>
              Phone: +880 1327-406604<br>
              Email: amzadfoodbd@gmail.com
            </p>
          </div>
          <div class="invoice-meta">
            <div class="invoice-title">PURCHASE RETURN</div>
            <div class="invoice-number">Return ID: ${data.returnId || "N/A"}</div>
            <div style="margin-top: 8px; color: #666; font-size: 10px;">
              <strong>Return Date:</strong> ${dayjs(
                data.returnDate || data.createdAt,
              ).format("DD/MM/YYYY")}<br>
              <strong>Purchase ID:</strong> ${data.returnId || "N/A"}<br>
              <strong>Status:</strong> <span class="status-badge">${
                data.status?.toUpperCase() || "COMPLETED"
              }</span>
            </div>
          </div>
        </div>
        
        <!-- Supplier & Warehouse Details -->
        <div class="details-section">
          <div class="info-card">
            <h3>Supplier Information</h3>
            <div class="info-row">
              <span class="info-label">Supplier Name:</span>
              <span class="info-value">${data.supplierName || data.supplier?.name || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Contact Person:</span>
              <span class="info-value">${data.supplierContactPerson || data.supplier?.contactPerson || "N/A"}</span>
            </div>
           
          </div>
          
          <div class="info-card">
            <h3>Return Details</h3>
            <div class="info-row">
              <span class="info-label">Warehouse:</span>
              <span class="info-value">${data.warehouseName || data.warehouse?.name || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Category:</span>
              <span class="info-value">${data.category || "N/A"}</span>
            </div>
           
          </div>
        </div>

        <!-- Return Reason -->
        ${
          data.returnReason
            ? `
        <div class="notes-section">
          <h3>Return Reason</h3>
          <div class="notes-content">${data.returnReason}</div>
        </div>
        `
            : ""
        }
        
        <!-- Return Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>SL</th>
              <th>Material Name</th>
              <th class="text-right">Purchase Qty</th>
              <th class="text-right">Return Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total Price</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            ${
              items.length > 0
                ? items
                    .map(
                      (item: any, index: number) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td><strong>${item.materialName || item.name || item.productName || "Material"}</strong></td>
                <td class="text-right">${item.purchaseQty || item.quantity || 0}</td>
                <td class="text-right">${item.returnQty || item.quantity || 0}</td>
                <td class="text-right">TK ${(
                  item.unitPrice ||
                  item.price ||
                  0
                ).toLocaleString()}</td>
                <td class="text-right"><strong>TK ${(
                  item.totalPrice ||
                  item.quantity * item.unitPrice ||
                  0
                ).toLocaleString()}</strong></td>
                <td class="text-center">${item.remark || item.note || "-"}</td>
              </tr>
            `,
                    )
                    .join("")
                : `
              <tr>
                <td colspan="7" class="text-center" style="padding: 20px; color: #999;">
                  No return items found
                </td>
              </tr>
            `
            }
          </tbody>
        </table>
        
        <!-- Financial Summary -->
        <div class="totals-section">
          <div class="total-row">
            <span>Purchase Amount:</span>
            <span>TK ${(data.purchaseAmount || data.totalAmount || 0).toLocaleString()}</span>
          </div>
          ${
            data.discountGiven
              ? `
          <div class="total-row">
            <span>Discount Given:</span>
            <span>TK ${(data.discountGiven || 0).toLocaleString()}</span>
          </div>
          `
              : ""
          }
          <div class="total-row" style="color: #dc2626;">
            <span>Return Amount:</span>
            <span>-TK ${(data.returnAmount || data.totalPrice || 0).toLocaleString()}</span>
          </div>
          ${
            data.discountAdjustment
              ? `
          <div class="total-row" style="color: #dc2626;">
            <span>Discount Adjustment:</span>
            <span>-TK ${(data.discountAdjustment || 0).toLocaleString()}</span>
          </div>
          `
              : ""
          }
          <div class="total-row grand-total">
            <span>Net Purchase After Return:</span>
            <span>TK ${(
              data.netPurchaseAfterReturn ||
              data.purchaseAmount ||
              0
            ).toLocaleString()}</span>
          </div>
          ${
            data.paidAmount
              ? `
          <div class="total-row">
            <span>Paid Amount:</span>
            <span>TK ${(data.paidAmount || 0).toLocaleString()}</span>
          </div>
          `
              : ""
          }
          ${
            data.dueSupplierBalance
              ? `
          <div class="total-row" style="color: #dc2626; border-top: 1px solid #e5e7eb; padding-top: 6px;">
            <span><strong>Due/Supplier Balance:</strong></span>
            <span><strong>TK ${(
              data.dueSupplierBalance || 0
            ).toLocaleString()}</strong></span>
          </div>
          `
              : ""
          }
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">
            Thank you for your business partnership
          </div>
          <div class="print-info">
            Printed on: ${dayjs().format("DD/MM/YYYY hh:mm A")}
          </div>
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const purchaseReturnHTML = generatePurchaseReturnHTML(returnData);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Return ${returnData?.returnId || ""}</title>
        <style>
          * { 
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
            font-size: 12px;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #ffffff;
            color: #333;
            line-height: 1.4;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 15px;
            background: white;
            position: relative;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.1;
            z-index: 0;
            pointer-events: none;
          }
          
          .watermark img {
            width: 300px;
            height: auto;
          }
          
          .content {
            position: relative;
            z-index: 1;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #15803d;
          }
          
          .company-info {
            text-align: left;
          }
          
          .company-info p {
            color: #666;
            font-size: 10px;
          }
          
          .invoice-meta {
            text-align: right;
          }
          
          .invoice-title {
            font-size: 18px;
            font-weight: bold;
            color: #15803d;
            margin-bottom: 5px;
          }
          
          .invoice-number {
            font-size: 12px;
            color: #555;
            font-weight: 600;
          }
          
          .details-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .info-card {
            padding: 12px 0px;
          }
          
          .info-card h3 {
            color: #15803d;
            margin-bottom: 8px;
            font-size: 11px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            padding-bottom: 4px;
          }
          
          .info-label {
            font-weight: 600;
            color: #555;
            font-size: 10px;
          }
          
          .info-value {
            color: #333;
            text-align: right;
            font-size: 10px;
          }
          
          .notes-section {
            margin: 15px 0;
            padding: 12px;
            background: #fef2f2;
            border-radius: 6px;
            border-left: 4px solid #dc2626;
          }
          
          .notes-section h3 {
            color: #dc2626;
            margin-bottom: 8px;
            font-size: 11px;
          }
          
          .notes-content {
            color: #666;
            font-size: 10px;
            line-height: 1.4;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10px;
            border: 1px solid #e5e7eb;
          }
          
          .items-table th {
            background: #dc2626;
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #e5e7eb;
          }
          
          .items-table td {
            padding: 6px;
            border-bottom: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
          }
          
          .items-table tr:last-child td {
            border-bottom: 1px solid #e5e7eb;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .totals-section {
            width: 300px;
            margin-left: auto;
            margin-top: 10px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
          }
          
          .grand-total {
            font-size: 12px;
            font-weight: bold;
            color: #15803d;
            border-top: 1px solid #15803d;
            margin-top: 6px;
            padding-top: 6px;
          }
          
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            text-align: center;
            color: #666;
            font-size: 9px;
            border-top: 1px solid #e5e7eb;
          }
          
          .thank-you {
            text-align: center;
            margin: 15px 0;
            padding: 12px;
            color: #15803d;
            font-weight: 600;
            font-size: 11px;
          }
          
          .print-info {
            margin-top: 5px;
            color: #999;
          }
          
          @media print {
            @page { margin: 0.5cm; }
            .no-print { display: none !important; }
            body { margin: 0; }
          }
          
          .print-button {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #dc2626;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            z-index: 1000;
            font-size: 11px;
          }
          
          .logo-img {
            height: 40px;
            margin-bottom: 5px;
          }

          .status-badge {
            background: #dcfce7;
            color: #15803d;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Print Return</button>
        <div class="invoice-container">
          ${purchaseReturnHTML}
        </div>
        <script>
          window.onload = () => setTimeout(() => window.print(), 500);
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (buttonType) {
    return (
      <Tooltip title="Print Return">
        <Button
          onClick={handlePrint}
          icon={<Printer size={14} />}
          danger
        ></Button>
      </Tooltip>
    );
  }

  return (
    <div className="">
      <Button onClick={handlePrint} danger>
        <Printer className="mr-1" size={12} />
        Print Return
      </Button>
    </div>
  );
};

export default PurchaseReturnPrint;
