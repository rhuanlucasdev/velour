import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import PlanBadge from "./ui/PlanBadge";
import CreatorEarlyAccessBadge from "./ui/CreatorEarlyAccessBadge";
import { useAuth } from "../context/AuthContext";
import { getUserPlan } from "../lib/plans";
import { getUserAvatarUrl } from "../utils/userAvatar";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

const navItems: NavItem[] = [
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="8"
          cy="5.5"
          r="2.5"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />
        <path
          d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "/pricing",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "library",
    label: "Library",
    href: "/library",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 2.2h8.8A1.2 1.2 0 0 1 13 3.4v9.2a1.2 1.2 0 0 1-1.2 1.2H3.9a1.2 1.2 0 0 1-1.2-1.2V3.4A1.2 1.2 0 0 1 3.9 2.2H3Zm0 0v11.6"
          stroke="currentColor"
          strokeOpacity="0.72"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M5.6 5h5M5.6 7.6h5M5.6 10.2h3.2"
          stroke="currentColor"
          strokeOpacity="0.72"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "ideas",
    label: "Ideas",
    href: "/app?tab=ideas",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 1.5a3.5 3.5 0 0 0-1.5 6.67V9.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V8.17A3.5 3.5 0 0 0 8 1.5zM6.5 11h3v.5a1.5 1.5 0 0 1-3 0V11z"
          fill="currentColor"
          fillOpacity="0.7"
        />
      </svg>
    ),
  },
  {
    id: "templates",
    label: "Templates",
    href: "/app?tab=templates",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="1.5"
          y="1.5"
          width="5.5"
          height="5.5"
          rx="1"
          fill="currentColor"
          fillOpacity="0.7"
        />
        <rect
          x="9"
          y="1.5"
          width="5.5"
          height="5.5"
          rx="1"
          fill="currentColor"
          fillOpacity="0.7"
        />
        <rect
          x="1.5"
          y="9"
          width="5.5"
          height="5.5"
          rx="1"
          fill="currentColor"
          fillOpacity="0.7"
        />
        <rect
          x="9"
          y="9"
          width="5.5"
          height="5.5"
          rx="1"
          fill="currentColor"
          fillOpacity="0.7"
        />
      </svg>
    ),
  },
  {
    id: "drafts",
    label: "Drafts",
    href: "/app?tab=drafts",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 2.5A1.5 1.5 0 0 1 4.5 1h5.086a1.5 1.5 0 0 1 1.06.44l2.415 2.414A1.5 1.5 0 0 1 13.5 5v8A1.5 1.5 0 0 1 12 14.5H4.5A1.5 1.5 0 0 1 3 13V2.5z"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M9.5 1v3a1 1 0 0 0 1 1h3"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />
        <path
          d="M5.5 8h5M5.5 10.5h3"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Calendar",
    href: "/calendar",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="3"
          width="12"
          height="10.5"
          rx="1.8"
          stroke="currentColor"
          strokeOpacity="0.72"
          strokeWidth="1.2"
        />
        <path
          d="M2 6h12M5 1.8v2.4M11 1.8v2.4"
          stroke="currentColor"
          strokeOpacity="0.72"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const currentPath = location.pathname;
  const currentTab = new URLSearchParams(location.search).get("tab") ?? "ideas";
  const isIdeasRoute = currentPath === "/app" || currentPath === "/dashboard";
  const userPlan = getUserPlan({ user, profile });
  const isCreator = userPlan === "creator";
  const visibleNavItems = navItems.filter(
    (item) => item.id !== "calendar" || isCreator,
  );

  const isPro = userPlan === "pro";

  const avatarUrl = getUserAvatarUrl(user);
  const displayName =
    (user?.user_metadata.full_name as string | undefined) ||
    (user?.user_metadata.name as string | undefined) ||
    user?.email ||
    "Creator";
  const fallbackInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setIsNavigating(true);
    navigate("/logout");
  };

  const handleNavigate = (href?: string) => {
    const currentTarget = `${currentPath}${location.search}`;

    if (!href || href === currentTarget) {
      return;
    }

    setIsNavigating(true);
    navigate(href);
  };

  useEffect(() => {
    setIsNavigating(false);
  }, [currentPath, location.search]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [avatarUrl]);

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#121212] px-3 py-5">
      <div className="mb-6 flex items-center gap-2 px-2">
        <img
          src="/brand/logo-mark.png"
          alt="Velour"
          className="h-5 w-5 rounded-sm object-contain"
        />
        <span className="text-[15px] font-semibold tracking-tight text-white/90">
          Velour
        </span>
      </div>
      <nav className="space-y-1">
        {visibleNavItems.map((item) => {
          const isActive =
            item.id === "profile"
              ? currentPath === "/profile"
              : item.id === "pricing"
                ? currentPath === "/pricing"
                : item.id === "library"
                  ? currentPath === "/library"
                  : item.id === "calendar"
                    ? currentPath === "/calendar"
                    : isIdeasRoute && currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.href)}
              className={`
                group relative w-full overflow-hidden rounded-lg px-3 py-2 text-left text-[13.5px] font-medium
                flex items-center gap-2.5 transition-all duration-200 ease-out
                ${
                  isActive
                    ? "text-[#a78fff]"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white/75 hover:translate-x-[2px]"
                }
              `}
            >
              {isActive ? (
                <motion.span
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-lg bg-[#7C5CFF]/12"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}

              <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full transition-all duration-200 ${
                  isActive
                    ? "bg-[#7C5CFF]/90 opacity-100"
                    : "bg-[#7C5CFF]/70 opacity-0 group-hover:opacity-100"
                }`}
              />
              <span
                className={`relative z-10 transition-all duration-200 ${
                  isActive
                    ? "text-[#7C5CFF]"
                    : "text-white/35 group-hover:scale-110 group-hover:text-[#8f75ff]"
                }`}
              >
                {item.icon}
              </span>
              <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-[1px]">
                {item.label}
              </span>
              <AnimatePresence>
                {isActive ? (
                  <motion.span
                    layoutId="sidebar-active-dot"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 28 }}
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-[#7C5CFF] shadow-[0_0_10px_rgba(124,92,255,0.8)]"
                  />
                ) : null}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/[0.08] px-1 pt-4">
        {isCreator ? (
          <CreatorEarlyAccessBadge className="mb-3 w-full" compact />
        ) : isPro ? (
          <PlanBadge variant="pro" label="Velour Pro Active" />
        ) : (
          <button
            type="button"
            onClick={() => navigate("/pricing")}
            className="mb-3 inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-3 py-2 text-xs font-semibold text-white transition-all duration-150 hover:bg-[#6B4EE0] hover:shadow-[0_0_24px_rgba(124,92,255,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Upgrade Plans
          </button>
        )}

        <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2">
          {avatarUrl && !avatarLoadError ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
              onError={() => setAvatarLoadError(true)}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C5CFF]/20 text-xs font-semibold text-[#c3b3ff]">
              {fallbackInitial}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white/88">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-white/45">Signed in</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/75 transition-all duration-150 hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-200 hover:shadow-[0_0_18px_rgba(239,68,68,0.2)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 2.5h4A1.5 1.5 0 0 1 11.5 4v8A1.5 1.5 0 0 1 10 13.5H6"
              stroke="currentColor"
              strokeOpacity="0.9"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M9.5 8H2.5M4.5 6L2.354 7.789a.25.25 0 0 0 0 .384L4.5 10"
              stroke="currentColor"
              strokeOpacity="0.9"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Logout
        </button>
      </div>

      {isNavigating ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A0A0A]/90 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-7 text-center shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#7C5CFF]" />
            <p className="text-sm font-medium text-white/90">Loading...</p>
            <p className="mt-1 text-xs text-white/45">
              Opening your workspace section.
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
