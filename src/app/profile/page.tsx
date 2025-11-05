"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { reactionService } from "@/services/reactionService";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { postsService } from "@/services/postsService";

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        setDarkMode(localStorage.getItem("theme") === "dark");
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
        const res = await userService.profile();
        const user = res.data.myProfile;
        const userPosts = res.data.posts; 

        const updatedPosts = await Promise.all(
            userPosts.map(async (post: any) => {
            const reactionData = await reactionService.getReactions(post._id);
            const myReaction = reactionData.data.find(
                (r: any) => r.userId._id === user._id
            );

            return {
                ...post,
                userReaction: myReaction
                ? { type: myReaction.type, userId: user._id }
                : { type: null, userId: user._id },
                likes: reactionData.data.map((r: any) => ({
                type: r.type,
                userId: r.userId._id,
                name: r.userId.name,
                profileImage: r.userId.profileImage,
                })),
                showReactions: false,
            };
            })
        );

        setProfile(user);
        setPosts(updatedPosts);
        } catch (err: any) {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: err.message || "Something went wrong!",
            background: darkMode ? "#1b1b1b" : "#fff",
            color: darkMode ? "#f3f4f6" : "#111827",
        });
        } finally {
        setLoading(false);
        }
    }

    const toggleReaction = async (post: any, type: string) => {
    try {
        const userId = profile._id;

        // لو المستخدم ضغط على نفس الريأكت → يشيله (unreact)
        if (post.userReaction?.type === type) {
        await reactionService.removeReaction(post._id);
        post.userReaction = { type: null, userId };
        post.likes = post.likes.filter((r: any) => r.userId !== userId);
        setPosts([...posts]);
        return;
        }

        // لو ضغط على نوع جديد → يحدث الريأكت
        await reactionService.addReaction(post._id, type);
        post.userReaction = { type, userId };

        const existing = post.likes.find((r: any) => r.userId === userId);
        if (existing) {
        existing.type = type; // تحديث الريأكت القديم
        } else {
        post.likes.push({
            type,
            userId,
            name: profile.name,
            profileImage: profile.profileImage,
        });
        }

        setPosts([...posts]);
    } catch (err: any) {
        console.error("Reaction error:", err);
        Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update reaction.",
        background: darkMode ? "#1b1b1b" : "#fff",
        color: darkMode ? "#f3f4f6" : "#111827",
        });
    }
    };


    const chooseReaction = (post: any, type: string) => {
        toggleReaction(post, type);
        post.showReactions = false;
        setPosts([...posts]);
    };

    const getReactionIcon = (type: string) => {
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
    };

    const deletePost = async (postId: string) => {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        background: darkMode ? "#1b1b1b" : "#fff",
        color: darkMode ? "#f3f4f6" : "#111827",
    }).then(async (result) => {
        if (result.isConfirmed) {
        try {
            const res = await postsService.deletePost(postId);
            Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: res.data,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: darkMode ? "#1b1b1b" : "#fff",
            color: darkMode ? "#f3f4f6" : "#111827",
            });
            setPosts(posts.filter((p) => p._id !== postId));
        } catch (err: any) {
            Swal.fire({
            icon: "error",
            title: "Error!",
            text: err.message || "Failed to delete post.",
            confirmButtonColor: "#e74c3c",
            background: darkMode ? "#1b1b1b" : "#fff",
            color: darkMode ? "#f3f4f6" : "#111827",
            });
        }
        }
    });
    };


    const goTo = (path: string) => router.push(path);
    const goToFriend = (id: string) => router.push(`/user_profile/${id}`); 
    const goToAddPost = () => {router.push("/add-post");};

    if (loading)
        return (
        <div className="flex justify-center items-center min-h-screen gap-2">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
            <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
        );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 py-6 px-4 md:px-28">
            {/* Cover + Profile Image */}
            <div className="relative bg-gray-300 dark:bg-neutral-700 h-56 rounded-xl">
                <img
                src={profile?.backgroundImage}
                alt="Cover"
                className="w-full h-full object-cover cursor-pointer"
                />
                <div className="absolute z-40 -bottom-14 left-6">
                <img
                    src={profile?.profileImage}
                    className="w-28 h-28 rounded-full cursor-pointer border-4 border-white dark:border-neutral-800 shadow-lg object-cover"
                />
                </div>
            </div>

            {/* Info */}
            <div className="mt-20 px-6 flex items-center justify-between flex-wrap">
                <div>
                <h2 className="text-2xl font-bold dark:text-white flex items-center space-x-1">
                    <span>{profile?.name}</span>
                    {profile?.role === "admin" && (
                    <span className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 ms-1 p-0.5 rounded-full text-sm font-semibold flex items-center gap-1">
                        <i className="fa-solid fa-circle-check"></i> Admin
                    </span>
                    )}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    <i className="fa-solid fa-briefcase text-gray-500 mr-1"></i>
                    {profile?.bio || "No bio available"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <i className="fa-solid fa-location-dot text-red-500 mr-1"></i>
                    {profile?.city} • {profile?.address}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
                    {profile?.email && (
                    <p>
                        <i className="fas fa-envelope mr-1 text-blue-400"></i>
                        {profile.email}
                    </p>
                    )}
                    {profile?.phone && (
                    <p>
                        <i className="fas fa-phone mr-1 text-green-500"></i>
                        {profile.phone}
                    </p>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
                    <p>
                    <i className="fas fa-birthday-cake mr-1 text-pink-500"></i>
                    {profile.birthday?.slice(0, 10)}
                    </p>
                    <p>
                    <i className="fas fa-user mr-1 text-yellow-500"></i> Age:{" "}
                    {profile.age}
                    </p>
                    <p>
                    <i className="fas fa-venus-mars mr-1 text-blue-400"></i>{" "}
                    {profile.gender}
                    </p>
                </div>

                {/* Friends */}
                <div className="flex items-center mt-4">
                    {profile?.friends?.slice(0, 6).map((friend: any) => (
                            <img
                            key={friend._id}
                            src={friend.profileImage || "/default-avatar.png"}
                            className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-800 shadow object-cover cursor-pointer"
                            title={friend.name}
                            onClick={() => goToFriend(friend._id)}
                            />
                    ))}
                    <span
                    className="text-sm ms-3 text-gray-600 dark:text-gray-400 cursor-pointer flex items-center gap-1"
                    onClick={() => goTo("/my-friends")}
                    >
                    <i className="fa-solid fa-user-friends text-indigo-500"></i>
                    {profile?.friends?.length} friends
                    </span>
                </div>
                </div>

                <button
                onClick={() => goTo("/edit-profile")}
                className="px-4 py-2 mt-3 lg:mt-0 cursor-pointer rounded-full border border-gray-300 dark:border-neutral-600 hover:bg-blue-500/80 hover:text-white text-sm font-semibold text-gray-700 dark:text-gray-200 transition flex items-center gap-2"
                >
                <i className="fa-solid fa-pen"></i> Edit Profile
                </button>
            </div>

            <hr className="my-6 border-gray-300 dark:border-neutral-700" />

            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow py-10 px-6 mb-6">
                {/* Profile Input Section */}
                <div className="flex items-center space-x-3 mb-3">
                    <img
                        src={profile.profileImage}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                    />

                    <input
                    type="text"
                    readOnly
                    onClick={goToAddPost}
                    placeholder={`What's on your mind, ${profile?.name || "User"}?`}
                    className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                </div>

                {/* Buttons Section */}
                <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm border-t pt-8">
                    <button
                    onClick={goToAddPost}
                    className="flex items-center cursor-pointer gap-2 hover:text-green-600 transition"
                    >
                    <i className="fa-solid fa-image"></i>
                    <span className="hidden md:block">Photo/Video</span>
                    </button>

                    <button className="flex items-center cursor-pointer gap-2 hover:text-indigo-600 transition">
                    <i className="fa-solid fa-user-tag"></i>
                    <span className="hidden md:block">Tag Friends</span>
                    </button>

                    <button className="flex items-center cursor-pointer gap-2 hover:text-orange-600 transition">
                    <i className="fa-solid fa-face-smile"></i>
                    <span className="hidden md:block">Feeling/Activity</span>
                    </button>
                </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
                {posts.map((post, index) => (
                <div
                    key={post._id || index}
                    className="bg-white dark:bg-neutral-800 cursor-pointer rounded-xl shadow p-4 relative"
                >
                    <div className="flex items-center mb-3 gap-2">
                    <img
                        src={profile.profileImage}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex items-center">
                        <div className="me-5">
                            <h4 className="font-semibold dark:text-white">
                            {profile.name}
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
                            onClick={() => goTo(`/edit-post/${post._id}`)}
                            className="block cursor-pointer w-full px-4 py-2 text-left text-neutral-600 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-600"
                        >
                            <i className="fa-solid fa-pen mr-2"></i> Edit Post
                        </button>
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
                                : "fa-regular fa-thumbs-up"
                            }
                        ></i>
                        {post.userReaction?.type || "Like"}
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
