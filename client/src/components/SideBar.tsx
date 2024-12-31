import { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import {
  FaBars,
  FaTimes,
  FaPlay,
  FaPause,
  FaVideo,
  FaRocket,
  FaHatWizard,
  FaClock,
} from "react-icons/fa";
import { IoLogoGameControllerA } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaImage } from "react-icons/fa";
import { FaHourglassStart } from "react-icons/fa";
import { RiWebcamFill } from "react-icons/ri";
import LoadImageButton from "./buttons/LoadImageButton";
import MultiPlayerModal from "./MultiplayerModal";
import PauseVideoButton from "./buttons/PauseVideoButton";
import RunDetectionButton from "./buttons/RunDetectionButton";
import PlayStopVideoButton from "./buttons/PlayStopVideoButton";
import LoadWebcamButton from "./buttons/LoadWebcamButton";
import LoadVideoButton from "./buttons/LoadVideoButton";
// import { useUserSession } from "@/store";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // const user = useUserSession((state) => state.user)
  const sidebarIcon = () => {
    if (isCollapsed) {
      return <FaBars size={22} />;
    } else {
      return <FaTimes size={22} />;
    }
  };

  return (
    <>
      <Sidebar
        collapsed={isCollapsed}
        className="bg-zinc-100  dark:bg-teal-950 h-screen absolute top-0 left-0 z-30"
      >
        {/* Hamburger Button to open the sidebar or X button to close it */}
        <div className="flex justify-center py-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 bg-transparent rounded-md focus:outline-none"
          >
            {sidebarIcon()}
          </button>
        </div>
        <Menu>
          {/* user profile picture and username */}
          <div
            className={`transition-opacity duration-300 ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            <div className="flex flex-col items-center mb-3">
              <img
                alt="user profile"
                src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                className="w-1/2 h-1/2 cursor-pointer rounded-full mb-2"
              ></img>
              <h1 className="my-2 text-center">User Username</h1>
            </div>
          </div>

          {/* Control Panel SubMenu */}
          <SubMenu
            label="Control Panel"
            icon={<IoLogoGameControllerA size={26} />}
            className="z-21"
          >
            <MenuItem icon={<FaImage />}>
              <LoadImageButton />
            </MenuItem>
            <MenuItem icon={<FaPause />}>
              <PauseVideoButton />
            </MenuItem>
            <MenuItem icon={<RiWebcamFill />}>
              <LoadWebcamButton />
            </MenuItem>
            <MenuItem icon={<FaPlay />}>
              <PlayStopVideoButton />
            </MenuItem>
            <MenuItem icon={<FaHourglassStart />}>
              <RunDetectionButton />
            </MenuItem>
            <MenuItem icon={<FaVideo />}>
              <LoadVideoButton />
            </MenuItem>
          </SubMenu>

          {/* Dashboard SubMenu */}
          <SubMenu label="Dashboard" icon={<MdDashboard size={24} />}>
            <MenuItem icon={<FaRocket />}>ItemsFound: 2/5</MenuItem>
            <MenuItem icon={<FaHatWizard />}>Items to find: Hat</MenuItem>
            <MenuItem icon={<FaClock />}>Game Timer: </MenuItem>
          </SubMenu>

          {/* Single Menu Item */}

          <MenuItem icon={<FaPeopleGroup size={24} />}>
            <MultiPlayerModal />
          </MenuItem>
        </Menu>
      </Sidebar>
    </>
  );
};

export default SideBar;
