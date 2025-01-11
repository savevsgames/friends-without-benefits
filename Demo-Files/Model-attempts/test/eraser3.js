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
    console.log("Raw predictions:", predictions.slice(0, 6)); 
    const boxes = predictions.slice(0, 4); 
    const scores = predictions[4]; 
    console.log("Confidence score:", scores);
    const cx = boxes[0] / 640;
    const cy = boxes[1] / 640;
    const w = boxes[2] / 640; 
    const h = boxes[3] / 640;
    console.log("Normalized coordinates:", {cx, cy, w, h});
    const x1 = Math.max(0, (cx - w/2) * image.width);
    const y1 = Math.max(0, (cy - h/2) * image.height);
    const x2 = Math.min(image.width, (cx + w/2) * image.width);
    const y2 = Math.min(image.height, (cy + h/2) * image.height);
    console.log("Final box coordinates:", {x1, y1, x2, y2});

    const outputCanvas = createCanvas(image.width, image.height);
    const ctx = outputCanvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
   
    if (scores > 0.5) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2-x1, y2-y1);
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(`${(scores * 100).toFixed(1)}%`, x1, y1-5);
    }
   
    fs.writeFileSync('output.png', outputCanvas.toBuffer('image/png'));
   }

detectHeadphones('test3.png');