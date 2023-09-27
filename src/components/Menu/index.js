import { ArrowDownCircle, Eraser, Pencil, Redo, Undo } from "lucide-react";
import styles from "./index.module.css";
import { useDispatch } from "react-redux";
import { menuItemClick } from "@/pages/slices/menuSlice";
import { useSelector } from "react-redux";
import { MENU_ITEMS } from "@/constants";
import cx from "classnames";
const Menu = () => {
  const activeMenuItem = useSelector((store) => store.menu.activeMenuItem);

  const dispatch = useDispatch();

  const handleClick = (menuItem) => {
    dispatch(menuItemClick(menuItem));
  };

  return (
    <div className={styles.menuContainer}>
      <div
         className={cx(styles.iconWrapper,{[styles.active]:activeMenuItem === MENU_ITEMS.PENCIL})}
        onClick={() => {
          handleClick(MENU_ITEMS.PENCIL);
        }}>
        <Pencil className={styles.icon} />
      </div>
      <div
        className={cx(styles.iconWrapper,{[styles.active]:activeMenuItem === MENU_ITEMS.ERASER})}
        onClick={() => {
          handleClick(MENU_ITEMS.ERASER);
        }}>
        <Eraser className={styles.icon} />
      </div>
      <div className={styles.iconWrapper}>
        <Undo className={styles.icon} />
      </div>
      <div className={styles.iconWrapper}>
        <Redo className={styles.icon} />
      </div>
      <div className={styles.iconWrapper}>
        <ArrowDownCircle className={styles.icon} />
      </div>
    </div>
  );
};

export default Menu;
