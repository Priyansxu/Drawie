import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MENU_ITEMS } from "@/constants";
import { actionItemClick } from "../../slices/menuSlice";
import Image from "next/image";

export default function Board() {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size } = useSelector((state) => state.tool[activeMenuItem]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Resize canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Drawing configuration
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, [color, size]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    const { offsetX, offsetY } = e.nativeEvent;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    
    lastPosRef.current = { x: offsetX, y: offsetY };
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    const { offsetX, offsetY } = e.nativeEvent;
    
    // Smooth drawing with quadratic curve
    context.beginPath();
    context.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    
    // Calculate control point for smoother curve
    const cpx = (lastPosRef.current.x + offsetX) / 2;
    const cpy = (lastPosRef.current.y + offsetY) / 2;
    
    context.quadraticCurveTo(
      cpx, 
      cpy, 
      offsetX, 
      offsetY
    );
    
    context.stroke();
    
    // Update last position
    lastPosRef.current = { x: offsetX, y: offsetY };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <canvas 
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        startDrawing({ nativeEvent: { offsetX: touch.clientX, offsetY: touch.clientY } });
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        draw({ nativeEvent: { offsetX: touch.clientX, offsetY: touch.clientY } });
      }}
      onTouchEnd={stopDrawing}
      style={{ 
        cursor: 'crosshair',
        touchAction: 'none' 
      }}
    />
  );
}