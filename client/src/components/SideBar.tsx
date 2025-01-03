import { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { FaBars, FaTimes, FaHourglassStart } from "react-icons/fa";

import { IoLogoGameControllerA } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { RiWebcamFill } from "react-icons/ri";
import LoadWebcamButton from "./buttons/LoadWebcamButton";
import RunDetectionButton from "./buttons/RunDetectionButton";
import MultiPlayerModal from "./MultiplayerModal";
import { useIsDetectionActive } from "@/hooks/useIsDetectionActive";
import { useGameStore, useUserSession } from "@/store";
import { NavLink } from "react-router-dom";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const user = useUserSession((state) => state.user?.data);
  const upperUsername = user?.username.toUpperCase();
  const singlePlayer = useGameStore((state) => state.isSingle);

  const sidebarIcon = () => {
    return isCollapsed ? <FaBars size={22} /> : <FaTimes size={22} />;
  };

  const isDetectionActive = useIsDetectionActive();

  return (
    <Sidebar
      collapsed={isCollapsed}
      className="bg-zinc-100 dark:bg-teal-950 h-screen absolute top-0 left-0 z-30"
    >
      {/* Hamburger Button */}
      <div className="flex justify-center py-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 bg-transparent rounded-md focus:outline-none"
          aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {sidebarIcon()}
        </button>
      </div>
      <Menu>
        {/* User Info */}
        <div
          className={`flex flex-col items-center mb-3 ${
            isCollapsed ? "hidden" : "block"
          }`}
        >
          <img
            alt="user profile"
            src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
            className="w-1/2 h-1/2 cursor-pointer rounded-full mb-2"
          />
          <h1 className="my-2 text-center font-semibold">
            HELLO {upperUsername}!
          </h1>
        </div>

        {/* Game Control SubMenu */}
        {singlePlayer && (
          <SubMenu
            label="Game Control"
            icon={<IoLogoGameControllerA size={26} />}
          >
            <MenuItem icon={<RiWebcamFill />}>
              <LoadWebcamButton />
            </MenuItem>
            <MenuItem icon={<FaHourglassStart />}>
              <RunDetectionButton />
            </MenuItem>
            <MenuItem>
              <div>
                Detection: {isDetectionActive ? "Active 🟢" : "Inactive 🔴"}
              </div>
            </MenuItem>
          </SubMenu>
        )}

        {/* Navigation Links */}
        <MenuItem icon={<MdDashboard size={24} />}>
          <NavLink
            to="/gameboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md ${
                isActive
                  ? "bg-teal-700 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`
            }
          >
            Gameboard
          </NavLink>
        </MenuItem>

        <MenuItem icon={<FaPeopleGroup size={24} />}>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md ${
                isActive
                  ? "bg-teal-700 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`
            }
          >
            Leaderboard
          </NavLink>
        </MenuItem>

        {/* Multiplayer Manager */}
        <MenuItem icon={<FaPeopleGroup size={24} />}>
          <MultiPlayerModal />
        </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default SideBar;
