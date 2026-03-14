import type { User } from "@supabase/supabase-js";

export type PlanId = "free" | "pro" | "creator";

export type PlanFeature =
  | "maxIdeas"
  | "templates"
  | "hookScore"
  | "export"
  | "analytics"
  | "calendar";

export interface PlanConfig {
  maxIdeas: number | null;
  templates: "basic" | "all";
  hookScore: boolean;
  export: boolean;
  analytics: boolean;
  calendar: boolean;
}

export const plans: Record<PlanId, PlanConfig> = {
  free: {
    maxIdeas: 10,
    templates: "basic",
    hookScore: false,
    export: false,
    analytics: false,
    calendar: false,
  },
  pro: {
    maxIdeas: null,
    templates: "all",
    hookScore: true,
    export: true,
    analytics: false,
    calendar: false,
  },
  creator: {
    maxIdeas: null,
    templates: "all",
    hookScore: true,
    export: true,
    analytics: true,
    calendar: true,
  },
};

interface UserProfileLike {
  is_pro?: boolean | null;
}

const toPlan = (value: unknown): PlanId | null => {
  if (value !== "free" && value !== "pro" && value !== "creator") {
    return null;
  }

  return value;
};

export function getUserPlan(params: {
  user?: User | null;
  profile?: UserProfileLike | null;
}): PlanId {
  const metadataPlan = toPlan(
    String(
      params.user?.user_metadata?.plan ?? params.user?.app_metadata?.plan ?? "",
    ).toLowerCase(),
  );

  if (metadataPlan) {
    return metadataPlan;
  }

  if (params.profile?.is_pro) {
    return "pro";
  }

  return "free";
}

export function canUseFeature(feature: PlanFeature, plan: PlanId): boolean {
  const entitlement = plans[plan];

  if (feature === "maxIdeas") {
    return entitlement.maxIdeas === null;
  }

  if (feature === "templates") {
    return entitlement.templates === "all";
  }

  return entitlement[feature];
}

export function canCreateIdea(plan: PlanId, currentIdeas: number): boolean {
  const limit = plans[plan].maxIdeas;

  return limit === null || currentIdeas < limit;
}
