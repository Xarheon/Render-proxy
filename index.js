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
    : `https://${targetHost}${url.pathname}${url.search}`;

  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      const k = key.toLowerCase();
      if (k === "host" || k === "x-host") continue;
      headers.set(key, value);
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== "GET" ? req.body : undefined
    });

    const data = await response.text();
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(data);
  } catch (e) {
    res.writeHead(200);
    res.end("OK");
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT);