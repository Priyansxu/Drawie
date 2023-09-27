import { configureStore } from "@reduxjs/toolkit";
import menuSlice from "./pages/slices/menuSlice";
import toolBoxSlice from "./pages/slices/toolBoxSlice";
export const store =configureStore({
reducer:{ 
    menu: menuSlice ,
    tool:toolBoxSlice,
} ,

})