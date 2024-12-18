let currentMediaElement = null;
let currentMediaType = null;
let model = null;
let videoPlaying = false;
let webcamSteam = null;

const blue = [255, 0, 0, 255];
const green = [0, 255, 0, 255];
const red = [0, 0, 255, 255];

const colorForLabels = (className) => {
  const colors = {
    // Can add more colors to match the classes we want to detect
    person: blue,
    bottle: green,
    default: red,
  };
  //
  return colors[className] || colors.default;
};

const drawBoundingBoxes = (predictions, inputImage) => {
  // Grab the canvas
  const canvas = document.getElementById("canvas-main");
  const context = canvas.getContext("2d");

  // Loop through the predictions and draw the bounding boxes
  predictions.forEach((prediction) => {
    const { bbox, class: className, score: confScore } = prediction;
    const { x, y, width, height } = bbox;

    const color = colorForLabels(className);
    // console.log(x, y, width, height, className, confScore);
    const point1 = new cv.Point(x, y);
    const point2 = new cv.Point(x + width, y + height);
    // Draw the bounding box (image, top-left, bottom-right, color, thickness)
    cv.rectangle(inputImage, point1, point2, color, 4);
    const text = `${className} ${Math.round(confScore * 100)}%`;
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;

    // Set the font for the box text
    const font = cv.FONT_HERSHEY_SIMPLEX;
    const fontSize = 1.5;
    const thickness = 2;

    cv.rectangle(
      inputImage,
      new cv.Point(x, y - 20),
      new cv.Point(x + textWidth + 150, y),
      color,
      -1
    );
    cv.putText(
      inputImage,
      text,
      new cv.Point(x, y - 5),
      font,
      fontSize,
      new cv.Scalar(255, 255, 255, 255),
      thickness
    );
  });
};

const initOpenCvAndModel = async () => {
  console.log("Initializing OpenCV and Model...");
  // Game page will load OpenCV.js into memory and the new Promise will resolve when it's ready
  await new Promise((resolve) => {
    cv["onRuntimeInitialized"] = resolve();
  });
  console.log("OpenCV is ready");
  // In the future we can load a custom model here, for MVP we will test with coco-ssd and yolo
  // TODO: Load the model here
  model = await cocoSsd.load();
  console.log("Model is ready");

  // Add functionality to the buttons
  setupEventListeners();
};

const setupEventListeners = () => {
  console.log("Setting up Event Listeners...");

  // Load Image Button
  document.getElementById("load_image_button").addEventListener("click", () => {
    document.getElementById("image-file-input").click();
  });
  // Load Image from File - Hidden Input
  document
    .getElementById("image-file-input")
    .addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        loadImage(file);
        currentMediaType = "image";
        console.log("Image loaded and media type set to image");
      } else {
        console.log("No image file selected");
      }
    });

  // Detect Button
  document
    .getElementById("detect_button")
    .addEventListener("click", async () => {
      await runDetection();
    });
};

const runDetection = async () => {
  if (!model) {
    // Media Element is the img, video or webcam to run detection on
    console.log("Model not ready");
    return;
  }
  if (!currentMediaElement || !currentMediaType) {
    console.log("No media element to run detection on. Load an image first.");
    return;
  }
  if (currentMediaType === "image") {
    console.log("Running detection on image...");
    const inputImage = cv.imread(currentMediaElement);
    const predictions = await model.detect(currentMediaElement);

    console.log("Predictions: ", predictions);
    if (predictions.length > 0) {
      drawBoundingBoxes(predictions, inputImage);
    }

    cv.imshow("canvas-main", inputImage);
    inputImage.delete();
  } else if (currentMediaType === "video") {
    console.log("Running detection on video...");
  } else if (currentMediaType === "webcam") {
    console.log("Running detection on webcam...");
  }
};

// Main initialization function
export const initScavengerHunt = async () => {
  await initOpenCvAndModel();
};

initScavengerHunt();
