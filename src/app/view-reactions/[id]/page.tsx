"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { reactionService } from "@/services/reactionService";

    interface Reaction {
    _id: string;
    name: string;
    profileImage?: string;
    type: string;
    }

export default function ViewReactions() {
    const router = useRouter();
    const params = useParams();

    const [postId, setPostId] = useState<string>("");
    const [authorId, setAuthorId] = useState<string>("");
    const [allReactions, setAllReactions] = useState<Reaction[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);

    const tabs = [
        { key: "all", label: "All", icon: "fa-solid fa-users" },
        { key: "like", label: "Like", icon: "fa-solid fa-thumbs-up text-blue-500" },
        { key: "love", label: "Love", icon: "fa-solid fa-heart text-red-500" },
        { key: "haha", label: "Haha", icon: "fa-solid fa-face-laugh-squint text-yellow-500" },
        { key: "wow", label: "Wow", icon: "fa-solid fa-face-surprise text-yellow-400" },
        { key: "sad", label: "Sad", icon: "fa-solid fa-face-sad-tear text-blue-400" },
        { key: "angry", label: "Angry", icon: "fa-solid fa-face-angry text-red-600" },
    ];

    useEffect(() => {
        if (params?.id) {
        setPostId(params.id as string);
        loadReactions(params.id as string);
        }
    }, [params]);

    async function loadReactions(postId: string) {
        setLoading(true);
        try {
        const res = await reactionService.getReactions(postId);
        setAuthorId(res.authorId);
        setAllReactions(
            res.data.map((r: any) => ({
            _id: r.userId._id,
            name: r.userId.name,
            profileImage: r.userId.profileImage,
            type: r.type,
            }))
        );
        } catch (err) {
        console.error("Error loading reactions:", err);
        } finally {
        setLoading(false);
        }
    }

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
            return "fa-solid fa-thumbs-up text-gray-400";
        }
    }

    const filteredReactions =
        activeTab === "all"
        ? allReactions
        : allReactions.filter((r) => r.type === activeTab);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 py-6 px-6 md:px-20">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold dark:text-white">Reactions</h2>
            <button
            onClick={() => router.push(`/user_profile/${authorId}`)}
            className="px-3 py-1 rounded-full bg-gray-200 dark:bg-neutral-700 dark:text-neutral-300 text-sm hover:bg-gray-300 dark:hover:bg-neutral-600"
            >
            Back
            </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-gray-300 dark:border-neutral-700 mb-4 overflow-x-auto">
            {tabs.map((tab) => (
            <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
                activeTab === tab.key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600"
                }`}
            >
                <i className={`${tab.icon} mr-1`} /> {tab.label}
            </button>
            ))}
        </div>

        {/* Loading */}
        {loading ? (
            <div className="flex justify-center py-10 text-gray-500 dark:text-gray-300">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading reactions...
            </div>
        ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4">
            {filteredReactions.length > 0 ? (
                filteredReactions.map((user) => (
                <div
                    key={user._id}
                    className="flex items-center gap-3 py-2 border-b border-gray-200 dark:border-neutral-700"
                >
                    <img
                    src={user.profileImage || "/assets/default-avatar.png"}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                    onClick={() => router.push(`/user_profile/${user._id}`)}
                    />
                    <span
                    className="dark:text-white cursor-pointer hover:underline"
                    onClick={() => router.push(`/user_profile/${user._id}`)}
                    >
                    {user.name}
                    </span>
                    <i className={`${getReactionIcon(user.type)} ml-auto text-lg`} />
                </div>
                ))
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No reactions yet.
                </p>
            )}
            </div>
        )}
        </div>
    );
}
