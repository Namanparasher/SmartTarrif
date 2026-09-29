import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { recommendationApi } from "@/services/recommendationApi";

export const fetchMyRecommendations = createAsyncThunk("recommendations/fetchMine", async (customerId, { rejectWithValue }) => {
  try {
    const res = await recommendationApi.getMine(customerId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const generateRecommendationsThunk = createAsyncThunk("recommendations/generate", async (customerId, { rejectWithValue }) => {
  try {
    const res = await recommendationApi.generate(customerId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  latest: null,
  status: "idle",
  error: null,
};

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRecommendations.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchMyRecommendations.fulfilled, (state, action) => { state.status = "succeeded"; state.latest = action.payload; })
      .addCase(fetchMyRecommendations.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(generateRecommendationsThunk.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(generateRecommendationsThunk.fulfilled, (state, action) => { state.status = "succeeded"; state.latest = action.payload; })
      .addCase(generateRecommendationsThunk.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; });
  },
});

export default recommendationSlice.reducer;
