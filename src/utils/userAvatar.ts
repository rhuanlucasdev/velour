import type { User } from "@supabase/supabase-js";

const isValidUrl = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const normalizeAvatarUrl = (value: string) => {
  let trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  if (trimmed.startsWith("//")) {
    trimmed = `https:${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return undefined;
    }

    return parsed.toString();
  } catch {
    return undefined;
  }
};

export function getUserAvatarUrl(user: User | null): string | undefined {
  if (!user) {
    return undefined;
  }

  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const providers =
    (user.app_metadata?.providers as string[] | undefined) ?? [];
  const isGoogleUser = providers.includes("google");

  const identityCandidates = (user.identities ?? []).flatMap((identity) => {
    const identityData = identity.identity_data as
      | Record<string, unknown>
      | undefined;

    return [
      identityData?.picture,
      identityData?.avatar_url,
      identityData?.photo_url,
    ];
  });

  const directCandidates = [
    metadata?.picture,
    metadata?.avatar_url,
    metadata?.photo_url,
  ];

  const allCandidates = isGoogleUser
    ? [...identityCandidates, ...directCandidates]
    : [...directCandidates, ...identityCandidates];

  for (const candidate of allCandidates) {
    if (isValidUrl(candidate)) {
      const normalized = normalizeAvatarUrl(candidate);
      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
}
