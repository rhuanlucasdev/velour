# Velour

> A premium creative workspace for crafting viral content ideas.

---

## Overview

Velour is a modern SaaS tool designed for creators who want to structure and develop viral content ideas through a fast, focused visual interface. It provides a clean, opinionated workspace — inspired by tools like Linear and Raycast — where ideas can be captured, shaped, and refined before going to production.

The MVP establishes the foundational layout, design system, and state architecture needed to build the full creator workflow on top of.

---

## Features (MVP)

- **Dark mode premium UI** — deep dark aesthetic using a curated token palette
- **Sidebar navigation** — vertical nav with Ideas, Templates and Drafts sections
- **Responsive dashboard grid** — 1 → 2 → 3 column layout adapting to screen width
- **Idea card system** — hoverable cards with subtle elevation and accent effects
- **Reusable design system** — `Button`, `Card`, `Container` and `SectionHeader` primitives
- **Zustand architecture** — store and type layer prepared for full idea management

---

## Tech Stack

| Layer    | Technology  |
| -------- | ----------- |
| UI       | React 18    |
| Language | TypeScript  |
| Bundler  | Vite        |
| Styling  | TailwindCSS |
| State    | Zustand     |

---

## Project Structure

```
src/
├── components/
│   ├── ui/             # Reusable design system primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   └── SectionHeader.tsx
│   ├── AppLayout.tsx   # Root shell (sidebar + main area)
│   ├── Sidebar.tsx     # Vertical navigation
│   ├── Dashboard.tsx   # Ideas grid view
│   └── IdeaCard.tsx    # Individual idea card
├── store/
│   └── ideaStore.ts    # Zustand store (ideas, addIdea, updateIdea, deleteIdea)
├── types/
│   └── idea.ts         # Core Idea type definition
├── App.tsx
├── main.tsx
└── index.css
public/
└── favicon.svg         # Custom gem-mark brand icon
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

---

## Roadmap

- [ ] Idea creation flow (modal + form)
- [ ] Hook composer (structured fields: hook, insight, twist, CTA)
- [ ] Drag and drop reordering
- [ ] Templates library
- [ ] AI-assisted hook generation
- [ ] Export to clipboard / Notion / Google Docs
- [ ] User authentication

---

## License

MIT
