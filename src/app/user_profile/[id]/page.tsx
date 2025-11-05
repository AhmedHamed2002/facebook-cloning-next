"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { userService } from "@/services/userService";
import { postsService } from "@/services/postsService";
import { friendshipService } from "@/services/friendshipService";
import { reactionService } from "@/services/reactionService";

export default function ViewUserProfile() {
    const router = useRouter();
    const { id } = useParams();
    const [user, setUser] = useState<any>(null);
    const [myProfile, setMyProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsDarkMode(localStorage.getItem("theme") === "dark");
        fetchProfileAndUser();
    }, [id]);

    async function fetchProfileAndUser() {
        try {
            const profileRes = await userService.profile();
            const myData = profileRes.data.myProfile;
            setMyProfile(myData);

            const res = await userService.getSingleUser(id as string);
            if (res.data === "this is your profile") {
            router.push("/profile");
            return;
            }

            setUser(res.data);

            // ✅ حمل البوستات بعد ما myProfile يكون متاح
            await fetchUserPosts(id as string, myData);
        } catch (err) {
            setIsLoading(false);
        }
    }

    async function fetchUserPosts(userId: string, myData: any) {
        try {
            const res = await postsService.getUserPosts(userId);

            const postsWithReactions = await Promise.all(
            res.data.map(async (post: any) => {
                const reactionRes = await reactionService.getReactions(post._id);

                // ✅ تحقق من الريأكشن الخاص بالمستخدم الحالي
                const myReaction = reactionRes.data.find(
                (r: any) => r?.userId?._id === myData?._id
                );

                post.userReaction = myReaction
                ? { type: myReaction.type, userId: myData._id }
                : { type: null, userId: myData._id };

                post.likes = reactionRes.data.map((r: any) => ({
                type: r.type,
                userId: r.userId._id,
                name: r.userId.name,
                profileImage: r.userId.profileImage,
                }));

                return post;
            })
            );

            setPosts(postsWithReactions);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    }


    // ✅ Delete Post
    async function deletePost(postId: string) {
        const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        background: isDarkMode ? "#1b1b1b" : "#fff",
        color: isDarkMode ? "#f3f4f6" : "#111827",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
        const res = await postsService.deletePost(postId);
        if (res.status === "success") {
            Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: res.data,
            showConfirmButton: false,
            timer: 2000,
            background: isDarkMode ? "#1b1b1b" : "#fff",
            color: isDarkMode ? "#f3f4f6" : "#111827",
            });
            setPosts((prev) => prev.filter((p) => p._id !== postId));
        }
        }
    }

    // ✅ Manage Friends
    async function sendFriendRequest(userId: string) {
        await friendshipService.sendFriendRequest(userId);
        Swal.fire("Success", "Friend request sent!", "success");
        setUser((u: any) => ({ ...u, isFriend: "pending" }));
    }

    async function acceptFriendRequest(userId: string) {
        await friendshipService.acceptFriendRequest(userId);
        Swal.fire("Success", "Friend request accepted!", "success");
        setUser((u: any) => ({ ...u, isFriend: true }));
    }

    async function removeFriend(userId: string) {
        await friendshipService.removeFriend(userId);
        Swal.fire("Removed", "Friend removed!", "info");
        setUser((u: any) => ({ ...u, isFriend: "none" }));
    }

    const toggleReaction = async (post: any, type: string) => {
        try {
            const userId = myProfile?._id; // استخدم myProfile بدل user
            const userName = myProfile?.name;
            const userImage = myProfile?.profileImage;

            // ✅ لو ضغط نفس الريأكشن مرتين -> نحذف الريأكشن
            if (post.userReaction?.type === type) {
            await reactionService.removeReaction(post._id);
            post.userReaction = { type: null, userId };
            post.likes = post.likes.filter((r: any) => r.userId !== userId);
            setPosts([...posts]);
            return;
            }

            // ✅ لو ضغط ريأكشن جديد -> نحدثه
            await reactionService.addReaction(post._id, type);
            post.userReaction = { type, userId };

            const existing = post.likes.find((r: any) => r.userId === userId);
            if (existing) {
            existing.type = type;
            } else {
            post.likes.push({
                type,
                userId,
                name: userName,
                profileImage: userImage,
            });
            }

            setPosts([...posts]);
        } catch (err) {
            console.error("Reaction error:", err);
            Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Failed to update reaction.",
            background: isDarkMode ? "#1b1b1b" : "#fff",
            color: isDarkMode ? "#f3f4f6" : "#111827",
            });
        }
    };


    const chooseReaction = async (post: any, type: string) => {
        await toggleReaction(post, type);
        post.showReactions = false;
        setPosts((prevPosts) =>
            prevPosts.map((p) => (p._id === post._id ? { ...post } : p))
        );
    } ;


    function getReactionIcon(type: string): string {
        switch (type) {
        case "like":
            return "fa-solid fa-thumbs-up text-blue-500";
        case "love":
            return "fa-solid fa-heart text-red-500";
        case "haha":
            return "fa-solid fa-face-laugh-squint text-yellow-500";
        case "wow":
            return "fa-solid fa-face-surprise text-yellow-400";
        case "sad":
            return "fa-solid fa-face-sad-tear text-blue-400";
        case "angry":
            return "fa-solid fa-face-angry text-red-600";
        default:
            return "fa-regular fa-thumbs-up text-gray-400";
        }
    }

    if (isLoading)
        return (
        <div className="flex justify-center items-center min-h-screen gap-2">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
            <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
        );

    if (!user) return null;


    const goTo = (path: string) => router.push(path);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 py-6 px-8 md:px-20">
        {/* Cover */}
        <div className="relative bg-gray-300 dark:bg-neutral-700 h-56 rounded-xl">
        <img
            src={user.backgroundImage || "/default-cover.jpg"}
            alt="Cover"
            className="w-full h-full object-cover rounded-xl"
        />
        <div className="absolute -bottom-14 left-6 z-40">
            <img
            src={user.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-white dark:border-neutral-800 shadow-lg object-cover"
            />
        </div>
        </div>

        {/* User Info */}
        <div className="mt-20 px-6 flex items-center justify-between flex-wrap">
            <div>
            <h2 className="text-3xl font-bold dark:text-white flex items-center gap-2">
                {user.name}
                {user.role === "admin" && (
                <span className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full text-base font-semibold flex items-center gap-1">
                    <i className="fa-solid fa-circle-check"></i> Admin
                </span>
                )}
            </h2>

            <p className="text-base text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                <i className="fa-solid fa-briefcase text-gray-500"></i>
                {user.bio || "No bio available"}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <i className="fa-solid fa-location-dot text-red-500 mr-1"></i>
                {user?.city} • {user?.address}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
                {user?.email && (
                <p>
                    <i className="fas fa-envelope mr-1 text-blue-400"></i>
                    {user.email}
                </p>
                )}
                {user?.phone && (
                <p>
                    <i className="fas fa-phone mr-1 text-green-500"></i>
                    {user.phone}
                </p>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
                <p>
                <i className="fas fa-birthday-cake mr-1 text-pink-500"></i>
                {user.birthday?.slice(0, 10)}
                </p>
                <p>
                <i className="fas fa-user mr-1 text-yellow-500"></i> Age:{" "}
                {user.age}
                </p>
                <p>
                <i className="fas fa-venus-mars mr-1 text-blue-400"></i>{" "}
                {user.gender}
                </p>
            </div>
            </div>

            {/* Friend Actions */}
            <div className="mt-4 md:mt-0">
            {user.isFriend === true && (
                <button
                onClick={() => removeFriend(user.id)}
                className="px-4 py-2 cursor-pointer rounded-xl bg-red-600 text-white hover:bg-red-700"
                >
                <i className="fas fa-user-times mr-1"></i> Remove Friend
                </button>
            )}

            {user.isFriend === "confirm" && (
                <button
                onClick={() => acceptFriendRequest(user.id)}
                className="px-4 py-2 cursor-pointer rounded-xl bg-green-500 text-white hover:bg-green-600"
                >
                <i className="fas fa-user-check mr-1"></i> Confirm Request
                </button>
            )}

            {user.isFriend === "pending" && (
                <button className="px-4 py-2 rounded-xl bg-gray-400 text-white cursor-not-allowed">
                <i className="fas fa-hourglass-half mr-1"></i> Request Sent
                </button>
            )}

            {(!user.isFriend || user.isFriend === "none") && (
                <button
                onClick={() => sendFriendRequest(user.id)}
                className="px-4 py-2 cursor-pointer rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                >
                <i className="fas fa-user-plus mr-1"></i> Add Friend
                </button>
            )}
            </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-neutral-700" />

        {/* Posts */}
            <div className="space-y-4">
                {posts.map((post, index) => (
                <div
                    key={post._id || index}
                    className="bg-white dark:bg-neutral-800 cursor-pointer rounded-xl shadow p-4 relative"
                >
                    <div className="flex items-center mb-3 gap-2">
                    <img
                        src={user.profileImage}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex items-center">
                        <div className="me-5">
                            <h4 className="font-semibold dark:text-white">
                            {user.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleString()}
                            </p>
                        </div>

                        {post.visibility === "public" && (
                        <p className="text-xs text-blue-600 dark:text-white bg-blue-300/80 p-1 rounded-sm">
                            {post.visibility}
                        </p>
                        )}

                        {post.visibility === "friends" && (
                        <p className="text-xs text-green-600 dark:text-white bg-green-300/80 p-1 rounded-sm">
                            {post.visibility}
                        </p>
                        )}

                        {post.visibility === "private" && (
                        <p className="text-xs text-yellow-600 dark:text-white bg-yellow-300/80 p-1 rounded-sm">
                            {post.visibility}
                        </p>
                        )}
                    </div>
                    {/* Post Menu */}
                    <div className="relative ms-auto">
                    <i
                        className="fa-solid fa-ellipsis-h text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() => {
                        post.showMenu = !post.showMenu;
                        setPosts([...posts]);
                        }}
                    ></i>
                    {post.showMenu && (
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-neutral-700 rounded-lg shadow-lg py-2 text-sm z-50">
                        <button
                            onClick={() => deletePost(post._id)}
                            className="block cursor-pointer w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-600"
                        >
                            <i className="fa-solid fa-trash mr-2"></i> Delete
                        </button>
                        </div>
                    )}
                    </div>
                </div>

                    <p dir="auto" className="dark:text-gray-200 mb-6">{post.content}</p>
                    {post.images && (
                    <img
                        src={post.images[0]}
                        className="w-full max-h-96 rounded-lg object-cover mb-2"
                    />
                    )}

                    {/* Reactions Summary */}
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-3">
                    <span className="flex items-center gap-1 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition"
                        onClick={() => goTo(`/view-reactions/${post._id}`)}
                    >
                        {(Array.from(new Set(post.likes.map((r: any) => r.type))) as string[]).map((uniqueType: string, i: number) => (
                            <i key={i} className={`${getReactionIcon(uniqueType)} text-lg`}></i>
                        ))}

                        <span className="ms-1 text-sm">
                            {post.likes.length} {post.likes.length === 1 ? "Reaction" : "Reactions"}
                        </span>
                    </span>

                    <span className="flex items-center gap-1 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition"
                        onClick={() => goTo(`/view-comments/${post._id}`)}
                    >
                        <i className="fa-solid fa-comment"></i>
                        {post.comments?.length || 0} Comments
                    </span>
                    </div>

                    {/* Reaction Buttons */}
                    <div className="flex justify-around mt-3 border-t pt-2 text-sm dark:text-gray-300 relative">
                    <div className="relative">
                        <button
                        className="cursor-pointer flex items-center gap-2 hover:text-blue-600 transition"
                        onClick={() => {
                            post.showReactions = !post.showReactions;
                            setPosts([...posts]);
                        }}
                        >
                        <i
                        className={
                            post.userReaction?.type
                            ? getReactionIcon(post.userReaction.type)
                            : "fa-regular fa-thumbs-up text-gray-400"
                        }
                        />
                        <span>
                        {post.userReaction?.type
                            ? post.userReaction.type.charAt(0).toUpperCase() +
                            post.userReaction.type.slice(1)
                            : "Like"}
                        </span>
                        </button>

                        {/* Reaction Popup */}
                        {post.showReactions && (
                        <div className="absolute  bottom-full left-0 mb-2 flex bg-white dark:bg-neutral-700 rounded-full shadow-lg p-2 space-x-2 z-50">
                            {[
                            { type: "like", icon: "fa-solid fa-thumbs-up text-blue-500" },
                            { type: "love", icon: "fa-solid fa-heart text-red-500" },
                            { type: "haha", icon: "fa-solid fa-face-laugh-squint text-yellow-500" },
                            { type: "wow", icon: "fa-solid fa-face-surprise text-yellow-400" },
                            { type: "sad", icon: "fa-solid fa-face-sad-tear text-blue-400" },
                            { type: "angry", icon: "fa-solid fa-face-angry text-red-600" },
                            ].map((r) => (
                            <button
                                key={r.type}
                                onClick={() => chooseReaction(post, r.type)}
                                className="hover:scale-125 transition  cursor-pointer"
                            >
                                <i className={`${r.icon} text-xl`}></i>
                            </button>
                            ))}
                        </div>
                        )}
                    </div>

                    <button className="cursor-pointer flex items-center gap-2 hover:text-green-600 transition"
                        onClick={() => goTo(`/view-comments/${post._id}`)}
                    >
                        <i className="fa-solid fa-comment"></i> Comment
                    </button>
                    <button className="cursor-pointer flex items-center gap-2 hover:text-indigo-600 transition">
                        <i className="fa-solid fa-share"></i> Share
                    </button>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}
