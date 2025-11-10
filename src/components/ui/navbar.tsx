"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Sheet,SheetContent,SheetDescription,SheetHeader,SheetTitle,SheetTrigger,} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, User, Settings, Menu } from "lucide-react";
import Swal from "sweetalert2";
import { userService } from "@/services/userService";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load user and theme
  useEffect(() => {
    const token = localStorage.getItem("facebook_token");
    setLoggedIn(!!token);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }

    if (token) {
      userService.getUserImage().then((res) => {
        if (res?.data) {
          setAvatar(res.data.profileImage);
          setUsername(res.data.name);
          setFriendRequestsCount(res.data.friendRequests.length);
        }
      }); 
    }
  }, []);

  // Search live users
  useEffect(() => {
    if (!loggedIn || searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(() => {
      userService.search(searchQuery).then((res) => {
        setSearchResults(res?.data || []);
      });
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery, loggedIn]);

  // Theme toggle
  const toggleDark = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Logout
  const handleLogout = async () => {
    const isDark = darkMode;
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout!",
      background: isDark ? "#1b1b1b" : "#fff",
      color: isDark ? "#f3f4f6" : "#111827",
    });

    if (confirm.isConfirmed) {
      const res = await userService.logout();
      localStorage.removeItem("facebook_token");
      setLoggedIn(false);
      setAvatar("");
      router.push("/login");

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: res?.message || "Logged out successfully",
        showConfirmButton: false,
        timer: 2000,
        background: isDark ? "#1b1b1b" : "#fff",
        color: isDark ? "#f3f4f6" : "#111827",
      });
    }
  };

  // Helper to check active route
  const isActive = (path: string) =>
    pathname === path
      ? "text-blue-600 dark:text-blue-400 pb-1"
      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400";

  return (
    <nav className="fixed w-full z-50 top-0 border-b bg-white/95 dark:bg-neutral-900 backdrop-blur-md shadow-sm transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link href="/home" className="flex items-center space-x-2">
          <i className="fa-brands fa-facebook text-blue-600 text-2xl"></i>
          <span className="font-bold text-xl text-blue-600 hidden sm:block">
            facebook
          </span>
        </Link>

        {/* Search */}
        <div className="relative w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-12 bg-white dark:bg-neutral-800 shadow-md rounded-lg w-full z-50 max-h-60 overflow-y-auto">
              {searchResults.map((user: any) => (
                <Link
                  key={user.id}
                  href={`/user_profile/${user.id}`}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700"
                  onClick={() => setSearchResults([])}
                >
                  <div className="relative mr-3">
                    <img
                      src={user.image}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {user.logged && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-neutral-800 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium dark:text-white flex items-center gap-1">
                      {user.name}
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-700 dark:bg-yellow-400/70 dark:text-yellow-900"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.address} | {user.city}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Links for large/medium screens */}
        <ul className="hidden md:flex items-center space-x-6 font-medium">
          <li>
            <Link href="/home" className={`flex items-center gap-1 ${isActive("/home")}`}>
              <i className="fas fa-home"></i>
              <span className="md:hidden lg:block">Home</span>
            </Link>
          </li>
          <li>
            <Link
              href="/friends-post"
              className={`flex items-center gap-1 ${isActive("/friends-post")}`}
            >
              <i className="fas fa-user-friends"></i>
              <span className="md:hidden lg:block">Friends</span>
            </Link>
          </li>
          <li>
            <Link
              href="/user-list"
              className={`relative flex items-center gap-2 ${isActive("/user-list")}`}
            >
              <i className="fas fa-user-plus text-lg relative">
                {friendRequestsCount > 0 && (
                  <span className="absolute -top-3 -left-2 bg-red-600/80 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
                    {friendRequestsCount}
                  </span>
                )}
              </i>

              {/* النص */}
              <span className="md:hidden lg:block">Add Friends</span>
            </Link>

          </li>
        </ul>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            className="rounded-full cursor-pointer"
          >
            {darkMode ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-blue-600" />
            )}
          </Button>

          {loggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{username}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm">{username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 dark:bg-neutral-800">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className={`cursor-pointer ${isActive("/profile")}`}>
                    <User className="mr-2 w-4 h-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/edit-profile" className={`cursor-pointer ${isActive("/edit-profile")}`}>
                    <Settings className="mr-2 w-4 h-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="mr-2 w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* ✅ Sheet for small screens */}
          <div className="md:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col gap-8 px-6 pt-14">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navigate through site pages</SheetDescription>
                </SheetHeader>

                <ul className="flex flex-col ms-4 space-y-4 mt-6 text-gray-700 dark:text-gray-200">
                  <li>
                    <Link
                      href="/home"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 ${isActive("/home")}`}
                    >
                      <i className="fas fa-home"></i> Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/friends-post"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 ${isActive("/friends-post")}`}
                    >
                      <i className="fas fa-user-friends"></i> Friends
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/user-list"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 ${isActive("/user-list")}`}
                    >
                      <i className="fas fa-user-plus"></i> Add Friends
                      {friendRequestsCount > 0 && (
                        <span className="bg-red-600/80 text-white text-xs font-semibold rounded-full px-2 py-0.5">{friendRequestsCount}</span>
                      )}
                    </Link>
                  </li>
                </ul>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
