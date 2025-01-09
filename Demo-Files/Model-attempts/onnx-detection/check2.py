import onnxruntime as ort
import cv2
import numpy as np

def yolo_to_box(cx, cy, w, h):
    x1 = cx - w/2
    y1 = cy - h/2
    x2 = cx + w/2
    y2 = cy + h/2
    return x1, y1, x2, y2

def nms(boxes, scores, iou_threshold=0.5):
    indices = np.argsort(scores)[::-1]
    keep = []
    
    while indices.size > 0:
        current = indices[0]
        keep.append(current)
        
        if indices.size == 1:
            break
            
        indices = indices[1:]
        box1 = boxes[:, current]
        other_boxes = boxes[:, indices].T
        
        overlap = calculate_iou(box1, other_boxes)
        mask = overlap <= iou_threshold
        indices = indices[mask]
        
    return keep

def calculate_iou(box1, box2):
   
   box1_x1 = box1[0] - box1[2]/2
   box1_y1 = box1[1] - box1[3]/2
   box1_x2 = box1[0] + box1[2]/2
   box1_y2 = box1[1] + box1[3]/2
   
   box2_x1 = box2[:, 0] - box2[:, 2]/2 
   box2_y1 = box2[:, 1] - box2[:, 3]/2
   box2_x2 = box2[:, 0] + box2[:, 2]/2
   box2_y2 = box2[:, 1] + box2[:, 3]/2
   
   xi1 = np.maximum(box1_x1, box2_x1)
   yi1 = np.maximum(box1_y1, box2_y1)
   xi2 = np.minimum(box1_x2, box2_x2)
   yi2 = np.minimum(box1_y2, box2_y2)
   
   intersection = np.maximum(0, xi2 - xi1) * np.maximum(0, yi2 - yi1)
   
   box1_area = (box1_x2 - box1_x1) * (box1_y2 - box1_y1)
   box2_area = (box2_x2 - box2_x1) * (box2_y2 - box2_y1)
   
   union = box1_area + box2_area - intersection
   iou = intersection / union
   
   return iou

def test_model(image_path):
 
    original_img = cv2.imread(image_path)

    img_to_show = original_img.copy()

    img = cv2.resize(original_img, (640, 640))
    img = img.transpose(2, 0, 1)  
    img = np.expand_dims(img, 0)  
    img = img.astype(np.float32) / 255.0 

    session = ort.InferenceSession("./best.onnx")
    results = session.run(None, {session.get_inputs()[0].name: img})
    print("Printing results...",  results)

    predictions = results[0][0]
    boxes = predictions[:4]
    scores = predictions[4]

    print("\nRaw predictions shape:", results[0].shape)
    print("First box predictions:", results[0][0][:6])
    print("Box coordinates:", boxes[:, 0])
    print("Scores:", scores)
    
    height, width = original_img.shape[:2]
    print("Found scores:", scores[scores > 0.5])
    keep_indices = nms(boxes, scores)
    for i in keep_indices:
        if scores[i] > 0.5:
            print(f"Raw values: cx={boxes[0][i]}, cy={boxes[1][i]}, w={boxes[2][i]}, h={boxes[3][i]}")
        
            cx = boxes[0][i] / 640
            cy = boxes[1][i] / 640
            w = (boxes[2][i]) / 640
            h = (boxes[3][i]) / 640
        
            x1 = int((cx - w/2) * width)
            y1 = int((cy - h/2) * height)
            x2 = int((cx + w/2) * width)
            y2 = int((cy + h/2) * height)
            cv2.rectangle(img_to_show, (x1, y1), (x2, y2), (0, 255, 0), 2)
            print(f"Box coords: {x1},{y1} to {x2},{y2}")
            cv2.putText(img_to_show, f"{scores[i]:.2f}", (x1, y1-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            print("\nAfter scaling:")
            print(f"cx={cx}, cy={cy}, w={w}, h={h}")
            print(f"Final box: x1={x1}, y1={y1}, x2={x2}, y2={y2}")
    
    cv2.imwrite('output.png', img_to_show)

    return results

def analyze_detections(output, conf_threshold=0.7):
   
   predictions = output[0]  
   boxes = predictions[0][:4]  
   scores = predictions[0][4]  
   mask = scores > conf_threshold
   filtered_boxes = boxes[:, mask]
   filtered_scores = scores[mask]
   
   print(f"Total predictions: {len(scores)}")
   print(f"Above {conf_threshold}: {len(filtered_scores)}")
   print("Confidence scores:", filtered_scores)
   
   return filtered_boxes, filtered_scores

if __name__ == "__main__":

    results = test_model("./test3.png")
    box, scores = analyze_detections(results)