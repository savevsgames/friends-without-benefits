import React, {  useRef } from "react";

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {}

const Canvas: React.FC<CanvasProps> = (props) => {
  const ref = useRef(null);
  // empty canvas

  return <canvas ref={ref} {...props} />;
};

export default Canvas;
