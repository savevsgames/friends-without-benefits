import { Link, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useUserSession } from "@/store";
import { useAuthStore } from "@/store";

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
    <nav className="bg-zinc-50 dark:bg-teal-950 z-0 border-b-2">
      <div className="mx-auto px-2 sm:px-6 lg:px-8 relative">
        <div className="relative flex h-16 items-center justify-end">
          <div className="absolute inset-0 flex flex-col items-center justify-center tracking-wide font-bold text-center">
            <h1>WELCOME TO THE LAND OF GAMES</h1>
            <p className=" flex font-thin text-xs">Start By Choosing a Game</p>
          </div>

          {/* Profile dropdown */}
          <div className="relative ml-3">
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
    </nav>
  );
}
