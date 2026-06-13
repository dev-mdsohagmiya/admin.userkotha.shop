import { IOrder } from "../../../types/order";
import { getPrintStyles } from "../../../styles/printStyles";

const OrderPickingSheetPrint = {
  print: (orders: IOrder[]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const logoUrl = "/images/logo/logo.png";
    const backgroundImageUrl = "/images/logo/logo2.png";

    // Aggregate products
    const productMap: Record<
      string,
      {
        name: string;
        sku: string;
        image: string;
        qty: number;
        orderNumbers: string[];
      }
    > = {};

    let totalProductsCount = 0;

    orders.forEach((order) => {
      order.orderProducts?.forEach((item) => {
        const product = item.product;
        const sku = product?.sku || "N/A";
        const key = sku;

        if (!productMap[key]) {
          productMap[key] = {
            name: product?.name || "Unknown Product",
            sku: sku,
            image: product?.thumbnail?.url || "/placeholder.png",
            qty: 0,
            orderNumbers: [],
          };
        }

        productMap[key].qty += item.quantity;
        totalProductsCount += item.quantity;
        const orderIdentifier =
          (order as any).sale?.invoiceNumber ||
          order.id?.substr(-8).toUpperCase() ||
          "N/A";
        if (!productMap[key].orderNumbers.includes(orderIdentifier)) {
          productMap[key].orderNumbers.push(orderIdentifier);
        }
      });
    });

    const productList = Object.values(productMap);
    const dateStr = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const tableRows = productList
      .map(
        (p, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td style="text-align: center;"><img src="${p.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/40'" /></td>
        <td style="font-weight: 600; color: #1e293b;">${p.sku}</td>
        <td style="text-align: center;"><span style="background: #15803d; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">${p.qty}</span></td>
        <td style="font-weight: 500;">${p.name}</td>
        <td style="font-size: 10px; color: #64748b; line-height: 1.4;">${p.orderNumbers.join(", ")}</td>
        <td style="text-align: center;"><div style="width: 18px; height: 18px; border: 1.5px solid #cbd5e1; border-radius: 3px; display: inline-block;"></div></td>
      </tr>
    `,
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>Picking List - ${orders.length} Orders</title>
          <style>
            ${getPrintStyles(backgroundImageUrl)}
            th { padding: 8px 10px !important; font-size: 11px !important; }
            td { padding: 8px 10px !important; font-size: 11px !important; border-bottom: 1px solid #f1f5f9 !important; }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">Print Picking List</button>
          
          <div class="page-container">
            <div class="header">
              <img src="${logoUrl}" alt="UserKotha.Shop" />
              <div class="title">Warehouse Picking List</div>
              <div class="subtitle">
                Total Orders: <strong>${orders.length}</strong> | 
                Total Items: <strong>${totalProductsCount}</strong> | 
                Date: ${dateStr}
              </div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th width="40" style="text-align: center;">SL</th>
                    <th width="60" style="text-align: center;">Image</th>
                    <th width="100">SKU</th>
                    <th width="60" style="text-align: center;">Qty</th>
                    <th width="220">Product Name</th>
                    <th>Order Numbers</th>
                    <th width="60" style="text-align: center;">Picked</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>

            <div class="footer">
              <p>UserKotha.Shop - Warehouse Management System</p>
              <p>Please check quality before packing.</p>
            </div>
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                // window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  },
};

export default OrderPickingSheetPrint;
