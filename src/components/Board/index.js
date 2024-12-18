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
  const lastPositions = useRef([]);
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

  // Throttle function to limit the number of draw calls
  const throttle = (callback, delay) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall < delay) return;
      lastCall = now;
      callback(...args);
    };
  };

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set up high-resolution canvas
    const scale = window.devicePixelRatio; 
    canvas.width = window.innerWidth * scale; 
    canvas.height = window.innerHeight * scale; 
    context.scale(scale, scale); 

    const beginPath = (x, y) => {
      context.beginPath();
      context.moveTo(x, y);
      lastPos.current = { x, y };
      lastPositions.current = [];
    };

    // Improved line smoothing using quadratic curves
    const drawSmoothLine = (points) => {
      if (points.length < 2) return;

      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length - 1; i++) {
        const cpX = (points[i].x + points[i + 1].x) / 2;
        const cpY = (points[i].y + points[i + 1].y) / 2;
        context.quadraticCurveTo(points[i].x, points[i].y, cpX, cpY);
      }

      context.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      context.stroke();
    };

    const drawLine = (x, y) => {
      lastPositions.current.push({ x, y });

      // Limit the number of stored positions
      if (lastPositions.current.length > 5) {
        lastPositions.current.shift();
      }

      // Draw smooth line with averaged positions
      drawSmoothLine(lastPositions.current);
      
      lastPos.current = { x: x, y: y }; // Update last position
    };

    // Event handlers for mouse and touch events
    const handleMouseDown = (e) => {
      shouldDraw.current = true;
      beginPath(e.clientX / scale, e.clientY / scale); // Adjust for scaling
      socket.emit("beginPath", { x: e.clientX / scale, y: e.clientY / scale });
    };

    const handleTouchDown = (e) => {
      shouldDraw.current = true;
      beginPath(e.touches[0].clientX / scale, e.touches[0].clientY / scale); // Adjust for scaling
      socket.emit("beginPath", {
        x: e.touches[0].clientX / scale,
        y: e.touches[0].clientY / scale,
      });
    };

    // Throttle mouse move event
    const handleMouseMove = throttle((e) => {
      if (!shouldDraw.current) return;
      drawLine(e.clientX / scale, e.clientY / scale); // Adjust for scaling
      socket.emit("drawLine", { x: e.clientX / scale, y: e.clientY / scale });
    }, 16);

    const handleTouchMove = (e) => {
      if (!shouldDraw.current) return;
      drawLine(e.touches[0].clientX / scale, e.touches[0].clientY / scale); // Adjust for scaling
      socket.emit("drawLine", {
        x: e.touches[0].clientX / scale,
        y: e.touches[0].clientY / scale,
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

    // Socket event handlers
    socket.on("beginPath", ({ x, y }) => beginPath(x / scale, y / scale));
    
    socket.on("drawLine", ({ x, y }) => drawLine(x / scale, y / scale));

    
    // Attach event listeners to the canvas
    canvas.addEventListener("mousedown", handleMouseDown);
    
    canvas.addEventListener("mousemove", handleMouseMove);
    
    canvas.addEventListener("mouseup", handleMouseUp);
    
    canvas.addEventListener("touchstart", handleTouchDown);
    
    canvas.addEventListener("touchmove", handleTouchMove);
    
    canvas.addEventListener("touchend", handleTouchUp);

    
   return () => {
     // Cleanup event listeners on component unmount
     canvas.removeEventListener("mousedown", handleMouseDown);
     canvas.removeEventListener("mousemove", handleMouseMove);
     canvas.removeEventListener("mouseup", handleMouseUp);

     canvas.removeEventListener("touchstart", handleTouchDown);
     canvas.removeEventListener("touchmove", handleTouchMove);
     canvas.removeEventListener("touchend", handleTouchUp);

     socket.off("beginPath");
     socket.off("drawLine");
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
