// Note: Utility functions for the application
import { useGameStore } from "@/store";

/**
 * Load a given image file into the canvas.
 * @param file File object to load
 */
export const loadImageToCanvas = async (file: File): Promise<void> => {
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    const imageElement = document.createElement("img");
    const canvasElement = document.getElementById(
      "canvas-main"
    ) as HTMLCanvasElement;
    if (!canvasElement) {
      console.log("Canvas element not found");
      return;
    }

    // Once the reader.onload event is triggered and file is read as a string
    imageElement.src = event.target?.result as string;
    imageElement.onload = () => {
      // Canvas needs to match image dimensions
      canvasElement.width = imageElement.naturalWidth;
      canvasElement.height = imageElement.naturalHeight;

      // Read the image and show it on the canvas then delete it to clean up memory
      const imgMat = window.cv.imread(imageElement);
      console.log("Image Mat: ", imgMat);
      window.cv.imshow("canvas-main", imgMat);
      imgMat.delete();
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

export const loadVideoFrameToCapturedImageElementAtInterval = async (
  intervalTime: number = 100
): Promise<void> => {
  const videoElement = document.getElementById(
    "video-output"
  ) as HTMLVideoElement;
  if (!videoElement) {
    console.log("Video element not found");
    return;
  }

  const capturedImageElement = document.getElementById(
    "captured-image"
  ) as HTMLImageElement;
  if (!capturedImageElement) {
    console.log("Hidden Captured-Image element not found");
    return;
  }

  const canvasElement = document.getElementById(
    "canvas-main"
  ) as HTMLCanvasElement;
  if (!canvasElement) {
    console.log("Canvas element not found");
    return;
  }

  // Wait for video to be ready -> readyState of 1 or less means metadata is still loading
  if (videoElement.readyState < 2) {
    await new Promise<void>((resolve) => {
      videoElement.oncanplay = () => resolve();
    });
  }

  // Set canvas dimensions to match video dimensions
  capturedImageElement.width = videoElement.videoWidth;
  capturedImageElement.height = videoElement.videoHeight;
  console.log(
    `Canvas has been resized to: ${capturedImageElement.width}x${capturedImageElement.height}`
  );

  /**
   * Draw frames from the video to the canvas at a "throttled" interval.
   */
  const loadSingleFrame = async () => {
    // Draw a single frame from the video to the canvas if the video is not paused or ended
    if (videoElement.paused || videoElement.ended) {
      console.log("Video is paused or ended. Cannot draw frame.");
      return;
    }
    // Draw the video frame to the "capture-image" element
    const image = videoElement.toImage();

      if (window.cv) {
        const videoMat = window.cv.imread("captured-image");
        // TODO: Comment this log out in production
        // Log the video mat properties for debugging only
        console.log("VideoMat Properties:", {
          rows: videoMat.rows,
          cols: videoMat.cols,
          type: videoMat.type(),
          channels: videoMat.channels(),
          empty: videoMat.empty(),
          size: videoMat.size(),
        });

        if (videoMat.empty() || videoMat.rows === 0 || videoMat.cols === 0) {
          console.error("VideoMat is empty or invalid. Cannot draw frame.");
          videoMat.delete();
          return;
        }

        console.log("VideoMat dimensions:", videoMat.rows, "x", videoMat.cols);
        console.log("VideoMat data sample:", videoMat.data.slice(0, 10));
        //   Check to make sure mat is not empty
        if (videoMat.rows > 0 && videoMat.cols > 0) {
          console.log("Video frame ready for detection...");
        }
      } else {
        console.error("OpenCV not loaded. Cannot draw video frame.");
      }
    } catch (error) {
      console.error("Error drawing video frame:", error);
    }
  };

  loadSingleFrame();
  //   If the video is playing, draw the next frame
  if (!videoElement.paused && !videoElement.ended) {
    setInterval(loadSingleFrame, intervalTime);
  }
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
      "canvas-main"
    ) as HTMLVideoElement;
    if (!videoElement) {
      console.error("Video element not found.");
      return null;
    }
    // Get the webcam stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    // Set the video element source to the stream
    videoElement.srcObject = stream;
    // Play the video
    videoElement.play();

    console.log("Webcam enabled:", videoElement.srcObject);

    if (shareMyStream) {
      console.log("Sharing webcam stream for multiplayer game...");
      //TODO: Add streaming logic here for peer.js
    }

    return stream;
  } catch (error) {
    console.error("Error enabling webcam:", error);
  }
  return null;
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
  const canvas = document.getElementById("canvas-main") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas element not found.");
    return;
  }
  const context = canvas.getContext("2d");
  if (!context) {
    console.error("Canvas context not found.");
    return;
  }
  const cv = window.cv;
  if (!cv) {
    console.log("OpenCV is not loaded. Cannot draw bounding boxes.");
    return;
  }

  // Create a transparent Mat for drawing
  const transparentCanvasMat = new cv.Mat(
    canvas.height,
    canvas.width,
    cv.CV_8UC4
  );
  transparentCanvasMat.setTo(new cv.Scalar(0, 0, 0, 0));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  predictions.forEach((prediction: any) => {
    const { bbox, class: className, score: confScore } = prediction;
    const [x, y, width, height] = bbox.map((val: number) => Math.round(val)); // Ensure all values are integers

    const color = colorForLabels(className);
    // Draw bounding box
    const point1 = new cv.Point(x, y);
    const point2 = new cv.Point(x + width, y + height);

    // Draw the bounding box
    cv.rectangle(transparentCanvasMat, point1, point2, color, 8);
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
      transparentCanvasMat,
      new cv.Point(x, y - labelHeight),
      new cv.Point(x + width, y),
      color,
      filled
    );

    // Draw the text over the background rectangle
    cv.putText(
      transparentCanvasMat,
      text,
      new cv.Point(x + textPadding, y - textPadding), // Adjust text placement
      fontFace,
      fontSize,
      new cv.Scalar(255, 255, 255, 255), // White text
      thickness
    );
  });
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

  const capturedImageElement = document.getElementById(
    "captured-image"
  ) as HTMLImageElement;
  if (!capturedImageElement) {
    console.error("Canvas element not found.");
    return;
  }

  // Process a single frame, grabbed from the canvas displaying the media
  try {
    const mediaMat = cv.imread("captured-image");
    console.log(`${currentMediaType} Mat: `, mediaMat);

    const predictions = await model.detect(mediaMat);
    if (!predictions) {
      console.log("No predictions found.");
      mediaMat.delete();
      return;
    }
    drawBoundingBoxes(predictions);

    // clean the memory by deleting the Mat with the copy of the media data
    mediaMat.delete();

    // TODO:
    // Add GAME logic to process the predictions
    //

    if (
      (currentMediaType === "video" || currentMediaType === "webcam") &&
      // Check state of video playing
      useGameStore.getState().videoPlaying
    ) {
      // Run detection on the currently displayed frame
      runDetectionOnCurrentMedia();
    } else {
      console.log(
        `Detection complete. ${currentMediaType} has been processed.`
      );
    }
  } catch (error) {
    console.error(`Error running detection on ${currentMediaType}:`, error);
  }
};
