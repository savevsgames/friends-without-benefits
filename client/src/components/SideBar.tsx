import { useState, useEffect } from "react";
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
  const videoPlaying = useGameStore((state) => state.videoPlaying);
  const [flash, setFlash] = useState(false);

  // trigger the flash animation when the camera turns on
  useEffect(() => {
    if (videoPlaying) {
      setFlash(true);
    } else {
      setFlash(false);
    }
  }, [videoPlaying]);

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
      className="bg-zinc-100 dark:bg-teal-950 h-screen absolute top-0 left-0 z-30 flex flex-col"
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
              className={`text-sm text-center font-bold text-gray-750 dark:text-gray-300 ${
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
            {/* Time Remaining  */}
            {/* <MenuItem
              className={`flex items-center pb-3 pt-1 ${
                isCollapsed ? "flex-col gap-1" : "flex-row gap-2"
              }`}
            >
              <FaHourglassEnd size={22} />
              <div
                className={`${
                  isCollapsed
                    ? "text-center font-bold text-sm flex flex-col pt-2"
                    : "text-base font-medium text-gray-500 dark:text-gray-300"
                }`}
              >
                {formatTime(timeRemaining)}
              </div>
            </MenuItem> */}

            {/*             refactoredddddddd */}

            {/* Time Remaining  */}
            <MenuItem className="pb-4">
              {isCollapsed ? (
                <>
                  <FaHourglassEnd size={22} className="mb-1" />

                  <div
                    className={`
                    "text-center font-bold text-sm pt-2"
                   
                `}
                  >
                    {formatTime(timeRemaining)}
                  </div>
                </>
              ) : (
                <div className="flex flex-row">
                  <FaHourglassEnd size={22} />
                  <p className="ml-5">
                    {" "}
                    Game Time: 0{formatTime(timeRemaining)}
                  </p>
                </div>
              )}
            </MenuItem>

            {/* Items Found */}

            <MenuItem className="pb-4">
              {isCollapsed ? (
                <>
                  <MdEmojiObjects size={26} className="mb-1" />

                  <div
                    className={`
                    "text-center font-bold text-sm pt-2"
                   
                `}
                  >
                    {numFoundItems} / {itemsArr.length}
                  </div>
                </>
              ) : (
                <div className="flex flex-row">
                  <MdEmojiObjects size={26} />
                  <p className="ml-5">
                    {" "}
                    Items Found: {numFoundItems} / {itemsArr.length}
                  </p>
                </div>
              )}
            </MenuItem>

            <MenuItem className="pb-2">
              {isCollapsed ? (
                <>
                  <SlMagnifier size={26} className="mb-1" />

                  <div
                    className={`
                    "text-center font-bold text-sm pt-2"
                   
                `}
                  >
                    {numFoundItems} / {itemsArr.length}
                  </div>
                </>
              ) : (
                <div className="flex flex-row">
                  <SlMagnifier size={26} />
                  <p className="ml-5">
                    {gameState === "playing"
                      ? `${itemsArr[numFoundItems]}`
                      : "?????"}
                  </p>
                </div>
              )}
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
              className={`text-sm text-center font-bold text-gray-750 dark:text-gray-300 ${
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
      <div className="font-semibold truncate absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <span
          className="font-semibold truncate"
          style={{
            fontSize: "30px",
            animation: flash ? "flash 1s linear infinite" : "none",
          }}
          data-tooltip-id="detecting"
        >
          {isDetectionActive ? "🟢" : "🔴"}
        </span>
        <Tooltip id="detecting" place="bottom" className="font-thin text-xs">
          {isDetectionActive ? "Detecting.." : "Detection Inactive"}
        </Tooltip>
      </div>
    </Sidebar>
  );
};

export default SideBar;
