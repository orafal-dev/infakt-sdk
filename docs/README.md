# infakt-sdk documentation

Next.js site powered by [Fumadocs](https://www.fumadocs.dev/docs), built as a **static export** for GitHub Pages.

**Live:** https://orafal-dev.github.io/infakt-sdk/docs/

## Commands

```bash
bun install
bun run dev      # http://localhost:3000/docs
bun run build    # writes static site to out/
```

GitHub Pages build (from CI):

```bash
NEXT_PUBLIC_BASE_PATH=/infakt-sdk bun run build
```

## Content

Edit MDX in `content/docs/`. Sidebar order: `content/docs/meta.json`.

## Deploy

`.github/workflows/docs-pages.yml` runs on push to `main`. Enable **Settings → Pages → Build and deployment → GitHub Actions** once per repository.
