let currentMediaElement = null;
let currentMediaType = null;
let model = null;
let videoPlaying = false;
let webcamSteam = null;

// Using File Reader API to load the image and display it.
// In the future we may switch to FormData API instead if media is uploaded to the server
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const imageElement = document.getElementById("image-main");
    const canvasElement = document.getElementById("canvas-main");
    imageElement.src = event.target.result;
    // Wait for the image to load
    imageElement.onload = () => {
      // Set the canvas width and height to the image width and height (may clash with CSS)
      canvasElement.width = imageElement.naturalWidth;
      canvasElement.height = imageElement.naturalHeight;
      // In react we will have to use setState to update the image src, currentMediaType and currentMediaElement
      currentMediaType = "image";
      currentMediaElement = imageElement;
      let imgMat = cv.imread("image-main");
      console.log("Image Loaded: ", imgMat);
      cv.imshow("canvas-main", imgMat);
      imgMat.delete();
      console.log("Image Loaded and Displayed");
    };
  };
  // For handling binary files
  reader.readAsDataURL(file);
}

const colorForLabels = (className) => {
  const blue = [255, 0, 0, 255];
  const green = [0, 255, 0, 255];
  const red = [0, 0, 255, 255];
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
  const canvas = document.getElementById("canvas-main");
  const context = canvas.getContext("2d");

  predictions.forEach((prediction) => {
    const { bbox, class: className, score: confScore } = prediction;
    const [x, y, width, height] = bbox.map((val) => Math.round(val)); // Ensure all values are integers

    const color = colorForLabels(className);
    // Draw bounding box
    const point1 = new cv.Point(x, y);
    const point2 = new cv.Point(x + width, y + height);

    // Draw the bounding box
    cv.rectangle(inputImage, point1, point2, color, 4);
    // Draw the label background and text
    const text = `${className} ${Math.round(confScore * 100)}%`;
    const fontFace = cv.FONT_HERSHEY_SIMPLEX;
    const fontSize = 0.8; // Proportional size in rem
    const thickness = 2;
    const filled = -1; // Filled rectangle

    // Get text size for background rectangle
    context.font = "20px Arial"; // Use to measure text width and height
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 20; // These are hardcoded for now
    const textPadding = 15;

    // Draw background rectangle for the label
    cv.rectangle(
      inputImage,
      new cv.Point(x, y - textHeight - textPadding),
      new cv.Point(x + textWidth + textPadding, y),
      color,
      filled
    );

    // Draw the text
    cv.putText(
      inputImage,
      text,
      new cv.Point(x + 5, y - 5), // Adjust text placement
      fontFace,
      fontSize,
      new cv.Scalar(255, 255, 255, 255), // White text
      thickness
    );
  });
};

const waitForCVDef = async () => {
  console.log("Waiting for cv ...");
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (typeof cv !== "undefined") {
        clearInterval(interval);
        resolve();
      }
    }, 100); // check every 100ms for the cv object to be available
  });
  console.log("OpenCV is ready");
};

const initOpenCvAndModel = async () => {
  console.log("Waiting for cv to be defined...");
  await waitForCVDef();
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
  console.log("Load Image Button is set up!");

  // Detect Button
  document
    .getElementById("detect_button")
    .addEventListener("click", async () => {
      await runDetection();
    });
  console.log("Detect Button is set up!");
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
    const inputImage = await cv.imread(currentMediaElement);
    try {
      const predictions = await model.detect(currentMediaElement);
      console.log("Predictions: ", predictions);
      if (predictions.length > 0) {
        drawBoundingBoxes(predictions, inputImage);
      }
      cv.imshow("canvas-main", inputImage);
    } catch (error) {
      console.error("Error running detection: ", error);
    } finally {
      inputImage.delete(); // Moved to finally block to ensure it's always deleted after use
    }
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
