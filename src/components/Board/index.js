import { useEffect, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MENU_ITEMS } from "@/constants";
import { actionItemClick } from "../../slices/menuSlice";
import { socket } from "@/socket";

export default function Board() {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const drawHistory = useRef([]);
  const historyPointer = useRef(0);
  const shouldDraw = useRef(false);
  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size } = useSelector((state) => state.tool[activeMenuItem]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
      const originalImage = context.getImageData(0, 0, canvas.width, canvas.height);
      const tempCanvas = document.createElement("canvas");
      const tempContext = tempCanvas.getContext("2d");

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      tempContext.fillStyle = "white";
      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempContext.drawImage(canvas, 0, 0);

      const URL = tempCanvas.toDataURL();
      const anchor = document.createElement("a");
      anchor.href = URL;
      anchor.download = "drawie";
      anchor.click();

      context.putImageData(originalImage, 0, 0);
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

    changeConfig(color, size);
  }, [color, size]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let lastX = 0, lastY = 0;

    const startDrawing = (x, y) => {
      shouldDraw.current = true;
      [lastX, lastY] = [x, y];
      context.beginPath();
      context.moveTo(x, y);
    };

    const draw = (x, y) => {
      if (!shouldDraw.current) return;

      context.beginPath();
      context.moveTo(lastX, lastY);

      const cpx = (lastX + x) / 2;
      const cpy = (lastY + y) / 2;

      context.quadraticCurveTo(cpx, cpy, x, y);
      context.stroke();

      [lastX, lastY] = [x, y];
    };

    const stopDrawing = () => {
      if (shouldDraw.current) {
        shouldDraw.current = false;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        drawHistory.current.push(imageData);
        historyPointer.current = drawHistory.current.length - 1;
      }
    };

    const handleMouseDown = (e) => startDrawing(e.clientX, e.clientY);
    const handleMouseMove = (e) => draw(e.clientX, e.clientY);
    const handleMouseUp = stopDrawing;
    const handleMouseOut = stopDrawing;
    const handleTouchStart = (e) => startDrawing(e.touches[0].clientX, e.touches[0].clientY);
    const handleTouchMove = (e) => draw(e.touches[0].clientX, e.touches[0].clientY);
    const handleTouchEnd = stopDrawing;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseOut);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", handleMouseOut);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ cursor: 'crosshair' }}></canvas>
    </>
  );
}