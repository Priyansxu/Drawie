import { COLORS, MENU_ITEMS } from "@/constants";
import styles from "./index.module.css";
import { useSelector } from "react-redux";
const Toolbox = () => {
  const activeMenuItem = useSelector((store) => store.menu.activeMenuItem);
  const showStrokeToolOption = activeMenuItem === MENU_ITEMS.PENCIL;
  const showBrushToolOption =
    activeMenuItem === MENU_ITEMS.PENCIL ||
    activeMenuItem === MENU_ITEMS.ERASER;
  const handleBrushSize = () => {};

  return (
    <div className={styles.toolboxContainer}>
      {showStrokeToolOption && (
        <div className={styles.toolItem}>
          <hd className={styles.toolText}>Stroke Color</hd>
          <div className={styles.itemContainer}>
            <div
              className={styles.colorBox}
              style={{ backgroundColor: COLORS.BLACK }}
            />
            <div
              className={styles.colorBox}
              style={{ backgroundColor: COLORS.BLUE }}
            />
            <div
              className={styles.colorBox}
              style={{ backgroundColor: COLORS.RED }}
            />
            <div
              className={styles.colorBox}
              style={{ backgroundColor: COLORS.GREEN }}
            />
            <div
              className={styles.colorBox}
              style={{ backgroundColor: COLORS.ORANGE }}
            />
            <div
              className={styles.colorBox}
              style={{ backgroundColor: COLORS.YELLOW }}
            />
            <div
              className={styles.colorBox}
              style={{ backgroundColor: COLORS.WHITE }}
            />
          </div>
        </div>
      )}

      {showBrushToolOption && (
        <div className={styles.toolltem}>
          <hd className={styles.toolText}> Brush Size</hd>
          <div className={styles.itesContainer}>
            <input
              type='range'
              min={1}
              max={10}
              step={1}
              onChange={handleBrushSize}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbox;
