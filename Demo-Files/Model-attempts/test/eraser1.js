const fs = require('fs');
const ort = require('onnxruntime-node');
const { createCanvas, loadImage } = require('canvas');

// function yoloToBoundingBox(cx, cy, w, h) {
//     return {
//       x1: cx - w/2,
//       y1: cy - h/2,
//       x2: cx + w/2,
//       y2: cy + h/2
//     };
// }

function calculateIOU(box1, box2) {
    const x1 = Math.max(box1.x1, box2.x1);
    const y1 = Math.max(box1.y1, box2.y1);
    const x2 = Math.min(box1.x2, box2.x2);
    const y2 = Math.min(box1.y2, box2.y2);

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const box1Area = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
    const box2Area = (box2.x2 - box2.x1) * (box2.y2 - box2.y1);

    return intersection / (box1Area + box2Area - intersection);
}

function nms(boxes, scores, iouThreshold = 0.3) {
    let indices = Array.from(Array(scores.length).keys())
        .sort((a, b) => scores[b] - scores[a]);

    const keep = [];
    while (indices.length > 0) {
        const current = indices[0];
        keep.push(current);

        indices.splice(0, 1);
        indices = indices.filter(idx =>
            calculateIOU(boxes[current], boxes[idx]) <= iouThreshold
        );
    }
    return keep;
}

async function detectHeadphones(imagePath) {
    const session = await ort.InferenceSession.create('./best.onnx');
    const image = await loadImage(imagePath);

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);

    const resizeCanvas = createCanvas(640, 640);
    const resizeCtx = resizeCanvas.getContext('2d');
    resizeCtx.drawImage(image, 0, 0, 640, 640);
    const imageData = resizeCtx.getImageData(0, 0, 640, 640);

    const input = new Float32Array(3 * 640 * 640);
    for (let i = 0; i < imageData.data.length; i += 4) {
        input[i/4] = imageData.data[i] / 255.0;
        input[i/4 + 640*640] = imageData.data[i+1] / 255.0;
        input[i/4 + 2*640*640] = imageData.data[i+2] / 255.0;
    }

    const tensor = new ort.Tensor('float32', input, [1, 3, 640, 640]);
    const results = await session.run({ images: tensor });
    const boxes = results.output0.data;

    const scaleX = image.width / 640;
    const scaleY = image.height / 640;

    const detections = [];
    for (let i = 0; i < boxes.length; i += 6) {
        const cx = boxes[i];
        const cy = boxes[i + 1];
        const w = boxes[i + 2];
        const h = boxes[i + 3];
        const confidence = boxes[i + 4];

        if (confidence > 0.5) {
            detections.push({
                cx,
                cy,
                w,
                h,
                confidence
            });
        }
    }

    const keepIndices = nms(detections.map(d => {
        return { x1: d.cx - d.w / 2, y1: d.cy - d.h / 2, x2: d.cx + d.w / 2, y2: d.cy + d.h / 2 };
    }), detections.map(d => d.confidence));

    keepIndices.forEach(i => {
        const box = detections[i];
        const x1 = box.cx - box.w / 2;
        const y1 = box.cy - box.h / 2;
        const x2 = box.cx + box.w / 2;
        const y2 = box.cy + box.h / 2;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x1 * scaleX, y1 * scaleY, (x2 - x1) * scaleX, (y2 - y1) * scaleY);

        ctx.fillStyle = '#00ff00';
        ctx.font = '16px Arial';
        ctx.fillText(`${(box.confidence * 100).toFixed(1)}%`, x1 * scaleX, y1 * scaleY - 5);
    });

    fs.writeFileSync('output.png', canvas.toBuffer('image/png'));
}

// Test with an image
detectHeadphones('./test3.png');
