const fs = require('fs');
const ort = require('onnxruntime-node');
const { createCanvas, loadImage } = require('canvas');

// Convert YOLO format (cx, cy, w, h) to (x1, y1, x2, y2)
function yoloToBox(cx, cy, w, h) {
    const x1 = cx - w / 2;
    const y1 = cy - h / 2;
    const x2 = cx + w / 2;
    const y2 = cy + h / 2;
    return { x1, y1, x2, y2 };
  }
  
  // Calculate IoU (Intersection over Union) between two boxes
  function calculateIoU(box1, box2) {
    const x1 = Math.max(box1.x1, box2.x1);
    const y1 = Math.max(box1.y1, box2.y1);
    const x2 = Math.min(box1.x2, box2.x2);
    const y2 = Math.min(box1.y2, box2.y2);
    
    const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const box1Area = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
    const box2Area = (box2.x2 - box2.x1) * (box2.y2 - box2.y1);
    
    const unionArea = box1Area + box2Area - intersectionArea;
    return intersectionArea / unionArea;
  }
  
  function nms(boxes, scores, iouThreshold = 0.5) {
    const indices = Array.from(Array(scores.length).keys()).sort((a, b) => scores[b] - scores[a]); 
    const keep = [];
  
    while (indices.length > 0) {
      const current = indices.shift();
      keep.push(current);
  
      const currentBox = boxes[current];
  
      const remainingIndices = indices.filter(index => {
        const iou = calculateIoU(currentBox, boxes[index]);
        return iou <= iouThreshold; 
      });
  
      indices.length = 0;  
      Array.prototype.push.apply(indices, remainingIndices);
    }
  
    return keep;
  }
  
  async function testModel(image) {
    const img = await loadImage(image);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 640;
    ctx.drawImage(img, 0, 0, 640, 640);
  
    const input = tf.browser.fromPixels(canvas).toFloat().expandDims(0).div(tf.scalar(255));
  
    const model = await tf.loadGraphModel('model.json'); 
    const predictions = await model.executeAsync(input);
    
    const rawPredictions = predictions[0].arraySync();
    const boxes = rawPredictions.slice(0, 4);
    const scores = rawPredictions[4];
    const threshold = 0.5;

    const filteredIndices = [];
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > threshold) {
        filteredIndices.push(i);
      }
    }

    const filteredBoxes = filteredIndices.map(i => ({
      x1: boxes[0][i] * 640,
      y1: boxes[1][i] * 640,
      x2: boxes[2][i] * 640,
      y2: boxes[3][i] * 640,
      score: scores[i]
    }));
  
    const nmsIndices = nms(filteredBoxes, filteredBoxes.map(b => b.score));
    const finalBoxes = nmsIndices.map(i => filteredBoxes[i]);
  
    const canvasToShow = document.createElement('canvas');
    const ctxToShow = canvasToShow.getContext('2d');
    canvasToShow.width = img.width;
    canvasToShow.height = img.height;
    ctxToShow.drawImage(img, 0, 0);
  
    finalBoxes.forEach(box => {
      ctxToShow.beginPath();
      ctxToShow.rect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      ctxToShow.lineWidth = 2;
      ctxToShow.strokeStyle = 'green';
      ctxToShow.stroke();
  
      ctxToShow.fillStyle = 'green';
      ctxToShow.fillText(`Score: ${box.score.toFixed(2)}`, box.x1, box.y1 - 10);
    });
  
    document.body.appendChild(canvasToShow); 
  
    testModel('path_to_image.jpg');
  }