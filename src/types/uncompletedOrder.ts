export interface IUncompletedOrder {
  id: string;
  customerId: string | null;
  customerDeviceIP: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  customerAddress: string | null;
  couponCode?: string | null;
  couponDiscount?: number;
  createdAt: string;
  updatedAt: string;
  checkoutProducts: Array<{
    id: string;
    productName: string;
    quantity: number;
    discountPrice: number;
    offerPrice: number | null;
    sellingPrice: number;
    variantId: string | null;
    comboVariantId: string | null;
  }>;
  fraudCheck?: {
    total_parcels: number;
    total_delivered: string;
    total_cancelled: string;
    total_fraud_reports: any[];
  };
  customerProfile?: {
    orderStats: {
      successRate: number;
      totalOrders: number;
      completedOrders: number;
      rating: number;
    };
  };
}
