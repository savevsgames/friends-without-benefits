import { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { FaBars, FaTimes, FaHome, FaHourglassEnd } from "react-icons/fa";
import { IoLogoGameControllerA } from "react-icons/io";
import { MdLeaderboard, MdEmojiObjects } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";

import { SlMagnifier } from "react-icons/sl";

// import RunDetectionButton from "./buttons/RunDetectionButton";
import MultiPlayerModal from "./MultiplayerModal";
import { useIsDetectionActive } from "@/hooks/useIsDetectionActive";
import { useGameStore, useUserSession } from "@/store";
import { NavLink } from "react-router-dom";
import { Tooltip } from "react-tooltip";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const user = useUserSession((state) => state.user?.data);
  const upperUsername = user?.username.toUpperCase();
  const singlePlayer = useGameStore((state) => state.isSingle);
  const multiPlayer = useGameStore((state) => state.isMulti);
  const numFoundItems = useGameStore((state) => state.numFoundItems);
  const itemsArr = useGameStore((state) => state.itemsArr);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const gameState = useGameStore((state) => state.gameState);

  const sidebarIcon = () => {
    return isCollapsed ? <FaBars size={22} /> : <FaTimes size={22} />;
  };

  const isDetectionActive = useIsDetectionActive();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Local Setter for showing the Multiplayer Modal
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);

  // Modal Handler for multiplayer modal
  // const handleOpenMPModal = () => {
  //   setShowMultiplayerModal(true);
  // };

  const handleCloseMPModal = () => {
    setShowMultiplayerModal(false);
  };

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
        {/* Game Control SubMenu */}
        {singlePlayer && (
          <SubMenu
            label="Game Control"
            icon={<IoLogoGameControllerA size={26} />}
          >
            <MenuItem className="z-60">
              <div>
                Detection: {isDetectionActive ? "Active 🟢" : "Inactive 🔴"}
              </div>
            </MenuItem>
            {/* <MenuItem icon={<FaHourglassStart />}>
              <RunDetectionButton />
            </MenuItem> */}
          </SubMenu>
        )}

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
          <Menu
            className={`flex items-center pb-3 pt-1 ${
              isCollapsed ? "flex-col gap-1" : "flex-row gap-2"
            }`}
          >
            {/* Time Remaining */}
            <MenuItem
              className={`flex items-center pb-3 pt-1 ${
                isCollapsed ? "flex-col gap-1" : "flex-row gap-2"
              }`}
            >
              <FaHourglassEnd size={22} />
              <span
                className={`${
                  isCollapsed
                    ? "text-center text-sm flex flex-col"
                    : "text-base font-medium text-gray-500 dark:text-gray-300 flex flex-row"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </MenuItem>

            {/* Items Found */}
            <MenuItem
              className={`flex items-center w-full pb-3 pt-1  ${
                isCollapsed
                  ? "flex-col gap-1 justify-center"
                  : "flex-row gap-2 justify-start"
              }`}
            >
              <MdEmojiObjects size={24} />
              <span
                className={`${
                  isCollapsed
                    ? "text-center text-sm font-normal"
                    : "text-left text-base font-medium text-gray-500 dark:text-gray-300"
                }`}
              >
                {isCollapsed
                  ? `${numFoundItems} / ${itemsArr.length}`
                  : `Items Found: ${numFoundItems} / ${itemsArr.length}`}
              </span>
            </MenuItem>
            <MenuItem>
              <SlMagnifier size={22} />
              <span
                className={`${
                  isCollapsed
                    ? "text-center text-sm"
                    : "text-base text-center font-medium text-gray-500 dark:text-gray-300"
                }`}
              >
                {gameState === "playing" ? `${itemsArr[numFoundItems]}` : "?"}
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
            <MultiPlayerModal
              isOpen={showMultiplayerModal}
              onClose={handleCloseMPModal}
            />
          </MenuItem>
        )}
      </Menu>
    </Sidebar>
  );
};

export default SideBar;
