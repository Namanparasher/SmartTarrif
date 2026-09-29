import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import planReducer from "./slices/planSlice";
import usageReducer from "./slices/usageSlice";
import recommendationReducer from "./slices/recommendationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: planReducer,
    usage: usageReducer,
    recommendations: recommendationReducer,
  },
});
