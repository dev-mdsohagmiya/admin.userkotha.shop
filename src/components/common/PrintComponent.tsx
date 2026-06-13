import dayjs from "dayjs";
import React from "react";

export interface PrintConfig {
  type: "page" | "custom";
  title?: string;
  companyName?: string;
  documentTitle?: string;
  headerInfo?: Array<{
    label: string;
    value: string;
  }>;
  tableData?: {
    columns: Array<{
      title: string;
      key: string;
      render?: (value: any) => string;
    }>;
    data: any[];
  };
  summaryData?: Array<{
    label: string;
    value: string | number;
    isTotal?: boolean;
  }>;
  footerText?: string;
}

interface PrintComponentProps {
  config: PrintConfig;
  children?: React.ReactElement;
}

const PrintComponent: React.FC<PrintComponentProps> = ({
  config,
  children,
}) => {
  const handlePrint = () => {
    if (config.type === "page") {
      window.print();
      return;
    }

    if (config.type === "custom") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${config.title || "Print Document"}</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 15px;
                line-height: 1.4;
                color: #333;
                background: white;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #1f2937;
                padding-bottom: 12px;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 15px;
                border-radius: 6px;
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .document-title {
                font-size: 18px;
                color: #4b5563;
                margin-bottom: 15px;
                font-weight: 600;
              }
              .info-section {
                margin-bottom: 15px;
                background: #f9fafb;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
              }
              .info-section h3 {
                margin: 0 0 10px 0;
                color: #1f2937;
                font-size: 14px;
                font-weight: 600;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 3px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
              }
              .info-item {
                margin-bottom: 6px;
                display: flex;
                align-items: center;
              }
              .info-label {
                font-weight: 600;
                display: inline-block;
                width: 140px;
                color: #374151;
                font-size: 13px;
              }
              .info-value {
                color: #111827;
                font-size: 13px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border-radius: 6px;
                overflow: hidden;
              }
              th, td {
                border: 1px solid #d1d5db;
                padding: 8px 10px;
                text-align: left;
                font-size: 13px;
              }
              th {
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                color: white;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 0.5px;
              }
              tbody tr:nth-child(even) {
                background-color: #f9fafb;
              }
              tbody tr:hover {
                background-color: #f3f4f6;
              }
              .summary-section {
                margin-top: 20px;
                background: #f8fafc;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
              }
              .summary-title {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 10px;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 5px;
              }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
              }
              .summary-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .summary-item.total {
                border-bottom: 2px solid #1f2937;
                font-weight: bold;
                font-size: 14px;
                color: #1f2937;
                margin-top: 8px;
                padding-top: 10px;
              }
              .summary-label {
                font-weight: 500;
                color: #374151;
              }
              .summary-value {
                font-weight: 600;
                color: #111827;
              }
              .footer {
                margin-top: 25px;
                text-align: center;
                font-size: 11px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
                padding-top: 12px;
              }
              .footer p {
                margin: 3px 0;
              }
              @media print {
                body {
                  margin: 0;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                .header {
                  background: white !important;
                  -webkit-print-color-adjust: exact;
                }
                table {
                  page-break-inside: avoid;
                }
                .summary-section {
                  page-break-inside: avoid;
                }
              }
              @page {
                margin: 0.5in;
                size: A4;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">${
                config.companyName || "Amzad Food Industries"
              }</div>
              <div class="document-title">${
                config.documentTitle || "Document"
              }</div>
            </div>

            ${
              config.headerInfo
                ? `
              <div class="info-section">
                <div class="info-grid">
                  ${config.headerInfo
                    .map(
                      (info) => `
                    <div class="info-item">
                      <span class="info-label">${info.label}:</span>
                      <span class="info-value">${info.value}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

            ${
              config.tableData
                ? `
              <table>
                <thead>
                  <tr>
                    ${config.tableData.columns
                      .map((col) => `<th>${col.title}</th>`)
                      .join("")}
                  </tr>
                </thead>
                <tbody>
                  ${config.tableData.data
                    .map(
                      (row) => `
                    <tr>
                      ${config
                        .tableData!.columns.map((col) => {
                          const value = row[col.key];
                          const displayValue = col.render
                            ? col.render(value)
                            : value;
                          return `<td>${displayValue}</td>`;
                        })
                        .join("")}
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
                : ""
            }

            ${
              config.summaryData
                ? `
              <div class="summary-section">
                <div class="summary-title">Summary</div>
                <div class="summary-grid">
                  <div>
                    ${config.summaryData
                      .map(
                        (item) => `
                      <div class="summary-item ${item.isTotal ? "total" : ""}">
                        <span class="summary-label">${item.label}:</span>
                        <span class="summary-value">${item.value}</span>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            `
                : ""
            }

            <div class="footer">
              <p>${
                config.footerText ||
                "Generated on " + dayjs().format("DD/MM/YYYY HH:mm:ss")
              }</p>
              <p>Amzad Food Industries - ERP System</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <>
      {children ? (
        React.cloneElement(children, {
          onClick: handlePrint,
        } as any)
      ) : (
        <button onClick={handlePrint} className="print-button">
          Print
        </button>
      )}
    </>
  );
};

export default PrintComponent;
