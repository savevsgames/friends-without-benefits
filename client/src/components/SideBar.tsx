import { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { FaBars, FaTimes, FaHourglassStart, FaHome } from "react-icons/fa";
import { IoLogoGameControllerA } from "react-icons/io";
import { MdLeaderboard, MdEmojiObjects } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { RiWebcamFill } from "react-icons/ri";
import { RxTimer } from "react-icons/rx";
import LoadWebcamButton from "./buttons/LoadWebcamButton";
import RunDetectionButton from "./buttons/RunDetectionButton";
import MultiPlayerModal from "./MultiplayerModal";
import { useIsDetectionActive } from "@/hooks/useIsDetectionActive";
import { useGameStore, useUserSession } from "@/store";
import { NavLink } from "react-router-dom";
import { Tooltip as ReactTooltip, Tooltip } from "react-tooltip";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const user = useUserSession((state) => state.user?.data);
  const upperUsername = user?.username.toUpperCase();
  const singlePlayer = useGameStore((state) => state.isSingle);
  const multiPlayer = useGameStore((state) => state.isMulti);
  const gameState = useGameStore((state) => state.gameState);
  const foundItems = useGameStore((state) => state.foundItems);
  const time = "time";
  const itemsToFind = 5;

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
        {!isCollapsed && (
          <div className="flex flex-col items-center mb-3">
            <img
              alt="user profile"
              src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
              className="w-1/2 h-1/2 cursor-pointer rounded-full mb-2"
            />
            <h1 className="my-2 text-center font-semibold">
              HELLO {upperUsername}!
            </h1>
          </div>
        )}

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

        {/* back to home */}
        <MenuItem
          icon={
            <FaHome
              size={24}
              data-tooltip-id="hometooltip"
              onClick={() => (window.location.href = "/home")}
              className="cursor-pointer"
            />
          }
        >
          <NavLink
            to="/home"
            className="flex items-center px-4 py-2 rounded-md"
          >
            Home
          </NavLink>
          <Tooltip
            id="hometooltip"
            place="bottom"
            className="font-thin text-xs"
          >
            to Home Page
          </Tooltip>
        </MenuItem>

        {/* stats section */}
        <div className="my-2">
          <div
            className={`flex items-center underline ${
              isCollapsed ? "justify-center" : "justify-center"
            } mb-2`}
          >
            <span
              className={`text-sm text-center font-semibold text-gray-750 dark:text-gray-300 ${
                isCollapsed ? "inline" : "block"
              }`}
            >
              Stats
            </span>
          </div>
          <Menu>
            <MenuItem icon={<RxTimer size={26} />}>
              <span>{!isCollapsed && `Time: ${time}s`}</span>
            </MenuItem>

            <MenuItem icon={<MdEmojiObjects size={26} />}>
              <span>
                {!isCollapsed &&
                  `Found: ${foundItems}, To Find: ${itemsToFind - foundItems}`}
              </span>
            </MenuItem>
          </Menu>
        </div>

        {/* pages section */}
        <div className="my-2">
          <div
            className={`flex items-center underline ${
              isCollapsed ? "justify-center" : "justify-center"
            } mb-2`}
          >
            <span
              className={`text-sm text-center font-semibold text-gray-750 dark:text-gray-300 ${
                isCollapsed ? "inline" : "block"
              }`}
            >
              Pages
            </span>
          </div>
          <Menu>
            <MenuItem icon={<IoLogoGameControllerA size={26} color="teal" />}>
              <NavLink
                to="/game"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md ${
                    isActive
                      ? "bg-teal-100 text-neutral-950 font-semibold"
                      : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                Gameboard
              </NavLink>
            </MenuItem>

            <MenuItem icon={<MdLeaderboard size={24} />}>
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
          </Menu>
        </div>

        {/* Multiplayer Manager */}
        {multiPlayer && (
          <MenuItem icon={<FaPeopleGroup size={24} />}>
            <MultiPlayerModal />
          </MenuItem>
        )}
      </Menu>
    </Sidebar>
  );
};

export default SideBar;
