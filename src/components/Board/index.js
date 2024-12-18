import { useEffect, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MENU_ITEMS } from "@/constants";
import { actionItemClick } from "../../slices/menuSlice";
import { socket } from "@/socket";
import Image from "next/image";

export default function Board() {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const drawHistory = useRef([]);
  const historyPointer = useRef(0);
  const shouldDraw = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size } = useSelector((state) => state.tool[activeMenuItem]);

  // Improved smooth drawing function
  const drawSmoothLine = (context, x1, y1, x2, y2) => {
    context.beginPath();
    context.moveTo(x1, y1);
    
    // Create control points for a smoother curve
    const cp1x = x1 + (x2 - x1) * 0.3;
    const cp1y = y1 + (y2 - y1) * 0.3;
    const cp2x = x1 + (x2 - x1) * 0.7;
    const cp2y = y1 + (y2 - y1) * 0.7;
    
    context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    context.stroke();
  };

  // Optimize canvas for high-resolution displays
  const setupHighResCanvas = (canvas) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Improve line rendering
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    return ctx;
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
      const URL = canvas.toDataURL('image/png');
      const anchor = document.createElement("a");
      anchor.href = URL;
      anchor.download = "drawing.png";
      anchor.click();
    } else if (
      actionMenuItem === MENU_ITEMS.UNDO ||
      actionMenuItem === MENU_ITEMS.REDO
    ) {
      if (historyPointer.current > 0 && actionMenuItem === MENU_ITEMS.UNDO)
        historyPointer.current -= 1;
      if (
        historyPointer.current < drawHistory.current.length - 1 &&
        actionMenuItem === MENU_ITEMS.REDO
      )
        historyPointer.current += 1;
      const imageData = drawHistory.current[historyPointer.current];
      context.putImageData(imageData, 0, 0);
    }
    dispatch(actionItemClick(null));
  }, [actionMenuItem, dispatch]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const changeConfig = (color, size) => {
      context.strokeStyle = color;
      context.lineWidth = size;
      context.lineCap = 'round';
      context.lineJoin = 'round';
    };

    const handleChangeConfig = (config) => {
      console.log("config", config);
      changeConfig(config.color, config.size);
    };
    changeConfig(color, size);
    socket.on("changeConfig", handleChangeConfig);

    return () => {
      socket.off("changeConfig", handleChangeConfig);
    };
  }, [color, size]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = setupHighResCanvas(canvas);

    const beginPath = (x, y) => {
      context.beginPath();
      context.moveTo(x, y);
    };

    const drawLine = (x, y) => {
      context.lineTo(x, y);
      context.stroke();
    };

    const handleMouseDown = (e) => {
      shouldDraw.current = true;
      beginPath(e.clientX, e.clientY);
      lastPos.current = { x: e.clientX, y: e.clientY };
      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    const handleTouchDown = (e) => {
      shouldDraw.current = true;
      beginPath(e.touches[0].clientX, e.touches[0].clientY);
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      socket.emit("beginPath", {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    };

    const handleMouseMove = (e) => {
      if (!shouldDraw.current) return;
      
      // Use smooth drawing method
      drawSmoothLine(
        context, 
        lastPos.current.x, 
        lastPos.current.y, 
        e.clientX, 
        e.clientY
      );
      
      lastPos.current = { x: e.clientX, y: e.clientY };
      socket.emit("drawLine", { x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e) => {
      if (!shouldDraw.current) return;
      
      // Use smooth drawing method
      drawSmoothLine(
        context, 
        lastPos.current.x, 
        lastPos.current.y, 
        e.touches[0].clientX, 
        e.touches[0].clientY
      );
      
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      socket.emit("drawLine", {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    };

    const handleMouseUp = (e) => {
      shouldDraw.current = false;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
    };

    const handleTouchUp = (e) => {
      shouldDraw.current = false;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
    };

    const handleBeginPath = (path) => {
      beginPath(path.x, path.y);
    };

    const handleDrawLine = (path) => {
      drawLine(path.x, path.y);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchDown);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchUp);

    socket.on("beginPath", handleBeginPath);
    socket.on("drawLine", handleDrawLine);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);

      canvas.removeEventListener("touchstart", handleTouchDown);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchUp);

      socket.off("beginPath", handleBeginPath);
      socket.off("drawLine", handleDrawLine);
    };
  }, []);

  return (
    <>
      <Image
        className='hidden absolute md:block'
        src='https://i.ibb.co/bXwBtPh/download-removebg-preview.png'
        width={120}
        height={50}
        alt='Logo'
        priority
      />
      <canvas ref={canvasRef} style={{
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%'
      }}></canvas>
    </>
  );
}