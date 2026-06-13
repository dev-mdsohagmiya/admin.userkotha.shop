import { IOrder } from "../../../types/order";

const OrderStickerPrint = {
  print: (orders: IOrder[]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const generateStickerHTML = (order: IOrder) => {
      const customer: any = order.user || order.customer || {};
      const customerName = customer.name || "N/A";
      const customerPhone = customer.phone || "N/A";
      const customerAddress = order.address || customer.address || "N/A";
      const products = order.orderProducts || [];
      const date = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "N/A";
      const dueAmount = Number(order.totalPrice || 0);
      const subTotal = Number(order.subTotal || 0);
      const deliveryFee = Number(order.deliveryCharge || 0);

      // Concise and informative data for a clean scan pattern
      const qrText = `Order: #${order.id?.substr(-8).toUpperCase()}
Customer: ${customerName}
Phone: ${customerPhone}
Total: Tk ${dueAmount.toLocaleString()}`;

      const qrData = encodeURIComponent(qrText);

      return `
        <div class="sticker">
          <div class="sticker-header">
            <div class="header-left">
              <h1 class="brand-name">Amzad Food</h1>
              <p class="hotline">Hotline: 09613824072</p>
              <p class="meta">DATE: ${date}</p>
              <p class="meta">Courier: ${order.deliveryMethod || "N/A"}</p>
            </div>
            <div class="header-right" style="display: flex; gap: 10px; align-items: center;">
              <div class="qr-code">
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}" style="width: 55px; height: 55px; border: 1px solid #ddd; padding: 2px;" alt="QR" />
              </div>
              <div class="id-sections">
                <div class="parcel-id-label">Parcel Id</div>
                <div class="parcel-id-box">N/A</div>
                <div class="barcode">
                  <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${order.id?.substr(-8).toUpperCase()}&scale=2&rotate=N&includetext=true" style="width: 100px; height: 40px;" alt="Barcode" />
                  <div class="barcode-text">${order.id?.substr(-8).toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="invoice-to">
             <h3 class="section-title">Invoice To:</h3>
             <div class="customer-info">
               <div class="info-row">
                 <span class="icon">👤</span> ${customerName}
               </div>
               <div class="info-row">
                 <span class="icon">📞</span> ${customerPhone}
               </div>
               <div class="info-row address">
                 <span class="icon">🏠</span> ${customerAddress}
               </div>
             </div>
          </div>

          <table class="product-table">
            <thead>
              <tr>
                <th align="left">Product</th>
                <th align="center">Qty</th>
                <th align="right">Price</th>
              </tr>
            </thead>
            <tbody>
              ${products
                .map((p) => {
                  const isCombo = !!(p as any).comboProduct;
                  const mainItem = isCombo
                    ? (p as any).comboProduct
                    : p.product;
                  const mainVariant = isCombo
                    ? (p as any).comboVariant
                    : p.variant;

                  const unitPrice = Number(
                    (p as any).discountPrice > 0
                      ? (p as any).discountPrice
                      : mainVariant?.sellingPrice ||
                          mainItem?.sellingPrice ||
                          p.price ||
                          0,
                  );

                  return `
                <tr>
                  <td>${mainItem?.name || "Product"}</td>
                  <td align="center">${p.quantity}</td>
                  <td align="right">${unitPrice.toLocaleString()}</td>
                </tr>
              `;
                })
                .join("")}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Sub Total</span>
              <span>${subTotal.toLocaleString()}</span>
            </div>
            ${
              (order.couponDiscount || 0) > 0
                ? `
            <div class="total-row">
              <span>Coupon Discount</span>
              <span>-${(order.couponDiscount || 0).toLocaleString()}</span>
            </div>
            `
                : ""
            }
            ${
              (order.extraDiscount || 0) > 0
                ? `
            <div class="total-row">
              <span>Extra Discount</span>
              <span>-${(order.extraDiscount || 0).toLocaleString()}</span>
            </div>
            `
                : ""
            }
            <div class="total-row">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toLocaleString()}</span>
            </div>
            ${
              (order.advance || 0) > 0
                ? `
            <div class="total-row" style="color: #15803d; font-weight: 600;">
              <span>Advance Paid</span>
              <span>-${(order.advance || 0).toLocaleString()}</span>
            </div>
            `
                : ""
            }
            <div class="total-row important">
              <span>Collection Amount</span>
              <span>${dueAmount.toLocaleString()}</span>
            </div>
          </div>

          <div class="order-note-container">
            <div class="note-label">Order Note:</div>
            <div class="note-box">${order.shippingNote || "N/A"}</div>
          </div>
        </div>
      `;
    };

    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
      
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
      body { background: #f0f0f0; padding: 20px; }
      
      .sticker {
        width: 100mm;
        background: #white;
        border: 1px solid #ddd;
        padding: 10px;
        margin-bottom: 20px;
        background: white;
        position: relative;
        overflow: hidden;
      }

      @media print {
        body { background: white; padding: 0; }
        .sticker { border: none; margin: 0; page-break-after: always; width: 100mm; height: 150mm; }
        .no-print { display: none; }
      }

      .sticker-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
      .brand-name { font-size: 20px; font-weight: 800; color: #000; }
      .hotline { font-size: 11px; font-weight: 700; margin: 2px 0; }
      .meta { font-size: 10px; color: #333; margin: 1px 0; }
      
      .header-right { text-align: center; }
      .parcel-id-label { font-size: 14px; font-weight: 800; margin-bottom: 2px; }
      .parcel-id-box { background: #000; color: #fff; padding: 2px 10px; font-size: 16px; font-weight: 700; margin-bottom: 15px; }
      
      .barcode img { width: 100px; height: 40px; }
      .barcode-text { font-size: 10px; margin-top: 2px; }

      .invoice-to { margin: 10px 0; }
      .section-title { font-size: 11px; font-weight: 800; margin-bottom: 5px; }
      .customer-info { font-size: 10px; line-height: 1.4; }
      .info-row { display: flex; align-items: flex-start; gap: 5px; margin-bottom: 2px; }
      .info-row.address { margin-top: 4px; border-top: 1px dashed #eee; padding-top: 4px; }
      .icon { font-size: 12px; }

      .product-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
      .product-table th { border-bottom: 1px solid #eee; padding: 4px; color: #333; }
      .product-table td { padding: 4px; border-bottom: 1px solid #f9f9f9; }

      .totals { border-top: 1px solid #eee; padding-top: 8px; }
      .total-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #444; }
      .total-row.important { font-weight: 800; font-size: 13px; color: #000; margin-top: 5px; }

      
      .order-note-container { margin-top: 15px; text-align: center; }
      .note-label { font-size: 9px; margin-bottom: 3px; }
      .note-box { border: 1px solid #ddd; padding: 5px; font-size: 10px; min-height: 30px; }
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Stickers - ${orders.length} orders</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; padding: 10px; background: #fff; border-bottom: 1px solid #ddd; position: sticky; top: 0; z-index: 100;">
            <button onclick="window.print()" style="padding: 8px 20px; background: #1BA143; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Print Stickers</button>
          </div>
          ${orders.map((o) => generateStickerHTML(o)).join("")}
          <script>
            window.onload = () => {
               // setTimeout(() => { window.print(); }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  },
};

export default OrderStickerPrint;
