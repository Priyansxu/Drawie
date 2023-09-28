import { COLORS, MENU_ITEMS } from "@/constants";
import styles from "./index.module.css";
import { useSelector, useDispatch } from "react-redux";
import { changeBrushSize, changeColor } from "@/slices/toolboxSlice";
import cx from "classnames";
import { socket } from "@/socket";
const Toolbox = () => {
  const dispatch = useDispatch();
  const activeMenuItem = useSelector((store) => store.menu.activeMenuItem);
  const { color, size } = useSelector((store) => store.tool[activeMenuItem]);
  const showStrokeToolOption = activeMenuItem === MENU_ITEMS.PENCIL;
  const showBrushToolOption =
    activeMenuItem === MENU_ITEMS.PENCIL ||
    activeMenuItem === MENU_ITEMS.ERASER;
  const handleBrushSize = (e) => {
    dispatch(changeBrushSize({ item: activeMenuItem, size: e.target.value }));
    socket.emit("changeConfig", { color, size: e.target.value });
  };
  const handleColor = (newColor) => {
    dispatch(changeColor({ item: activeMenuItem, color: newColor }));
    socket.emit("changeConfig", { color: newColor, size });
  };
  return (
    <div className={styles.toolboxContainer}>
      {showStrokeToolOption && (
        <div className={styles.toolItem}>
          <hd className={styles.toolText}>Stroke Color</hd>
          <div className={styles.itemContainer}>
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.BLACK,
              })}
              style={{ backgroundColor: COLORS.BLACK }}
              onClick={() => handleColor(COLORS.BLACK)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.BLUE,
              })}
              style={{ backgroundColor: COLORS.BLUE }}
              onClick={() => handleColor(COLORS.BLUE)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.RED,
              })}
              style={{ backgroundColor: COLORS.RED }}
              onClick={() => handleColor(COLORS.RED)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.GREEN,
              })}
              style={{ backgroundColor: COLORS.GREEN }}
              onClick={() => handleColor(COLORS.GREEN)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.ORANGE,
              })}
              style={{ backgroundColor: COLORS.ORANGE }}
              onClick={() => handleColor(COLORS.ORANGE)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.YELLOW,
              })}
              style={{ backgroundColor: COLORS.YELLOW }}
              onClick={() => handleColor(COLORS.YELLOW)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.WHITE,
              })}
              style={{ backgroundColor: COLORS.WHITE }}
              onClick={() => handleColor(COLORS.WHITE)}
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
              max={50}
              step={1}
              value={size}
              onChange={handleBrushSize}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbox;
