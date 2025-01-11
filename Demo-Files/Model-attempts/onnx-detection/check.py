import onnxruntime as ort
import cv2
import numpy as np

def test_model(image_path):
    # Load test image
    img = cv2.imread(image_path)
    img = cv2.resize(img, (640, 640))
    img = img.transpose(2, 0, 1)  
    img = np.expand_dims(img, 0)  
    img = img.astype(np.float32) / 255.0  

    # Load and run model
    session = ort.InferenceSession("best.onnx")
    input_name = session.get_inputs()[0].name
    results = session.run(None, {input_name: img})

    
    print("Results shape:", [r.shape for r in results])
    print("Sample predictions:", results[0][0][:5])  

    return results

def analyze_detections(output, conf_threshold=0.7):
   # Get output array and reshape
   predictions = output[0]  
   boxes = predictions[0][:4]  
   scores = predictions[0][4]  
   
   # Filter by confidence
   mask = scores > conf_threshold
   filtered_boxes = boxes[:, mask]
   filtered_scores = scores[mask]
   
   print(f"Total predictions: {len(scores)}")
   print(f"Above {conf_threshold}: {len(filtered_scores)}")
   print("Confidence scores:", filtered_scores)
   
   return filtered_boxes, filtered_scores

if __name__ == "__main__":

    results = test_model("./imagetest/test1.png")
    box, scores = analyze_detections(results)