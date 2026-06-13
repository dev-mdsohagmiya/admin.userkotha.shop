import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ICartItem {
  id: string; // variant id
  productId: string;
  name: string; // variant name
  productName: string; // product name
  sku?: string;
  price: number; // discounted or selling price
  sellingPrice: number;
  discountedPrice?: number;
  quantity: number;
  currentStock: number;
  thumbnail?: {
    url: string;
  };
}

interface NewOrderCartState {
  items: ICartItem[];
}

const initialState: NewOrderCartState = {
  items: [],
};

const newOrderCartSlice = createSlice({
  name: "newOrderCart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<ICartItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );

      if (existingItem) {
        // Increase quantity if item exists
        existingItem.quantity += 1;
      } else {
        // Add new item with quantity 1
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },

    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item && action.payload.quantity >= 1) {
        item.quantity = action.payload.quantity;
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  updateQuantity,
  clearCart,
} = newOrderCartSlice.actions;

export default newOrderCartSlice.reducer;
