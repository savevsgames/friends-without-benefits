import React, { useEffect, useState, useRef } from 'react';
import * as ort from 'onnxruntime-web';

const ObjectDetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [model, setModel] = useState(null);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      async function initModel() {
        try {
          const session = await ort.InferenceSession.create('./best.onnx');
          setModel(session);
        } catch (err) {
          setError('Failed to load model: ' + err.message);
        }
      }
      initModel();
    }, []);
  
    useEffect(() => {
      async function setupCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          setError('Failed to access camera: ' + err.message);
        }
      }
      setupCamera();
    }, []);

    useEffect(() => {
      if (model && videoRef.current) {
        videoRef.current.play();
        const ctx = canvasRef.current.getContext('2d');
        const animate = () => {
          processFrame();
          requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, [model]);
    
    async function processFrame() {
      if (!model || !videoRef.current || !canvasRef.current) return;
  
      const ctx = canvasRef.current.getContext('2d');
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      const scale = Math.min(640 / videoWidth, 640 / videoHeight);
      const scaledWidth = videoWidth * scale;
      const scaledHeight = videoHeight * scale;
      
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      
     
      const x = (window.innerWidth - scaledWidth) / 2;
      const y = (window.innerHeight - scaledHeight) / 2;
      ctx.drawImage(videoRef.current, x, y, scaledWidth, scaledHeight);
      //const imageData = ctx.getImageData(0, 0, 640, 640);
      const imageData = ctx.getImageData(x, y, scaledWidth, scaledHeight);
    
      //const imageData = ctx.getImageData(0, 0, 640, 640);
      //const imageData = ctx.getImageData(x, y, scaledWidth, scaledHeight);
      console.log("Image data shape:", imageData.width, imageData.height);
      
      const input = new Float32Array(3 * 640 * 640);
      for (let i = 0; i < imageData.data.length; i += 4) {
        input[i/4] = imageData.data[i] / 255.0;
        input[i/4 + 640*640] = imageData.data[i+1] / 255.0;
        input[i/4 + 2*640*640] = imageData.data[i+2] / 255.0;
      }
    
      const tensor = new ort.Tensor('float32', input, [1, 3, 640, 640]);
      console.log("Input tensor shape:", tensor.dims);
    
      try {
        const results = await model.run({ images: tensor });
        console.log("Model output:", results);
        drawDetections(results, ctx);
      } catch (err) {
        console.error('Inference error:', err);
      }
    
  
      requestAnimationFrame(processFrame);
    }

  
    function drawDetections(results, ctx) {
      // const boxes = results.output0.data;
      // console.log("Boxes:", boxes);
      // const stride = 6;
      // //const confidenceThreshold = 0.5;
      // //const conf_threshold = 0.7; 
      // const videoWidth = videoRef.current.videoWidth;
      // const videoHeight = videoRef.current.videoHeight;
      // const scale = Math.min(640 / videoWidth, 640 / videoHeight);
      // const scaledWidth = videoWidth * scale;
      // const scaledHeight = videoHeight * scale;
      // const x = (window.innerWidth - scaledWidth) / 2;
      // const y = (window.innerHeight - scaledHeight) / 2;
    
      // ctx.strokeStyle = '#00ff00';
      // ctx.lineWidth = 2;
      // const maxConf = Math.max(...boxes.filter((_, i) => i % stride === 4));
      // console.log("Confidence values:", boxes.filter((_, i) => i % stride === 4));
    
      // for (let i = 0; i < boxes.length; i += stride) {
        
      //   const confidence = boxes[i + 4];
      //   //const confidence = rawConf / Math.max(...boxes.filter((_, i) => i % 6 === 4)); e
        
      //   if (confidence > 0.85) {
      //     const bbox_x = boxes[i] / 640;
      //     const bbox_y = boxes[i + 1] / 640;
      //     const bbox_w = (boxes[i + 2] - boxes[i]) / 640;
      //     const bbox_h = (boxes[i + 3] - boxes[i + 1]) / 640;
    
      //     const x1 = bbox_x * scaledWidth + x;
      //     const y1 = bbox_y * scaledHeight + y;
      //     const w = bbox_w * scaledWidth;
      //     const h = bbox_h * scaledHeight;
     
      //     ctx.strokeRect(x1, y1, w, h);
      //     ctx.fillText(`${confidence.toFixed(2)}%`, x1, y1 - 5);
      const boxes = results.output0.data;
      const stride = 6;
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      const scale = Math.min(640 / videoWidth, 640 / videoHeight);
      // const scaledWidth = videoWidth * scale;
      // const scaledHeight = videoHeight * scale;
      
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
    
      for (let i = 0; i < boxes.length; i += stride) {
        const confidence = boxes[i + 4] / 640;
        if (confidence > 0.5) {
          const x1 = boxes[i];
          const y1 = boxes[i + 1];
          const x2 = boxes[i + 2];
          const y2 = boxes[i + 3];
          
          ctx.strokeRect(x1, y1, x2-x1, y2-y1);
          ctx.fillText(`${(confidence * 100).toFixed(0)}%`, x1, y1 - 5);
        }
      }
    }

    return (
      <div className="relative w-screen h-screen">
      <div className="absolute w-full h-full">
        <video ref={videoRef} autoPlay />
        <canvas ref={canvasRef} className="absolute top-0 left-0 z-10" />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
    );
  };
  
  export default ObjectDetection;