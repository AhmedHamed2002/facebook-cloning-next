"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function editProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [form, setForm] = useState({
        name: "",
        bio: "",
        email: "",
        address: "",
        city: "",
        phone: "",
        gender: "",
        birthday: "",
    });
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
        null
    );
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadProfile = async () => {
        const res = await userService.profile();
        if (res?.data?.myProfile) {
            setProfile(res.data.myProfile);
            setForm({
            name: res.data.myProfile.name || "",
            bio: res.data.myProfile.bio || "",
            email: res.data.myProfile.email || "",
            address: res.data.myProfile.address || "",
            city: res.data.myProfile.city || "",
            phone: res.data.myProfile.phone || "",
            gender: res.data.myProfile.gender || "",
            birthday: res.data.myProfile.birthday || "",
            });
            setProfilePreview(res.data.myProfile.profileImage);
            setBackgroundPreview(res.data.myProfile.backgroundImage);
        }
        };
        loadProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        setProfileFile(file);
        const reader = new FileReader();
        reader.onload = () => setProfilePreview(reader.result as string);
        reader.readAsDataURL(file);
        }
    };

    const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        setBackgroundFile(file);
        const reader = new FileReader();
        reader.onload = () => setBackgroundPreview(reader.result as string);
        reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        Object.keys(form).forEach((key) => {
        const value = (form as any)[key];
        if (value) formData.append(key, value);
        });
        if (profileFile) formData.append("profileImage", profileFile);
        if (backgroundFile) formData.append("backgroundImage", backgroundFile);

        const res = await userService.updateProfile(formData);
        setIsLoading(false);

        if (res?.status === "success") {
        Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Profile updated successfully!",
        });
        router.push("/profile");
        } else {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: res?.message || "Something went wrong!",
        });
        }
    };

    return (
        <div className="min-h-screen flex justify-center pt-20 pb-8 px-4 bg-gray-100 dark:bg-neutral-900">
        <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-2xl w-full max-w-4xl overflow-hidden">

            {/* Cover Image */}
            <div className="relative group">
            {backgroundPreview && (
                <img
                src={backgroundPreview}
                alt="background"
                className="w-full h-56 object-cover"
                />
            )}
            <label className="absolute bottom-3 right-3 bg-black/60 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-black/80 z-40 transition">
                <div className="flex items-center gap-2">
                <i className="fas fa-camera"></i>
                <span className="hidden md:block">Change Cover</span>
                </div>
                <input type="file" onChange={handleBackgroundChange} hidden />
            </label>
            </div>

            {/* Profile Image */}
            <div className="relative flex justify-center -mt-16">
            <div className="relative w-36 h-36">
                {profilePreview && (
                <img
                    src={profilePreview}
                    alt="profile"
                    className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-md"
                />
                )}
                <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow">
                <i className="fas fa-camera"></i>
                <input type="file" onChange={handleProfileChange} hidden />
                </label>
            </div>
            </div>

            {/* Profile Form */}
            <div className="p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white border-b pb-3">
                Edit Profile
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                    { label: "Full Name", name: "name", type: "text" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Phone", name: "phone", type: "text" },
                    { label: "City", name: "city", type: "text" },
                    { label: "Address", name: "address", type: "text" },
                    { label: "Birthday", name: "birthday", type: "date" },
                ].map(({ label, name, type }) => (
                    <div key={name}>
                    <label className="label">{label}</label>
                    <input
                        type={type}
                        name={name}
                        value={(form as any)[name]}
                        onChange={handleChange}
                        className="input"
                        placeholder={`Enter your ${name}`}
                    />
                    </div>
                ))}

                <div>
                    <label className="label">Gender</label>
                    <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="input"
                    >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    </select>
                </div>
                </div>

                <div>
                <label className="label">About You</label>
                <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Write something about yourself..."
                    className="input h-28 resize-none"
                />
                </div>

                <div className="flex justify-end">
                <button
                    type="submit"
                    className="cursor-pointer px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow flex items-center gap-2"
                >
                    <i className="fas fa-save"></i> Save Changes
                </button>
                </div>
            </form>
            </div>

            {isLoading && (
            <div className="flex justify-center items-center p-4">
                <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-500 mr-2"></i>{" "}
                Updating...
            </div>
            )}
        </div>
        </div>
    );
}
