'use client';

import Sidebar from "@/components/Sidebar";
import { User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setProfilePic(session.user.image || "");
    }

  }, [session]);

  if (status === 'loading')
    return (
      <p className="p-8 text-center text-gray-400 italic animate-pulse">Loading profile...</p>
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
      if(!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);


      setUploading(true);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await res.json();
      if(data.secure_url) {
        setProfilePic(data.secure_url);
      } else {
        alert("Failed to upload image");
      }
      setUploading(false);
    }

  const updateProfile = async () => {
    setLoading(true);
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image: profilePic }),
    });
    setLoading(false);
    if (res.ok) {
      alert("Profile updated!");
      setIsEditModalOpen(false);
      await updateSession();
    } else {
      alert("Failed to update profile");
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword)
      return alert('Please fill out all password fields.');
    setLoading(true);
    const res = await fetch('/api/user/change-password', {
      method: 'PATCH',
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
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone."))
      return;
    const res = await fetch('/api/user/delete', { method: 'DELETE' });
    if (res.ok) {
      alert("Account deleted.");
      signOut();
    } else {
      alert("Failed to delete account");
    }
  };
  console.log("createdAt:", user.createdAt, typeof user.createdAt);


  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 max-w-7xl mx-auto px-10 py-12 flex flex-col gap-14 overflow-y-auto h-screen">
          <header className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-sm text-gray-400">
              {/* Use an appropriate icon here */}
              <User />
              Profile Settings
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text pb-2 mb-2">
              Manage Your Profile
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Update your personal information and account settings.
            </p>
          </header>

            {/* Normal Profile View */}
            <section className="bg-[#1a1a1f] border border-gray-700 rounded-3xl p-8 mb-10 shadow-lg hover:shadow-blue-600/40 transition-shadow duration-300">
                <div className="flex items-center gap-10 mb-4">
                    {/* Profile Image */}
                    <div className="w-28 h-28 rounded-full border-4 border-blue-600 shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 select-none">
                    {profilePic ? (
                        <img
                        src={profilePic}
                        alt={user.name ?? user.email ?? "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = "/default-avatar.jpg")}
                        />
                    ) : (
                        <span className="text-white font-extrabold text-6xl">
                        {(user.name || user.email)?.[0]?.toUpperCase()}
                        </span>
                    )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white leading-tight mb-1 capitalize">
                        {name || "Unnamed User"}
                    </h1>

                    {/* Info grid */}
                    <div className="flex flex-wrap gap-x-12 gap-y-6 max-w-xl mt-4">
                        <div className="flex flex-col min-w-[140px]">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Email
                            </h3>
                            <p className="text-white truncate">{user.email}</p>
                        </div>

                        <div className="flex flex-col min-w-[140px]">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Account Created
                            </h3>
                            <p className="text-white">
                            {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })
                                : "N/A"}
                            </p>
                        </div>

                        <div className="flex flex-col min-w-full">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            User ID
                            </h3>
                            <p className="text-gray-400 truncate text-sm select-text">{user.id}</p>
                        </div>
                        </div>
                    </div>
                </div>

                {/* Edit Button */}
                <div className="flex justify-end">
                    <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-block bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl px-8 py-3 shadow-lg transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500"
                    aria-label="Edit Profile"
                    >
                    Edit Profile
                    </button>
                </div>
            </section>



            {/* Edit Modal */}
            {isEditModalOpen && (
                <div
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                onClick={() => setIsEditModalOpen(false)}
                >
                {/* Prevent modal content from closing when clicking inside */}
                <div
                    className="bg-[#1a1a1f] rounded-3xl p-8 w-full max-w-md shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-3">
                    Edit Profile
                    </h2>

                    <div className="flex flex-col items-center gap-6 mb-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-600 shadow-md">
                        {profilePic ? (
                        <img
                            src={profilePic}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/default-avatar.jpg")}
                        />
                        ) : (
                        <div className="w-full h-full bg-blue-800 flex items-center justify-center text-3xl font-bold text-blue-300">
                            {name ? name[0].toUpperCase() : "?"}
                        </div>
                        )}
                    </div>

                    <div className="w-full space-y-4">
                        <div>
                        <label
                            htmlFor="name"
                            className="block mb-1 font-medium text-gray-300"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white capitalize placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            spellCheck={false}
                        />
                        </div>

                        <div>
                        <label
                            htmlFor="profilePic"
                            className="block mb-1 font-medium text-gray-300"
                        >
                            Profile Picture URL
                        </label>
                        <input
                            id="profilePic"
                            type="file"
                            accept="image/*"
                            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                        />
                        </div>
                    </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                    <button
                        onClick={updateProfile}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl px-6 py-3 shadow-lg transition transform active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update Profile"}
                    </button>

                    <button
                        onClick={() => setIsEditModalOpen(false)}
                        disabled={loading}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl px-6 py-3 shadow-lg transition transform active:scale-95"
                    >
                        Cancel
                    </button>
                    </div>
                </div>
                </div>
            )}


            {/* Change Password */}
            <section className="bg-[#1a1a1f] border border-gray-700 rounded-3xl p-8 mb-10 shadow-lg hover:shadow-green-600/40 transition-shadow duration-300">
                <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-3">
                Change Password
                </h2>

                <div className="space-y-5">
                <div>
                    <label htmlFor="oldPassword" className="block mb-1 font-medium text-gray-300">
                    Current Password
                    </label>
                    <input
                    id="oldPassword"
                    type="password"
                    className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    />
                </div>

                <div>
                    <label htmlFor="newPassword" className="block mb-1 font-medium text-gray-300">
                    New Password
                    </label>
                    <input
                    id="newPassword"
                    type="password"
                    className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    />
                </div>
                </div>

                <button
                onClick={changePassword}
                disabled={loading}
                className="mt-6 w-full md:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-teal-700 hover:to-green-700 text-white font-semibold rounded-xl px-6 py-3 shadow-lg transition transform active:scale-95 disabled:opacity-50"
                >
                {loading ? "Changing..." : "Change Password"}
                </button>
            </section>

            {/* Danger Zone */}
            <section className="bg-[#1a1a1f] border border-red-500 rounded-3xl p-8 shadow-lg hover:shadow-red-700/50 transition-shadow duration-300">
                <h2 className="text-xl font-semibold mb-6 border-b border-red-500 pb-3 text-red-500">
                Account Deletion
                </h2>
                <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full md:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl px-6 py-3 shadow-lg transition transform active:scale-95"
                >
                Delete Account
                </button>
            </section>
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-0">
                    <div className="bg-red-50 dark:bg-neutral-900 p-6 rounded-2xl border border-red-400 dark:border-red-600 w-xl shadow-2xl transition-colors">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-6 leading-relaxed">
                        Deleting your account is <strong>irreversible</strong>. All your data will be permanently lost. Please proceed with caution.
                    </p>
                    <div className="flex justify-end gap-4">
                        <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
                        >
                        Cancel
                        </button>
                        <button
                        onClick={deleteAccount}
                        className="px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 shadow-lg transition"
                        >
                        Confirm Delete
                        </button>
                    </div>
                    </div>
                </div>
            )}
      </main>
    </div>
  );
}
