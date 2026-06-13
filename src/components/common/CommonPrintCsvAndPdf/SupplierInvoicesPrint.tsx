import { Printer } from "lucide-react";
import dayjs from "dayjs";
import { Button, Tooltip } from "antd";

interface PrintProps {
  purchaseNeed: any;
  buttonType?: string;
}

const SupplierInvoicesPrint: React.FC<PrintProps> = ({
  purchaseNeed,
  buttonType,
}) => {
  const logoUrl = "/images/logo/logo.png";
  const backgroundImageUrl = "/images/logo/logo2.png";

  const generatePurchaseNeedHTML = (data: any) => {
    if (!data) return "<div>No purchase need data available</div>";

    const items = data.items || [];
    const supplier = data.supplier || {};

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
          
            <div class="invoice-number">Need Id : ${data.needId || "N/A"}</div>
            <div style="margin-top: 8px; color: #666; font-size: 10px;">
              <strong>Date:</strong> ${dayjs(data.createdAt).format(
                "DD/MM/YYYY",
              )}<br>
              <strong>Status:</strong> <span class="status-badge">${
                data.status?.toUpperCase() || "PENDING"
              }</span><br>
              <strong>Priority:</strong> <span class="priority-badge">${
                data.priority?.toUpperCase() || "LOW"
              }</span>
            </div>
          </div>
        </div>
        
        <!-- Supplier & Request Details -->
        <div class="details-section">
          <div class="info-card">
            <h3>Supplier Information</h3>
            <div class="info-row">
              <span class="info-label">Supplier Name:</span>
              <span class="info-value">${
                supplier.name || data.supplierName || "N/A"
              }</span>
            </div>
            <div class="info-row">
              <span class="info-label">Contact Person:</span>
              <span class="info-value">${
                supplier.contactPerson || data.supplierContactPerson || "N/A"
              }</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${supplier.phone1 || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${supplier.email || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span class="info-value">${
                supplier.address || data.supplierAddress || "N/A"
              }</span>
            </div>
          </div>
          
          
        </div>

        
        <!-- Materials Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>SL</th>
              <th>Material Name</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Max Stock</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total Price</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item: any, index: number) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td><strong>${item.materialName || "Material"}</strong></td>
                <td class="text-center">${item.currentStock || 0}</td>
                <td class="text-center">${item.minStock || 0}</td>
                <td class="text-center">${item.maxStock || 0}</td>
                <td class="text-right">${item.quantity || 0}</td>
                <td class="text-right">TK ${(
                  item.unitPrice || 0
                ).toLocaleString()}</td>
                <td class="text-right"><strong>TK ${(
                  item.totalPrice || 0
                ).toLocaleString()}</strong></td>
                <td class="text-center">${item.unit || "N/A"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <!-- Summary -->
        <div class="totals-section">
          <div class="total-row">
            <span>Total Materials:</span>
            <span>${data.totalMaterials || 0}</span>
          </div>
          <div class="total-row">
            <span>Total Quantity:</span>
            <span>${data.totalQty || 0}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Price:</span>
            <span>TK ${(data.totalPrice || 0).toLocaleString()}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">
            Thank you for your business partnership
          </div>
         
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const purchaseNeedHTML = generatePurchaseNeedHTML(purchaseNeed);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Need ${purchaseNeed?.needId || ""}</title>
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
          }
          
          .company-info h1 {
            color: #15803d;
            font-size: 16px;
            margin-bottom: 3px;
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
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #15803d;
          }
          
          .notes-section h3 {
            color: #15803d;
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
          }
          
          .items-table th {
            background: #1BA143;
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-weight: 600;
          }
          
          .items-table td {
            padding: 6px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .items-table tr:last-child td {
            border-bottom: none;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .totals-section {
            width: 250px;
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
          
          @media print {
            @page { margin: 0.5cm; }
            .no-print { display: none !important; }
            body { margin: 0; }
          }
          
          .print-button {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #15803d;
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

          .priority-badge {
            background: #fef3c7;
            color: #92400e;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Print Purchase Need</button>
        <div class="invoice-container">
          ${purchaseNeedHTML}
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
      <Tooltip title="Print">
        <Button onClick={handlePrint} icon={<Printer size={14} />}></Button>
      </Tooltip>
    );
  }

  return (
    <div className="">
      <Button onClick={handlePrint}>
        <Printer className="mr-1" size={12} />
        Print
      </Button>
    </div>
  );
};

export default SupplierInvoicesPrint;
