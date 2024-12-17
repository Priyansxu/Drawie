import { COLORS, MENU_ITEMS } from "@/constants";
import { useSelector, useDispatch } from "react-redux";
import { changeBrushSize, changeColor } from "@/slices/toolBoxSlice";
import { socket } from "@/socket";

export default function Toolbox() {
  const dispatch = useDispatch();
  const activeMenuItem = useSelector((store) => store.menu.activeMenuItem);
  const { color, size } = useSelector((store) => store.tool[activeMenuItem]);

  const showStrokeToolOption = activeMenuItem === MENU_ITEMS.PENCIL;
  const showBrushToolOption =
    activeMenuItem === MENU_ITEMS.PENCIL || activeMenuItem === MENU_ITEMS.ERASER;

  const handleBrushSize = (e) => {
    dispatch(changeBrushSize({ item: activeMenuItem, size: e.target.value }));
    socket.emit("changeConfig", { color, size: e.target.value });
  };

  const handleColor = (newColor) => {
    dispatch(changeColor({ item: activeMenuItem, color: newColor }));
    socket.emit("changeConfig", { color: newColor, size });
  };

  return (
    <div className="p-5 absolute md:top-1/4 md:left-5 md:h-1/4 left-[80px] bottom-[70px] w-64 rounded-2xl md:rounded-md border border-border1 shadow-shadow1 bg-background1">
      {showStrokeToolOption && (
        <div className="mb-5">
          <h6 className="text-[11px] text-text1">Stroke Color</h6>
          <div className="flex justify-between mt-2">
            {Object.values(COLORS).map((clr) => (
              <div
                key={clr}
                className={`h-5 w-5 mr-1 rounded-sm cursor-pointer ${
                  color === clr ? "border-[1.5px] border-border2 shadow-shadow2" : ""
                }`}
                style={{ backgroundColor: clr }}
                onClick={() => handleColor(clr)}
              />
            ))}
          </div>
        </div>
      )}

      {showBrushToolOption && (
        <div className="mb-5">
          <h6 className="text-[11px] text-text1">Brush Size {size}</h6>
          <div className="mt-2">
            <input
              type="range"
              min={1}
              max={500}
              step={1}
              value={size}
              onChange={handleBrushSize}
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}