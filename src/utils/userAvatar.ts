import type { User } from "@supabase/supabase-js";

const isValidUrl = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

export function getUserAvatarUrl(user: User | null): string | undefined {
  if (!user) {
    return undefined;
  }

  const metadata = user.user_metadata as Record<string, unknown> | undefined;

  const directCandidates = [
    metadata?.avatar_url,
    metadata?.picture,
    metadata?.photo_url,
  ];

  for (const candidate of directCandidates) {
    if (isValidUrl(candidate)) {
      return candidate;
    }
  }

  for (const identity of user.identities ?? []) {
    const identityData = identity.identity_data as
      | Record<string, unknown>
      | undefined;

    const identityCandidates = [
      identityData?.avatar_url,
      identityData?.picture,
      identityData?.photo_url,
    ];

    for (const candidate of identityCandidates) {
      if (isValidUrl(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}
