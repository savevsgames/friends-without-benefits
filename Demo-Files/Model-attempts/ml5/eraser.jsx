import React, { useEffect, useRef, useState } from 'react';

const ObjectDetection = () => {
  const modelRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const [status, setStatus] = useState('Loading TFJS model...');
  const [detections, setDetections] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    async function loadModelAndLabels() {
      try {
    
        const labelsResponse = await fetch('./src/tfjs/labels.txt');
        const labelsText = await labelsResponse.text();
        const labelsList = labelsText.split('\n').map(label => label.trim()).filter(Boolean);
        setLabels(labelsList);
        console.log('Labels loaded:', labelsList);

        // const manifestResponse = await fetch('./src/tfjs/cvexport.manifest');
        // const manifest = await manifestResponse.json();
        // console.log('Manifest loaded:', manifest);

        console.log('Starting model loading...');
        const loadedModel = await tf.loadGraphModel('./src/tfjs/model.json');
        console.log('Model loading complete:', loadedModel);
        modelRef.current = loadedModel; 
        setModel(loadedModel);  // This isn't working properly
        console.log('Model state after setting:', loadedModel);
        console.log('Model stored in ref:', modelRef.current);
        setStatus('Model and labels loaded! Starting webcam...');
        await setupCamera();
      } catch (error) {
        console.error('Error during initialization:', error);
        setStatus(`Error loading resources: ${error.message}`);
      }
    }
    loadModelAndLabels();
  }, []);

  const setupCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: 640,
            height: 480,
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            console.log('Video feed initialized');
            console.log('Video dimensions:', {
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            });
            setStatus('Ready for detection');
            
            setTimeout(() => {
              console.log('Starting detection...');
              startDetection();
            }, 1000);
          };
        }
      } catch (err) {
        setStatus('Error accessing webcam');
        console.error('Webcam error:', err);
      }
    };

  const startDetection = async () => {
    if (!modelRef.current || !videoRef.current) {
        console.log('Missing requirements:', { 
          hasModel: !!modelRef.current, 
          hasVideo: !!videoRef.current 
        });
        return;
      }
  
      console.log('Detection starting with model from ref');
      const activeModel = modelRef.current;  
  
      async function detectFrame() {
        try {
          const video = videoRef.current;
          
          const tensor = tf.tidy(() => {
            const img = tf.browser.fromPixels(video);
            console.log('Created initial tensor:', img.shape);
            const resized = tf.image.resizeBilinear(img, [416, 416]);
            const normalized = resized.div(255.0);
            const batched = normalized.expandDims(0);
            console.log('Final tensor shape:', batched.shape);
            return batched;
          });
  
          console.log('Running prediction with model');
          const result = await activeModel.predict(tensor);
          console.log('Got prediction result:', result);
  
          const predictions = await processDetections(result);
          console.log('Processed predictions:', predictions);
  
          drawDetections(predictions);
  
          tf.dispose(tensor);
          if (Array.isArray(result)) {
            result.forEach(t => t.dispose());
          } else {
            result.dispose();
          }
  
          requestAnimationFrame(detectFrame);
        } catch (error) {
          console.error('Error in detection:', error);
        }
      }
  
      detectFrame();
    };

  const processDetections = async (predictions) => {
    try {
        console.log('Processing predictions:', predictions);
        let detectionResults = [];
        
        const predictionData = await predictions.array();
        console.log('Prediction data:', predictionData);
    
        // [1, 13, 13, 50]
        const [batch, gridH, gridW, channels] = predictions.shape;
        console.log('Grid size:', gridH, 'x', gridW);
    
        for (let i = 0; i < gridH; i++) {
          for (let j = 0; j < gridW; j++) {
            const gridCell = predictionData[0][i][j];
            
            for (let b = 0; b < 5; b++) {  
              const offset = b * 10;  
              const confidence = gridCell[offset + 4];
              
              if (confidence > 0.3) {  
                const classes = gridCell.slice(offset + 5, offset + 10);
                const classIndex = classes.indexOf(Math.max(...classes));
                
                const x = (j + gridCell[offset]) / gridW;
                const y = (i + gridCell[offset + 1]) / gridH;
                const w = Math.exp(gridCell[offset + 2]) / gridW;
                const h = Math.exp(gridCell[offset + 3]) / gridH;
    
                detectionResults.push({
                  bbox: [y, x, h, w],  
                  class: labels[classIndex] || `Class ${classIndex}`,
                  score: confidence
                });
              }
            }
          }
        }
    
        console.log('Processed detections:', detectionResults);
        return detectionResults.filter(det => det.score > 0.3);
      } catch (error) {
        console.error('Error processing detections:', error);
        return [];
      }
  };

  const drawDetections = (detections) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(det => {
      const [y, x, h, w] = det.bbox;
      const boxX = x * canvas.width;
      const boxY = y * canvas.height;
      const boxW = w * canvas.width;
      const boxH = h * canvas.height;

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(
        `Class ${det.class} (${(det.score * 100).toFixed(1)}%)`,
        boxX,
        boxY > 20 ? boxY - 5 : boxY + 20
      );
    });

    setDetections(detections);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        style={{ width: '640px', height: '480px' }}
        autoPlay
        playsInline
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '640px',
          height: '480px'
        }}
      />
    </div>

    <div style={{ 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      minWidth: '300px'
    }}>
      <h3>Status: {status}</h3>
      <h4>Available Labels:</h4>
      <div style={{ 
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '4px'
      }}>
        {labels.map((label, i) => (
          <div key={i}>{i}: {label}</div>
        ))}
      </div>
      <h4>Detections:</h4>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {detections.map((det, i) => (
          <div key={i} style={{ 
            marginBottom: '10px', 
            padding: '5px', 
            backgroundColor: '#fff',
            borderRadius: '4px'
          }}>
            <p><strong>{det.class}</strong></p>
            <p>Confidence: {(det.score * 100).toFixed(1)}%</p>
            <p>Position: ({Math.round(det.bbox[1] * 100)}%, 
                         {Math.round(det.bbox[0] * 100)}%)</p>
            <p>Size: {Math.round(det.bbox[3] * 100)}% x 
                    {Math.round(det.bbox[2] * 100)}%</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};
export default ObjectDetection;