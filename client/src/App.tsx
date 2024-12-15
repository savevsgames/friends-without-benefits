import { Outlet, Route, Routes } from 'react-router-dom';


// import NavBar from './components/NavBar.tsx';
// import Footer from './components/Footer.tsx';
import "./index.css"
import Landing from './pages/Landing.tsx';
import Error from './pages/Error.tsx';
import Game from './pages/Game.tsx';
import LeaderBoard from './pages/LeaderBoard';
import Profile from './pages/Profile.tsx';


function Layout () {
  return (
    <div>
   
      <Outlet />

    </div>
)}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="/game" element={<Game />} />
        <Route path="/leaderboard" element={<LeaderBoard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  );
}

export default App;