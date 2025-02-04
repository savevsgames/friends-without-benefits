// import { useEffect } from "react";
// import Header from "@/components/Header.tsx";
// import { ControlPanel } from "../components/ControlPanel.tsx";
// import Canvas from "../components/Canvas.tsx";
// import { Dashboard } from "../components/Dashboard.tsx";

// import { useGameStore } from "@/store";
// import MultiPlayerModal from "@/components/MultiplayerModal.tsx";
// // import MultiplayerConnectionManager from "@/components/MultiplayerConnectionManager.tsx";
// import { loadModel } from "@/utils/ml5-model-utils.ts";

// // import LoadImageButton from "../components/buttons/LoadImageButton.tsx";
// // import RunDetectionButton from "@/components/buttons/RunDetectionButton.tsx";
// // import LoadVideoButton from "../components/buttons/LoadVideoButton.tsx";
// // import LoadWebcamButton from "@/components/buttons/LoadWebcamButton.tsx";
// // import PlayStopVideoButton from "@/components/buttons/PlayStopVideoButton.tsx";
// // import PauseVideoButton from "@/components/buttons/PauseVideoButton.tsx";

// function Game() {
//   // when canvasReady is changed in the store, setCanvasReady is called and the model is loaded
//   const setCanvasReady = useGameStore((state) => state.setCanvasReady);

//   const loadMl5Model = async () => {
//     console.log("Loading ml5 model...");
//     try {
//       await loadModel();
//     } catch (error) {
//       console.error("Error loading ml5 model:", error);
//     }
//   };

//   useEffect(() => {
//     // if ml5 is already there, just load the model
//     if (window.ml5) {
//       loadMl5Model();
//       return;
//     }

//     // otherwise, poll every 100ms
//     const interval = setInterval(() => {
//       if (window.ml5) {
//         clearInterval(interval);
//         loadMl5Model();
//       }
//     }, 100);

//     return () => clearInterval(interval);
//   }, [setCanvasReady]);

//   // useEffect(() => {
//   // const initializeModel = async () => {
//   //   console.log("Loading TensorFlow.js COCO-SSD Model...");
//   //   try {
//   //     const cocoSsd = await window.cocoSsd?.load();
//   //     if (cocoSsd) {
//   //       window.cocoSsd = cocoSsd;
//   //       console.log("COCO-SSD Model successfully loaded!");
//   //     } else {
//   //       console.error("COCO-SSD Model failed to load.");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error loading TensorFlow model:", error);
//   //   }
//   // };
//   // initializeModel();
//   // }, [setCanvasReady]);

//   return (
//     <>
//       <Header />
//       <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 h-screen overflow-auto bg-gradient-to-r from-teal-800 via-teal-500 to-teal-300 dark:bg-gradient-to-r dark:from-black dark:via-neutral-950 dark:to-teal-950">
//         {/* Control Panel and Dashboard */}
//         <div className="col-span-1 md:col-span-1 grid grid-rows-4 gap-2 p-2">
//           {/* Control Panel */}
//           <div className="row-span-1 bg-teal-50 dark:bg-teal-950 border border-teal-700 dark:border-teal-700 shadow-sm rounded-lg">
//             <ControlPanel />
//           </div>
//           <div>
//             <MultiPlayerModal />
//           </div>
//           {/* Dashboard */}
//           <div className="row-span-3 bg-teal-50 dark:bg-teal-950 border border-teal-700 dark:border-teal-700 shadow-sm rounded-lg h-full overflow-auto">
//             <Dashboard />
//           </div>
//         </div>

//         {/* Canvas Section */}
//         <div className="h-full grid grid-cols-1 md:col-span-2 m-2 bg-teal-50 dark:bg-teal-950 border border-teal-800 dark:border-teal-800 shadow-md rounded-lg">
//           <Canvas />
//         </div>
//       </div>
//     </>
//   );
// }

// export default Game;
