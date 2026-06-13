import { Printer, Download } from "lucide-react";
import CustomActionButton from "../Button/CustomActionButton";

interface PrintProps {
  invoice: any;
  fileName?: string;

  buttonType?: string;
}

const SalesInvoicesPrint: React.FC<PrintProps> = ({ invoice, buttonType }) => {
  const otherInfo = invoice;
  const logoUrl = "/images/logo/logo.png";
  const backgroundImageUrl = "/images/logo/logo2.png";
  const generateInvoiceHTML = (data: any) => {
    if (!data) return "<div>No invoice data available</div>";

    const items = data.items || [];
    const customer = data.customer || {};

    // Calculate totals
    const subtotal =
      data.totalAmount ||
      items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);
    const discount = data.discount || 0;
    const deliveryCharge = data.deliveryCharge || 0;
    const otherCharge = data.otherCharge || 0;
    const grandTotal =
      data.finalAmount || subtotal - discount + deliveryCharge + otherCharge;

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
              Address: ${
                data.companyAddress || "Block B, Bosila, House 15, 1 / B, Rd 9"
              }<br>
              Phone: ${data.companyPhone || "+880 1327-406604"}<br>
              Email: ${data.companyEmail || "amzadfoodbd@gmail.com"}
            </p>
          </div>
          <div class="invoice-meta">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${data.invoiceNumber || "N/A"}</div>
            <div style="margin-top: 8px; color: #666; font-size: 10px;">
              <strong>Date:<strong>
  ${
    data.createdAt
      ? new Date(data.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
  }
</strong><br>
Status:</strong> <span class="status-badge">${data.status || "Completed"}</span>
<span><div>
              <span class="info-label">Payment Method:- </span>
              <span class="info-value" style="text-transform: capitalize;">${
                data.paymentMethod || "N/A"
              }</span>
            </div></span>
            </div>
          </div>
          
        </div>
        
        <!-- Customer & Invoice Details -->
      
          <div class="info-card">
            <h3>Bill To</h3>
            <div class='customer'><div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${customer.name || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${customer.phone || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${customer.email || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span class="info-value">${customer.address || "N/A"}</span>
            </div>
            </div>
          </div>
          
         

        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item: any) => `
              <tr>
                <td>
                  <strong>${item.product?.name || "Product"}</strong>
                  ${
                    item.product?.category?.name
                      ? `<br><small style="color: #666;">${item.product.category.name}</small>`
                      : ""
                  }
                </td>
                <td>${item.variant?.name || "Standard"}</td>
                <td class="text-right">${item.quantity || 0}</td>
                <td class="text-right">TK ${(
                  item.unitPrice || 0
                ).toLocaleString()}</td>
                <td class="text-right"><strong>TK ${(
                  item.totalPrice || 0
                ).toLocaleString()}</strong></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>TK ${subtotal.toLocaleString()}</span>
          </div>
          ${
            discount > 0
              ? `
            <div class="total-row">
              <span>Discount:</span>
              <span style="color: #15803d;">-TK ${discount.toLocaleString()}</span>
            </div>
          `
              : ""
          }
          ${
            deliveryCharge > 0
              ? `
            <div class="total-row">
              <span>Delivery:</span>
              <span>TK ${deliveryCharge.toLocaleString()}</span>
            </div>
          `
              : ""
          }
          ${
            otherCharge > 0
              ? `
            <div class="total-row">
              <span>Other Charge:</span>
              <span>TK ${otherCharge.toLocaleString()}</span>
            </div>
          `
              : ""
          }
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>TK ${grandTotal.toLocaleString()}</span>
          </div>
          ${
            data.paid !== undefined
              ? `
            <div class="total-row">
              <span>Paid Amount:</span>
              <span style="color: #15803d;">TK ${data.paid.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Due Amount:</span>
              <span style="color: #15803d;">TK ${(
                grandTotal - data.paid
              ).toLocaleString()}</span>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const invoiceHTML = generateInvoiceHTML(otherInfo);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${otherInfo?.invoiceNumber || ""}</title>
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
.info-row{
display : flex ;
 justify-content: space-between;
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
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Print Invoice</button>
        <div class="invoice-container">
          ${invoiceHTML}
        </div>
        <script>
          window.onload = () => setTimeout(() => window.print(), 500);
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownload = async () => {
    // Create a temporary div with the exact same design as print
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = generateInvoiceHTML(otherInfo);

    // Use the EXACT SAME styles as print version
    const styles = document.createElement("style");
    styles.textContent = `
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
      
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 10px;
      }
      
      .items-table th {
        background: #15803d;
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
      }
      
      .thank-you {
        text-align: center;
        margin: 15px 0;
        padding: 12px;
        color: #15803d;
        font-weight: 600;
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
    `;

    const container = document.createElement("div");
    container.className = "invoice-container";
    container.appendChild(styles);
    container.appendChild(tempDiv);

    // Load html2pdf library dynamically
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

      script.onload = () => {
        const options = {
          margin: [10, 10, 10, 10], // Small margins to match print
          filename: `invoice-${otherInfo?.invoiceNumber || "unknown"}.pdf`,
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollY: 0,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            compress: true,
          },
        };

        // @ts-expect-error print
        html2pdf().set(options).from(container).save();
        resolve(true);
      };

      document.head.appendChild(script);
    });
  };

  if (buttonType) {
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        <CustomActionButton
          text="Download PDF"
          type="primary"
          onClick={handleDownload}
          icon={<Download size={14} />}
        />
        <CustomActionButton
          text="Print Invoice"
          onClick={handlePrint}
          icon={<Printer size={14} />}
        />
      </div>
    );
  }

  return (
    <div className="-mr-2">
      <button
        onClick={handleDownload}
        style={{
          color: "#000",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          fontSize: "13px",
          padding: "6px 0px",
        }}
      >
        <Download className="mr-1" size={12} />
        Download PDF
      </button>
      <button
        onClick={handlePrint}
        style={{
          color: "#000",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          fontSize: "13px",
          padding: "6px 0px",
        }}
      >
        <Printer className="mr-1" size={12} />
        Print Invoice
      </button>
    </div>
  );
};

export default SalesInvoicesPrint;
