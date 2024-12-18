import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { COLORS, MENU_ITEMS } from "@/constants";
import { changeBrushSize, changeColor } from "@/slices/toolBoxSlice";
import { socket } from "@/socket";
import { Minimize2, Maximize2 } from 'lucide-react';

export default function Toolbox() {
  const dispatch = useDispatch();
  const [isMinimized, setIsMinimized] = useState(false);

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
    <div 
      className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 
        px-5 py-4 md:max-w-full bg-background1 border border-border1 border-0.5 rounded-xl shadow-shadow1 relative overflow-hidden`}
    >
      {/* SVG Background */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1280 100" 
        className="absolute bottom-0 left-0 w-full h-full opacity-30 z-0"
      >
        <path 
          d="M -28.16 50 Q 35.84 50 99.84 0 Q 163.84 50 227.84 50 Q 291.84 50 355.84 0 Q 419.84 50 483.84 50 Q 547.84 50 611.84 0 Q 675.84 50 739.84 50 Q 803.84 50 867.84 0 Q 931.84 50 995.84 50 Q 1059.84 50 1123.84 0 Q 1187.84 50 1251.84 50 Q 1315.84 50 1379.84 0 Q 1443.84 50 1507.84 50 L 1280 100 L 0 100 Z" 
          fill="#D8BFD8"  // Light purple color
        />
      </svg>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 space-x-6">
          <h4 className="md:ml-4 text-sm font-bold text-text1">Toolbox</h4>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="flex items-center justify-center px-2 rounded-md hover:bg-gray-200"
          >
            {isMinimized ? <Maximize2 className="text-text1" size={16} /> : <Minimize2 className="text-text1" size={16} />}
          </button>
        </div>

        {!isMinimized && (
          <div>
            {showStrokeToolOption && (
              <div className="mb-4">
                <h6 className="text-xs text-gray-600 mb-2">Stroke Color</h6>
                <div className="flex justify-between space-x-3">
                  {Object.values(COLORS).map((clr) => (
                    <div
                      key={clr}
                      className={`h-6 w-6 rounded-full cursor-pointer transition-all 
                        ${color === clr ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: clr }}
                      onClick={() => handleColor(clr)}
                    />
                  ))}
                </div>
              </div>
            )}

            {showBrushToolOption && (
              <div>
                <h6 className="text-xs text-gray-600 mb-2">Brush Size: {size}</h6>
                <div className="relative">
                  <input
                    type="range"
                    min={1}
                    max={500}
                    step={1}
                    value={size}
                    onChange={handleBrushSize}
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}