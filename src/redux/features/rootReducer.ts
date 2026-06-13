import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { baseApi } from "../api/baseApi";
import authReducer from "./auth/authSlice";
import sidebarReducer from "./sidebar/sidebarSlice";
import cartReducer from "./cart/cartSlice";
import newOrderCartReducer from "./newOrder/newOrderCartSlice";

const persistConfig = {
  key: "auth",
  storage,
};

// change code
const cartPersistConfig = {
  key: "cart",
  storage,
};

const newOrderCartPersistConfig = {
  key: "newOrderCart",
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
// change this
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedNewOrderCartReducer = persistReducer(
  newOrderCartPersistConfig,
  newOrderCartReducer,
);

export const reducer = {
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistedAuthReducer,
  sidebar: sidebarReducer,
  // change this
  cart: persistedCartReducer,
  newOrderCart: persistedNewOrderCartReducer,
};
