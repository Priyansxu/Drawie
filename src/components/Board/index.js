import { useEffect, useRef, useLayoutEffect, useState } from "react";
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
  const [context, setContext] = useState(null);

  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size } = useSelector((state) => state.tool[activeMenuItem]);

  // Improved drawing configuration
  const drawingConfig = {
    lineCap: 'round',
    lineJoin: 'round',
    shadowBlur: 2,
    shadowColor: 'rgba(0,0,0,0.1)'
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setContext(ctx);

    // Configure canvas for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);

    // Apply smooth drawing configuration
    ctx.lineCap = drawingConfig.lineCap;
    ctx.lineJoin = drawingConfig.lineJoin;
    ctx.shadowBlur = drawingConfig.shadowBlur;
    ctx.shadowColor = drawingConfig.shadowColor;
  }, []);

  useEffect(() => {
    if (!context) return;

    const changeConfig = (color, size) => {
      context.strokeStyle = color;
      context.lineWidth = size;
    };

    const handleChangeConfig = (config) => {
      changeConfig(config.color, config.size);
    };

    changeConfig(color, size);
    socket.on("changeConfig", handleChangeConfig);

    return () => {
      socket.off("changeConfig", handleChangeConfig);
    };
  }, [color, size, context]);

  useEffect(() => {
    if (!canvasRef.current || !context) return;
    const canvas = canvasRef.current;

    const handleActionMenuItem = () => {
      if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
        const URL = canvas.toDataURL();
        const anchor = document.createElement("a");
        anchor.href = URL;
        anchor.download = "drawing.jpg";
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
    };

    handleActionMenuItem();
  }, [actionMenuItem, context, dispatch]);

  useLayoutEffect(() => {
    if (!context || !canvasRef.current) return;
    const canvas = canvasRef.current;

    const beginPath = (x, y) => {
      context.beginPath();
      context.moveTo(x, y);
    };

    const drawSmoothLine = (x1, y1, x2, y2) => {
      context.beginPath();
      context.moveTo(x1, y1);

      // Quadratic curve for smoother lines
      const cpx = (x1 + x2) / 2;
      const cpy = (y1 + y2) / 2;

      context.quadraticCurveTo(cpx, cpy, x2, y2);
      context.stroke();
    };

    const drawLine = (prevX, prevY, x, y) => {
      drawSmoothLine(prevX, prevY, x, y);
    };

    const handleMouseDown = (e) => {
      shouldDraw.current = true;
      beginPath(e.clientX, e.clientY);
      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    const handleTouchDown = (e) => {
      shouldDraw.current = true;
      beginPath(e.touches[0].clientX, e.touches[0].clientY);
      socket.emit("beginPath", {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    };

    const handleMouseMove = (e) => {
      if (!shouldDraw.current) return;
      const prevX = e.movementX + e.clientX;
      const prevY = e.movementY + e.clientY;
      drawLine(prevX, prevY, e.clientX, e.clientY);
      socket.emit("drawLine", { 
        prevX, 
        prevY, 
        x: e.clientX, 
        y: e.clientY 
      });
    };

    const handleTouchMove = (e) => {
      if (!shouldDraw.current) return;
      const touch = e.touches[0];
      const prevX = touch.clientX - touch.radiusX;
      const prevY = touch.clientY - touch.radiusY;
      drawLine(prevX, prevY, touch.clientX, touch.clientY);
      socket.emit("drawLine", {
        prevX,
        prevY,
        x: touch.clientX,
        y: touch.clientY,
      });
    };

    const handleMouseUp = () => {
      if (shouldDraw.current) {
        shouldDraw.current = false;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        drawHistory.current.push(imageData);
        historyPointer.current = drawHistory.current.length - 1;
      }
    };

    const handleBeginPath = (path) => {
      beginPath(path.x, path.y);
    };

    const handleDrawLine = (path) => {
      drawLine(path.prevX, path.prevY, path.x, path.y);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchDown);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleMouseUp);

    socket.on("beginPath", handleBeginPath);
    socket.on("drawLine", handleDrawLine);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchDown);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleMouseUp);

      socket.off("beginPath", handleBeginPath);
      socket.off("drawLine", handleDrawLine);
    };
  }, [context]);

  return (
    <>
      <Image
        className="hidden absolute md:block"
        src="https://i.ibb.co/bXwBtPh/download-removebg-preview.png"
        width={120}
        height={50}
        alt=""
        logo
      />
      <canvas ref={canvasRef} style={{}}></canvas>
    </>
  );
}