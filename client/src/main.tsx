// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router-dom";

import Landing from "./pages/Landing.tsx";
import Error from "./pages/Error.tsx";
import Game from "./pages/Game.tsx";
// import Game from "./pages/Game.tsx";
import LeaderBoard from "./pages/LeaderBoard";
import Profile from "./pages/Profile.tsx";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";

import App from "./App.tsx";
// Using useContext and hook to provide the model to the Game component
import { ModelProvider } from "./components/ModelProvider.tsx";


createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <BrowserRouter>
    <ModelProvider>
      <Routes>
        <Route path="/" element={<App />}>
          {/* nested routes within the app are: */}
          <Route index element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </ModelProvider>
  </BrowserRouter>
  // </StrictMode>
);
