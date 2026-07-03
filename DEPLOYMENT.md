# Deploying to Netlify

## Why 4 separate sites?

This app uses **Module Federation** (Rspack). Each remote (`catalog`, `cart`, `account`)
is an independently deployed static site that exposes a `remoteEntry.js`. The host shell
loads those files at runtime from their live URLs.

You cannot deploy this as a single Netlify site.

---

## Step 1 — Deploy the three remotes

Create a separate Netlify site for each remote. In the Netlify UI:

| Remote | Base directory | Build command | Publish directory |
|--------|---------------|---------------|-------------------|
| catalog | `demo-app/catalog` | `npm run build` | `demo-app/catalog/dist` |
| cart | `demo-app/cart` | `npm run build` | `demo-app/cart/dist` |
| account | `demo-app/account` | `npm run build` | `demo-app/account/dist` |

For each remote, set one environment variable in **Site configuration → Environment variables**:

```
PUBLIC_URL = https://<that-site>.netlify.app/
```

> `PUBLIC_URL` must end with a trailing slash. It tells Rspack where to serve
> chunk files from — without it, lazy-loaded chunks will 404.

After deploying, note each site's URL. You will need them in Step 2.

---

## Step 2 — Deploy the host

The root `netlify.toml` already points Netlify at `demo-app/host`. Before triggering a
build, set these environment variables in **Site configuration → Environment variables**:

```
CATALOG_URL  = https://<catalog-site>.netlify.app
CART_URL     = https://<cart-site>.netlify.app
ACCOUNT_URL  = https://<account-site>.netlify.app
PUBLIC_URL   = https://<host-site>.netlify.app/
```

> These are read by `rspack.config.ts` **at build time**, not runtime. If you
> change a remote URL later you must rebuild the host.

Then deploy. The composed app will be live at the host site's URL.

---

## Redeploy checklist

| Change | What to redeploy |
|--------|-----------------|
| Code change in a remote | That remote only |
| Remote URL changed (site rename etc.) | Update host env var → rebuild host |
| Code change in host | Host only |
| Shared dependency version bump | All four sites |

---

## Local development

All four apps must run simultaneously:

```bash
# In four separate terminals:
cd demo-app/catalog  && npm run dev   # :3001
cd demo-app/cart     && npm run dev   # :3002
cd demo-app/account  && npm run dev   # :3003
cd demo-app/host     && npm run dev   # :3000  ← open this in the browser
```
