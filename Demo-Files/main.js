let currentMediaElement = null;
let currentMediaType = null;
let model = null;
let videoPlaying = false;
let webcamSteam = null;

const blue = [255, 0, 0, 255];
const green = [0, 255, 0, 255];
const red = [0, 0, 255, 255];

function colorForLabels(className) {
  const colors = {
    // Can add more colors to match the classes we want to detect
    person: blue,
    bottle: green,
    default: red,
  };
  //
  return colors.className || colors.default;
}

function drawBoundingBoxes(predictions, inputImage) {
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
}

function OpenCVReady() {
  cv["onRuntimeInitialized"] = () => {
    console.log("OpenCV.js is ready");

    // Test OpenCV.js is working on load with a quick image load
    let imageMain = cv.imread("image-main");
    cv.imshow("canvas-main", imageMain);
    imageMain.delete();

    // Functions to add event listeners to the buttons
    async function addLoadImageEListener() {
      const loadImageButton = document.getElementById("load_image_button");
      loadImageButton.addEventListener("click", function () {
        console.log("Load Image Button Clicked");
      });
    }
    // Object Detection Event Listener
    document
      .getElementById("detect_button")
      .addEventListener("click", function () {
        console.log("Object Detection Image loader...");
        const image = document.getElementById("image-main");
        let inputImage = cv.imread(image);
        // Load the cocossd model then use it to detect objects in the image
        cocoSsd.load().then((model) => {
          model.detect(image).then((predictions) => {
            console.log("Predictions: ", predictions);
            console.log("Length of Predictions: ", predictions.length);
            if (predictions.length > 0) {
              drawBoundingBoxes(predictions, inputImage);
            }
            cv.imshow("canvas-main", inputImage);
            inputImage.delete();
          });
        });
      });
  };
}
