"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { postsService } from "@/services/postsService";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams();
  console.log(id);
  
  const [formData, setFormData] = useState({
    content: "",
    visibility: "public",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load post data
  useEffect(() => {
    const dark = localStorage.getItem("theme") === "dark";
    setIsDarkMode(dark);

    async function fetchPost() {
      try {
        const res = await postsService.getSinglePost(id as string);
        const post = res.data;
        setFormData({
          content: post.content || "",
          visibility: post.visibility || "public",
        });
        setPreviewImage(post.images || null);
      } catch (err) {
        console.error("Error loading post:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.content.trim().length < 3) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: "Please write at least 3 characters",
        confirmButtonColor: "#f1c40f",
        background: isDarkMode ? "#1b1b1b" : "#fff",
        color: isDarkMode ? "#f3f4f6" : "#111827",
      });
      return;
    }

    const sendData = new FormData();
    sendData.append("postId", id as string);
    sendData.append("content", formData.content);
    sendData.append("visibility", formData.visibility);
    if (selectedFile) sendData.append("images", selectedFile);

    try {
      await postsService.editPost(sendData);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Post updated successfully!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: isDarkMode ? "#1b1b1b" : "#fff",
        color: isDarkMode ? "#f3f4f6" : "#111827",
      });
      router.push("/profile");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "Something went wrong!",
        confirmButtonColor: "#e74c3c",
        background: isDarkMode ? "#1b1b1b" : "#fff",
        color: isDarkMode ? "#f3f4f6" : "#111827",
      });
    }
  };

  return (
    <div className="h-[93vh] flex justify-center items-center bg-gray-100 dark:bg-neutral-900 p-6">
      <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl w-full max-w-4xl p-5 border border-gray-200 dark:border-neutral-700 hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-3">
          <i className="fas fa-edit text-blue-500"></i> Edit Post
        </h2>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-6 gap-3">
            <i className="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Loading post data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={3}
                placeholder="Update your post..."
                className="w-full p-4 rounded-xl border border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none shadow-sm placeholder-gray-400 dark:placeholder-gray-300 transition-all duration-200"
              ></textarea>
              <i className="fas fa-pencil-alt absolute top-3 right-3 text-gray-400"></i>
            </div>

            {previewImage && (
              <div className="relative mt-2">
                <img
                  src={previewImage}
                  className="rounded-xl shadow-md max-h-56 object-cover w-full border border-gray-300 dark:border-neutral-600"
                  alt="Preview"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200">
              <i className="fas fa-image"></i>
              <span>Add / Change Image</span>
              <input type="file" hidden onChange={handleFileChange} />
            </label>

            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="public">Public</option>
              <option value="friends">Friends only</option>
              <option value="private">Private</option>
            </select>

            <div className="text-right">
              <button
                type="submit"
                disabled={formData.content.trim().length < 3}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 flex items-center gap-2"
              >
                <i className="fas fa-save"></i> Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
