import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: "ideas",
    label: "Ideas",
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
];

export default function Sidebar() {
  const [active, setActive] = useState("ideas");

  return (
    <aside className="w-[240px] h-full shrink-0 border-r border-white/[0.06] bg-[#121212] px-3 py-5">
      <div className="mb-6 px-2 text-[15px] font-semibold tracking-tight text-white/90">
        Velour
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`
                w-full rounded-lg px-3 py-2 text-left text-[13.5px] font-medium transition-all duration-150
                flex items-center gap-2.5
                ${
                  isActive
                    ? "bg-[#7C5CFF]/12 text-[#a78fff]"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
                }
              `}
            >
              <span className={isActive ? "text-[#7C5CFF]" : "text-white/35"}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto h-1 w-1 rounded-full bg-[#7C5CFF]" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
