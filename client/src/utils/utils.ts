// Note: Utility functions for the application
import { useGameStore } from "@/store";

/**
 * Load a given image file into the canvas.
 * @param file File object to load
 */
export const loadImageToVideoElementAsPoster = async (
  file: File
): Promise<void> => {
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    const videoElement = document.getElementById(
      "video-output"
    ) as HTMLVideoElement;

    if (!videoElement) {
      console.log("Canvas or source element not found");
      return;
    }

    // Store the image data in the video element as a poster
    videoElement.style.display = "block";
    // Poster is a static image displayed when the video is paused
    // Allows us to place the image file into the video element
    videoElement.poster = event.target?.result as string;
    videoElement.pause();
  };
  // call the reader to read file
  console.log("File: ", file);
  reader.readAsDataURL(file);
};

/**
 * Load a given video file into the canvas.
 * @param file File object to load
 */
export const loadVideoToVideoOutput = async (file: File): Promise<void> => {
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  if (!videoElement) {
    console.log("Hidden video element not found.");
    return;
  }

  // Create a blob URL for the video file - plain src will fail detection
  const url = URL.createObjectURL(file);
  console.log("Video URL: ", url);

  videoElement.src = url;
  videoElement.autoplay = true;
  videoElement.loop = true;
  videoElement.muted = true;

  // Wait for metadata to load
  await new Promise<void>((resolve) => {
    videoElement.onloadedmetadata = () => {
      console.log(
        `Video dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`
      );
      resolve();
    };
  });
  // Play the video and wait for it to load
  try {
    await videoElement.play();
    console.log("Video loaded and playing.");
  } catch (error) {
    console.error("Error playing video:", error);
  }

  videoElement.onerror = (error) => {
    console.error("Error loading video file:", error);
  };
};

/**
 * Enable the webcam
 * @param shareMyStream Flag to share the webcam stream for multiplayer games
 * @returns MediaStream object
 */
export const enableWebcam = async (
  shareMyStream = false
): Promise<MediaStream | null> => {
  try {
    const videoElement = document.getElementById(
      "video-output"
    ) as HTMLVideoElement;
    if (!videoElement) {
      console.error("Video element not found.");
      return null;
    }
    // Stop any existing streams
    if (videoElement.srcObject) {
      const existingStream = videoElement.srcObject as MediaStream;
      existingStream.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
    }

    //
    // Get the webcam stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    // Set the video element source to the stream
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.muted = true; // UPDATE FOR MULTIPLAYER
    videoElement.playsInline = true;

    console.log("Webcam enabled:", videoElement.srcObject);

    if (shareMyStream) {
      console.log("Sharing webcam stream for multiplayer game...");
      //TODO: Add streaming logic here for peer.js
    }

    await new Promise<void>((resolve) => {
      videoElement.onloadedmetadata = () => {
        console.log(
          `Webcam dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`
        );
        resolve();
      };
    });
    // Play the video
    await videoElement.play();

    return stream;
  } catch (error) {
    console.error("Error enabling webcam:", error);
  }
  return null;
};

/**
 * Disable the webcam
 */
export const disableWebcam = (): void => {
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  if (!videoElement || !videoElement.srcObject) return;

  // Stop all tracks (video and audio) in the stream
  const stream = videoElement.srcObject as MediaStream;
  stream.getTracks().forEach((track) => track.stop());
  videoElement.srcObject = null;
};

/**
 * Toggle the webcam on or off
 * @param isEnabled Flag to enable or disable the webcam
 * @returns Flag indicating if the webcam is enabled
 */
export const toggleWebcam = async (isEnabled: boolean): Promise<boolean> => {
  if (isEnabled) {
    const stream = await enableWebcam();
    return stream !== null;
  } else {
    disableWebcam();
    return false;
  }
};

/**
 * Maps class names to specific colors for bounding boxes.
 * @param className Class name of the detected object
 * @returns RGBA color array
 */
export const colorForLabels = (className: string) => {
  const blue = [255, 0, 0, 255];
  const green = [0, 255, 0, 255];
  const red = [0, 0, 255, 255];
  const colors: { [key: string]: number[] } = {
    // Can add more colors to match the classes we want to detect
    person: blue,
    bottle: green,
    default: red,
  };
  //
  return colors[className] || colors.default;
};

