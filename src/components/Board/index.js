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
  }, [actionMenuItem, dispatch]);

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
      context.moveTo(Math.floor(x), Math.floor(y)); // Use integer coordinates
      lastPos.current = { x, y };
    };

    const drawSmoothLine = (x1, y1, x2, y2) => {
      context.beginPath();
      context.moveTo(Math.floor(x1), Math.floor(y1));
      const cpX = (x1 + x2) / 2; // Control point for curve
      const cpY = (y1 + y2) / 2;
      context.quadraticCurveTo(cpX, cpY, Math.floor(x2), Math.floor(y2));
      context.stroke();
    };

    const drawLine = (x, y) => {
      drawSmoothLine(lastPos.current.x, lastPos.current.y, x, y);
      lastPos.current = { x: x, y: y }; // Update last position
    };

    const handleMouseDown = (e) => {
      shouldDraw.current = true;
      beginPath(e.clientX / scale, e.clientY / scale); // Adjust for scaling
      socket.emit("beginPath", { x: e.clientX / scale, y: e.clientY / scale });
    };

    const handleMouseMove = throttle((e) => {
      if (!shouldDraw.current) return;
      drawLine(e.clientX / scale, e.clientY / scale); // Adjust for scaling
      socket.emit("drawLine", { x: e.clientX / scale, y: e.clientY / scale });
    }, 16);

    const handleMouseUp = () => {
      shouldDraw.current = false;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
    };

    // Attach event listeners to the canvas
    canvas.addEventListener("mousedown", handleMouseDown);
    
    canvas.addEventListener("mousemove", handleMouseMove);
    
    canvas.addEventListener("mouseup", handleMouseUp);

   return () => {
     // Cleanup event listeners on component unmount
     canvas.removeEventListener("mousedown", handleMouseDown);
     canvas.removeEventListener("mousemove", handleMouseMove);
     canvas.removeEventListener("mouseup", handleMouseUp);
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
