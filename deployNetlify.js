const fs = require('node:fs/promises');
const path = require('node:path');

const NETLIFY_TIMEOUT_MS = 30_000;

async function deployToNetlify(htmlContent, fileName = 'index.html') {
  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_TOKEN;
  if (!siteId || !token) {
    throw new Error('NETLIFY_SITE_ID and NETLIFY_TOKEN are required.');
  }

  const safeFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '-');
  const form = new FormData();
  form.append('files[]', new Blob([htmlContent], { type: 'text/html; charset=utf-8' }), { filename: safeFileName });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NETLIFY_TIMEOUT_MS);
  try {
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}/deploys`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.deploy_ssl_url) {
      const reason = payload.message || payload.error || `Netlify returned HTTP ${response.status}.`;
      throw new Error(`Deployment failed: ${reason}`);
    }
    return `${payload.deploy_ssl_url}/${encodeURIComponent(safeFileName)}`;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = deployToNetlify;
