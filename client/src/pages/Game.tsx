import { ControlPanel } from "../components/ControlPanel.tsx";
import Canvas from "../components/Canvas.tsx";
import { Items } from "../components/Items.tsx";

function Game() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 h-screen overflow-y-hidden bg-gradient-to-r from-gray-900 via-teal-600 to-cyan-100">
      {/* Sidebar Section */}
      <div className="col-span-1 md:col-span-1 grid grid-rows-4">
        {/* Control Panel */}
        <div className="row-span-1 bg-slate-100 p-4 border border-teal-900 rounded mx-1 my-1">
          <ControlPanel />
        </div>
        {/* Items Section */}
        <div className="row-span-4 bg-slate-200 p-4 border border-teal-900 rounded mx-1 my-1">
          <Items />
        </div>
      </div>
      {/* Canvas Section */}
      <div className="col-span-1 md:col-span-2 bg-slate-50 border border-teal-900 rounded mx-1 my-1">
        <Canvas id="canvas-main" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
export default Game;
