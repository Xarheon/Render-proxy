import https from 'https';
import fs from 'fs';

// Render به طور خودکار گواهی SSL فراهم میکنه
const server = https.createServer(async (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const targetHost = req.headers["x-host"];
  
  if (!targetHost) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("OK - Send x-host header");
    return;
  }

  const targetUrl = targetHost.startsWith('http') 
    ? `${targetHost}${url.pathname}${url.search}`
    : `https://${targetHost}${url.pathname}${url.search}`;

  try {
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      const k = key.toLowerCase();
      if (k === "host" || k === "x-host") continue;
      headers[key] = value;
    }
    headers["x-forwarded-for"] = "104.198.14.52";

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== "GET" ? req.body : undefined
    });

    const data = await response.text();
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(data);
  } catch (e) {
    console.error("Proxy error:", e.message);
    res.writeHead(502);
    res.end("Proxy Error");
  }
});

const PORT = process.env.PORT || 443;
server.listen(PORT, () => console.log(`HTTPS Proxy running on port ${PORT}`));
