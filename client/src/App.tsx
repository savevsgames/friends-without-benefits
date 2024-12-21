import { Outlet, Route, Routes } from "react-router-dom";

import Header from "./components/Header.tsx";
// import Footer from "./components/Footer.tsx";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import Error from "./pages/Error.tsx";
import Game from "./pages/Game.tsx";
import LeaderBoard from "./pages/LeaderBoard";
import Profile from "./pages/Profile.tsx";
import Login from "./pages/Login.tsx";

function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<LeaderBoard />} />
        <Route path="/game" element={<Game />} />
        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  );
}

export default App;
