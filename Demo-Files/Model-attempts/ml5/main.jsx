import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import ML5Training from './training'
import ObjectDetection from './objectDetection'  // TensorFlow.js 
import WebcamDetection from './webcamDetection'  // ML5

const App = () => {
  const [currentMode, setCurrentMode] = useState('training'); // training, ml5, tfjs

  const renderContent = () => {
    switch(currentMode) {
      case 'training':
        return <ML5Training />;
      case 'ml5':
        return <WebcamDetection />;
      case 'tfjs':
        return <ObjectDetection />;
      default:
        return <ML5Training />;
    }
  };

  return (
    <div>
      <div style={{
        padding: '10px',
        marginBottom: '20px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={() => setCurrentMode('training')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentMode === 'training' ? '#4CAF50' : '#ddd',
            color: currentMode === 'training' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Training Mode
        </button>
        <button 
          onClick={() => setCurrentMode('ml5')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentMode === 'ml5' ? '#2196F3' : '#ddd',
            color: currentMode === 'ml5' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test ML5 Model
        </button>
        <button 
          onClick={() => setCurrentMode('tfjs')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentMode === 'tfjs' ? '#9c27b0' : '#ddd',
            color: currentMode === 'tfjs' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test TensorFlow.js Model
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)