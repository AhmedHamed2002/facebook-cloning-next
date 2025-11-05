"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { friendshipService } from "@/services/friendshipService";
import Swal from "sweetalert2";
import Link from "next/link";

export default function MyFriendsPage() {
    const [friends, setFriends] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsDarkMode(localStorage.getItem("theme") === "dark");
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
        const res = await userService.profile();
        setFriends(res.data?.myProfile?.friends || []);
        setIsLoading(false);
        } catch (err) {
        console.error(err);
        setIsLoading(false);
        handleError(err);
        }
    };

    const removeFriend = async (friendId: string) => {
        Swal.fire({
        title: "Are you sure?",
        text: "Do you want to remove this friend?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e74c3c",
        cancelButtonColor: "#7f8c8d",
        confirmButtonText: "Yes, remove",
        background: isDarkMode ? "#1b1b1b" : "#fff",
        color: isDarkMode ? "#f3f4f6" : "#111827",
        }).then(async (result) => {
        if (result.isConfirmed) {
            try {
            await friendshipService.removeFriend(friendId);
            Swal.fire("Removed!", "Friend has been removed.", "success");
            setFriends((prev) => prev.filter((f) => f._id !== friendId));
            } catch (err) {
            handleError(err);
            }
        }
        });
    };

    const handleError = (err: any) => {
        const status = err?.error?.status;
        const message =
        err?.error?.message || err?.error?.data || "Something went wrong";

        Swal.fire({
        icon: status === "error" ? "error" : "warning",
        title: status === "error" ? "Error!" : "Warning!",
        text: message,
        confirmButtonColor: status === "error" ? "#e74c3c" : "#f1c40f",
        background: isDarkMode ? "#1b1b1b" : "#fff",
        color: isDarkMode ? "#f3f4f6" : "#111827",
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">My Friends</h2>

        {/* Loading */}
        {isLoading && (
            <div className="flex justify-center items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
            <span className="text-gray-500 dark:text-gray-400">
                Loading friends...
            </span>
            </div>
        )}

        {/* Empty State */}
        {!isLoading && friends.length === 0 && (
            <div className="text-gray-500 dark:text-gray-400">
            You have no friends yet.
            </div>
        )}

        {/* Friends Grid */}
        {!isLoading && friends.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {friends.map((friend) => (
                <div
                key={friend._id}
                className="bg-white dark:bg-neutral-800 rounded-lg p-4 flex flex-col items-center shadow"
                >
                <Link href={`/user_profile/${friend._id}`}>
                    <img
                    src={friend.profileImage}
                    alt={friend.name}
                    className="cursor-pointer w-20 h-20 rounded-full mb-2 object-cover"
                    />
                </Link>
                <h3 className="font-semibold dark:text-white">{friend.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {friend.city || ""}
                </p>
                <button
                    onClick={() => removeFriend(friend._id)}
                    className="mt-3 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                    <i className="fas fa-user-times mr-1"></i> Remove
                </button>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
