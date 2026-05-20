import http from 'http';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const targetHost = req.headers["x-host"];
  
  // صفحه اصلی (مثل index.html نتلیفای)
  if (!targetHost) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Railway Proxy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .card { background: white; border-radius: 20px; padding: 40px; max-width: 600px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { color: #333; margin-bottom: 10px; }
        .status { color: #10b981; font-weight: bold; margin: 20px 0; }
        code { background: #f4f4f5; padding: 2px 6px; border-radius: 6px; }
        pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 10px; text-align: left; overflow-x: auto; margin: 15px 0; }
        .example { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🚀 Railway Proxy</h1>
        <p class="status">✅ Active & Running</p>
        <p>Send request with <code>x-host</code> header</p>
        <div class="example">
            <strong>📖 Example:</strong><br>
            <code>curl -H "x-host: panel.xarheon.cn.mt" https://your-project.up.railway.app/cdn2</code>
        </div>
        <h3>📦 V2Ray Config:</h3>
        <pre>vless://4ce1bc18-e10c-4cab-8a8d-2b0a731427a4@your-project.up.railway.app:443?type=xhttp&encryption=none&path=%2Fcdn2&host=your-project.up.railway.app&mode=auto&x_padding_bytes=100-1000&security=tls&sni=your-project.up.railway.app&fp=chrome&headers=%7B%22x-host%22%3A%22panel.xarheon.cn.mt%22%7D#Railway</pre>
    </div>
</body>
</html>`);
    return;
  }
  
  // ساخت آدرس مقصد
  const targetUrl = targetHost.startsWith('http')
    ? `${targetHost}${url.pathname}${url.search}`
    : `https://${targetHost}${url.pathname}${url.search}`;
  
  // کپی هدرها (مثل نتلیفای)
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const k = key.toLowerCase();
    if (k === "host" || k === "x-host") continue;
    headers[key] = value;
  }
  headers["x-forwarded-for"] = "104.198.14.52";
  
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.text();
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(data);
  } catch (e) {
    console.error("Proxy error:", e.message);
    res.writeHead(200);
    res.end("OK");
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Railway Proxy running on port ${PORT}`));
