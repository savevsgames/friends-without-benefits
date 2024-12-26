import { Link, useLocation } from "react-router-dom";
import { useThemeStore } from "@/store";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";
import { useEffect } from "react";


// page navigations
const navigation = [
  { name: "GameBoard", page: "/Game" },
  { name: "LeaderBoard", page: "/LeaderBoard" },
];
const profileNavigation = [
  { name: "Your Profile", page: "/Profile" },
  { name: "Sign Out", page: "/" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const location = useLocation();
  console.log("current path:", location.pathname);

  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = useThemeStore((state) => state.theme);

  console.log('theme from header', theme);


  const icon = (theme: string) => {
    if (theme === "light") {
      return <IoSunny style={{ color: "teal" }} />;
    } else {
      return <IoMoon style={{ color: "red" }} />;
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-teal-600 to-cyan-100 dark:bg-gradient-to-r dark:from-gray-800 dark:via-teal-800 dark:to-gray-600 border-b-2">
      <div className="mx-auto max-w-9xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Open main menu"
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <svg
                aria-hidden="true"
                className="block size-6 group-data-[open]:hidden"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                aria-hidden="true"
                className="hidden size-6 group-data-[open]:block"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Logo and navigation items */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            {/* Navigation items */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4 tracking-widest">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.page}
                    className={classNames(
                      location.pathname === item.page
                        ? "bg-teal-900 text-white dark:bg-teal-700 dark:text-white"
                        : "text-gray-300 hover:outline-offset-0 hover:text-white dark:text-gray-300 dark:hover:text-white",
                      "rounded-md px-3 py-2 text-xl font-bold"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => toggleTheme()}
            className="font-bold tracking-widest px-7 flex flex-row items-center"
          >
            {icon(theme)}
          </button>

          {/* Profile dropdown */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="relative ml-3">
              <button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span className="sr-only">Open user menu</span>
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://bit.ly/broken-link"
                  alt="Profile"
                />
              </button>
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                {profileNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.page}
                    className={`block px-4 py-2 text-sm ${
                      location.pathname === item.page
                        ? "bg-gray-100 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.page}
              className={classNames(
                location.pathname === item.page
                  ? "bg-teal-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
