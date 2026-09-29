import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { planApi } from "@/services/planApi";

export const fetchPlans = createAsyncThunk("plans/fetchPlans", async (params, { rejectWithValue }) => {
  try {
    const res = await planApi.list(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  items: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
  status: "idle",
  error: null,
  compareList: JSON.parse(sessionStorage.getItem("compareList") || "[]"),
};

const planSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    toggleCompare(state, action) {
      const id = action.payload;
      if (state.compareList.includes(id)) {
        state.compareList = state.compareList.filter((x) => x !== id);
      } else if (state.compareList.length < 3) {
        state.compareList.push(id);
      }
      sessionStorage.setItem("compareList", JSON.stringify(state.compareList));
    },
    clearCompare(state) {
      state.compareList = [];
      sessionStorage.setItem("compareList", JSON.stringify([]));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => { state.status = "loading"; })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPlans.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; });
  },
});

export const { toggleCompare, clearCompare } = planSlice.actions;
export default planSlice.reducer;
