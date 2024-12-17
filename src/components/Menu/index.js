import { ArrowDownCircle, Eraser, Pencil, Redo, Undo } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { menuItemClick, actionItemClick } from "@/slices/menuSlice";
import { MENU_ITEMS } from "@/constants";
import cx from "classnames";

const Menu = () => {
  const activeMenuItem = useSelector((store) => store.menu.activeMenuItem);
  const dispatch = useDispatch();

  const handleClick = (menuItem) => {
    dispatch(menuItemClick(menuItem));
  };

  const handleActionItemClick = (actionItem) => {
    dispatch(actionItemClick(actionItem));
  };

  return (
    <div className="absolute px-5 py-1 flex justify-between md:w-1/4 left-1/2 top-10 rounded-xl md:rounded-md border border-border1 bg-background1 shadow-shadow1 transform -translate-x-1/2">
      <div
        className={cx(
          "cursor-pointer flex justify-center items-center h-10 w-10 rounded-md",
          { "bg-text2": activeMenuItem === MENU_ITEMS.PENCIL }
        )}
        onClick={() => handleClick(MENU_ITEMS.PENCIL)}
      >
        <Pencil className="text-text1 text-[20px]" />
      </div>

      <div
        className={cx(
          "cursor-pointer flex justify-center items-center h-10 w-10 rounded-md",
          { "bg-text2": activeMenuItem === MENU_ITEMS.ERASER }
        )}
        onClick={() => handleClick(MENU_ITEMS.ERASER)}
      >
        <Eraser className="text-text1 text-[20px]" />
      </div>

      <div
        className="cursor-pointer flex justify-center items-center h-10 w-10 rounded-md"
        onClick={() => handleActionItemClick(MENU_ITEMS.UNDO)}
      >
        <Undo className="text-text1 text-[20px]" />
      </div>

      <div
        className="cursor-pointer flex justify-center items-center h-10 w-10 rounded-md"
        onClick={() => handleActionItemClick(MENU_ITEMS.REDO)}
      >
        <Redo className="text-text1 text-[20px]" />
      </div>

      <div
        className="cursor-pointer flex justify-center items-center h-10 w-10 rounded-md"
        onClick={() => handleActionItemClick(MENU_ITEMS.DOWNLOAD)}
      >
        <ArrowDownCircle className="text-text1 text-[20px]" />
      </div>
    </div>
  );
};

export default Menu;