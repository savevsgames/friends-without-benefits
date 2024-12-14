const blue = [255, 0, 0, 255];
const green = [0, 255, 0, 255];
const red = [0, 0, 255, 255];

function colorForLabels(className) {
  let color;
  if (className === "person") {
    color = blue;
  } else if (className === "oneoftheitemsinourgame") {
    color = green;
  } else {
    color = red;
  }
}

function drawBoundingBoxes(predictions, inputImage) {
  predictions.forEach((prediction) => {
    const bbox = prediction.bbox;
    const x = bbox[0];
    const y = bbox[1];
    const width = bbox[2];
    const height = bbox[3];
    const className = prediction.class;
    const confScore = prediction.score;
    const color = colorForLabels(className);
    console.log(x, y, width, height, className, confScore);
    // Draw the bounding box with the label and the confidence score
    // using points from prediction iterable
    let point1 = new cv.Point(x, y);
    let point2 = new cv.Point(x + width, y + height);
    cv.rectangle(inputImage, point1, point2, color, 2);
    let text = className + " " + Math.round(confScore * 100) + "%";
    // Set the font for the box text
    const font = cv.FONT_HERSHEY_SIMPLEX;
    const fontSize = 0.7;
    const thickness = 1;
    // Grab the canvas
    const canvas = document.getElementById("canvas-main");
    const context = canvas.getContext("2d");
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;
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
    let imageMain = cv.imread("image-main");
    cv.imshow("canvas-main", imageMain);
    imageMain.delete();

    // Oject detection
    document
      .getElementById("detect_button")
      .addEventListener("click", function () {
        console.log("Object Detection Image loader...");
        const image = document.getElementById("image-main");
        let inputImage = cv.imread(image);
        //Load the model then use it to detect objects in the image
        cocoSsd.load().then((model) => {
          model.detect(image).then((predictions) => {
            console.log("Predictions: ", predictions);
            console.log("Length of Predictions: ", predictions.length);
            if (predictions.length > 0) {
              // draw the bounding boxes if there are any predictions
              drawBoundingBoxes(predictions, inputImage);
              cv.imshow("canvas-main", inputImage);
              inputImage.delete();
            } else {
              cv.imshow("canvas-main", inputImage);
              inputImage.delete();
            }
          });
        });
      });
  };
}
