import { ControlPanel } from "../components/ControlPanel.tsx";
import { Canvas } from "../components/Canvas.tsx";
import { Items } from "../components/Items.tsx";

function Game() {
  return (
    <div className="grid grid-cols-3 grid-rows-1 h-screen overflow-y-hidden">
      {/* Sidebar Section */}
      <div className="col-span-1 grid grid-rows-3">
        {/* Control Panel */}
        <div className="row-span-1 bg-gray-300 p-4">
          <ControlPanel />
        </div>

        {/* Items Section */}
        <div className="row-span-2 bg-gray-400 p-4">
          <Items />
        </div>
      </div>

      {/* Canvas Section */}
      <div className="col-span-2 bg-gray-200">
        <Canvas />
      </div>
    </div>
  );
}
export default Game;
