'use client';

import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, MENU_ITEMS } from '@/constants';
import { changeBrushSize, changeColor } from '@/slices/toolBoxSlice';
import { socket } from '@/socket';
import { Minimize2, Maximize2 } from 'lucide-react';

export default function Toolbox() {
  const dispatch = useDispatch();
  const [isMinimized, setIsMinimized] = useState(false);
  const colorContainerRef = useRef(null);

  const activeMenuItem = useSelector((store) => store.menu.activeMenuItem);
  const toolConfig = useSelector((store) => store.tool[activeMenuItem] || {});
  const { color = '', size = 1 } = toolConfig;

  const showStrokeToolOption = activeMenuItem === MENU_ITEMS.PENCIL;
  const showBrushToolOption =
    activeMenuItem === MENU_ITEMS.PENCIL || activeMenuItem === MENU_ITEMS.ERASER;

  const handleBrushSize = (e) => {
    const newSize = e.target.value;
    dispatch(changeBrushSize({ item: activeMenuItem, size: newSize }));
    socket.emit('changeConfig', { color, size: newSize });
  };

  const handleColor = (newColor) => {
    dispatch(changeColor({ item: activeMenuItem, color: newColor }));
    socket.emit('changeConfig', { color: newColor, size });
  };

  return (
    <div
      className={`fixed justify-between bottom-2 left-1/2 transform -translate-x-1/2 
        px-5 py-4 w-11/12 md:max-w-full bg-background1 border border-0.5 border-border1 rounded-xl shadow-shadow1`}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-text1">Toolbox</h4>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center justify-center px-2 rounded-md hover:bg-gray-200"
        >
          {isMinimized ? (
            <Maximize2 className="text-text1" size={16} />
          ) : (
            <Minimize2 className="text-text1" size={16} />
          )}
        </button>
      </div>

      {!isMinimized && (
        <div>
          {showStrokeToolOption && (
            <div className="mb-4">
              <h6 className="text-xs text-gray-600 mb-2">Stroke Color</h6>
              <div
                ref={colorContainerRef}
                className="flex space-x-2 overflow-x-auto py-2 px-4"
              >
                {Object.values(COLORS).map((clr) => (
                  <div
                    key={clr}
                    className={`flex-shrink-0 h-6 w-6 rounded-full cursor-pointer transition-all ${
                      color === clr
                        ? 'ring-2 ring-blue-500 scale-110'
                        : 'hover:scale-110'
                    }`}
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