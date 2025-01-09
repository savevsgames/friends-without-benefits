import sys
from ultralytics import YOLO

def export2():
    print("Trial")
    try:
        model = YOLO("./runs/detect/train2/weights/best.pt")
        print("Model loaded")

        #model.export(format="saved_model", save_dir="./saved_model")
        #print("Export complete")

        model.export(format="tfjs", save_dir="./web_model")
        print("Done?")
    except Exception as e: 
        print(f"Error: {e}")
        print(f"Python version: {sys.version}")

if __name__ == "__main__":
    export2()

