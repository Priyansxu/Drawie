import { configureStore } from "@reduxjs/toolkit";
import menuSlice from "./slices/menuSlice";
import toolboxSlice from "./slices/toolboxSlice";
export const store = configureStore({
  reducer: {
    menu: menuSlice,
    tool: toolboxSlice,
  },
});
