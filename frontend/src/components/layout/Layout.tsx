import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import clsx from "clsx";
import {
  Bell,
  Menu,
  X,
  LayoutGrid,
  MessageSquare,
  Users,
  FileText,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Campaigns", href: "/campaigns", icon: MessageSquare },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      {/* Static sidebar for desktop */}
      <div
        className={clsx(
          "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col",
          "transition-transform transform",
          { "translate-x-0": sidebarOpen, "-translate-x-full": !sidebarOpen }
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center text-white">
            <h1 className="text-2xl font-bold">SMS Platform</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          clsx(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                            {
                              "bg-gray-700 text-white": isActive,
                              "text-gray-300 hover:text-white hover:bg-gray-700":
                                !isActive,
                            }
                          )
                        }
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center text-white">
                    <h1 className="text-2xl font-bold">SMS Platform</h1>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <NavLink
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                  clsx(
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                                    {
                                      "bg-gray-700 text-white": isActive,
                                      "text-gray-300 hover:text-white hover:bg-gray-700":
                                        !isActive,
                                    }
                                  )
                                }
                              >
                                <item.icon
                                  className="h-6 w-6 shrink-0"
                                  aria-hidden="true"
                                />
                                {item.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:bg-gray-800 dark:border-gray-700">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center p-1.5">
                  <UserCircle className="h-8 w-8 text-gray-500" />
                  <span className="hidden lg:flex lg:items-center ml-2">
                    <span
                      className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
                      aria-hidden="true"
                    >
                      {user?.full_name}
                    </span>
                  </span>
                </button>
              </div>
              <button
                onClick={logout}
                className="flex items-center p-1.5 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-6 w-6" />
                <span className="sr-only">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
