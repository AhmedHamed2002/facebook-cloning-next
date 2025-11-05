"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { commentService } from "@/services/commentService";
import Swal from "sweetalert2";

    interface Comment {
    _id: string;
    text: string;
    userId: {
        _id: string;
        name: string;
        profileImage: string;
    };
    }

export default function ViewComments() {
    const { id: postId } = useParams<{ id: string }>();
    const router = useRouter();

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [authorId, setAuthorId] = useState("");
    const [userId, setUserId] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        if (postId) loadComments();
    }, [postId]);

    const loadComments = async () => {
        try {
        setLoading(true);
        const res = await commentService.getComments(postId);
        setComments(res.data || []);
        setUserId(res.userId || "");
        setAuthorId(res.authorId || "");
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;
        await commentService.addComment(postId, newComment);
        setNewComment("");
        loadComments();
    };

    const deleteComment = async (commentId: string) => {
        const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this comment?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e74c3c",
        cancelButtonColor: "#7f8c8d",
        confirmButtonText: "Yes, delete it",
        });

        if (confirm.isConfirmed) {
        await commentService.deleteComment(postId, commentId);
        Swal.fire("Deleted!", "Your comment has been deleted.", "success");
        loadComments();
        }
    };

    return (
        <div className="max-w-7xl mx-auto bg-white dark:bg-neutral-900 pt-2 rounded-lg shadow flex flex-col h-[100vh]">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold dark:text-white">Comments</h2>
            <button
            onClick={() => router.push(`/user_profile/${authorId}`)}
            className="cursor-pointer px-3 py-1 rounded-full bg-gray-200 dark:bg-neutral-700 dark:text-neutral-300 text-sm hover:bg-gray-300 dark:hover:bg-neutral-600"
            >
            Back
            </button>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
            <div className="text-center py-6 text-gray-500">
                <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
                <p>Loading comments...</p>
            </div>
            ) : comments.length === 0 ? (
            <div className="text-gray-500 text-center py-6">
                No comments yet. Be the first to comment!
            </div>
            ) : (
            comments.map((comment) => (
                <div
                key={comment._id}
                className={`flex items-start space-x-3 relative group mt-3 ${
                    userId === comment.userId._id
                    ? "justify-end flex-row-reverse text-right"
                    : ""
                }`}
                >
                {/* Profile Image */}
                <img
                    src={comment.userId?.profileImage}
                    alt={comment.userId?.name}
                    width={40}
                    height={40}
                    onClick={() => router.push(`/user_profile/${comment.userId._id}`)}
                    className="w-9 h-9 rounded-full object-cover mt-1 cursor-pointer mx-3"
                />

                {/* Comment Bubble */}
                <div className="flex-1">
                    <div
                    className={`px-3 py-2 rounded-2xl inline-block max-w-[85%] ${
                        userId === comment.userId._id
                        ? "bg-blue-200 dark:bg-blue-600"
                        : "bg-gray-100 dark:bg-neutral-700"
                    }`}
                    >
                    <p
                        className="font-semibold text-sm text-gray-800 dark:text-white cursor-pointer pb-2"
                        onClick={() =>
                        router.push(`/user_profile/${comment.userId._id}`)
                        }
                    >
                        {comment.userId?.name}
                    </p>
                    <p className="text-gray-700 dark:text-neutral-300 text-sm">
                        {comment.text}
                    </p>
                    </div>
                </div>

                {/* Menu (3 dots + delete) */}
                
                    <div className="relative ml-2">
                    <i
                        className="fa-solid fa-ellipsis-h text-gray-400 cursor-pointer hover:text-gray-600"
                        onClick={() =>
                        setOpenMenuId(
                            openMenuId === comment._id ? null : comment._id
                        )
                        }
                    ></i>

                    {openMenuId === comment._id && (
                        <div className={`absolute  mt-2 w-32 bg-white dark:bg-neutral-700 rounded-lg shadow-lg py-2 text-sm z-50 ${ userId === comment.userId._id ? "-right-30" : "right-10"}`}>
                        <button
                            onClick={() => deleteComment(comment._id)}
                            className="block cursor-pointer w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-600 text-red-500"
                        >
                            <i className="fa-solid  fa-trash mr-2"></i> Delete
                        </button>
                        </div>
                    )}
                    </div>
                
                </div>
            ))
            )}
        </div>

        {/* Add Comment */}
        <div className="border-t dark:border-neutral-700 p-3 bg-gray-50 dark:bg-neutral-800 sticky bottom-0">
            <div className="flex items-center space-x-2">
            <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                type="text"
                placeholder="Write a comment..."
                className="flex-1 bg-gray-100 dark:bg-neutral-700 text-sm text-gray-800 dark:text-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={addComment}
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700"
            >
                Comment
            </button>
            </div>
        </div>
        </div>
    );
}
