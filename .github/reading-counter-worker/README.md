# ITIGRE reading counter (Cloudflare Worker + D1)

GitHub Pages uses the production Cloudflare D1 counter by default. The owner approved starting a new count at cutover because the legacy service rejected the site's identifier and no historical values could be verified.

## Privacy and counting

- One counted visit per tab's `sessionStorage` ID per page while the Worker retains that ID.
- No cookies, IP addresses, user agents, or identifiable browser fingerprints are stored in D1.
- Counter values are approximate visits, **not unique people**, and can be manipulated by automated clients. The Origin check is not authentication.
- Anonymous visit IDs are deleted daily after seven days. Page totals stay indefinitely.
- The page URL is normalized and hashed (SHA-256, first 16 bytes) by the existing site script before sending the request. Different articles use different keys.
- The existing 6pt handwritten front-end and per-page accent-line placement are unchanged.

## Deploy: Cloudflare account owner action required

1. In the Cloudflare account that hosts the existing Workers, create a **new** D1 database named `itigre-reading-counter`. Do not modify the CMS authentication Worker.
2. Use Wrangler with Cloudflare authorization: `npx wrangler d1 create itigre-reading-counter` if it does not already exist. Record the returned database UUID.
3. In this directory, copy `wrangler.toml.example` to `wrangler.toml`, substitute the real D1 database UUID for `REPLACE_WITH_D1_DATABASE_ID` (never paste an API token in the repository).
4. Run `npx wrangler d1 migrations apply itigre-reading-counter --remote`.
5. Deploy with `npx wrangler deploy` from this directory, or connect this directory as a Worker project to Cloudflare Builds. Verify `https://<actual-worker-host>/v1/health` returns `{"ok":true}`.
6. If using a different verified Worker, set the GitHub Actions variable `ITIGRE_READING_COUNTER_D1_ENDPOINT` to its HTTPS `/v1/count` URL without a query or fragment.
7. Trigger the `Deploy ITIGRE to GitHub Pages` workflow. With no override, it injects the production D1 endpoint.
8. Confirm the number appears on the homepage and at least two articles, each has its own total, and refreshing within the same tab does not increase the count. Verify mobile layout.

### Rollback

Set the GitHub Actions repository variable `ITIGRE_READING_COUNTER_MODE` to `legacy` and rerun the GitHub Pages deployment to use the legacy transport. Keep the D1 database and its counts. To resume D1, clear the mode variable and rerun the workflow.

### Historical counts

The D1 database starts at zero unless previous values are *verified* and seeded. The page-key derivation is intentionally compatible with the current Moe Counter: SHA-256 of `itigre.com` + canonical path, first 16 bytes in hex. Verify each old value first; to seed a page, use a D1 upsert to set its `view_count`. **Do not assume historical counts automatically migrate**, and do not run both providers for the same view.

### Notes

- The deployment variable contains a public API URL, not a secret.
- If the database or network is unavailable, the script hides the number and leaves the article readable.
- Cloudflare D1 and Worker usage is subject to account-level limits and charges outside free quotas.
