import { configureStore } from "@reduxjs/toolkit";
import menuSlice from "@/slices/menuSlice";
import toolBoxSlice from "@/slices/toolBoxSlice";
export const store = configureStore({
  reducer: {
    menu: menuSlice,
    tool: toolBoxSlice,
  },
});
