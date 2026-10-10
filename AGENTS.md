# AGENTS.md

Static website for [Photok](https://github.com/leonlatsch/Photok), served from `main` by GitHub Pages at https://photok.app (`CNAME`, `.nojekyll`). Plain HTML/CSS/JS, no framework. The only build step is the blog generator described below.

**This repo is public.** Never commit private content, and keep CI fork-safe (no secrets, no write-token steps on untrusted triggers).

## Blog

### Layout

| Path | What it is | Edit? |
| --- | --- | --- |
| `content/blog/*.md` | Posts: YAML front matter + Markdown | Yes (source of truth) |
| `content/blog/_template.md` | Copy-me template; files starting with `_` are skipped | Yes |
| `templates/blog-post.html`, `templates/blog-index.html` | Page templates with `{{placeholder}}`s | Yes |
| `templates/partial-nav.html`, `templates/partial-footer.html` | Nav and footer injected into blog pages | Yes |
| `blog/blog.css` | Blog styles (on top of the root `style.css`) | Yes |
| `scripts/build-blog.mjs` | The generator (Node, deps: `marked`, `yaml`) | Yes |
| `blog/index.html`, `blog/<slug>/index.html`, `blog/feed.xml` | Generated output | **No**, it gets overwritten |
| `sitemap.xml` between `<!-- blog:start -->` and `<!-- blog:end -->` | Generated blog entries | **No** (the rest of the file is hand-maintained) |

The partials are only used by blog pages. The other pages (`index.html`, `faq/`, `privacy/`, …) have their own copies of the nav and footer, so change them in both places.

### Writing a post

1. Copy `content/blog/_template.md` to `content/blog/<slug>.md`. The file name is the URL: `/blog/<slug>/`. Slugs must match `^[a-z0-9]+(-[a-z0-9]+)*$`.
2. Front matter:
   - Required: `title`, `description`, `date` (`YYYY-MM-DD`), `author`
   - Optional: `updated` (`YYYY-MM-DD`), `author_url`, `tags` (list), `image` (cover and social preview), `slug` (overrides the file name), `draft: true` (excluded from the build, but **still public on GitHub**)
3. Body: Markdown. Start sections at `##`, because the title is already the page's `h1`. Reading time is computed at ~200 words/min.
4. Example post: `content/blog/how-to-back-up-photok.md`.

Facts about the app in posts should match `faq/index.html`. Don't invent features.

### Building

```sh
cd scripts && npm ci && npm run build
```

The build:
- renders each non-draft post to `blog/<slug>/index.html`, with meta/OG/Twitter tags and `BlogPosting` JSON-LD
- renders `blog/index.html` (newest first, slug as tiebreaker) and `blog/feed.xml` (RSS)
- rewrites the blog block in `sitemap.xml`
- deletes `blog/<slug>/` folders whose post was removed, renamed or made a draft. It only deletes folders that contain the generated marker, so hand-made folders under `blog/` are safe.

It fails loudly on missing front matter, bad dates, invalid or duplicate slugs, unknown template placeholders, and missing sitemap markers.

The output is deterministic (dates come from posts, not the clock), so an unchanged rebuild produces no diff. Keep it that way.

### Deployment

`.github/workflows/build-blog.yml` runs on pushes to `main` that touch `content/blog/`, `templates/`, `scripts/`, `sitemap.xml` or the workflow itself, and can also be started manually. It builds and commits `blog/` and `sitemap.xml` back to `main` as `github-actions[bot]`, and GitHub Pages deploys that. Committing locally built output is fine too, because CI then finds nothing to change.

It deliberately runs only on `push` (never `pull_request`), because it has `contents: write`. Actions are pinned to commit SHAs. Keep both of these when editing it.

### Changing the generator or templates

- Templates use `{{name}}` placeholders, substituted in a single pass. An unknown placeholder is a build error. When you add one, pass it in `renderPost` / `renderIndex`.
- Escape every front-matter value with `escapeHtml` before putting it in HTML. JSON-LD goes through `jsonLd()`, which escapes `<`.
- Post HTML is inserted without re-indenting, because whitespace inside `<pre>` matters.
- Keep `GENERATED_MARKER` in the templates (as `{{generated_marker}}`). Stale-folder cleanup depends on it.
- After any change, run the build and check the diff in `blog/` and `sitemap.xml`.
