"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { userService } from "@/services/userService";
import { friendshipService } from "@/services/friendshipService";

export default function UserListPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem("theme") === "dark";
        setDarkMode(isDark);

        const loadData = async () => {
        try {
            const usersRes = await userService.getAllUsers();
            setUsers(usersRes.data || []);

            const profileRes = await userService.getUserImage();
            if (profileRes?.data) setFriendRequests(profileRes.data.friendRequests || []);
        } catch (err: any) {
            showError(err);
        } finally {
            setLoading(false);
        }
        };

        loadData();
    }, []);

    const sendFriendRequest = async (userId: string) => {
        try {
        await friendshipService.sendFriendRequest(userId);
        Swal.fire("Success", "Friend request sent!", "success");
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, relation: "pending" } : u))
        );
        } catch (err: any) {
        showError(err);
        }
    };

    const acceptFriendRequest = async (fromId: string) => {
        try {
        await friendshipService.acceptFriendRequest(fromId);
        Swal.fire("Success", "Friend request accepted!", "success");
        setFriendRequests((prev) => prev.filter((r) => r._id !== fromId));
        } catch (err: any) {
        showError(err);
        }
    };

    const rejectFriendRequest = async (fromId: string) => {
        try {
        await friendshipService.rejectFriendRequest(fromId);
        Swal.fire("Info", "Friend request rejected!", "info");
        setFriendRequests((prev) => prev.filter((r) => r._id !== fromId));
        } catch (err: any) {
        showError(err);
        }
    };

    const showError = (err: any) => {
        Swal.fire({
        icon: "error",
        title: "Error!",
        text: err?.message || "Something went wrong!",
        confirmButtonColor: "#e74c3c",
        background: darkMode ? "#1b1b1b" : "#fff",
        color: darkMode ? "#f3f4f6" : "#111827",
        });
    };

    if (loading)
        return (
        <div className="min-h-screen flex flex-col items-center justify-center dark:bg-neutral-900">
            <i className="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
            <p className="mt-3 dark:text-white">Loading users...</p>
        </div>
        );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 p-6">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
            <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 dark:text-white">
                Friend Requests · <span>{friendRequests.length}</span>
            </h3>
            <div className="space-y-4">
                {friendRequests.map((req) => (
                <div
                    key={req._id}
                    className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow flex items-center justify-between"
                >
                    {/* Left */}
                    <Link
                    href={`/user_profile/${req._id}`}
                    className="flex items-center gap-3 cursor-pointer"
                    >
                    <img
                        src={req.profileImage}
                        alt={req.name}
                        className="w-12 h-12 rounded-full object-cover shadow"
                    />
                    <span className="font-medium dark:text-white">{req.name}</span>
                    </Link>

                    {/* Actions */}
                    <div className="flex gap-2">
                    <button
                        onClick={() => acceptFriendRequest(req._id)}
                        className="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={() => rejectFriendRequest(req._id)}
                        className="cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-md text-sm"
                    >
                        Delete
                    </button>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* People You May Know */}
        <h3 className="text-xl font-semibold mb-3 dark:text-white">
            People You May Know
        </h3>

        {/* Users */}
        {users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {users.map((user) => (
                <div
                key={user.id}
                className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow relative text-center"
                >
                <Link
                    href={`/user_profile/${user.id}`}
                    className="block w-20 h-20 mx-auto"
                >
                    <img
                    src={user.image}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover shadow"
                    />
                </Link>

                <h3 className="mt-3 text-lg font-semibold dark:text-white">
                    {user.name}
                </h3>
                <p className="text-sm text-gray-500">{user.role}</p>

                <div className="mt-4 flex justify-center">
                    {user.relation === "none" && (
                    <button
                        onClick={() => sendFriendRequest(user.id)}
                        className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full text-sm"
                    >
                        Add Friend
                    </button>
                    )}
                    {user.relation === "pending" && (
                    <span className="text-gray-400 text-sm italic">Pending...</span>
                    )}
                    {user.relation === "confirm" && (
                    <>
                        <button
                        onClick={() => acceptFriendRequest(user.id)}
                        className="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm"
                        >
                        Confirm
                        </button>
                        <button
                        onClick={() => rejectFriendRequest(user.id)}
                        className="cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 ms-2 text-gray-700 dark:text-gray-200 px-4 py-1 rounded-full text-sm"
                        >
                        Delete
                        </button>
                    </>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
