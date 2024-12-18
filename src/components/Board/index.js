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

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
      const URL = canvas.toDataURL();
      const anchor = document.createElement("a");
      anchor.href = URL;
      anchor.download = "आकृति.jpg";
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
    };

    const handleChangeConfig = (config) => {
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
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const beginPath = (x, y) => {
      context.beginPath();
      context.moveTo(x, y);
      lastPos.current = { x, y }; // Set last position for smooth drawing
    };

    const drawSmoothLine = (x1, y1, x2, y2) => {
      context.beginPath();
      context.moveTo(x1, y1);

      // Interpolation to draw smooth lines
      const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
      const dx = (x2 - x1) / steps;
      const dy = (y2 - y1) / steps;

      for (let i = 0; i <= steps; i++) {
        const x = x1 + dx * i;
        const y = y1 + dy * i;
        context.lineTo(x, y);
      }
      context.stroke();
    };

    const drawLine = (x, y) => {
      drawSmoothLine(lastPos.current.x, lastPos.current.y, x, y);
      lastPos.current = { x, y }; // Update last position
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
      drawLine(e.clientX, e.clientY);
      socket.emit("drawLine", { x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e) => {
      if (!shouldDraw.current) return;
      drawLine(e.touches[0].clientX, e.touches[0].clientY);
      socket.emit("drawLine", {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    };

    const handleMouseUp = () => {
      shouldDraw.current = false;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
    };
    const handleTouchUp = () => {
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