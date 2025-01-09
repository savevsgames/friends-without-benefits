from ultralytics import YOLO

def train():

    model = YOLO("./yolov8n.pt")

    results = model.train(data="./data.yaml", epochs=20, imgsz=640)

    #results = model("./data/images/train/headphoones1.png")

if __name__ == "__main__":
    train()