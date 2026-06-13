export interface ICoupon {
  id?: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  applicableProducts?: string[];
  applicableProductDetails?: {
    id: string;
    name: string;
    slug: string;
    thumbnail?: {
      url: string;
      altText?: string;
    };
  }[];
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICouponResponse {
  data: ICoupon[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
