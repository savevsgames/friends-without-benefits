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

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

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
        className="bg-zinc-100 h-screen absolute top-0 left-0 z-10"
      >
        {/* Hamburger Button to open the sidebar */}
        <div className="flex justify-center py-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 bg-transparent rounded-md focus:outline-none"
          >
            {sidebarIcon()}
          </button>
        </div>
        <Menu>
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
