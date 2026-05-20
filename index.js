import http from 'http';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const targetHost = req.headers["x-host"];
  
  if (!targetHost) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("OK - Send x-host header");
    return;
  }

  const targetUrl = targetHost.startsWith('http') 
    ? `${targetHost}${url.pathname}${url.search}`
    : `http://${targetHost}${url.pathname}${url.search}`;

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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`xHTTP Proxy running on port ${PORT}`));
