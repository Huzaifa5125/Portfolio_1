# Huzaifa Ali — Portfolio

A personal portfolio for [Huzaifa Ali](https://github.com/Huzaifa5125), an AI/ML engineer working in computer vision and vision-language models.

## Features

- Paired featured project cards with descriptions underneath; stacked on mobile.
- Compact, responsive experience, skills, and contact sections.
- Light and dark themes with a saved preference.
- Scroll reveals that replay in both directions.
- A soft cursor light and responsive halo that fade out when idle.
- Reduced-motion support, keyboard navigation, and accessible controls.

## Run locally

Use Node.js 24 or newer. If you use nvm, run `nvm use` first.

```bash
git clone https://github.com/Huzaifa5125/Portfolio_1.git
cd Portfolio_1
npm ci
npm run dev
```

Open the local address printed by the development server. No API keys or ChatGPT account are required to run the portfolio locally.

## Check and build

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

To preview the production build locally, run `npm start` after building. This starts the Cloudflare Workers local runtime; it does not publish the site.

## Project structure

| Path                       | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `app/page.tsx`             | Portfolio content and layout                         |
| `app/globals.css`          | Responsive styling, themes, and CSS animations       |
| `app/layout.tsx`           | Page metadata and initial theme selection            |
| `app/motion.tsx`           | Scroll, navigation, and card interactions            |
| `app/reveals.ts`           | Repeatable scroll-reveal behavior                    |
| `app/pointer-field.ts`     | Ambient cursor light and interactive halo            |
| `app/theme-toggle.tsx`     | Theme switch and saved preferences                   |
| `components/ui/button.tsx` | The UI component used by the theme switch            |
| `lib/utils.ts`             | Component class-name utilities                       |
| `public/favicon.svg`       | Site icon                                            |
| `tests/motion.test.mjs`    | Motion, accessibility, and theme regression tests    |
| `vite.config.ts`           | Vinext, Tailwind, and Cloudflare build configuration |

Built with React, TypeScript, Vinext/Vite, Tailwind CSS, and native browser animation APIs. The repository contains the necessary source and configuration; dependencies, generated builds, credentials, and personal hosting state are ignored.

## Contributors

- **[Huzaifa Ali](https://github.com/Huzaifa5125)** — project owner and maintainer; portfolio content, requirements, and design direction.
- **OpenAI Codex** — AI-assisted implementation, layout refinement, animations, testing, and repository preparation under Huzaifa's direction.

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for attribution details.
