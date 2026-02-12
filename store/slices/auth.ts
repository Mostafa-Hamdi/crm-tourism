import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * User data returned by backend
 */
export interface User {
  fullName: string;
  email: string;
  roles: string[];
  id: number;
  permissions: string[];
}

/**
 * Auth state
 */
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

/**
 * Initial state
 */
const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

/**
 * Login / refresh response payload
 */
interface AuthPayload {
  token: string;
  fullName: string;
  email: string;
  roles: string[];
  id: number;
  permissions: string[];
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set full auth state after login / refresh
     */
    setAuth: (state, action: PayloadAction<AuthPayload>) => {
      state.token = action.payload.token;
      state.user = {
        fullName: action.payload.fullName,
        email: action.payload.email,
        roles: action.payload.roles,
        id: action.payload.id,
        permissions: action.payload.permissions,
      };
      state.isAuthenticated = true;
    },

    /**
     * Only update token (used for refresh token flow)
     */
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },

    /**
     * Clear auth state
     */
    logout: () => initialState,
  },
});

export const { setAuth, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
