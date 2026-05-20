import https from 'https';
import fs from 'fs';

// توجه: Render به طور خودکار گواهی SSL را مدیریت می‌کند.
// ما فقط به یک سرور ساده نیاز داریم که درخواست‌ها را بپذیرد.
const server = https.createServer(async (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  let targetHost = req.headers["x-host"];
  
  if (!targetHost) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("OK - Send x-host header");
    return;
  }

  targetHost = targetHost.replace(/^https?:\/\//, '');
  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

  try {
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      const k = key.toLowerCase();
      if (k === "host" || k === "x-host") continue;
      headers[key] = value;
    }
    headers["Host"] = targetHost.split(':')[0];
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
