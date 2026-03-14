import type { User } from "@supabase/supabase-js";
import { getUserAvatarUrl } from "../utils/userAvatar";

export type PublicPlanId = "free" | "pro" | "creator";

const normalizeUsernameBase = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

const resolveDisplayName = (user: User) => {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const candidate =
    (metadata?.full_name as string | undefined) ||
    (metadata?.name as string | undefined) ||
    user.email ||
    "Creator";

  return candidate.trim() || "Creator";
};

const resolveUsernameSeed = (user: User, displayName: string) => {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const metadataUsername =
    typeof metadata?.username === "string" ? metadata.username : undefined;
  const emailHandle = user.email?.split("@")[0];

  return metadataUsername || emailHandle || displayName;
};

const toPlan = (value: unknown): PublicPlanId | null => {
  if (value !== "free" && value !== "pro" && value !== "creator") {
    return null;
  }

  return value;
};

const resolvePublicPlan = (
  user: User,
  isProFallback: boolean,
): PublicPlanId => {
  const metadataPlan = toPlan(
    String(
      user.user_metadata?.plan ?? user.app_metadata?.plan ?? "",
    ).toLowerCase(),
  );

  if (metadataPlan) {
    return metadataPlan;
  }

  return isProFallback ? "pro" : "free";
};

export const createDefaultUsername = (user: User) => {
  const displayName = resolveDisplayName(user);
  const seed = resolveUsernameSeed(user, displayName);
  const normalized = normalizeUsernameBase(seed) || "creator";
  return `${normalized}-${user.id.slice(0, 6)}`;
};

export const createCreatorProfilePayload = (
  user: User,
  options?: { isPro?: boolean | null },
) => {
  const displayName = resolveDisplayName(user);
  const plan = resolvePublicPlan(user, Boolean(options?.isPro));

  return {
    id: user.id,
    username: createDefaultUsername(user),
    display_name: displayName,
    avatar_url: getUserAvatarUrl(user) ?? null,
    plan,
  };
};
