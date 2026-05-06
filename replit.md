# ZYREAI

ZYREAI is an AI website builder platform with a comprehensive admin panel and user dashboard, accessible via web and a dedicated mobile app.

## Run & Operate

*   **Run Development Server (Web):** `pnpm dev`
*   **Run Development Server (Mobile):** Navigate to `mobile/`, then `npm install` and `npm start` (port 8080)
*   **Build:** `pnpm build`
*   **Build (Vercel):** `pnpm build:vercel`
*   **Typecheck:** `pnpm typecheck`
*   **Environment Variables:**
    *   Admin panel API keys (e.g., `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) can be set in Admin -> AI Settings or as Replit secrets.
    *   `EXPO_PUBLIC_API_URL` (for mobile app backend)

## Stack

*   **Framework:** Remix v2
*   **Runtime:** Cloudflare Workers/Pages (+ Vercel adapter)
*   **Build Tool:** Vite (`pnpm` v9.4.0)
*   **CSS:** UnoCSS + Tailwind CSS v3
*   **Mobile:** Expo React Native SDK 54 (`npm`)
*   **AI SDKs:** `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/groq`

## Where things live

*   **Web Application:** `app/`
    *   **Routes:** `app/routes/`
    *   **Admin Panel:** `app/routes/admin.*`
    *   **User Dashboard:** `app/routes/dashboard.*`
    *   **Homepage:** `app/routes/_index.tsx`
    *   **User Sessions:** `app/lib/user/session.server.ts`
    *   **Admin Data:** `app/lib/admin/data.server.ts` (in-memory)
    *   **AI Model Config:** `app/lib/.server/llm/`
*   **Mobile Application:** `mobile/`
    *   **Entrypoint:** `mobile/app/index.tsx`
    *   **EAS Build Config:** `mobile/eas.json`
    *   **APK Build Guide:** `mobile/BUILD_APK.md`
*   **API Endpoints:**
    *   `app/routes/api.admin.ts` (Admin CRUD)
    *   `app/routes/api.github-push.tsx` (GitHub integration)
    *   `app/routes/api.vercel-deploy.tsx` (Vercel integration)
*   **Cloudflare Worker:** `functions/[[path]].ts`, `wrangler.toml`
*   **Vercel Config:** `vercel.json`

## Architecture decisions

*   **Bolt.new backend fully removed:** All bolt.new specific code (WebContainer, runtime, stores, prompt-engine, persistence, hooks, chat/editor/workbench/sidebar/header components) has been deleted. Only ZYREAI's own admin, dashboard, site, and UI code remains.
*   **In-Memory Data Stores:** Admin panel and user data use in-memory stores for Cloudflare Workers compatibility, resetting on server restarts.
*   **Base64-Encoded Session Cookies:** Avoids `crypto.subtle` issues; cookie name is `__zyreai_user`, stores `userId`.
*   **Multi-Provider AI Fallback:** Prioritizes admin panel settings → Cloudflare env bindings → `process.env`.
*   **Dedicated Mobile App:** Standalone Expo React Native project in `mobile/` with EAS Build for APK.
*   **Mixed CSS:** UnoCSS for app components, Tailwind CSS v3 for landing/admin.

## Product

*   **AI-Powered Website Building:** Create websites using AI.
*   **Content Management:** Edit website sections via admin panel.
*   **User Dashboard:** Manage projects, templates, billing, and settings.
*   **Mobile Access:** Native app with EAS Build APK support.
*   **Admin Features:** Users, projects, AI engine, billing, deployments, analytics.
*   **Integrations:** GitHub and Vercel for deployment.

## User preferences

*   User prefers Urdu/Hindi language explanations.

## Gotchas

*   **Session Storage:** Always use base64-encoded cookies, never `createCookieSessionStorage`.
*   **No bolt.new libs:** Do NOT re-add `~/lib/stores`, `~/lib/runtime`, `~/lib/webcontainer`, `~/lib/prompt-engine`, `~/lib/persistence`, `~/lib/hooks` — all deleted.
*   **Theme:** Theme stored in `localStorage` key `bolt_theme`, set via `data-theme` on `<html>`.
*   **Tailwind Animations:** Use inline `style={{ animation: '...' }}` not Tailwind animate utilities.
*   **Mobile `npm`:** Mobile app uses `npm`, root uses `pnpm`.
*   **APK Build:** Use GitHub Actions workflow `.github/workflows/build-apk.yml` or `eas build`.

## Pointers

*   **Remix Docs:** https://remix.run/docs
*   **Cloudflare Workers:** https://developers.cloudflare.com/workers/
*   **Expo EAS Build:** https://docs.expo.dev/build/introduction/
*   **Vercel Deployment:** See `DEPLOYMENT.md`
