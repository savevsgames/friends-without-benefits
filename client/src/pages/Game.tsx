import { ControlPanel } from "../components/ControlPanel.tsx";
import { Canvas } from "../components/Canvas.tsx";
import { Items } from "../components/Items.tsx";

function Game() {
  return (
    <div className="grid grid-cols-3 grid-rows-1 h-screen overflow-y-hidden">
      {/* Sidebar Section */}
      <div className="col-span-1 grid grid-rows-5">
        {/* Control Panel */}
        <div className="row-span-1 bg-gray-900 p-4">
          <ControlPanel />
        </div>

        {/* Items Section */}
        <div className="row-span-4 bg-gray-900 p-4">
          <Items />
        </div>
      </div>

      {/* Canvas Section */}
      <div className="col-span-2 bg-gray-900 border-white">
        <Canvas />
      </div>
    </div>
  );
}
export default Game;
