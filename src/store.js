import { configureStore } from "@reduxjs/toolkit";
import menuSlice from "./pages/slices/menuSlice";
import toolboxSlice from "./pages/slices/toolboxSlice";
export const store = configureStore({
  reducer: {
    menu: menuSlice,
    tool: toolboxSlice,
  },
});
