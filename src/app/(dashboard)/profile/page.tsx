"use client";

import ConfirmModal from "@/components/ConfirmModal";
import HomeNavbar from "@/components/HomeNavbar";
import { User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setProfilePic(session.user.image || "");
    }
  }, [session]);

  if (status === "loading")
    return (
      <p className="p-8 text-center text-gray-400 italic animate-pulse">
        Loading profile...
      </p>
    );

  if (!session)
    return (
      <p className="p-8 text-center text-red-400 font-semibold">
        Please log in to view your profile.
      </p>
    );

  const user = session?.user;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewProfileImage(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (data.secure_url) {
      setProfilePic(data.secure_url);
    } else {
      alert("Failed to upload image");
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image: profilePic }),
    });
    setLoading(false);
    if (res.ok) {
      alert("Profile updated!");
      await updateSession();
    } else {
      alert("Failed to update profile");
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword)
      return alert("Please fill out all password fields.");
    setLoading(true);
    const res = await fetch("/api/user/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    setLoading(false);
    if (res.ok) {
      alert("Password changed!");
      setOldPassword("");
      setNewPassword("");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to change password.");
    }
  };

  const deleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    )
      return;
    const res = await fetch("/api/user/delete", { method: "DELETE" });
    if (res.ok) {
      alert("Account deleted.");
      signOut();
    } else {
      alert("Failed to delete account");
    }
  };
  console.log("createdAt:", user.createdAt, typeof user.createdAt);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#111111] to-gray-900 text-white">
      <HomeNavbar />

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-20 space-y-20">
        {/* --- Refined Header --- */}
        <header className="text-center max-w-3xl mx-auto">
          {" "}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-white/5 text-sm text-gray-400 border border-white/10 rounded-full">
            {" "}
            <User className="w-4 h-4" /> Profile Settings{" "}
          </div>{" "}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-4">
            {" "}
            Manage Your Profile{" "}
          </h1>{" "}
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            {" "}
            Update your personal information and account settings.{" "}
          </p>{" "}
        </header>

        {/* --- Profile Section --- */}
        <section className="flex flex-col md:flex-row items-start gap-10">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center border-4 border-neutral-700 text-white text-4xl font-bold select-none">
            {profilePic ? (
              <img
                src={profilePic}
                alt={user.name ?? user.email ?? "User"}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = "/default-avatar.jpg")}
              />
            ) : (
              <span>{(user.name || user.email)?.[0]?.toUpperCase()}</span>
            )}
          </div>

          {/* Details and Form */}
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-xl font-semibold capitalize">
                {name || "Unnamed User"}
              </h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-gray-600 text-sm">
                Joined:{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Name Input */}
              <div className="flex-1">
                <label
                  htmlFor="name"
                  className="text-sm text-gray-400 block mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition"
                />
              </div>

              {/* Profile Pic Input */}
              <div className="flex-1">
                <label
                  htmlFor="profilePic"
                  className="text-sm text-gray-400 block mb-1"
                >
                  Profile Picture
                </label>
                <input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-4 py-3 text-white file:cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={updateProfile}
                disabled={
                  loading ||
                  (name.trim() === (user.name ?? "") && !newProfileImage) // Assuming you're using a newProfileImage/file
                }
                className="bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 hover:from-neutral-600 hover:to-neutral-800 text-white font-semibold rounded-md px-6 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </section>

        {/* --- Password Section --- */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Change Password</h2>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Current Password */}
            <div className="flex-1">
              <label
                htmlFor="oldPassword"
                className="text-sm text-gray-400 block mb-1"
              >
                Current Password
              </label>
              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-4 py-3 text-white focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition"
              />
            </div>

            {/* New Password */}
            <div className="flex-1">
              <label
                htmlFor="newPassword"
                className="text-sm text-gray-400 block mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-4 py-3 text-white focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition"
              />
            </div>
          </div>

          <div>
            <button
              onClick={changePassword}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md px-6 py-3 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </section>

        {/* --- Danger Zone --- */}
        <section className="pt-10 border-t border-white/10 space-y-4">
          <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
          <p className="text-sm text-red-400">
            Deleting your account is <strong>permanent</strong> and will remove
            all your data. Proceed only if you're sure.
          </p>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-md px-6 py-3 transition cursor-pointer"
          >
            Delete Account
          </button>
        </section>

        {/* --- Confirm Delete Modal --- */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          message="Are you absolutely sure? This action cannot be undone."
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={deleteAccount}
        />
      </main>
    </div>
  );
}
