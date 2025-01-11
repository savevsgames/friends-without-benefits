import React, { useEffect, useRef, useState } from 'react';

const WebcamDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [classifier, setClassifier] = useState(null);
  const [status, setStatus] = useState('Loading...');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            setIsVideoReady(true);
          };
        }
      } catch (err) {
        setStatus('Error accessing webcam');
        console.error(err);
      }
    }

    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    async function loadModel() {
      if (!isVideoReady) return;
      
      try {
        const loadedClassifier = await window.ml5.imageClassifier('model.json', () => {
          console.log('Model loaded successfully!');
          setStatus('Model loaded! Ready for detection.');
        });
        
        setClassifier(loadedClassifier);
        startDetection(loadedClassifier);
      } catch (error) {
        setStatus('Error loading model');
        console.error('Error loading model:', error);
      }
    }

    loadModel();
  }, [isVideoReady]);

  const startDetection = (loadedClassifier) => {
    if (!videoRef.current || !canvasRef.current) return;

    const detectFrame = async () => {
      if (!videoRef.current) return;

      try {
        const results = await loadedClassifier.classify(videoRef.current);
        if (results && results[0]) {
          drawBox(results[0]);
        }
      } catch (error) {
        console.error('Detection error:', error);
      }

      requestAnimationFrame(detectFrame);
    };

    detectFrame();
  };

  const drawBox = (prediction) => {
    if (prediction.confidence < 0.50) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const boxWidth = video.videoWidth / 3;
    const boxHeight = video.videoHeight / 3;
    const x = (video.videoWidth - boxWidth) / 2;
    const y = (video.videoHeight - boxHeight) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    ctx.fillStyle = '#00ff00';
    ctx.font = '24px Arial';
    const label = `${prediction.label} (${(prediction.confidence * 100).toFixed(1)}%)`;
    ctx.fillText(label, x, y - 10);

    setDebugInfo({
      label: prediction.label,
      confidence: prediction.confidence,
      coords: {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(boxWidth),
        height: Math.round(boxHeight)
      }
    });
  };

  return (
    <div className="flex gap-5">
      <div className="relative w-fit">
        <video
          ref={videoRef}
          className="w-[640px] h-[480px]"
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-[640px] h-[480px]"
        />
        <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white p-2">
          {status}
        </div>
      </div>
      
      {debugInfo && (
        <div className="p-5 bg-gray-100 rounded-lg min-w-[200px]">
          <h3 className="text-lg font-bold mb-3">Detection Info</h3>
          <p><strong>Object:</strong> {debugInfo.label}</p>
          <p><strong>Confidence:</strong> {(debugInfo.confidence * 100).toFixed(1)}%</p>
          <p className="mt-2"><strong>Box Coordinates:</strong></p>
          <pre className="bg-white p-2 rounded mt-1">
            {JSON.stringify(debugInfo.coords, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WebcamDetection;