import * as tf from "@tensorflow/tfjs-node";
import * as ml5 from "ml5";
import sharp from "sharp";

/**   Image Processing Pipeline
 * 1) Enable Webcam Stream: Feed from the webcam (enableWebcam) is cast to video-output element.
 * 2) Capture Frame & Classify (classifyStream): Take frames from the webcam/video-output feed and
 *    classify them using ml5.imageClassifier.
 * 3) Verify Predictions (verifyPrediction): Separate high-confidence and low-confidence predictions.
 * 4) Sort Predictions (sortPredictions): Rank predictions by confidence score.
 * 5) Store Data (savePredictionToDatabase): Save high-confidence images and metadata to a database. This function
 *    will be a long term goal for the project, as it will require an investment in database infrastructure.
 * 6) Log Low-Confidence Data: Have a glimpse at the data at the cut-off point for high-confidence scores before
 *    letting them be cleared by garbage collection. This is for debugging and monitoring purposes.
 * 7) Clear Low-Confidence Data: Clear low-confidence data from memory to prevent memory leaks.
 * 9) Pass high-confidence predictions to the re-training pipeline. This will start with cropping the image
 *    (cropToBoundingBox) and then normalizing the image for training, or optimizing for re-training.
 * 11) Export the re-trained model in a format that can be used in the game.
 * 12) Update the game with the new model and save the model to our model database. Each user will have their
 *     own model in the database to add items to the game. Long term, all this data can be used to train a
 *     very large model that can be used for all users, but this will take a lot of time and resources. For now,
 *     the goal would be to have a model for each user that can be used to add items to the game, each user would
 *     have access to a certain amount of database storage, and the user would be informed when they need to remove
 *     a class before adding a new one.
 * 13) Pass the new model in on loading the game page.
 */

/**
 * Classify a single frame from the webcam stream.
 * @param videoElement HTMLVideoElement - The video stream element.
 * @returns Predictions from the classifier.
 */
export const classifyStream = async (
    videoElement: HTMLVideoElement
  ): Promise<Array<{ label: string; confidence: number }>> => {
    try {
      if (!videoElement || videoElement.readyState < 2) {
        throw new Error('Video is not ready or not loaded properly.');
      }
  
      const model = await ml5.imageClassifier('MobileNet');
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
  
      if (!ctx) throw new Error('Failed to create canvas context.');
  
      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
      // Convert canvas to TensorFlow image tensor
      const imageBuffer = canvas.toDataURL('image/jpeg');
      const imageTensor = tf.node.decodeImage(
        Buffer.from(imageBuffer.split(',')[1], 'base64')
      );
  
      // Run classification
      const predictions = await model.classify(imageTensor);
      console.log('Predictions:', predictions);
  
      return predictions;
    } catch (error) {
      console.error('Error during classification:', error);
      return [];
    }
  };


/**
 * Take the user's image (from image series/video or webcam footage) and crop it to the bounding box
 * of the prediction with some padding around it. The output will be used to retrain the model.
 * @param inputBuffer - Image buffer - needed to crop the image
 * @param boundingBox - Bounding box coordinates [x, y, width, height]
 * @param padding - Additional pixels to include around the bounding box
 * @returns Cropped image buffer
 */
export const cropToBoundingBox = async (
  inputBuffer: Buffer,
  boundingBox: [x: number, y: number, width: number, height: number],
  paddingX: number = 20,
  paddingY: number = 20
): Promise<Buffer> => {
  const [x, y, width, height] = boundingBox;

  /** This will crop a square region around the bounding box with some padding for error tolerance
  The crop region should not exceed the image dimensions so Math.min &  Math.max make sure it 
  does not crop the region according to the prediction if the box would go out of bounds. 
  Padding defaults to 20, but can be adjusted to include more or less of the surrounding area.
  */
  const cropRegion = {
    left: Math.max(x - paddingX, 0),
    top: Math.max(y - paddingY, 0),
    width: Math.min(width + paddingX * 2, width),
    height: Math.min(height + paddingY * 2, height),
  };

  // Perform the crop
  return await sharp(inputBuffer)
    .extract(cropRegion) // Crop to the region
    .resize(224, 224) // Standard size for ML models
    .normalize() // Adjust lighting levels
    .toFormat("jpeg") // Ensure consistent format
    .toBuffer();
};

export const getPredictions = async (
  imageBuffer: Buffer
): Promise<ml5.ObjectDetection.Prediction[]> => {
  const objectDetector = ml5.objectDetector("cocossd");

  const image = tf.node.decodeImage(imageBuffer, 3);
  const predictions = await objectDetector.detect(image);

  return predictions;
};
