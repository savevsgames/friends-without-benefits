import React from 'react'
import ObjectDetection from '../onnx-detection/src/components/ObjectDetection'

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Object Detection</h1>
      <ObjectDetection />
    </div>
  )
}

export default App