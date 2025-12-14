"use client";

import ConfirmModal from "@/components/ConfirmModal";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Loader } from "@/components/Loader";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Loader2,
  Lock,
  Mail,
  Upload,
  User,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  // State
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Loading States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setProfilePic(session.user.image || "");
    }
  }, [session]);

  if (status === "loading") return <Loader />;
  if (!session) return null;

  const user = session?.user;

  // --- Handlers ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.secure_url) {
        setProfilePic(data.secure_url);
        toast.success("Avatar updated");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const updateProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: profilePic }),
      });

      if (res.ok) {
        toast.success("Profile saved");
        await updateSession();
      } else {
        toast.error("Failed to save");
      }
    } catch (err) {
      toast.error("Error saving profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) return toast.error("Fill all fields");
    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (res.ok) {
        toast.success("Password updated");
        setOldPassword("");
        setNewPassword("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed");
      }
    } catch (err) {
      toast.error("Error updating password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const deleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        toast.success("Account deleted");
        signOut();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    toast.success("Logging out...");
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans">
      <HomeNavbar />

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-24">
        {/* Page Header */}
        <div className="mb-12 border-b border-neutral-800 pb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Account Settings
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Manage your profile information and security preferences.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* --- Section 1: Public Profile --- */}
          <section className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 md:gap-12">
            <div>
              <h2 className="text-sm font-medium text-neutral-200">
                Public Profile
              </h2>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                This information will be visible to other members of your teams
                and shared rooms.
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                {/* Avatar Row */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <div className="h-20 w-20 rounded-full overflow-hidden">
                      <UserAvatar
                        user={{
                          name: user.name ?? "User",
                          image: profilePic || user.image || undefined,
                        }}
                        size="full"
                      />
                    </div>
                    {isUploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-10">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 hover:text-white text-xs font-medium text-neutral-300 transition-all w-fit"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload new picture
                    </button>
                    <p className="text-[10px] text-neutral-500">
                      Recommended: 400x400px. JPG or PNG.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="text-xs font-medium text-neutral-400 ml-1"
                    >
                      Display Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-neutral-500 group-focus-within:text-neutral-200 transition-colors" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-neutral-600" />
                      </div>
                      <input
                        type="text"
                        value={user.email || ""}
                        disabled
                        className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={updateProfile}
                    disabled={isSavingProfile || name === user.name}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                  >
                    {isSavingProfile && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* --- Section 2: Security --- */}
          <section className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 md:gap-12">
            <div>
              <h2 className="text-sm font-medium text-neutral-200">Security</h2>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Ensure your account is secure by using a strong password.
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400 ml-1">
                      Current Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-neutral-500 group-focus-within:text-neutral-200 transition-colors" />
                      </div>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all placeholder:text-neutral-700"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400 ml-1">
                      New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-neutral-500 group-focus-within:text-neutral-200 transition-colors" />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all placeholder:text-neutral-700"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={changePassword}
                    disabled={isSavingPassword || !oldPassword || !newPassword}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-200 text-sm font-medium hover:bg-neutral-700 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    {isSavingPassword && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* --- Section 3: Session (LOGOUT) --- */}
          <section className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 md:gap-12">
            <div>
              <h2 className="text-sm font-medium text-neutral-200">Session</h2>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Manage your active session on this device.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-200">
                    Log out of CodeSphere
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    You are currently logged in as{" "}
                    <span className="text-white font-mono">{user.email}</span>
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-200 text-sm font-medium hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          </section>

          {/* --- Section 4: Danger Zone --- */}
          <section className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 md:gap-12">
            <div>
              <h2 className="text-sm font-medium text-red-500">Danger Zone</h2>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Irreversible actions regarding your account data.
              </p>
            </div>

            <div className="rounded-xl border border-red-900/20 bg-red-500/5 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-200">
                    Delete Personal Account
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm leading-relaxed">
                    Permanently remove your account and all of its contents.
                    This action is not reversible.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-transparent hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/50 text-red-500 text-sm font-medium rounded-lg transition-all whitespace-nowrap"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* --- Confirm Delete Modal --- */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Account?"
        message={
          <div className="space-y-3">
            <p className="text-neutral-300">
              Are you sure you want to delete your account?
            </p>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warning: This cannot be undone.
              </p>
            </div>
          </div>
        }
        confirmLabel="Delete Forever"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await deleteAccount();
          setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
}
