'use client'

import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { COLORS, MENU_ITEMS } from "@/constants";
import { changeBrushSize, changeColor } from "@/slices/toolBoxSlice";
import { socket } from "@/socket";
import { Minimize2, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Toolbox() {
  const dispatch = useDispatch();
  const [isMinimized, setIsMinimized] = useState(false);
  const colorContainerRef = useRef(null);

  const activeMenuItem = useSelector((store) => store.menu.activeMenuItem);
  const { color, size } = useSelector((store) => store.tool[activeMenuItem]);

  const showStrokeToolOption = activeMenuItem === MENU_ITEMS.PENCIL;
  const showBrushToolOption =
    activeMenuItem === MENU_ITEMS.PENCIL || activeMenuItem === MENU_ITEMS.ERASER;

  const handleBrushSize = (e) => {
    const newSize = parseInt(e.target.value);
    dispatch(changeBrushSize({ item: activeMenuItem, size: newSize }));
    socket.emit("changeConfig", { color, size: newSize });
  };

  const handleColor = (newColor) => {
    dispatch(changeColor({ item: activeMenuItem, color: newColor }));
    socket.emit("changeConfig", { color: newColor, size });
  };

  const scroll = (direction) => {
    if (colorContainerRef.current) {
      const scrollAmount = 100; // Adjust this value to control scroll distance
      colorContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 
        px-5 py-4 md:max-w-full bg-background1 border border-border1 border-0.5 rounded-xl shadow-shadow1`}
    >
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
              <div className="flex items-center">
                <button onClick={() => scroll('left')} className="p-1 hover:bg-gray-200 rounded-full">
                  <ChevronLeft size={20} />
                </button>
                <div ref={colorContainerRef} className="flex-1 overflow-x-auto scrollbar-hide">
                  <div className="flex space-x-3 px-2">
                    {Object.values(COLORS).map((clr) => (
                      <div
                        key={clr}
                        className={`h-6 w-6 rounded-full cursor-pointer transition-all flex-shrink-0
                          ${color === clr ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-110'}`}
                        style={{ backgroundColor: clr }}
                        onClick={() => handleColor(clr)}
                      />
                    ))}
                  </div>
                </div>
                <button onClick={() => scroll('right')} className="p-1 hover:bg-gray-200 rounded-full">
                  <ChevronRight size={20} />
                </button>
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
                  max={100}
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
  );
}

