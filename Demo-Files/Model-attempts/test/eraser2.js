const cv = require('opencv.js'); 
const ort = require('onnxruntime-web'); 

function yoloToBox(cx, cy, w, h) {
    const x1 = cx - w / 2;
    const y1 = cy - h / 2;
    const x2 = cx + w / 2;
    const y2 = cy + h / 2;
    return [x1, y1, x2, y2];
}

function nms(boxes, scores, iouThreshold = 0.5) {
    const sortedIndices = scores.map((score, idx) => ({ score, idx }))
        .sort((a, b) => b.score - a.score)
        .map(entry => entry.idx);

    const keep = [];
    while (sortedIndices.length > 0) {
        const current = sortedIndices.shift();
        keep.push(current);

        if (sortedIndices.length === 0) break;

        const box1 = boxes[current];
        const otherBoxes = sortedIndices.map(idx => boxes[idx]);

        const overlap = otherBoxes.map(box2 => calculateIou(box1, box2));
        const mask = overlap.map(iou => iou <= iouThreshold);

        sortedIndices = sortedIndices.filter((_, i) => mask[i]);
    }

    return keep;
}

function calculateIou(box1, box2) {
    const [x1, y1, x2, y2] = yoloToBox(...box1);
    const [x1b, y1b, x2b, y2b] = yoloToBox(...box2);

    const xi1 = Math.max(x1, x1b);
    const yi1 = Math.max(y1, y1b);
    const xi2 = Math.min(x2, x2b);
    const yi2 = Math.min(y2, y2b);

    const intersection = Math.max(0, xi2 - xi1) * Math.max(0, yi2 - yi1);
    const box1Area = (x2 - x1) * (y2 - y1);
    const box2Area = (x2b - x1b) * (y2b - y1b);

    const union = box1Area + box2Area - intersection;
    return intersection / union;
}

function preprocessImage(image, targetSize) {
  
    const resizedImage = cv.resize(image, new cv.Size(targetSize, targetSize));

    const floatArray = new Float32Array(targetSize * targetSize * 3);
    let index = 0;
    for (let y = 0; y < resizedImage.rows; y++) {
        for (let x = 0; x < resizedImage.cols; x++) {
            const [r, g, b] = resizedImage.ucharPtr(y, x);
            floatArray[index++] = r / 255.0;
            floatArray[index++] = g / 255.0;
            floatArray[index++] = b / 255.0;
        }
    }

    return floatArray;
}

async function testModel(imagePath) {
    
    const originalImg = cv.imread(imagePath);
    const imgToShow = originalImg.clone();

    const inputSize = 640;
    const preprocessedImage = preprocessImage(originalImg, inputSize);
    const tensor = new Float32Array([preprocessedImage]);

    const session = await ort.InferenceSession.create("./best.onnx");
    const inputName = session.inputNames[0];
    const results = await session.run({ [inputName]: tensor });

    const predictions = results[session.outputNames[0]];
    const boxes = predictions.slice(0, 4);
    const scores = predictions[4];
    const [height, width] = [originalImg.rows, originalImg.cols];

    console.log("Found scores:", scores.filter(score => score > 0.5));
    const keepIndices = nms(boxes, scores);

    keepIndices.forEach(i => {
        if (scores[i] > 0.5) {
            console.log(`Raw values: cx=${boxes[0][i]}, cy=${boxes[1][i]}, w=${boxes[2][i]}, h=${boxes[3][i]}`);

            const cx = boxes[0][i] / inputSize;
            const cy = boxes[1][i] / inputSize;
            const w = boxes[2][i] / inputSize;
            const h = boxes[3][i] / inputSize;

            const x1 = Math.round((cx - w / 2) * width);
            const y1 = Math.round((cy - h / 2) * height);
            const x2 = Math.round((cx + w / 2) * width);
            const y2 = Math.round((cy + h / 2) * height);

            cv.rectangle(imgToShow, new cv.Point(x1, y1), new cv.Point(x2, y2), new cv.Scalar(0, 255, 0), 2);
            console.log(`Box coords: ${x1},${y1} to ${x2},${y2}`);
            cv.putText(imgToShow, scores[i].toFixed(2), new cv.Point(x1, y1 - 10),
                cv.FONT_HERSHEY_SIMPLEX, 0.5, new cv.Scalar(0, 255, 0), 2);
        }
    });

    cv.imwrite('output.png', imgToShow);
    return results;
}

function analyzeDetections(output, confThreshold = 0.7) {
    const predictions = output[0]; 
    const boxes = predictions.slice(0, 4); 
    const scores = predictions[4]; 

    const mask = scores.map(score => score > confThreshold);
    const filteredBoxes = boxes.map((row, i) => row.filter((_, j) => mask[j]));
    const filteredScores = scores.filter(score => score > confThreshold);

    console.log(`Total predictions: ${scores.length}`);
    console.log(`Above ${confThreshold}: ${filteredScores.length}`);
    console.log("Confidence scores:", filteredScores);

    return { filteredBoxes, filteredScores };
}

(async () => {
    const results = await testModel("./imagetest/test3.png");
    const { filteredBoxes, filteredScores } = analyzeDetections(results, 0.7);
    console.log("Filtered Boxes:", filteredBoxes);
    console.log("Filtered Scores:", filteredScores);
})();
