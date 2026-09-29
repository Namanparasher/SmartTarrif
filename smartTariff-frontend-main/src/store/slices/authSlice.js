import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "@/services/authApi";
import { customerApi } from "@/services/customerApi";

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.login(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.register(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchCurrentUser = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.me();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
  return null;
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async ({ userId, payload }, { rejectWithValue }) => {
  try {
    const res = await customerApi.updateUser(userId, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  user: null,
  status: "idle", // idle | loading | succeeded | failed
  bootstrapped: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.status = "succeeded"; state.user = action.payload.user; })
      .addCase(login.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(register.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.status = "succeeded"; state.user = action.payload.user; })
      .addCase(register.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(fetchCurrentUser.pending, (state) => { state.status = "loading"; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.status = "succeeded"; state.user = action.payload; state.bootstrapped = true; })
      .addCase(fetchCurrentUser.rejected, (state) => { state.status = "failed"; state.user = null; state.bootstrapped = true; })

      .addCase(logout.fulfilled, (state) => { state.user = null; state.status = "idle"; })

      .addCase(updateProfile.fulfilled, (state, action) => { state.user = { ...state.user, ...action.payload }; });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
