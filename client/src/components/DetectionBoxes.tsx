// Keeps video aspect ratio and centers the video and canvas
import React, { useEffect, useState } from "react";
import { useGameStore } from "../store";

interface Prediction {
  bbox: number[];
  class: string;
  score: number;
}

interface DetectionBoxProps {
  prediction: Prediction;
  sourceWidth: number;
  sourceHeight: number;
  scale: number;
}

const DetectionBox: React.FC<DetectionBoxProps> = ({
  prediction,
  sourceWidth,
  sourceHeight,
  scale,
}) => {
  const { bbox, class: className, score } = prediction;
  const [x, y, width, height] = bbox;

  const minDimension = Math.min(sourceHeight, sourceWidth);
  //const textPadding = Math.max(2, Math.floor(minDimension * 0.01));
  const labelHeight = Math.max(20, Math.floor(minDimension * 0.05));

  const scaledStyle = {
    left: `${x * scale}px`,
    top: `${y * scale}px`,
    width: `${width * scale}px`,
    height: `${height * scale}px`,
    position: "absolute" as const,
    pointerEvents: "none" as const,
  };

  const getProgressColorClass = (value: number): string => {
    if (value < 0.5) return "bg-red-500";
    if (value < 0.8) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div style={scaledStyle}>
      <div className="relative w-full h-full border-4 border-blue-500">
        <div
          className="absolute left-[-4px] right-[-4px] bg-blue-500 text-white font-semibold truncate text-center rounded-t-lg flex items-center justify-center"
          style={{
            top: `-${labelHeight}px`,
            height: `${labelHeight}px`,
            width: "calc(100% + 8px)",
          }}
        >
          {className} {Math.round(score * 100)}%
        </div>
        <div className="absolute -bottom-8 left-[-4px] right-[-4px] h-8 bg-gray-300 rounded-b-lg overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${getProgressColorClass(
              score
            )} transition-all duration-300`}
            style={{ width: `${score * 100}%` }}
          />
          <div className="absolute w-full h-full flex items-center justify-center text-sm font-semibold text-white z-10">
            detect-O-meter
          </div>
        </div>
      </div>
    </div>
  );
};

const DetectionOverlay: React.FC = () => {
  const { currentMediaType } = useGameStore();
  const { currentDetections } = useGameStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateDimensions = () => {
      const imageElement = document.getElementById(
        "image-output"
      ) as HTMLImageElement;
      const videoElement = document.getElementById(
        "video-output"
      ) as HTMLVideoElement;

      const containerElement = document.getElementById("canvas-container");

      const sourceWidth =
        currentMediaType === "image"
          ? imageElement?.naturalWidth
          : videoElement?.videoWidth;
      const sourceHeight =
        currentMediaType === "image"
          ? imageElement?.naturalHeight
          : videoElement?.videoHeight;

      if (sourceWidth && sourceHeight && containerElement) {
        const containerWidth = containerElement.clientWidth;
        const containerHeight = containerElement.clientHeight;

        const scale = Math.min(
          containerWidth / sourceWidth,
          containerHeight / sourceHeight
        );

        const scaledWidth = sourceWidth * scale;
        const scaledHeight = sourceHeight * scale;

        const offsetX = 0;
        const offsetY = (containerHeight - scaledHeight) / 2;

        setDimensions({
          width: sourceWidth,
          height: sourceHeight,
        });
        setScale(scale);

        const mediaElement =
          currentMediaType === "image" ? imageElement : videoElement;
        if (mediaElement) {
          mediaElement.style.width = `${scaledWidth}px`;
          mediaElement.style.height = `${scaledHeight}px`;
          mediaElement.style.objectFit = "contain";
          mediaElement.style.position = "absolute";
          mediaElement.style.left = `${offsetX}px`;
          mediaElement.style.top = `${offsetY}px`;
        }

        const overlayContainer = document.querySelector(
          "[data-overlay-container]"
        );
        if (overlayContainer instanceof HTMLElement) {
          overlayContainer.style.width = `${scaledWidth}px`;
          overlayContainer.style.height = `${scaledHeight}px`;
          overlayContainer.style.left = `${offsetX}px`;
          overlayContainer.style.top = `${offsetY}px`;
        }
      }
    };

    updateDimensions();

    const containerElement = document.getElementById("canvas-container");
    if (containerElement) {
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerElement);
    }

    const element =
      currentMediaType === "image"
        ? document.getElementById("image-output")
        : document.getElementById("video-output");

    element?.addEventListener("loadedmetadata", updateDimensions);
    if (currentMediaType === "image") {
      element?.addEventListener("load", updateDimensions);
    }

    return () => {
      const containerElement = document.getElementById("canvas-container");
      if (containerElement) {
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.disconnect();
      }
      element?.removeEventListener("loadedmetadata", updateDimensions);
      if (currentMediaType === "image") {
        element?.removeEventListener("load", updateDimensions);
      }
    };
  }, [currentMediaType]);

  if (!dimensions.width || !dimensions.height) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{ zIndex: 15 }}
      data-overlay-container
    >
      {currentDetections.map((prediction, index) => (
        <DetectionBox
          key={index}
          prediction={prediction}
          sourceWidth={dimensions.width}
          sourceHeight={dimensions.height}
          scale={scale}
        />
      ))}
    </div>
  );
};

export default DetectionOverlay;
