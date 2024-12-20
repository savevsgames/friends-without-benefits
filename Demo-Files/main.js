let currentMediaElement = null;
let currentMediaType = null;
let model = null;
let videoPlaying = false;
let webcamSteam = null;

// Using File Reader API to load the image and display it.
// In the future we may switch to FormData API instead if media is uploaded to the server
const loadImage = async (file) => {
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
};

const loadVideo = async (file) => {
  const reader = new FileReader();
  reader.onload = function (event) {
    // video element needs src to be set to a URL
    const videoElement = document.getElementById("video-main");
    const canvasElement = document.getElementById("canvas-main");
    const url = URL.createObjectURL(file);
    videoElement.src = url;
    videoElement.pause();
    videoElement.currentTime = 0;
    videoElement.style.display = "block";
    videoElement.onloadedmetadata = () => {
      // Use actual video dimensions to set canvas dimensions
      const nativeVideoWidth = videoElement.videoWidth;
      const nativeVideoHeight = videoElement.videoHeight;

      // Set canvas dimensions to match video - CSS may distort the video but the canvas will still be the correct size for processing
      canvasElement.width = nativeVideoWidth;
      canvasElement.height = nativeVideoHeight;
      // In react we will have to use setState to update the video src, currentMediaType and currentMediaElement

      currentMediaType = "video";
      currentMediaElement = videoElement;
      console.log("Video Loaded: ", videoElement);

      videoElement.addEventListener(
        "loadeddata",
        async () => {
          try {
            const matWidth = nativeVideoWidth;
            const matHeight = nativeVideoHeight;

            videoElement.currentTime = 0; // Make sure video is at the start and has not autoplayed
            //

            let tempCapture = await new cv.VideoCapture(videoElement);
            // create the mat with the native video height and width and the CV_8UC4 color space
            let tempMat = new cv.Mat(matHeight, matWidth, cv.CV_8UC4);
            console.log("Mat Statistics: ", {
              height: tempMat.rows,
              width: tempMat.cols,
              type: tempMat.type(),
            });
            // read the first video frame into the mat
            tempCapture.read(tempMat);
            cv.imshow("canvas-main", tempMat);
            console.log("First Frame of Video Loaded and Displayed");
            tempMat.delete();
          } catch (error) {
            console.error("Error loading video frame: ", error);
          }
        },
        { once: true }
      );
    };
  };
  reader.readAsDataURL(file);
};

const processVideoFrame = async () => {
  if (currentMediaType !== "video") {
    console.log("No video to process");
    return;
  }
  if (!videoPlaying) {
    console.log("Video is not playing");
    return;
  }
  const video = currentMediaElement;
  // video.readyState === 4 means the video has enough data to start playing
  if (video.readyState === 4 && !video.paused && !video.ended) {
    const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    const capture = new cv.VideoCapture(video);
    capture.read(src);

    const predictions = await model.detect(video);
    console.log("Video Predictions: ", predictions);
    if (predictions.length > 0) {
      drawBoundingBoxes(predictions, src);
    }
    cv.imshow("canvas-main", src);
    src.delete();
    // requestAnimationFrame recursively calls the function until the video ends
    requestAnimationFrame(processVideoFrame);
  }
};

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
    cv.rectangle(inputImage, point1, point2, color, 8);
    // Draw the label background and text
    const text = `${className} ${Math.round(confScore * 100)}%`;
    const fontFace = cv.FONT_HERSHEY_SIMPLEX;
    const fontSize = 0.8; // Proportional size in rem
    const thickness = 4;
    const filled = -1; // Filled rectangle

    // Get text size for background rectangle
    context.font = "20px Arial"; // Use to measure text width and height
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 100; // These are hardcoded for now
    const textPadding = 150;

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
  // Play button will start the game / detection loop (and start video if there is one loaded and not playing)
  document.getElementById("play_button").addEventListener("click", async () => {
    console.log("Game is Starting...");
    if (currentMediaType === "video") {
      let video = currentMediaElement;
      video.play();
      videoPlaying = true;
      //   await runDetection();
      // } else if (currentMediaType === "image" || currentMediaType === "webcam") {
      // Just run detection once (image) or start webcam loop
      // await runDetection();
    }
  });
  console.log("Play Button is set up!");

  // Pause button
  document
    .getElementById("pause_button")
    .addEventListener("click", function () {
      console.log("Game is Paused... haha no it is not.");
      // Only pauses video if it's playing
      if (currentMediaType === "video" && currentMediaElement) {
        currentMediaElement.pause();
        videoPlaying = false;
      }
    });
  console.log("Pause Button is set up!");

  // Load Image Button
  document.getElementById("load_image_button").addEventListener("click", () => {
    document.getElementById("image-file-input").click();
  });

  // Load Image from File - Hidden Input
  document
    .getElementById("image-file-input")
    .addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (file) {
        await loadImage(file);
        currentMediaType = "image";
        console.log("Image loaded and media type set to image");
      } else {
        console.log("No image file selected");
      }
    });
  console.log("Load Image Button is set up!");

  // Load Video Button
  document.getElementById("load_video_button").addEventListener("click", () => {
    document.getElementById("video-file-input").click();
  });

  // Load Video from File - Hidden Input
  document
    .getElementById("video-file-input")
    .addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (file) {
        await loadVideo(file);
        currentMediaType = "video";
        console.log("Video loaded and media type set to video");
      } else {
        console.log("No video file selected");
      }
    });
  console.log("Load Video Button is set up!");

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
    try {
      // For video we will process frame by frame
      await processVideoFrame();
    } catch (error) {
      console.error("Error running detection on video: ", error);
    }
  } else if (currentMediaType === "webcam") {
    console.log("Running detection on webcam...");
    try {
      // For video we will process frame by frame
      processWebcamFrame();
    } catch (error) {
      console.error("Error running detection on video: ", error);
    }
  }
};

// Main initialization function
export const initScavengerHunt = async () => {
  await initOpenCvAndModel();
};

initScavengerHunt();
