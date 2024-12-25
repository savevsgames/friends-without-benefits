// import * as tf from "@tensorflow/tfjs-node";
// import sharp from "sharp";

// Import ml5 from the window object - index.html includes the ml5 library
// const ml5 = window.ml5;

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
 *    (cropToBoundingBox) and then normalizing (normalizeImage) the image for training, or optimizing for re-training.
 * 11) Export the re-trained model in a format that can be used in the game.
 * 12) Update the game with the new model and save the model to our model database. Each user will have their
 *     own model in the database to add items to the game. Long term, all this data can be used to train a
 *     very large model that can be used for all users, but this will take a lot of time and resources. For now,
 *     the goal would be to have a model for each user that can be used to add items to the game, each user would
 *     have access to a certain amount of database storage, and the user would be informed when they need to remove
 *     a class before adding a new one.
 * 13) Pass the new model in on loading the game page.
 */

// export const classifyStream = async () => {
//   try {
//     const videoElement = document.getElementById(
//       "video-output"
//     ) as HTMLVideoElement;
//     if (!videoElement) {
//       console.log("No video element found.");
//       return;
//     }
//     const stream = videoElement.src;
//     console.log(stream);
//   } catch (error) {
//     console.log("Error classifying webcam stream data.", error);
//   }
// };

// export const verifyPredictions = async (objectPredictions) => {
//   // Use ml5 to verify prediction data - outputs confidence scores for predictions on user created image data
// };

// export const sortPredictions = async (predictions) => {
//   // Sort prediction images - high vs low confidence score images
// };

// export const savePredictionToDatabase = async (trainingSet) => {
//   // Save predictions to large database for training community model
//   // Long term goal function.
// };

// export const logResultsAndClearUnusedData = async (highConfSet, lowConfSet) => {
//   // Log the results from the high conf and low conf arrays as summaries, and
//   // slice 10 entries to view output data manually at cut-off point and at highest
//   // confidence score point.
// };

// export const cropToBoundingBox = async (singleImageToCrop) => {
//   // takes the classified image with bounding box data and crops it to normalize
// };

// export const normalizeImage = async (finalImageSet) => {
//   // Takes the cropped image and normalizes it for training/re-training
// };

// export const reTrainModel = async (model, trainingData, config) => {
//   // Separates a square of the training data size for validation
//   // Train the model using the config to send options for epochs, etc. needed for training accurately
// };

// export const loadNewModelAndUpdateStore = async (model) => {
//   // Loads new model and updates zustand
// };
