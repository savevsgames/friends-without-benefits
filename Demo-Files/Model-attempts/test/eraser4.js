const fs = require('fs');
const ort = require('onnxruntime-node');
const { createCanvas, loadImage } = require('canvas');

async function detectHeadphones(imagePath) {
  const session = await ort.InferenceSession.create('./best.onnx');
  const image = await loadImage(imagePath);

  const inputCanvas = createCanvas(640, 640);
  const inputCtx = inputCanvas.getContext('2d');
  inputCtx.drawImage(image, 0, 0, 640, 640);

  const imageData = inputCtx.getImageData(0, 0, 640, 640);
  const input = new Float32Array(3 * 640 * 640);
  for (let i = 0; i < imageData.data.length; i += 4) {
    input[i/4] = imageData.data[i] / 255.0;
    input[i/4 + 640*640] = imageData.data[i+1] / 255.0;
    input[i/4 + 2*640*640] = imageData.data[i+2] / 255.0;
  }

  const tensor = new ort.Tensor('float32', input, [1, 3, 640, 640]);
  const results = await session.run({ images: tensor });
  const predictions = results.output0.data;

  const outputCanvas = createCanvas(image.width, image.height);
  const ctx = outputCanvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  let bestScore = 0;
  let bestBox = null;
  
  for (let i = 0; i < predictions.length; i += 6) {
    const confidence = predictions[i + 4];
    if (confidence > bestScore) {
      bestScore = confidence;
      bestBox = {
        cx: predictions[i],
        cy: predictions[i + 1],
        w: predictions[i + 2],
        h: predictions[i + 3]
      };
    }
  }

  if (bestBox) {
  
    const cx = bestBox.cx / 640;
    const cy = bestBox.cy / 640;
    const w = bestBox.w / 640;
    const h = bestBox.h / 640;

    const x1 = (cx - w/2) * image.width;
    const y1 = (cy - h/2) * image.height;
    const x2 = (cx + w/2) * image.width;
    const y2 = (cy + h/2) * image.height;

    console.log("Box coordinates:", {x1, y1, x2, y2});
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, x2-x1, y2-y1);
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px Arial';
    const conf = (bestScore / 640 * 100).toFixed(1);
    ctx.fillText(`${conf}%`, x1, y1-5);
  }

  fs.writeFileSync('output.png', outputCanvas.toBuffer('image/png'));
}

detectHeadphones('./test3.png');