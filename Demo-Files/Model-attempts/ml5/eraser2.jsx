import React, { useEffect, useRef, useState } from 'react';

const ObjectDetection = () => {
  const modelRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [labels, setLabels] = useState([]);
  const [status, setStatus] = useState('Loading TFJS model...');
  const [detections, setDetections] = useState([]);
  const [lastDetections, setLastDetections] = useState([]);

  useEffect(() => {
    async function loadModelAndLabels() {
      try {
      
        const labelsResponse = await fetch('./src/tfjs/labels.txt');
        const labelsText = await labelsResponse.text();
        const labelsList = labelsText.split('\n').map(label => label.trim()).filter(Boolean);
        setLabels(labelsList);
        console.log('Labels loaded:', labelsList);

        const loadedModel = await tf.loadGraphModel('./src/tfjs/model.json');
        modelRef.current = loadedModel;
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
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          setStatus('Ready for detection');
          setTimeout(() => {
            startDetection();
          }, 1000);
        };
      }
    } catch (err) {
      setStatus('Error accessing webcam');
      console.error('Webcam error:', err);
    }
  };

  const processImageAndPredict = async (video, model, labels) => {
    const tensor = tf.tidy(() => {
      const img = tf.browser.fromPixels(video);
      const resized = tf.image.resizeBilinear(img, [416, 416]);
      const normalized = resized.div(255.0);
      return normalized.expandDims(0); //tensor shape: [1, 416, 416, 3]
    });

    try {
      const predictions = await model.predict(tensor);
      console.log('Raw predictions:', predictions);

      const predictionData = await predictions.array();
      const [batch, gridH, gridW, channels] = predictions.shape;
      console.log('Prediction shape:', predictions.shape);

      let detectionResults = [];
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
                score: confidence,
              });
            }
          }
        }
      }

      return detectionResults.filter(det => det.score > 0.3);
    } catch (error) {
      console.error('Error in prediction:', error);
      return [];
    } finally {
      tf.dispose(tensor);
    }
  };

  const startDetection = async () => {
    if (!modelRef.current || !videoRef.current) {
      console.error('Model or video is not available');
      return;
    }

    const detectFrame = async () => {
      const video = videoRef.current;
      const detections = await processImageAndPredict(video, modelRef.current, labels);
      console.log('Processed detections:', detections);

      drawDetections(detections);
      setDetections(detections);

      requestAnimationFrame(detectFrame);
    };

    detectFrame();
  };

  const drawDetections = (detections) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    if (detections.length > 0) {
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
          `${det.class} (${(det.score * 100).toFixed(1)}%)`,
          boxX,
          boxY > 20 ? boxY - 5 : boxY + 20
        );
      });
  
      setLastDetections(detections);
    } else {
      
      if (lastDetections.length > 0) {
        lastDetections.forEach(det => {
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
            `${det.class} (${(det.score * 100).toFixed(1)}%)`,
            boxX,
            boxY > 20 ? boxY - 5 : boxY + 20
          );
        });
      }
    }
  
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
            height: '480px',
          }}
        />
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', minWidth: '300px' }}>
        <h3>Status: {status}</h3>
        <h4>Available Labels:</h4>
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
          {labels.map((label, i) => (
            <div key={i}>{i}: {label}</div>
          ))}
        </div>
        <h4>Detections:</h4>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
  {(detections.length > 0 ? detections : lastDetections).map((det, i) => (
    <div
      key={i}
      style={{
        marginBottom: '10px',
        padding: '5px',
        backgroundColor: '#fff',
        borderRadius: '4px',
      }}
    >
      <p>
        <strong>{det.class}</strong>
      </p>
      <p>Confidence: {(det.score * 100).toFixed(1)}%</p>
      <p>
        Position: ({Math.round(det.bbox[1] * 100)}%, {Math.round(det.bbox[0] * 100)}%)
      </p>
      <p>
        Size: {Math.round(det.bbox[3] * 100)}% x {Math.round(det.bbox[2] * 100)}%
      </p>
    </div>
  ))}
</div>;
      </div>
    </div>
  );
};

export default ObjectDetection;
