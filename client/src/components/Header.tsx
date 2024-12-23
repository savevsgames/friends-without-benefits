import { Link, useLocation } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import { Avatar } from "./ui/avatar";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

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

  // header begins
  return (
    <Disclosure
      as="nav"
      className="bg-gradient-to-r from-gray-900 via-teal-600 to-cyan-100 border-b-2"
    >
      <div className="mx-auto max-w-9xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* {responsiveness} */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block size-6 group-data-[open]:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden size-6 group-data-[open]:block"
              />
            </DisclosureButton>
          </div>

          {/* {Logo and navigation items} */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            {/* {Logo} */}
            <div className="flex shrink-0 items-center text-gray-900">
              {/* chakra text component */}
              <Text
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="widest"
                color="cyan.100"
                textShadow="0 0 8px rgba(0, 255, 255, 0.7), 0 0 12px rgba(0, 255, 255, 0.5), 0 0 16px rgba(0, 255, 255, 0.3)"
              >
                REPUBLIC OF FWOB
              </Text>
            </div>

            {/* {Navigation items} */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4 tracking-widest">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.page}
                    className={classNames(
                      location.pathname === item.page
                        ? "bg-teal-900 text-white" // this is to highlight active
                        : "text-gray-300 hover:outline-offset-0 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* {Profile} */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <HStack>
                    <Avatar
                      name="Souad Hassen"
                      src="https://bit.ly/broken-link"
                      colorPalette="teal"
                    ></Avatar>
                  </HStack>
                </MenuButton>
              </div>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                {profileNavigation.map((item) => (
                  <MenuItem key={item.name}>
                    <Link
                      to={item.page}
                      className={`block px-4 py-2 text-sm ${
                        location.pathname === item.page
                          ? "bg-gray-100 text-blue-600" // Highlight active page
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
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
      </DisclosurePanel>
    </Disclosure>
  );
}
import { HStack } from "@chakra-ui/react";
