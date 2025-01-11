const fs = require('fs');
const ort = require('onnxruntime-node');
const { createCanvas, loadImage } = require('canvas');

async function detectHeadphones(imagePath) {
  
  const session = await ort.InferenceSession.create('./best.onnx');
  const image = await loadImage(imagePath);
  const canvas = createCanvas(640, 640);
  const ctx = canvas.getContext('2d');
  const scale = Math.min(640/image.width, 640/image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const x = (640 - scaledWidth) / 2;
  const y = (640 - scaledHeight) / 2;
  
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

  const imageData = ctx.getImageData(0, 0, 640, 640);
  const input = new Float32Array(3 * 640 * 640);
  for (let i = 0; i < imageData.data.length; i += 4) {
    input[i/4] = imageData.data[i] / 255.0;
    input[i/4 + 640*640] = imageData.data[i+1] / 255.0;
    input[i/4 + 2*640*640] = imageData.data[i+2] / 255.0;
  }
 
  const tensor = new ort.Tensor('float32', input, [1, 3, 640, 640]);
  console.log("Input tensor shape:", tensor.dims);

  const results = await session.run({ images: tensor });
  const boxes = results.output0.data;
  let bestBox = null;
  let bestConf = 0;

  const detections = [];
for (let i = 0; i < boxes.length; i += 6) {
 if (boxes[i + 4] > 0.5) {
   detections.push({
     x1: boxes[i],
     y1: boxes[i + 1],
     x2: boxes[i + 2],
     y2: boxes[i + 3],
     confidence: boxes[i + 4]
   });
 }
}

const keepIndices = nms(detections, detections.map(d => d.confidence));
keepIndices.forEach(i => {
 const box = detections[i];
 ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
});
//   for (let i = 0; i < boxes.length; i += 6) {
//     const conf = boxes[i + 4] / 640;
//     if (conf > 0.5 && conf > bestConf) {
//       bestConf = conf;
//     //   bestBox = {
//     //     x: x + (boxes[i] / 640) * scaledWidth,
//     //     y: y + (boxes[i + 1] / 640) * scaledHeight,
//     //     w: ((boxes[i + 2] - boxes[i]) / 640) * scaledWidth,
//     //     h: ((boxes[i + 3] - boxes[i + 1]) / 640) * scaledHeight
//     //   };
//       const bestBox = {
//         x1: x + (boxes[i] / 640) * width,
//         y1: y + (boxes[i + 1] / 640) * height,
//         x2: x + (boxes[i + 2] / 640) * width,
//         y2: y + (boxes[i + 3] / 640) * height
//       };
//       console.log(`Raw coords: x=${boxes[i]}, y=${boxes[i+1]}, x2=${boxes[i+2]}, y2=${boxes[i+3]}`);
//       console.log(`Scaled coords: x=${bestBox.x}, y=${bestBox.y}, w=${bestBox.w}, h=${bestBox.h}`);
//     }
//   }

  // Draw detection
//   if (bestBox) {
//     ctx.strokeStyle = '#00ff00';
//     ctx.lineWidth = 3;
//     //ctx.strokeRect(bestBox.x, bestBox.y, bestBox.w, bestBox.h);
//     ctx.strokeRect(
//         bestBox.x1, 
//         bestBox.y1,
//         bestBox.x2 - bestBox.x1,
//         bestBox.y2 - bestBox.y1
//       );
//     ctx.fillStyle = '#00ff00';
//     ctx.font = '16px Arial';
//     ctx.fillText(`${(bestConf * 100).toFixed(0)}%`, bestBox.x, bestBox.y - 5);
//   }

  fs.writeFileSync('output.png', canvas.toBuffer('image/png'));
}

detectHeadphones('./test2.jpg');