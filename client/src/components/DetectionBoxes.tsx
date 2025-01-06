import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';

interface Prediction {
    bbox: number[];
    class: string;
    score: number;
}

interface DetectionBoxProps {
    prediction: Prediction;
    sourceWidth: number;
    sourceHeight: number;
}

const DetectionBox: React.FC<DetectionBoxProps> = ({ 
    prediction,
    sourceWidth,
    sourceHeight
}) => {
    const { bbox, class: className, score } = prediction;
    const [x, y, width, height] = bbox;

    const minDimension = Math.min(sourceHeight, sourceWidth);
    const textPadding = Math.max(2, Math.floor(minDimension * 0.01)); 
    const labelHeight = Math.max(20, Math.floor(minDimension * 0.05)); 
  
    const containerElement = document.getElementById('canvas-container');
    const containerWidth = containerElement?.clientWidth || 0;
    const containerHeight = containerElement?.clientHeight || 0;
    const scale = Math.min(
        containerWidth / sourceWidth,
        containerHeight / sourceHeight
    );

    const scaledStyle = {
        left: `${x * scale}px`,
        top: `${y * scale}px`,
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        position: 'absolute' as const,
        pointerEvents: 'none' as const,
    };

    const getProgressColorClass = (value: number): string => {
        if (value < 0.5) return 'bg-red-500';
        if (value < 0.8) return 'bg-orange-500';
        return 'bg-green-500';
    };

    return (
        <div style={scaledStyle}>
            <div className="relative w-full h-full border-4 border-blue-500">
                <div 
                    className="absolute left-0 right-0 bg-blue-500 text-white font-semibold truncate"
                    style={{ 
                        top: `-${labelHeight}px`,
                        height: `${labelHeight}px`,
                        padding: `${textPadding}px`,
                    width: '100%'
                    }}
                >
                    {className} {Math.round(score * 100)}%
                </div>
                <div className="absolute -bottom-3 left-0 right-0 h-3 bg-gray-300">
                    <div 
                        className={`h-full ${getProgressColorClass(score)} transition-all duration-300`}
                        style={{ width: `${score * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

const DetectionOverlay: React.FC = () => {
    const { currentDetections, currentMediaType } = useGameStore();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            const imageElement = document.getElementById('image-output') as HTMLImageElement;
            const videoElement = document.getElementById('video-output') as HTMLVideoElement;
      
            const sourceWidth = currentMediaType === 'image'
                ? imageElement?.naturalWidth
                : videoElement?.videoWidth;
            const sourceHeight = currentMediaType === 'image'
                ? imageElement?.naturalHeight
                : videoElement?.videoHeight;

            if (sourceWidth && sourceHeight) {
                setDimensions({
                    width: sourceWidth,
                    height: sourceHeight
                });
            }
        };

    updateDimensions();

    const element = currentMediaType === 'image' 
        ? document.getElementById('image-output')
        : document.getElementById('video-output');

    element?.addEventListener('loadedmetadata', updateDimensions);
    if (currentMediaType === 'image') {
        element?.addEventListener('load', updateDimensions);
    }

    return () => {
        element?.removeEventListener('loadedmetadata', updateDimensions);
        if (currentMediaType === 'image') {
            element?.removeEventListener('load', updateDimensions);
        }
        };
    }, [currentMediaType]);

    if (!dimensions.width || !dimensions.height) return null;

    return (
        <div 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 15 }}
        >
            {currentDetections.map((prediction, index) => (
        <DetectionBox
            key={index}
            prediction={prediction}
            sourceWidth={dimensions.width}
            sourceHeight={dimensions.height}
        />
        ))}
        </div>
    );
};

export default DetectionOverlay;