import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CUSTOMER" | "SUPPLIER"; // Updated to new role system
  profile_photo?: string;
  last_login: Date;
  is_active: boolean;
  type: string; // "user" or "employee"

  // ADMIN role fields
  designationId?: string;
  designation?: {
    id: string;
    name: string;
    permissions: Array<{
      module: string;
      actions: string[];
    }>;
  };

  // CUSTOMER role fields
  customerId?: string;
  customerProfile?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };

  // SUPPLIER role fields
  supplierId?: string;
  supplierProfile?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

interface TAuthState {
  user?: IUser | null;
  token?: string | null;
  refreshToken?: string | null;
}

const initialState: TAuthState = {
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: IUser; token: string; refreshToken: string }>,
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },
    setProfile: (state, action) => {
      if (state.user) {
        state.user.profile_photo = action.payload;
      }
    },
    setRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
  },
});

export const { setUser, logout, setProfile, setRole } = authSlice.actions;
export default authSlice.reducer;

export const useCurrentToken = (state: RootState) => state.auth.token;
export const selectCurrentUser = (state: RootState) => state.auth.user;
