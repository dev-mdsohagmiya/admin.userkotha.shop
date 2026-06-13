import { ICustomer } from "./customer";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "HOLD"
  | "CONFIRM"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "GOOD_BUT_NO_RESPONSE"
  | "NO_RESPONSE"
  | "ADVANCE_REQUIRED"
  | "preorder";

export interface IOrderProduct {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    thumbnail?: { url: string };
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    thumbnail?: { url: string };
  };
}

export interface IOrderPayment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  id: string;
  customer?: ICustomer;
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    customerProfile?: {
      address?: string;
    };
  };
  address: string;
  paymentMethod?: string;
  deliveryMethod: string;
  orderSource: string | any;
  orderSourceId?: string;
  subTotal?: number;
  totalPrice?: number;
  couponDiscount: number;
  advance: number;
  deliveryCharge: number;
  extraDiscount?: number;
  notes: string;
  status: OrderStatus;
  orderProducts: IOrderProduct[];
  isPreorder?: boolean;
  isCrossSale?: boolean;
  referenceLink?: string;
  shippingNote?: string;
  transactionId?: string;
  advancePaymentDeliveryMethod?: string;
  customerEmail?: string;
  transactions?: any[];
  activityLogs?: IActivityLog[];
  orderPayments?: IOrderPayment[];
  lockStatus?: {
    isLocked: boolean;
    maintainer: {
      id: string;
      name: string;
      email?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface IActivityLog {
  id: string;
  orderId: string;
  action: string;
  details: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface IOrderResponse {
  success: boolean;
  message: string;
  data: IOrder;
}

export interface IOrderListResponse {
  success: boolean;
  message: string;
  data: IOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface IUpdateOrderPayload {
  customerPhone?: string;
  customerName?: string;
  customerAddress?: string;
  products?: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  deliveryMethod?: string;
  deliveryCharge?: number;
  paymentMethod?: string;
  orderSourceId?: string;
  shippingNote?: string;
  referenceLink?: string;
  isPreorder?: boolean;
  isCrossSale?: boolean;
  discount?: number;
  extraDiscount?: number;
  advance?: number;
  transactionId?: string;
  advancePaymentDeliveryMethod?: string | null;
  customerEmail?: string;
}

export interface IUpdateOrderStatusPayload {
  status: OrderStatus;
  followUp?: {
    followUpDate: string;
    description: string;
  };
}

export interface IFollowUpData {
  id: string;
  orderId: string;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
