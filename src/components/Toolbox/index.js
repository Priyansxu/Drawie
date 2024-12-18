import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { COLORS, MENU_ITEMS } from "@/constants";
import { changeBrushSize, changeColor } from "@/slices/toolBoxSlice";
import { socket } from "@/socket";
import { Move, Minimize2, Maximize2 } from 'lucide-react";

export default function Toolbox() {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const toolboxRef = useRef(null);
  const moveHandleRef = useRef(null);

  const activeMenuItem = useSelector((store) => store.menu.activeMenuItem);
  const { color, size } = useSelector((store) => store.tool[activeMenuItem]);

  const showStrokeToolOption = activeMenuItem === MENU_ITEMS.PENCIL;
  const showBrushToolOption =
    activeMenuItem === MENU_ITEMS.PENCIL || activeMenuItem === MENU_ITEMS.ERASER;

  useEffect(() => {
    const updatePosition = () => {
      if (toolboxRef.current) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const toolboxWidth = toolboxRef.current.offsetWidth;
        const toolboxHeight = toolboxRef.current.offsetHeight;

        const initialX = Math.max(0, Math.min(
          (windowWidth - toolboxWidth) / 2, 
          windowWidth - toolboxWidth
        ));

        const initialY = Math.max(0, Math.min(
          windowHeight - toolboxHeight - 50,
          windowHeight - toolboxHeight
        ));

        setPosition({ x: initialX, y: initialY });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && toolboxRef.current) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const toolboxWidth = toolboxRef.current.offsetWidth;
        const toolboxHeight = toolboxRef.current.offsetHeight;

        const newX = Math.max(0, Math.min(
          e.clientX - toolboxWidth / 2,
          windowWidth - toolboxWidth
        ));

        const newY = Math.max(0, Math.min(
          e.clientY - 20,
          windowHeight - toolboxHeight
        ));

        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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
      ref={toolboxRef}
      className={`fixed z-50 transition-all duration-300 ease-in-out 
        shadow-lg rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 
        ${isMinimized ? 'h-12 overflow-hidden' : 'h-auto'}`}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: '280px',
        maxWidth: 'calc(100vw - 40px)', 
      }}
    >
      <div 
        ref={moveHandleRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          e.preventDefault();
        }}
        className="flex items-center justify-between p-2 cursor-move bg-gray-100 rounded-t-xl select-none"
      >
        <Move className="text-gray-500 cursor-move" size={20} />
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-gray-200 rounded-full p-1"
            aria-label={isMinimized ? "Expand toolbar" : "Minimize toolbar"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 max-w-full overflow-x-auto">
          {showStrokeToolOption && (
            <div className="mb-4">
              <h6 className="text-xs text-gray-600 mb-2">Stroke Color</h6>
              <div className="flex justify-between space-x-1">
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
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}