/**
 * Draws bounding boxes around detected objects on the input image.
 * @param predictions Array of predictions from the model
 * @param inputImage Input image to draw bounding boxes on
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const drawBoundingBoxes = (predictions: any) => {
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  const canvasElement = document.getElementById(
    "canvas-main"
  ) as HTMLCanvasElement;
  if (!canvasElement || !videoElement) {
    console.error("Canvas or source video element not found.");
    return;
  }
  const context = canvasElement.getContext("2d");
  if (!context) {
    console.error("Canvas context not found.");
    return;
  }
  const cv = window.cv;
  if (!cv) {
    console.log("OpenCV is not loaded. Cannot draw bounding boxes.");
    return;
  }
  try {
    // Clear the canvas first
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // Create source and destination Mats to store the image data
    const srcMat = new cv.Mat(
      canvasElement.height,
      canvasElement.width,
      cv.CV_8UC4
    );
    const dstMat = new cv.Mat(
      canvasElement.height,
      canvasElement.width,
      cv.CV_8UC4
    );
    // Set initial transparency in destination Mat to 0
    dstMat.setTo(new cv.Scalar(0, 0, 0, 0));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    predictions.forEach((prediction: any) => {
      const { bbox, class: className, score: confScore } = prediction;
      const [x, y, width, height] = bbox.map((val: number) => Math.round(val)); // Ensure all values are integers

      const color = colorForLabels(className);
      // Draw bounding box
      const point1 = new cv.Point(x, y);
      const point2 = new cv.Point(x + width, y + height);

      // Draw the bounding box into the destination Mat
      cv.rectangle(dstMat, point1, point2, color, 8);
      // Draw the label background and text
      const text = `${className} ${Math.round(confScore * 100)}%`;
      const fontFace = cv.FONT_HERSHEY_SIMPLEX;
      const fontSize = 1; // Proportional size in rem
      const thickness = 1;
      const filled = -1; // Filled rectangle

      // Get text size for background rectangle through context - not used for now
      // context.font = "20px Arial"; // Use to measure text width and height
      // const textMetrics = context.measureText(text);
      // const textWidth = textMetrics.width;
      const labelHeight = 50; // These are hardcoded for now
      const textPadding = 5;

      // Draw background rectangle for the label
      cv.rectangle(
        dstMat,
        new cv.Point(x, y - labelHeight),
        new cv.Point(x + width, y),
        color,
        filled
      );

      // Draw the text over the background rectangle
      cv.putText(
        dstMat,
        text,
        new cv.Point(x + textPadding, y - textPadding), // Adjust text placement
        fontFace,
        fontSize,
        new cv.Scalar(255, 255, 255, 255), // White text
        thickness
      );

      // Convert destination matrix to image data and draw it on the canvas
      const imageData = new ImageData(
        new Uint8ClampedArray(dstMat.data),
        dstMat.cols,
        dstMat.rows
      );
      context.putImageData(imageData, 0, 0);

      // Clean up
      srcMat.delete();
      dstMat.delete();
    });
  } catch (error) {
    console.error("Error drawing bounding boxes:", error);
  }
};

/**
 * Run detection on the current media in the canvas.
 * Uses the store to access the current media type and video playing status.
 */
export const runDetectionOnCurrentMedia = async (): Promise<void> => {
  // Access the store for the current media type by name
  const { currentMediaType } = useGameStore.getState();

  if (!currentMediaType) {
    console.log(
      "Invalid media type or no media type selected. Cannot run detection."
    );
    return;
  }

  const cv = window.cv;
  const model = window.cocoSsd;
  if (!cv || !model) {
    console.log("OpenCV or model not loaded. Cannot run detection.");
    return;
  }

  const canvasElement = document.getElementById(
    "canvas-main"
  ) as HTMLCanvasElement;
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  if (!canvasElement || !videoElement) {
    console.error("Canvas element not found.");
    return;
  }

  // Set up canvas dimensions
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  console.log("Video Element : ", videoElement);

  // Process a single frame, grabbed from the canvas displaying the media
  try {
    const detectFrame = async () => {
      // Use the cocoSsd model to detect objects in the video frame
      const predictions = await model.detect(videoElement);
      if (!predictions || predictions.length === 0) {
        console.log("No predictions found.");
        return;
      }

      const context = canvasElement.getContext("2d");
      if (!context) {
        console.error("Canvas context not found. Cannot draw bounding boxes.");
        return;
      }

      // Clear the canvas before drawing new bounding boxes
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);
      //   context.globalAlpha = 0.7; // Set transparency to 70%

      drawBoundingBoxes(predictions);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //   predictions.forEach((prediction: any) => {
      //     const [x, y, width, height] = prediction.bbox;
      //     const label = `${prediction.class} ${Math.round(
      //       prediction.score * 100
      //     )}%`;
      //     // Get the class color
      //     const color = colorForLabels(prediction.class);
      //     context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
      //     context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
      //     context.lineWidth = 2;
      //     // Draw the label background using the label text width
      //     context.strokeRect(x, y, width, height);
      //     context.fillRect(x, y - 24, context.measureText(label).width + 10, 24);
      //     // Write the label text
      //     context.fillStyle = "#000000";
      //     context.fillText(label, x + 5, y - 8);
      //   });
      //   context.globalAlpha = 1.0; // Reset transparency

      // Continue detection if video is playing
      if (!videoElement.paused && useGameStore.getState().videoPlaying) {
        requestAnimationFrame(detectFrame);
      }
    };
    // Start recursive detection
    detectFrame();
  } catch (error) {
    console.error(`Error running detection on ${currentMediaType}:`, error);
  }
};

/**
 * Stop detection and clear canvas
 */
export const stopDetection = (): void => {
  const canvasElement = document.getElementById(
    "canvas-main"
  ) as HTMLCanvasElement;
  if (!canvasElement) return;

  const ctx = canvasElement.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
};

/**
 * Play the currently loaded media and update the store
 */
export const playMedia = async (): Promise<void> => {
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  if (!videoElement || !videoElement.src) return;

  try {
    await videoElement.play();
    useGameStore.getState().setVideoPlaying(true);
  } catch (error) {
    console.error("Error playing media:", error);
  }
};

/**
 * Pause the currently playing media and update the store
 */
export const pauseMedia = (): void => {
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  if (!videoElement) return;

  videoElement.pause();
  useGameStore.getState().setVideoPlaying(false);
};

/**
 * Stop and reset the currently media playing time to 0 and update the store
 */
export const stopMedia = (): void => {
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  if (!videoElement) return;

  videoElement.pause();
  videoElement.currentTime = 0;
  useGameStore.getState().setVideoPlaying(false);
};
