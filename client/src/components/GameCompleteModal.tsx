import React from 'react';
import ReactModal from "react-modal";
import { useGameStore } from '@/store';

ReactModal.setAppElement('#root');

interface GameCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameCompletionModal: React.FC<GameCompletionModalProps> = ({ isOpen, onClose }) => {
  // Get necessary state and actions from store
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const numFoundItems = useGameStore((state) => state.numFoundItems);
  const foundItemsArr = useGameStore((state) => state.foundItemsArr);
  const itemsArr = useGameStore((state) => state.itemsArr);
  const resetGame = useGameStore((state) => state.resetGame);
  const setGameState = useGameStore((state) => state.setGameState);
 
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
  
    // Reset game state
    resetGame();
    setGameState("setup");
    
    // Close modal
    onClose();
  };

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      maxWidth: '500px',
      width: '90%',
      padding: '0',
      border: 'none',
      backgroundColor: '#1e293b',
      borderRadius: '1rem',
      overflow: 'auto',
      position: 'absolute'
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      contentLabel="Game Completion Modal"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <div className="text-white p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-4 text-slate-400 hover:text-white transition-colors text-3xl font-light"
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">
            {numFoundItems >= 5 ? '🎉 Victory! 🎉' : '⏰ Time\'s Up!'}
          </h2>
          <p className="text-slate-300 text-lg">Here's how you did:</p>
        </div>

        {/* Stats */}
        <div className="bg-slate-900 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-300">Time Remaining:</span>
            <span className="text-2xl font-bold text-green-400">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Items Found:</span>
            <span className="text-2xl font-bold text-blue-400">
              {numFoundItems} / {itemsArr.length}
            </span>
          </div>
        </div>

        {/* Found Items List */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Items Found:</h3>
          <div className="grid grid-cols-2 gap-2">
            {itemsArr.map((item) => (
              <div 
                key={item}
                className={`p-2 rounded ${
                  foundItemsArr?.includes(item)
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-slate-700/50 text-slate-400'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg transition-colors font-medium"
        >
          Back
        </button>
      </div>
    </ReactModal>
  );
};

export default GameCompletionModal;