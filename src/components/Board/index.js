import { useEffect, useRef ,useLayoutEffect} from "react";
import { useSelector } from "react-redux";
const Board = () => {
  const canvasRef = useRef();
  const shouldDraw =useRef();
  const activeMenuItem = useSelector((store) => store.menu.activeMenuItem);
  const { color, size } = useSelector((store) => store.tool[activeMenuItem]);

 useEffect(()=>{
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const changeConfig=()=>{
        context.strokeStyle=color
        context.lineWidth=size
    }

    const beginPath=(x,y)=>{
        context.beginPath()
        context.moveTo(x,y)
    }

    const drawLine=(x,y)=>{
        context.lineTo(x,y)
        context.stroke()
    }

    const handleMouseDown=(e)=>{
shouldDraw.current =true

beginPath(e.clientX,e.clientY)
    }

    const handleMouseMove=(e)=>{
if(!shouldDraw.current) return
drawLine(e.clientX,e.clientY)

    }

    const handleMouseUp=(e)=>{
shouldDraw.current =false
    }

    canvas.addEventListener('mousedown',handleMouseDown);
    canvas.addEventListener('mousemove',handleMouseMove);
    canvas.addEventListener('mouseup',handleMouseUp);
    changeConfig();

    return ()=>{
        canvas.removeEventListener('mousedown',handleMouseDown);
        canvas.removeEventListener('mousemove',handleMouseMove);
        canvas.removeEventListener('mouseup',handleMouseUp);
    }
 },[size,color])



  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    //when mounting
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);
  console.log(color, size);
  return <canvas ref={canvasRef}></canvas>;
};

export default Board;
