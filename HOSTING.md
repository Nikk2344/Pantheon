# Free hosting and a database

The current Astro site builds to static files. It does not need a continuously running server. For an initial zero-cost deployment, use Cloudflare Pages and its included `pages.dev` address. A separately purchased domain is optional.

## Publish the current project

1. Put the `pantheon` project in a GitHub or GitLab repository. Keep `node_modules`, `.astro`, `.shots`, and local credentials out of it.
2. In Cloudflare Pages, connect that repository and choose Astro.
3. If the repository contains the parent folder, set the root directory to `pantheon`. If the repository is this project itself, leave the root at its default.
4. Set the build command to `npm run build`, output directory to `dist`, and `NODE_VERSION` to `24`.
5. Deploy. Later pushes rebuild the site. The browser simulations run on visitors’ devices.

Cloudflare’s documented free limits include 500 builds per month and 20,000 files per site. Free service is subject to quotas and changing terms; it is not unlimited infrastructure. See the [Astro deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) and [Pages limits](https://developers.cloudflare.com/pages/platform/limits/). Checked 26 September 2026.

## A database for the next stage

Supabase provides managed PostgreSQL and an editing dashboard. Its current Free plan includes a 500 MB database and 1 GB file storage; projects may pause after a week of inactivity. Automatic backups are not included in Free. See [current pricing](https://supabase.com/pricing).

Recommended architecture: editors maintain content in the database; a publishing action triggers an Astro build; visitors read the resulting static pages. This keeps routine traffic off the database and preserves fast, searchable pages. Store images separately, with their attribution metadata.

Suggested tables:

- `people`: stable slug, display name, dates, category, summary, biography, publication status.
- `contributions`: stable id, person id, title, date label, explanation, significance, registered interactive id.
- `sources`: citation title, URL, note; link citations to the claims they support.
- `topics` and `topic_people`: guides and their associated figures.
- `people_relations`: explicit links between figures.
- `revisions`: editorial change history.

The built `/catalogue.json` export now contains versioned public profile records, biographies, contributions, sources, topics, and learning paths. It provides a migration input; **it is not a connected database or an editing interface**. The current source of truth remains `src/content/people/*.mdx`.

Before migrating, add a validated content loader, draft/publish workflow, and editor authentication. Database write credentials must stay on the server. Enable row-level security and keep public clients read-only for published records. Store externally edited biographies as sanitized Markdown or structured blocks; do not execute arbitrary database content as MDX code. Add private, per-user tables only when implementing cloud notebooks—current notes remain in browser storage.

No hosting account, database, credentials, or deployment has been created by this release.

The modern research release also exports team-attributed innovation records, their article bodies, source notes, and related IDs. These are stored in `src/content/innovations/*.mdx`; they remain static content.
