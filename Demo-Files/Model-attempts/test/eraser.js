const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const ort = require('onnxruntime-node');

const MODEL_PATH = './best.onnx';
const INPUT_SIZE = 640;

async function detectObjects(imagePath) {
  try {
    const session = await ort.InferenceSession.create(MODEL_PATH);
    const image = await loadImage(imagePath);

    const inputCanvas = createCanvas(INPUT_SIZE, INPUT_SIZE);
    const inputCtx = inputCanvas.getContext('2d');
    inputCtx.drawImage(image, 0, 0, INPUT_SIZE, INPUT_SIZE);

    const imageData = inputCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
    const input = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);

    for (let i = 0; i < imageData.data.length; i += 4) {
      input[i / 4] = imageData.data[i] / 255.0; // R
      input[i / 4 + INPUT_SIZE * INPUT_SIZE] = imageData.data[i + 1] / 255.0; // G
      input[i / 4 + 2 * INPUT_SIZE * INPUT_SIZE] = imageData.data[i + 2] / 255.0; // B
    }

    const tensor = new ort.Tensor('float32', input, [1, 3, INPUT_SIZE, INPUT_SIZE]);
    const results = await session.run({ images: tensor });
    const predictions = results.output0.data;

    const boxes = [];
    const scores = [];
    const confidenceThreshold = 0.5; 

    for (let i = 0; i < 8400; i++) {
      const baseIdx = i * 6;
      const confidence = predictions[baseIdx + 4];
      if (confidence > confidenceThreshold) {
        const box = {
          cx: predictions[baseIdx] / INPUT_SIZE,
          cy: predictions[baseIdx + 1] / INPUT_SIZE,
          w: predictions[baseIdx + 2] / INPUT_SIZE,
          h: predictions[baseIdx + 3] / INPUT_SIZE
        };
        boxes.push(box);
        scores.push(confidence);
      }
    }

    const keepIndices = nms(boxes, scores, 0.5);

    const outputCanvas = createCanvas(image.width, image.height);
    const ctx = outputCanvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    keepIndices.forEach(i => {
      const box = boxes[i];
      const x1 = Math.floor((box.cx - box.w / 2) * image.width);
      const y1 = Math.floor((box.cy - box.h / 2) * image.height);
      const x2 = Math.floor((box.cx + box.w / 2) * image.width);
      const y2 = Math.floor((box.cy + box.h / 2) * image.height);

      // Print the final box coordinates and confidence score
      console.log(`Final Box ${i}: x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2}, Confidence=${(scores[i] * 100).toFixed(1)}%`);

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(`${(scores[i] * 100).toFixed(1)}%`, x1, y1 - 5);
    });

    const buffer = outputCanvas.toBuffer('image/png');
    fs.writeFileSync('./output.png', buffer);
    console.log("Output image saved as 'output.png'.");
  } catch (error) {
    console.error("Error during detection:", error);
  }
}

function nms(boxes, scores, iouThreshold) {
  let indices = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.index);

  const keep = [];

  while (indices.length > 0) {
    const current = indices.shift(); 
    keep.push(current);

    const currentBox = boxes[current];
    const remainingBoxes = indices.map(i => boxes[i]);

    const overlaps = remainingBoxes.map(box => calculateIoU(currentBox, box));
    indices = indices.filter((_, i) => overlaps[i] <= iouThreshold);
  }

  return keep;
}

function calculateIoU(box1, box2) {
  const x1 = Math.max(box1.cx - box1.w / 2, box2.cx - box2.w / 2);
  const y1 = Math.max(box1.cy - box1.h / 2, box2.cy - box2.h / 2);
  const x2 = Math.min(box1.cx + box1.w / 2, box2.cx + box2.w / 2);
  const y2 = Math.min(box1.cy + box1.h / 2, box2.cy + box2.h / 2);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const box1Area = box1.w * box1.h;
  const box2Area = box2.w * box2.h;
  const union = box1Area + box2Area - intersection;

  return intersection / union;
}

detectObjects('./test3.png');