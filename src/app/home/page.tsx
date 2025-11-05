"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userService } from "@/services/userService";
import { postsService } from "@/services/postsService";
import { reactionService } from "@/services/reactionService";

export default function HomePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        loadProfileAndPosts();
    }, []);

    const loadProfileAndPosts = async () => {
        try {
        const resProfile = await userService.profile();
        setProfile(resProfile.data.myProfile);

        const postRes = await postsService.getAllPublicPosts();
        const data = postRes.data;
        await loadReactions(data, resProfile.data.myProfile);
        } catch (err: any) {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: err.error?.message || "Something went wrong!",
            background: isDark ? "#1b1b1b" : "#fff",
            color: isDark ? "#f3f4f6" : "#111827",
        });
        } finally {
        setLoading(false);
        }
    };

    const loadReactions = async (postList: any[], user: any) => {
        const updatedPosts = await Promise.all(
        postList.map(async (post) => {
            try {
            const reactionData = await reactionService.getReactions(post._id);
            const reactions = reactionData.data.map((r: any) => ({
                type: r.type,
                userId: r.userId._id,
                name: r.userId.name,
                profileImage: r.userId.profileImage,
            }));

            const myReaction = reactionData.data.find(
                (r: any) => r.userId._id === user._id
            );

            return {
                ...post,
                likes: reactions,
                userReaction: myReaction
                ? { type: myReaction.type, userId: user._id }
                : { type: null, userId: user._id },
            };
            } catch {
            return post;
            }
        })
        );
        setPosts(updatedPosts);
    };

    const deletePost = async (id: string) => {
        const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        background: isDark ? "#1b1b1b" : "#fff",
        color: isDark ? "#f3f4f6" : "#111827",
        });

        if (!confirm.isConfirmed) return;

        try {
        const res = await postsService.deletePost(id);
        if (res.status === "success") {
            Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: res.data,
            showConfirmButton: false,
            timer: 2000,
            background: isDark ? "#1b1b1b" : "#fff",
            color: isDark ? "#f3f4f6" : "#111827",
            });
            setPosts((prev) => prev.filter((p) => p._id !== id));
        }
        } catch (err: any) {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: err.error?.message || "Failed to delete post",
        });
        }
    };

    const toggleReaction = async (post: any, type: string) => {
        if (!profile) return;
        const userId = profile._id;
        try {
        if (post.userReaction?.type === type) {
            await reactionService.removeReaction(post._id);
            post.userReaction.type = null;
            post.likes = post.likes.filter((r: any) => r.userId !== userId);
        } else {
            await reactionService.addReaction(post._id, type);
            post.userReaction = { type, userId };
            const existing = post.likes.find((r: any) => r.userId === userId);
            if (existing) existing.type = type;
            else
            post.likes.push({
                type,
                userId,
                name: profile.name,
                profileImage: profile.profileImage,
            });
        }

        setPosts((prevPosts) =>
            prevPosts.map((p) => (p._id === post._id ? { ...post } : p))
        );
        } catch {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Failed to update reaction",
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

    const goToAddPost = () => {router.push("/add-post");};

    if (loading)
        return (
        <div className="flex justify-center items-center min-h-screen gap-2">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
            <p className="text-gray-500 dark:text-gray-400">Loading posts...</p>
        </div>
        );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 py-6 px-4 md:px-24">
        {/* Create Post */}
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
        {posts.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
                No public posts available.
            </div>
        ) : (
            posts.map((post) => (
            <div
                key={post._id}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 mb-6 relative"
            >
                <div className="flex items-center gap-3 mb-4">
                <img
                    src={post.authorId.profileImage}
                    alt="author"
                    className="w-10 h-10 rounded-full object-cover"
                />
            
                <div className="flex items-center">
                    <Link href={`/user_profile/${post.authorId._id}`}>
                    <div className="me-5" >
                        <h4 className="font-semibold dark:text-white">
                        {post.authorId.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(post.createdAt).toLocaleString()}
                        </p>
                    </div>
                    </Link> 

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

                <div className="ms-auto relative">
                    <i
                    className="fa-solid fa-ellipsis-h text-gray-500 cursor-pointer"
                    onClick={() => {
                        post.showMenu = !post.showMenu;
                        setPosts([...posts]);
                    }}
                    ></i>
                    {post.showMenu && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-neutral-700 rounded-lg shadow-lg py-2 text-sm z-50">
                        <button
                        onClick={() => deletePost(post._id)}
                        className="cursor-pointer block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-600"
                        >
                        <i className="fa-solid fa-trash mr-2"></i> Delete
                        </button>
                    </div>
                    )}
                </div>
                </div>

                <p dir="auto" className="dark:text-gray-200 mb-3">{post.content}</p>
                {post.images?.[0] && (
                <img
                    src={post.images[0]}
                    alt="post"
                    className="w-full max-h-96 rounded-lg object-cover mb-2"
                />
                )}

                {/* Reactions Summary */}
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                <span
                    className="flex items-center gap-1 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition"
                    onClick={() => router.push(`/view-reactions/${post._id}`)}
                >
                    {post.likes.slice(0, 3).map((r: any, i: number) => (
                    <i key={i} className={`${getReactionIcon(r.type)} text-lg`} />
                    ))}
                    {post.likes.length} Reactions
                </span>

                <Link
                    href={`/view-comments/${post._id}`}
                    className="flex items-center gap-1 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition"
                >
                    <i className="fas fa-comment text-green-500"></i>
                    {post.comments?.length || 0} Comments
                </Link>
                </div>

                {/* Reaction Buttons */}
                <div className="flex justify-around mt-3 border-t pt-2 text-sm dark:text-gray-300 relative">
                <div className="relative">
                    <button
                    className="flex items-center cursor-pointer gap-2 hover:text-blue-600 transition"
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

                    {post.showReactions && (
                    <div className="absolute bottom-full left-0 mb-2 flex bg-white dark:bg-neutral-700 rounded-full shadow-lg p-2 space-x-2 z-50">
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
                            onClick={() =>  chooseReaction(post, r.type)}
                            className="hover:scale-125 transition cursor-pointer"
                        >
                            <i className={`${r.icon} text-xl`}></i>
                        </button>
                        ))}
                    </div>
                    )}
                </div>

                <button
                    className="flex items-center cursor-pointer gap-2 hover:text-green-600 transition"
                    onClick={() => router.push(`/view-comments/${post._id}`)}
                >
                    <i className="fa-solid fa-comment"></i> Comment
                </button>

                <button className="flex items-center cursor-pointer gap-2 hover:text-indigo-600 transition">
                    <i className="fa-solid fa-share"></i> Share
                </button>
                </div>
            </div>
            ))
        )}
        </div>
    );
}
