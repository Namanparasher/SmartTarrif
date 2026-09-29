import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usageApi } from "@/services/usageApi";

export const fetchMyUsage = createAsyncThunk("usage/fetchMine", async (customerId, { rejectWithValue }) => {
  try {
    const res = await usageApi.getMine(customerId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addUsage = createAsyncThunk("usage/add", async (payload, { rejectWithValue }) => {
  try {
    const res = await usageApi.create(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  records: [],
  status: "idle",
  error: null,
};

const usageSlice = createSlice({
  name: "usage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyUsage.pending, (state) => { state.status = "loading"; })
      .addCase(fetchMyUsage.fulfilled, (state, action) => { state.status = "succeeded"; state.records = action.payload; })
      .addCase(fetchMyUsage.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
      .addCase(addUsage.fulfilled, (state, action) => { state.records.unshift(action.payload); });
  },
});

export default usageSlice.reducer;
