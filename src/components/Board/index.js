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
  const points = useRef<{ x: number, y: number, time: number }[]>([]);
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
      context.lineCap = 'round';
      context.lineJoin = 'round';
    };

    changeConfig(color, size);
  }, [color, size]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Enhanced canvas quality
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    context.scale(dpr, dpr);

    const addPoint = (x: number, y: number) => {
      const point = { x, y, time: Date.now() };
      points.current.push(point);

      // Keep only last 4 points to prevent memory buildup
      if (points.current.length > 4) {
        points.current.shift();
      }
    };

    const getControlPoints = (points: { x: number, y: number }[]) => {
      if (points.length < 3) return points;

      const controlPoints = [];
      for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        const controlPoint1 = {
          x: curr.x + (prev.x - next.x) * 0.2,
          y: curr.y + (prev.y - next.y) * 0.2
        };

        const controlPoint2 = {
          x: curr.x + (next.x - prev.x) * 0.2,
          y: curr.y + (next.y - prev.y) * 0.2
        };

        controlPoints.push(controlPoint1, controlPoint2);
      }

      return controlPoints;
    };

    const draw = () => {
      if (points.current.length < 2) return;

      context.beginPath();
      context.moveTo(points.current[0].x, points.current[0].y);

      const controlPoints = getControlPoints(points.current);

      for (let i = 1; i < points.current.length; i++) {
        const point = points.current[i];
        const prevPoint = points.current[i - 1];

        // Calculate pressure-based width
        const timeDiff = point.time - prevPoint.time;
        const pressure = Math.max(0.1, Math.min(1, 100 / timeDiff));
        context.lineWidth = size * pressure;

        // Advanced curve drawing
        if (controlPoints.length >= 2 * i - 1) {
          context.bezierCurveTo(
            controlPoints[2 * i - 2].x, 
            controlPoints[2 * i - 2].y,
            controlPoints[2 * i - 1].x, 
            controlPoints[2 * i - 1].y,
            point.x, 
            point.y
          );
        } else {
          context.lineTo(point.x, point.y);
        }
      }

      context.stroke();
    };

    const startDrawing = (x: number, y: number) => {
      shouldDraw.current = true;
      points.current = [{ x, y, time: Date.now() }];
    };

    const continueDrawing = (x: number, y: number) => {
      if (!shouldDraw.current) return;
      addPoint(x, y);
      draw();
    };

    const stopDrawing = () => {
      if (shouldDraw.current) {
        shouldDraw.current = false;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        drawHistory.current.push(imageData);
        historyPointer.current = drawHistory.current.length - 1;
        points.current = [];
      }
    };

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      startDrawing(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      continueDrawing(e.clientX, e.clientY);
    };

    const handleMouseUp = stopDrawing;
    const handleMouseOut = stopDrawing;

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startDrawing(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      continueDrawing(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = stopDrawing;

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseOut);

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseOut);

      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [color, size]);

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
      <canvas ref={canvasRef} style={{cursor: 'crosshair'}}></canvas>
    </>
  );
}