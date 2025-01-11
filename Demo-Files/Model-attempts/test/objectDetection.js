import * as ort from 'onnxruntime-web';

function yoloToBox(cx, cy, w, h) {
    const x1 = cx - w/2;
    const y1 = cy - h/2;
    const x2 = cx + w/2;
    const y2 = cy + h/2;
    return [x1, y1, x2, y2];
}

function calculateIou(box1, box2) {
   
    const box1X1 = box1[0] - box1[2]/2;
    const box1Y1 = box1[1] - box1[3]/2;
    const box1X2 = box1[0] + box1[2]/2;
    const box1Y2 = box1[1] + box1[3]/2;
    
    const box2X1 = box2[0] - box2[2]/2;
    const box2Y1 = box2[1] - box2[3]/2;
    const box2X2 = box2[0] + box2[2]/2;
    const box2Y2 = box2[1] + box2[3]/2;
    
    const xi1 = Math.max(box1X1, box2X1);
    const yi1 = Math.max(box1Y1, box2Y1);
    const xi2 = Math.min(box1X2, box2X2);
    const yi2 = Math.min(box1Y2, box2Y2);
    
    const intersection = Math.max(0, xi2 - xi1) * Math.max(0, yi2 - yi1);
    
    const box1Area = (box1X2 - box1X1) * (box1Y2 - box1Y1);
    const box2Area = (box2X2 - box2X1) * (box2Y2 - box2Y1);
    
    const union = box1Area + box2Area - intersection;
    return intersection / union;
}

function nms(boxes, scores, iouThreshold = 0.5) {
    
    const indices = Array.from(scores.keys()).sort((a, b) => scores[b] - scores[a]);
    const keep = [];
    
    while (indices.length > 0) {
        const current = indices[0];
        keep.push(current);
        
        if (indices.length === 1) break;
        
        indices.shift();
        const box1 = boxes[current];
        
        indices = indices.filter(idx => {
            const box2 = boxes[idx];
            const overlap = calculateIou(box1, box2);
            return overlap <= iouThreshold;
        });
    }
    
    return keep;
}

async function preprocessImage(imageElement) {
    
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
  
    ctx.drawImage(imageElement, 0, 0, 640, 640);
    const imageData = ctx.getImageData(0, 0, 640, 640);
  
    const inputArray = new Float32Array(3 * 640 * 640);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i] / 255.0;
        const g = imageData.data[i + 1] / 255.0;
        const b = imageData.data[i + 2] / 255.0;
        
        inputArray[i/4] = r;
        inputArray[640*640 + i/4] = g;
        inputArray[2*640*640 + i/4] = b;
    }
    
    return inputArray;
}

async function detectObjects(imageElement, modelPath, confidenceThreshold = 0.5) {
    try {
        // Load model
        const session = await ort.InferenceSession.create(modelPath);
        
        // Preprocess image
        const inputTensor = await preprocessImage(imageElement);
        
        // Prepare input tensor
        const input = new ort.Tensor('float32', inputTensor, [1, 3, 640, 640]);
        
        // Run inference
        const results = await session.run({ images: input });
        const output = results.output0;
        
        // Process results
        const predictions = output.data;
        const numPredictions = predictions.length / 6; 
        
        // Extract boxes and scores
        const boxes = [];
        const scores = [];
        
        for (let i = 0; i < numPredictions; i++) {
            const score = predictions[4 * numPredictions + i];
            if (score > confidenceThreshold) {
                const cx = predictions[i];
                const cy = predictions[numPredictions + i];
                const w = predictions[2 * numPredictions + i];
                const h = predictions[3 * numPredictions + i];
                boxes.push([cx, cy, w, h]);
                scores.push(score);
            }
        }
        
        // Apply NMS
        const keepIndices = nms(boxes, scores);
        
        // Prepare final results
        const finalDetections = keepIndices.map(idx => {
            const box = boxes[idx];
            const score = scores[idx];
            
            // Scale coordinates to original image size
            const cx = box[0] / 640 * imageElement.width;
            const cy = box[1] / 640 * imageElement.height;
            const w = box[2] / 640 * imageElement.width;
            const h = box[3] / 640 * imageElement.height;
            
            // Convert to corner coordinates
            const [x1, y1, x2, y2] = yoloToBox(cx, cy, w, h);
            
            return {
                bbox: {
                    x1: Math.round(x1),
                    y1: Math.round(y1),
                    x2: Math.round(x2),
                    y2: Math.round(y2)
                },
                score: score
            };
        });
        
        return finalDetections;
        
    } catch (error) {
        console.error('Detection error:', error);
        throw error;
    }
}


/*
const image = document.getElementById('inputImage');
const modelPath = './best.onnx';

detectObjects(image, modelPath)
    .then(detections => {
        console.log('Detections:', detections);
        // Draw boxes on image or canvas here
    })
    .catch(error => {
        console.error('Error:', error);
    });
*/

export { detectObjects };