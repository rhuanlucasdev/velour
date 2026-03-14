import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { createDefaultUsername } from "../lib/creatorProfile";
import { getUserPlan } from "../lib/plans";
import CreatorEarlyAccessBadge from "../components/ui/CreatorEarlyAccessBadge";
import { toast } from "../utils/toast";
import { getUserAvatarUrl } from "../utils/userAvatar";

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const userPlan = getUserPlan({ user, profile });

  const avatarUrl = getUserAvatarUrl(user);
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
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);

  const providers =
    (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const hasSocialProvider =
    providers.includes("github") || providers.includes("google");
  const canChangePassword = providers.includes("email") && !hasSocialProvider;

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarPreview(avatarUrl);
    setAvatarLoadError(false);
  }, [avatarUrl]);

  useEffect(() => {
    const loadCreatorUsername = async () => {
      if (!user?.id) {
        setCreatorUsername(null);
        return;
      }

      const { data } = await supabase
        .from("creator_profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.username) {
        setCreatorUsername(data.username as string);
        return;
      }

      setCreatorUsername(createDefaultUsername(user));
    };

    void loadCreatorUsername();
  }, [user?.id]);

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
    setAvatarLoadError(false);
    setIsUploadingAvatar(true);

    try {
      const path = `${user.id}/avatar`;

      const { error: uploadError } = await supabase.storage
        .from("avatar")
        .upload(path, file, {
          upsert: true,
          contentType: file.type || "image/png",
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatar")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarPreview(publicUrl);

      await refreshProfile();
      toast("Profile photo updated", { type: "success" });
    } catch (error) {
      setAvatarPreview(avatarUrl);
      toast(error instanceof Error ? error.message : "Upload failed", {
        type: "error",
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
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

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const rawBody = await response.text();
        const serverUnavailableHint = rawBody.includes("<!DOCTYPE")
          ? "Billing API unavailable. Start the backend server and try again."
          : "Billing service returned an invalid response.";
        throw new Error(serverUnavailableHint);
      }

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
    <div className="min-h-screen px-6 py-12">
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
          whileHover={{ y: -2 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className={`${cardClass} relative overflow-hidden border-[#7C5CFF]/15 shadow-[0_10px_44px_rgba(0,0,0,0.42),0_0_22px_rgba(124,92,255,0.08)]`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 18% 0%, rgba(124,92,255,0.16), transparent 45%)",
            }}
          />

          <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
              Profile
            </h2>
            <motion.span
              initial={{ scale: 0.96, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.12 }}
              className="rounded-full border border-[#7C5CFF]/25 bg-[#7C5CFF]/12 px-2.5 py-1 text-[10px] font-medium text-[#cdbfff]"
            >
              Personal Info
            </motion.span>
          </div>

          {/* Avatar row */}
          <div className="relative z-10 mb-6 flex items-center gap-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
            <motion.div className="relative group" whileHover={{ scale: 1.02 }}>
              <div className="rounded-full ring-2 ring-[#7C5CFF]/38 ring-offset-2 ring-offset-[#0E0E0E] transition-all duration-300 group-hover:ring-[#A388FF]/70 group-hover:shadow-[0_0_30px_rgba(124,92,255,0.4)]">
                {avatarPreview && !avatarLoadError ? (
                  <img
                    src={avatarPreview}
                    alt={currentDisplayName}
                    className="h-16 w-16 rounded-full object-cover"
                    onError={() => setAvatarLoadError(true)}
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
            </motion.div>

            <div>
              <p className="text-sm font-medium text-white/88">
                {currentDisplayName}
              </p>
              <p className="mt-0.5 text-[11px] text-white/35">Account avatar</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-xs text-white/30 transition-colors hover:text-[#b8a6ff]"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Display name */}
          <div className="relative z-10 mb-4">
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
                  className="text-xs text-white/25 transition-colors hover:text-[#b8a6ff] group-hover:text-white/40"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="relative z-10">
            <label className="mb-1.5 block text-xs font-medium text-white/40">
              Email
            </label>
            <div className="flex items-center rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
              <span className="text-sm text-white/40">{user?.email}</span>
              <span className="ml-auto rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/25">
                Read-only
              </span>
            </div>
          </div>

          {creatorUsername ? (
            <div className="relative z-10 mt-4 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() => navigate(`/creator/${creatorUsername}`)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#7C5CFF]/35 bg-[#7C5CFF]/12 px-3 py-2 text-xs font-semibold text-[#D6CAFF] transition-all duration-150 hover:border-[#A288FF]/45 hover:bg-[#7C5CFF]/2"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="5"
                    r="2.2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeOpacity="0.9"
                  />
                  <path
                    d="M3 13c0-2 2.1-3.6 5-3.6s5 1.6 5 3.6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeOpacity="0.9"
                    strokeLinecap="round"
                  />
                </svg>
                View my Creator Profile
              </button>
            </div>
          ) : null}
        </motion.section>

        {/* ── Plan section ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
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
                {userPlan === "creator"
                  ? "Access to all Creator features, analytics and calendar"
                  : userPlan === "pro"
                    ? "Full access to all Pro features"
                    : "Limited to free tier"}
              </p>
            </div>

            {userPlan === "creator" ? (
              <CreatorEarlyAccessBadge className="shrink-0" />
            ) : userPlan === "pro" ? (
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
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

          {userPlan !== "free" && (
            <div className="mt-5 border-t border-white/[0.05] pt-4">
              <motion.button
                type="button"
                onClick={() => void handleManageBilling()}
                disabled={isManagingBilling}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
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
              </motion.button>
            </div>
          )}
        </motion.section>

        {/* ── Account actions section ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
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

                <motion.button
                  type="button"
                  onClick={() => void handleChangePassword()}
                  disabled={isUpdatingPassword}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/65 transition-all duration-150 hover:border-[#7C5CFF]/35 hover:bg-[#7C5CFF]/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingPassword ? "Updating..." : "Update password"}
                </motion.button>
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

          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
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
          </motion.button>
        </motion.section>
      </motion.div>
    </div>
  );
}
