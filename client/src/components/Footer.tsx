import { IoMdSettings } from "react-icons/io";
import { useThemeStore } from "@/store";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";
import { useState } from "react";
import SettingsModal from "./SettingsModal";

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = useThemeStore((state) => state.theme);
  const icon = (theme: string) => {
    if (theme === "light") {
      return <IoMoon size={22} style={{ color: "black" }} />;
    } else {
      return <IoSunny size={22} style={{ color: "white" }} />;
    }
  };
  return (
    <nav className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 flex-row items-center justify-center gap-2 rounded-full border border-light11/20 bg-light1/70 px-4 py-2 text-light12 bg-blend-luminosity shadow-sm backdrop-blur-xl transition dark:border-dark11/20 dark:bg-dark1/50 dark:text-dark12">
      <button
        onClick={() => toggleTheme()}
        className="flex h-auto w-auto cursor-pointer items-center justify-center gap-4 p-1"
      >
        {icon(theme)}
      </button>

      <div
        className="flex h-auto w-auto cursor-pointer items-center justify-center gap-4 p-1"
        aria-label="Settings"
      >
        <IoMdSettings size={22} onClick={openModal} />
      </div>
      <SettingsModal isOpen={isModalOpen} onClose={closeModal} />
    </nav>
  );
};

export default Footer;
