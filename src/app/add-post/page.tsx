"use client";

import { useState, useEffect, FormEvent } from "react";
import Swal from "sweetalert2";
import { postsService } from "@/services/postsService";
import { useRouter } from "next/navigation";

export default function AddPostPage() {
    const router = useRouter();

    const [content, setContent] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        setDarkMode(localStorage.getItem("theme") === "dark");
    }, []);

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (content.trim().length < 3) {
        Swal.fire({
            icon: "warning",
            title: "Warning!",
            text: "Please write at least 3 characters",
            confirmButtonColor: "#f1c40f",
            background: darkMode ? "#1b1b1b" : "#fff",
            color: darkMode ? "#f3f4f6" : "#111827",
        });
        return;
        }

        const formData = new FormData();
        formData.append("content", content);
        formData.append("visibility", visibility);
        if (selectedFile) formData.append("images", selectedFile);

        try {
        const res = await postsService.createPost(formData);

        if (res.status === "success") {
            Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Post published successfully!",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: darkMode ? "#1b1b1b" : "#fff",
            color: darkMode ? "#f3f4f6" : "#111827",
            });

            setContent("");
            setSelectedFile(null);
            setVisibility("public");
            router.push("/profile");
        } else {
            Swal.fire({
            icon: "warning",
            title: "Warning!",
            text: res.data || "Post creation failed",
            confirmButtonColor: "#f1c40f",
            background: darkMode ? "#1b1b1b" : "#fff",
            color: darkMode ? "#f3f4f6" : "#111827",
            });
        }
        } catch (err: any) {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: err.message || "Something went wrong!",
            confirmButtonColor: "#e74c3c",
            background: darkMode ? "#1b1b1b" : "#fff",
            color: darkMode ? "#f3f4f6" : "#111827",
        });
        }
    };

    return (
        <div className="pt-20">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md mx-4 md:mx-20 p-5 mb-4 border border-gray-200 dark:border-neutral-700">
            <form onSubmit={onSubmit}>
            {/* Post Content */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-neutral-600
                dark:bg-neutral-700 dark:text-white focus:ring-2 focus:ring-blue-500
                focus:border-blue-500 transition outline-none"
            ></textarea>

            {/* Upload Image */}
            <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer text-blue-600 dark:text-blue-400 hover:underline">
                <i className="fa-solid fa-image"></i>
                <span>{selectedFile ? selectedFile.name : "Add an image"}</span>
                <input type="file" hidden onChange={onFileSelected} />
                </label>
            </div>

            {/* Visibility */}
            <div className="mt-3">
                <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-neutral-600
                    dark:bg-neutral-700 dark:text-white focus:ring-2 focus:ring-blue-500
                    focus:border-blue-500 transition outline-none"
                >
                <option value="public">Public</option>
                <option value="friends">Friends only</option>
                <option value="private">Private</option>
                </select>
            </div>

            {/* Post Button */}
            <div className="mt-4 text-right">
                <button
                type="submit"
                className="cursor-pointer px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md
                    hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none
                    transition dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                Post
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}
