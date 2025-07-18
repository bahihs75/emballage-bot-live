<<<<<<< HEAD
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function deployToNetlify(htmlContent, fileName) {
  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, htmlContent, 'utf8');

  const form = new FormData();
  form.append('files[]', fs.createReadStream(filePath), { filepath: fileName });

  const response = await fetch(`https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NETLIFY_TOKEN}`,
    },
    body: form,
  });

  const data = await response.json();
  fs.unlinkSync(filePath);
  return data.deploy_ssl_url + '/' + fileName;
}

module.exports = deployToNetlify;
=======
≈≈require("dotenv").config();
const fs = require("fs");
const path = require("path");
cconst fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function deployToNetlify(htmlContent, filename = "index.html") {
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, htmlContent);

  const response = await fetch(
    `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NETLIFY_TOKEN}`,
      },
      body: JSON.stringify({
        files: {
          [`/${filename}`]: htmlContent,
        },
      }),
    }
  );

  const result = await response.json();
  const url = `${result.deploy_ssl_url}/${filename}`;
  return url;
}

module.exports = deployToNetlify;

>>>>>>> 4002ece (Initial commit)
