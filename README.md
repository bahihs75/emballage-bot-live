# Emballage Bot Live

Emballage Bot Live turns a Telegram conversation into a shareable Arabic product page. The bot collects a product photo, name, price, and brand, then publishes a responsive RTL storefront page with a validated order form. Orders are delivered through a server-side Netlify Function so the Telegram bot token is never placed in public HTML.

## Product promise

The strongest version of this project is not only a page generator. It is a lightweight commerce bridge for sellers who already work in Telegram and need a credible product page without managing a full store. The current release focuses on the smallest useful loop: collect product data, publish a page, receive an order.

## Architecture

```text
Telegram user
    │
    ▼
Telegram polling bot (index.js)
    ├── validates conversation input
    ├── downloads the Telegram photo server-side
    ├── renders an escaped Arabic RTL page
    └── deploys one static HTML artifact to Netlify
                                      │
                                      ▼
                         Product page + order form
                                      │
                                      ▼
                  Netlify Function: create-order.js
                                      │
                                      ▼
                         Telegram admin notification
```

The bot flow is intentionally modular. `src/validation.js` owns input rules, `src/template.js` owns HTML rendering and escaping, `deployNetlify.js` owns the external deployment boundary, and `netlify/functions/create-order.js` owns server-side order intake. The bot entry point wires these pieces together rather than containing all business logic inline.

## Requirements

Use Node.js 20 or newer. The runtime is intentionally pinned to a modern version because the project uses the built-in `fetch`, `FormData`, `Blob`, and `AbortSignal.timeout` APIs.

## Installation

```bash
npm install
```

Create a local `.env` file. Do not commit it:

```dotenv
TELEGRAM_TOKEN=replace_with_a_new_bot_token
TELEGRAM_ADMIN_ID=replace_with_the_admin_chat_id
NETLIFY_SITE_ID=replace_with_the_netlify_site_id
NETLIFY_TOKEN=replace_with_a_netlify_personal_access_token
ORDER_ENDPOINT=/.netlify/functions/create-order
```

`ORDER_ENDPOINT` is optional and defaults to `/.netlify/functions/create-order`. Set it to a full HTTPS URL only when the function is hosted separately.

## Run

Start the bot locally:

```bash
npm start
```

The bot accepts `/start`, `/restart`, `/cancel`, and `/help`. A normal session is: photo → product name → price → brand → deployed page URL.

The Netlify Function is deployed with the static page. Netlify must be configured with `netlify/functions` as its functions directory. A minimal `netlify.toml` is included in this repository.

## Test and verify

Run syntax checks and unit tests:

```bash
npm run check
npm test
```

The unit tests cover HTML escaping, price validation, product validation, and order validation. They do not call Telegram or Netlify, so they run without credentials.

## Security notes

The Telegram token must exist only in environment variables on the bot and function runtimes. The product page contains a server-generated image data URI rather than a Telegram file URL, which prevents the public page from leaking the bot token. The order form posts to a server-side function; it does not call Telegram from the browser.

The repository previously contained generated HTML with an exposed Telegram bot token. That token must be revoked and replaced in BotFather immediately. Removing the files from the current tree does not remove the secret from Git history. A separate history rewrite and secret-scanning review should be performed before treating the repository as clean.

The current order receiver has no durable order database or idempotency store. It is appropriate for an early pilot, but duplicate submissions, analytics, order status, and audit history require persistent storage before serious volume.

## Environment variables

| Variable | Purpose | Required | Example |
|---|---|---:|---|
| `TELEGRAM_TOKEN` | Bot authentication and server-side file retrieval | Yes | `123456:replace-me` |
| `TELEGRAM_ADMIN_ID` | Telegram destination for new orders | Yes | `123456789` |
| `NETLIFY_SITE_ID` | Target Netlify site | Yes | `site-id` |
| `NETLIFY_TOKEN` | Netlify deployment credential | Yes | `nfp_...` |
| `ORDER_ENDPOINT` | Public order function URL | No | `/.netlify/functions/create-order` |

## Release checklist

Before production use, rotate the historical Telegram credential, configure Netlify environment variables, test a real page on mobile, submit one order, confirm the Telegram notification, and inspect the generated page source to ensure no secret appears. Then add a persistent order store, rate limiting, idempotency, privacy copy, and an admin status workflow.

## License

The repository currently has no product-specific license. Add one before accepting outside contributions or distributing the project.
