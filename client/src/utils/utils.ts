// Note: Utility functions for the application
import { useGameStore } from "@/store";

/**
 * Load a given image file into the canvas.
 * @param file File object to load
 */
export const loadImageToCanvas = async (file: File): Promise<void> => {
  const reader = new FileReader();
  reader.onload = async (event: ProgressEvent<FileReader>) => {
    const imageElement = document.getElementById(
      "image-output"
    ) as HTMLImageElement;
    const canvasElement = document.getElementById(
      "canvas-main"
    ) as HTMLCanvasElement;
    if (!canvasElement || !imageElement) {
      console.log("Canvas or image element not found");
      return;
    }

    // Once the reader.onload event is triggered and file is read as a string
    imageElement.src = event.target?.result as string;
    if (!imageElement.src) {
      console.error("Image source not found.");
    }
    imageElement.onload = () => {
      // Canvas needs to match image dimensions
      canvasElement.width = imageElement.naturalWidth;
      canvasElement.height = imageElement.naturalHeight;
      console.log("Image loaded into image-output:", imageElement.src);
    };
    imageElement.onerror = () => {
      console.error("Error loading image file.");
    };
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
 * Draws bounding boxes around detected objects on the media source.
 * @param predictions Array of predictions from the model
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const drawBoundingBoxes = (predictions: any): void => {
  const canvasElement = document.getElementById(
    "canvas-main"
  ) as HTMLCanvasElement;
  const imageElement = document.getElementById(
    "image-output"
  ) as HTMLImageElement;
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  const context = canvasElement?.getContext("2d");

  if (!canvasElement || !context) return;

  const cv = window.cv;
  if (!cv) return;

  try {
    const currentMediaType = useGameStore.getState().currentMediaType;
    // Create one source element (img or video) based on the current media type
    const sourceElement =
      currentMediaType === "image" ? imageElement : videoElement;

    if (!sourceElement) return;

    // Get the actual dimensions of the source media
    const sourceWidth =
      currentMediaType === "image"
        ? imageElement.naturalWidth
        : videoElement.videoWidth;
    const sourceHeight =
      currentMediaType === "image"
        ? imageElement.naturalHeight
        : videoElement.videoHeight;

    // Set canvas to match source dimensions, not display dimensions
    canvasElement.width = sourceWidth;
    canvasElement.height = sourceHeight;
    console.log(
      "Canvas dimensions:",
      canvasElement.width,
      "x",
      canvasElement.height
    );

    // Create transparent Mat at source dimensions
    const dstMat = new cv.Mat(
      canvasElement.height,
      canvasElement.width,
      cv.CV_8UC4
    );
    dstMat.setTo(new cv.Scalar(0, 0, 0, 0));

    // Calculate scaling for Bounding Box dynamically based on source dimensions
    const minDimension = Math.min(canvasElement.height, canvasElement.width);
    const boxThickness = Math.max(2, Math.floor(minDimension * 0.003));
    const fontSize = Math.max(0.7, minDimension * 0.001);
    const labelHeight = 50;
    const textPadding = 10;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    predictions.forEach((prediction: any) => {
      const { bbox, class: className, score: confScore } = prediction;
      // Use raw coordinates from prediction - they're already in source dimensions
      const [x, y, width, height] = bbox.map((val: number) => val);
      const color = colorForLabels(className);

      // Draw bounding box and label box
      cv.rectangle(
        dstMat,
        new cv.Point(x, y),
        new cv.Point(x + width, y + height),
        color,
        boxThickness
      );

      cv.rectangle(
        dstMat,
        new cv.Point(x, y - labelHeight),
        new cv.Point(x + width, y),
        color,
        -1
      );
      // Draw label text
      const text = `${className} ${Math.round(confScore * 100)}%`;
      cv.putText(
        dstMat,
        text,
        new cv.Point(x + textPadding, y - textPadding),
        cv.FONT_HERSHEY_DUPLEX,
        fontSize,
        new cv.Scalar(255, 255, 255, 255),
        Math.max(1, Math.floor(fontSize / 2))
      );
    });

    // Draw to canvas at source dimensions
    const imageData = new ImageData(dstMat.cols, dstMat.rows);
    const data = dstMat.data;
    // Swtich BGRA to RGBA
    for (let i = 0; i < data.length; i += 4) {
      imageData.data[i] = data[i + 2];
      imageData.data[i + 1] = data[i + 1];
      imageData.data[i + 2] = data[i];
      imageData.data[i + 3] = data[i + 3];
    }
    // console.log("Drawing boxes on canvas...", imageData);
    context.putImageData(imageData, 0, 0);
    console.log("Boxes drawn on canvas.");
    // Clean up
    dstMat.delete();
  } catch (error) {
    console.error("Error drawing boxes:", error);
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

  if (!videoElement) {
    console.error("Video element not found.");
    return;
  }
  if (!canvasElement) {
    console.error("Canvas element not found.");
    return;
  }

  // If the current media type is image, we need to set up the canvas differently
  if (currentMediaType === "image") {
    const imageElement = document.getElementById(
      "image-output"
    ) as HTMLImageElement;
    if (!imageElement) {
      console.error("Image element not found.");
      return;
    }
    // IMAGE DETECTION
    const predictions = await model.detect(imageElement);
    if (!predictions || predictions.length === 0) {
      console.log("No predictions found in image.");
    } else {
      drawBoundingBoxes(predictions);
    }
  } else {
    if (!videoElement.videoWidth || !videoElement.videoHeight) {
      console.error("Video dimensions not found.");
      return;
    }
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
  }
  // Process a single frame, grabbed from the canvas displaying the media
  const detectFrame = async () => {
    try {
      // Use the cocoSsd model to detect objects in the video frame
      const predictions = await model.detect(videoElement);
      if (!predictions || predictions.length === 0) {
        console.log("No predictions found in frame.");
      } else {
        drawBoundingBoxes(predictions);
      }
      // Continue detection if video is playing/webcam is enabled
      if (
        currentMediaType !== "image" &&
        !videoElement.paused &&
        useGameStore.getState().videoPlaying
      ) {
        requestAnimationFrame(detectFrame);
      }
    } catch (error) {
      console.error(`Error running detection on ${currentMediaType}:`, error);
      stopDetection();
    }
  };
  // Start recursive detectFrame call for video or webcam
  await detectFrame();
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

  // Pause the video and update the store
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
  //   Try to clear the canvas and reset the video
  try {
    const videoElement = document.getElementById(
      "video-output"
    ) as HTMLVideoElement;
    if (!videoElement) return console.error("Video element not found.");

    const canvasElement = document.getElementById(
      "canvas-main"
    ) as HTMLCanvasElement;
    if (!canvasElement) return console.error("Canvas element not found.");

    const context = canvasElement.getContext("2d");
    if (!context) return console.error("Canvas context not found.");
    // Clear the canvas
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  } catch (error) {
    console.error("Error clearing canvas:", error);
  }

  videoElement.pause();
  videoElement.currentTime = 0;
  useGameStore.getState().setVideoPlaying(false);
  // Reset the video element
  videoElement.src = "";
};
