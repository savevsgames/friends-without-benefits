import { detectObjects } from './objectDetection.js';

const image = document.getElementById('inputImage');
const modelPath = './best.onnx';

try {
    const detections = await detectObjects(image, modelPath);
    console.log('Detections:', detections);
   
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    detections.forEach(det => {
        const { bbox, score } = det;
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);
        ctx.fillStyle = '#00FF00';
        ctx.fillText(`${score.toFixed(2)}`, bbox.x1, bbox.y1 - 5);
    });
} catch (error) {
    console.error('Detection error:', error);
}