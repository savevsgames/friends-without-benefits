const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const ort = require('onnxruntime-node'); 
const MODEL_PATH = './best.onnx';
const INPUT_SIZE = 640;

async function detectHeadphones(imagePath) {
  try {
    const session = await ort.InferenceSession.create(MODEL_PATH);
    const image = await loadImage(imagePath);

    const inputCanvas = createCanvas(INPUT_SIZE, INPUT_SIZE);
    const inputCtx = inputCanvas.getContext('2d');
    inputCtx.drawImage(image, 0, 0, INPUT_SIZE, INPUT_SIZE);

    const imageData = inputCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
    const input = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);

    for (let i = 0; i < imageData.data.length; i += 4) {
      input[i / 4] = imageData.data[i] / 255.0; 
      input[i / 4 + INPUT_SIZE * INPUT_SIZE] = imageData.data[i + 1] / 255.0; 
      input[i / 4 + 2 * INPUT_SIZE * INPUT_SIZE] = imageData.data[i + 2] / 255.0;
    }

    const tensor = new ort.Tensor('float32', input, [1, 3, INPUT_SIZE, INPUT_SIZE]);
    const results = await session.run({ images: tensor });
    const predictions = results.output0.data;

    console.log("Raw predictions first 6:", predictions.slice(0, 6));

    const outputCanvas = createCanvas(image.width, image.height);
    const ctx = outputCanvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    let maxConf = 0;
    let bestBox = null;

    for (let i = 0; i < predictions.length / 6; i++) {
      const baseIdx = i * 6;
      const confidence = predictions[baseIdx + 4];
      if (confidence > maxConf) {
        maxConf = confidence;
        bestBox = {
          cx: predictions[baseIdx] / INPUT_SIZE,
          cy: predictions[baseIdx + 1] / INPUT_SIZE,
          w: predictions[baseIdx + 2] / INPUT_SIZE,
          h: predictions[baseIdx + 3] / INPUT_SIZE
        };
      }
    }

    if (bestBox) {
      console.log("Best detection:", bestBox, "confidence:", maxConf);

      const x1 = Math.floor((bestBox.cx - bestBox.w / 2) * image.width);
      const y1 = Math.floor((bestBox.cy - bestBox.h / 2) * image.height);
      const x2 = Math.floor((bestBox.cx + bestBox.w / 2) * image.width);
      const y2 = Math.floor((bestBox.cy + bestBox.h / 2) * image.height);

      console.log("Final box coords:", { x1, y1, x2, y2 });

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(`${(maxConf * 100).toFixed(1)}%`, x1, y1 - 5);
    }

    fs.writeFileSync('output.png', outputCanvas.toBuffer('image/png'));
  } catch (error) {
    console.error("Error during detection:", error);
  }
}