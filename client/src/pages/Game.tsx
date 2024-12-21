import { ControlPanel } from "../components/ControlPanel.tsx";
import Canvas from "../components/Canvas.tsx";
import { Dashboard } from "../components/Dashboard.tsx";

import LoadImageButton from "../components/buttons/LoadImageButton.tsx";
import RunDetectionButton from "@/components/buttons/RunDetectionButton.tsx";

function Game() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 h-screen overflow-auto bg-gradient-to-r from-gray-900 via-teal-600 to-cyan-100">
      <div className="col-span-1 md:col-span-1 grid grid-rows-4 gap-1 p-1">
        {/* Control Panel */}
        <div className="row-span-1 bg-slate-100 p-4 border border-teal-900 rounded">
          <LoadImageButton />
          <RunDetectionButton />
          <ControlPanel />
        </div>
        {/* Dashboard Section */}
        <div className="row-span-3 bg-slate-200 p-4 border border-teal-900 rounded">
          <Dashboard />
        </div>
      </div>
      {/* Canvas Section */}
      <div className="col-span-1 md:col-span-2 m-1 bg-slate-50 border border-teal-900 rounded">
        <Canvas />
      </div>
    </div>
  );
}
export default Game;
