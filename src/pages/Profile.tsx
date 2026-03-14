import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "../utils/toast";

export default function Profile() {
  const { user, isPro, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const avatarUrl = user?.user_metadata.avatar_url as string | undefined;
  const currentDisplayName =
    (user?.user_metadata.full_name as string | undefined) ||
    (user?.user_metadata.name as string | undefined) ||
    user?.email ||
    "Creator";
  const fallbackInitial = currentDisplayName.charAt(0).toUpperCase();

  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    avatarUrl,
  );
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const providers =
    (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const hasSocialProvider =
    providers.includes("github") || providers.includes("google");
  const canChangePassword = providers.includes("email") && !hasSocialProvider;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = async () => {
    if (!displayName.trim() || displayName.trim() === currentDisplayName) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() },
      });

      if (error) throw error;

      await refreshProfile();
      toast("Display name updated", { type: "success" });
      setIsEditingName(false);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update name", {
        type: "error",
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast("Image must be under 2MB", { type: "error" });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setIsUploadingAvatar(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatar")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatar")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      await refreshProfile();
      toast("Profile photo updated", { type: "success" });
    } catch (error) {
      setAvatarPreview(avatarUrl);
      toast(error instanceof Error ? error.message : "Upload failed", {
        type: "error",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user?.id) return;

    setIsManagingBilling(true);
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not open billing portal");
      }

      window.location.href = data.url;
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Billing portal unavailable",
        { type: "error" },
      );
      setIsManagingBilling(false);
    }
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const handleChangePassword = async () => {
    if (!canChangePassword) {
      return;
    }

    if (newPassword.length < 6) {
      toast("Password must be at least 6 characters", { type: "error" });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast("Passwords do not match", { type: "error" });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setNewPassword("");
      setConfirmNewPassword("");
      toast("Password updated successfully", { type: "success" });
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not update password",
        { type: "error" },
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const cardClass =
    "rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 shadow-[0_4px_32px_rgba(0,0,0,0.3)] backdrop-blur-md";

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-xl mx-auto space-y-4"
      >
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-white/90">
            Profile
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Manage your account settings
          </p>
        </div>

        {/* ── Profile section ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className={cardClass}
        >
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-white/25">
            Profile
          </h2>

          {/* Avatar row */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative group">
              <div className="rounded-full ring-2 ring-[#7C5CFF]/35 ring-offset-2 ring-offset-[#0A0A0A] transition-all duration-300 group-hover:ring-[#7C5CFF]/65 group-hover:shadow-[0_0_28px_rgba(124,92,255,0.35)]">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={currentDisplayName}
                    className="object-cover w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7C5CFF]/20 text-xl font-semibold text-[#c3b3ff]">
                    {fallbackInitial}
                  </div>
                )}
              </div>

              {/* Edit overlay button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                title="Change photo"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#181818] text-white/50 transition-all duration-150 hover:border-[#7C5CFF]/40 hover:bg-[#7C5CFF]/25 hover:text-white disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <svg
                    className="w-3 h-3 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => void handleAvatarChange(e)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-white/80">
                {currentDisplayName}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-0.5 text-xs text-white/30 transition-colors hover:text-[#a78fff]"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Display name */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-white/40">
              Display name
            </label>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSaveName();
                    if (e.key === "Escape") {
                      setDisplayName(currentDisplayName);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#7C5CFF]/50 focus:ring-1 focus:ring-[#7C5CFF]/25"
                />
                <button
                  type="button"
                  onClick={() => void handleSaveName()}
                  disabled={isSavingName}
                  className="rounded-lg bg-[#7C5CFF] px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-[#6B4EE0] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  {isSavingName ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDisplayName(currentDisplayName);
                    setIsEditingName(false);
                  }}
                  className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-white/45 transition-all hover:text-white/75"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="group flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/[0.1]">
                <span className="text-sm text-white/70">
                  {currentDisplayName}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-white/25 transition-colors hover:text-[#a78fff] group-hover:text-white/40"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/40">
              Email
            </label>
            <div className="flex items-center rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
              <span className="text-sm text-white/40">{user?.email}</span>
              <span className="ml-auto rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/25">
                Read-only
              </span>
            </div>
          </div>
        </motion.section>

        {/* ── Plan section ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className={cardClass}
        >
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-white/25">
            Plan
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/75">Current plan</p>
              <p className="mt-0.5 text-xs text-white/35">
                {isPro
                  ? "Full access to all Pro features"
                  : "Limited to free tier"}
              </p>
            </div>

            {isPro ? (
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                <span className="text-xs font-semibold text-emerald-300">
                  Velour Pro
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
                <span className="text-xs font-medium text-white/40">Free</span>
              </div>
            )}
          </div>

          {isPro && (
            <div className="mt-5 border-t border-white/[0.05] pt-4">
              <button
                type="button"
                onClick={() => void handleManageBilling()}
                disabled={isManagingBilling}
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/60 transition-all duration-150 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="1"
                    y="4"
                    width="14"
                    height="10"
                    rx="1.5"
                    stroke="currentColor"
                    strokeOpacity="0.8"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M1 7h14"
                    stroke="currentColor"
                    strokeOpacity="0.8"
                    strokeWidth="1.3"
                  />
                  <circle
                    cx="4"
                    cy="10.5"
                    r="1"
                    fill="currentColor"
                    fillOpacity="0.6"
                  />
                </svg>
                {isManagingBilling ? "Opening portal…" : "Manage Billing"}
              </button>
            </div>
          )}
        </motion.section>

        {/* ── Account actions section ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
          className={cardClass}
        >
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-white/25">
            Account
          </h2>

          {canChangePassword ? (
            <div className="mb-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
                Security
              </p>

              <div className="mt-3 space-y-2.5">
                <div>
                  <label className="mb-1 block text-xs text-white/45">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#7C5CFF]/50 focus:ring-1 focus:ring-[#7C5CFF]/25"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/45">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) =>
                      setConfirmNewPassword(event.target.value)
                    }
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#7C5CFF]/50 focus:ring-1 focus:ring-[#7C5CFF]/25"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleChangePassword()}
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/65 transition-all duration-150 hover:border-[#7C5CFF]/35 hover:bg-[#7C5CFF]/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingPassword ? "Updating..." : "Update password"}
                </button>
              </div>
            </div>
          ) : hasSocialProvider ? (
            <div className="mb-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
                Security
              </p>
              <p className="mt-2 text-sm text-white/55">
                This account uses social login ({providers.join(" / ")}).
                Password is managed by your identity provider.
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/55 transition-all duration-150 hover:border-red-500/25 hover:bg-red-500/8 hover:text-red-400"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10.5 11.5L14 8l-3.5-3.5M14 8H6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign out
          </button>
        </motion.section>
      </motion.div>
    </div>
  );
}
