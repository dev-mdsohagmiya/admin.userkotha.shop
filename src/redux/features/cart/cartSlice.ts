import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
interface Thumbnail {
  id: string;
  url: string | null;
}

interface BaseUnit {
  id: string;
  name: string;
  symbol: string;
}

interface IProductVariant {
  baseUnit: BaseUnit;
  categoryId: string;
  categoryName: string;
  conversionFactor: number;
  currentStock: number;
  discountedPrice: number | null;
  maxStock: number;
  minStock: number;
  productId: string;
  productName: string;
  productType: string;
  sellingPrice: number;
  sku: string;
  thumbnail: Thumbnail;
  variantId: string;
  variantName: string;
}

interface TCartProduct extends IProductVariant {
  orderQuantity: number;
}

interface TInitialState {
  products: TCartProduct[];
  totalAmount: number;
}

const initialState: TInitialState = {
  products: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      if (
        action.payload.currentStock === 0 ||
        action.payload.currentStock < 0
      ) {
        return;
      }

      const exists = state.products.find(
        (product) => product.orderQuantity === action.payload.currentStock
      );

      if (exists) {
        return;
      }

      const matchProduct = state.products.find(
        (product) => product.variantId === action.payload.variantId
      );

      if (matchProduct) {
        matchProduct.orderQuantity += 1;
        return;
      } else {
        state.products.push({ ...action.payload, orderQuantity: 1 });
      }
    },

    incrementProductQuantity: (state, action) => {
      const matchProduct = state.products.find(
        (product) => product.variantId === action.payload.variantId
      );
      const exists = state.products.find(
        (product) => product.orderQuantity === action.payload.currentStock
      );

      if (exists) {
        return;
      }
      if (matchProduct) {
        matchProduct.orderQuantity += 1;
        return;
      }
    },
    decrementProductQuantity: (state, action) => {
      const matchProduct = state.products.find(
        (product) => product.variantId === action.payload.variantId
      );

      if (matchProduct) {
        if (matchProduct.orderQuantity > 1) {
          matchProduct.orderQuantity -= 1;
        }
      }
    },
    clearCart: (state, action) => {
      state.products = state.products.filter(
        (product) => product.variantId !== action.payload.variantId
      );
    },
    clearAllCart: (state) => {
      // new: remove all products and reset total
      state.products = [];
      state.totalAmount = 0;
    },

    totalAmount: (state) => {
      const productsTotal = state.products.reduce((sum, item) => {
        return sum + Number(item.sellingPrice) * Number(item.orderQuantity);
      }, 0);

      state.totalAmount = productsTotal;
    },
  },
});

export const productSelector = (state: RootState) => {
  return state.cart.products;
};
export const totalAmountValue = (state: RootState) => {
  return state.cart.totalAmount;
};
export const {
  addProduct,
  incrementProductQuantity,
  decrementProductQuantity,
  clearCart,
  totalAmount,
  clearAllCart,
} = cartSlice.actions;

export default cartSlice.reducer;
