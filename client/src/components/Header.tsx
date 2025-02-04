import { Link, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useUserSession } from "@/store";
import { useAuthStore } from "@/store";

// page navigations
const navigation = [
  { name: "GameBoard", page: "/Game" },
  { name: "LeaderBoard", page: "/LeaderBoard" },
];
const profileNavigation = [
  { name: "Your Profile", page: "/Profile" },
  { name: "Sign Out", page: "/" },
];

// for combining classes conditionally
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const location = useLocation();
  console.log("current path:", location.pathname);


  const clearUser = useUserSession((state) => state.clearUser);
  const logout = useAuthStore((state) => state.logout);


  return (
    <nav className="bg-zinc-50 dark:bg-teal-950 z-0">
      <div className="mx-auto max-w-9xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              className="group relative inline-flex items-center justify-center rounded-md p-2 text-slate-100 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Open main menu"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
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
            </button>
          </div>

          {/* <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start"> */}
            {/* Navigation items
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4 tracking-widest">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.page}
                    className={classNames(
                      location.pathname === item.page
                        ? "text-neutral-950 underline underline-offset-4 dark:text-white dark:underline"
                        : "text-neutral-950 hover:underline  dark:text-white dark:hover:text-white dark:hover:underline",
                      "px-3 py-2 font-bold text-sm sm:text-base md:text-sm lg:text-base"
                    )}
                  >
                    {item.name.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </div> */}

          {/* Profile dropdown */}
          <div className="relative ml-3 flex flex-1 justify-end">
            <Menu as="div" className="relative">
              <MenuButton className="flex rounded-full bg-neutral-950 dark:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span className="sr-only">Open user menu</span>
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                  alt="Profile"
                />
              </MenuButton>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                {profileNavigation.map((item) => (
                  <MenuItem key={item.name}>
                    {({ active }) => (
                      <Link
                        to={item.page}
                        className={classNames(
                          active
                            ? "bg-gray-100 text-teal-600"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                        onClick={() => {
                          if (item.name === "Sign Out") {
                            clearUser();
                            logout();
                          }
                        }}
                      >
                        {item.name}
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
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
