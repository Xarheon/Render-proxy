import http from 'http';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let targetHost = req.headers["x-host"];
  
  if (!targetHost) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("OK - Send x-host header");
    return;
  }

  // ساخت URL مقصد دقیقاً از روی x-host
  let targetUrl;
  if (targetHost.startsWith('http')) {
    targetUrl = `${targetHost}${url.pathname}${url.search}`;
  } else {
    targetUrl = `https://${targetHost}${url.pathname}${url.search}`;
  }
  
  console.log(`Proxying to: ${targetUrl}`);

  try {
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      const k = key.toLowerCase();
      if (k === "host" || k === "x-host") continue;
      headers[key] = value;
    }
    
    // تنظیم هدر Host برای سرور پنل
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
    res.end(`Proxy Error: ${e.message}`);
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
