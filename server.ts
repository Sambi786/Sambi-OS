import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // GitHub OAuth URL helper
  app.get("/api/auth/github/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/github/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID || "",
      redirect_uri: redirectUri,
      scope: "repo read:user",
      state: Math.random().toString(36).substring(7),
    });
    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ url });
  });

  // GitHub OAuth Callback
  app.get(["/auth/github/callback", "/auth/github/callback/"], async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const { access_token } = response.data;

      if (!access_token) {
        throw new Error("Failed to get access token");
      }

      // Store token in a secure cookie
      res.cookie("github_token", access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.send(`
        <html>
          <body style="background: #0d1117; color: white; display: flex; items-center; justify-content: center; height: 100vh; font-family: sans-serif;">
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <div style="text-align: center;">
              <h2>Authentication successful</h2>
              <p>Closing window...</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("OAuth exchange error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // Proxy for GitHub API
  app.get("/api/github/*", async (req, res) => {
    const token = req.cookies.github_token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const path = req.params[0];
    const query = new URLSearchParams(req.query as any).toString();
    const url = `https://api.github.com/${path}${query ? "?" + query : ""}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error(`GitHub API error (${url}):`, error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "API request failed" });
    }
  });

  // Auth Status
  app.get("/api/auth/github/status", (req, res) => {
    const token = req.cookies.github_token;
    res.json({ authenticated: !!token });
  });

  // Logout
  app.post("/api/auth/github/logout", (req, res) => {
    res.clearCookie("github_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ success: true });
  });

  // Real-world URL stream downloader proxy
  app.get("/api/download", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send("No target URL specified.");
    }

    try {
      let urlStr = targetUrl.trim();
      // Auto-prefix protocol if missing
      if (!/^https?:\/\//i.test(urlStr)) {
        urlStr = 'https://' + urlStr;
      }

      const response = await axios({
        method: 'get',
        url: urlStr,
        responseType: 'arraybuffer', // Get bin representation
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        },
        timeout: 15000
      });

      // Attempt to extract a reliable file name
      let filename = 'downloaded_resource';
      const dispositionHeader = response.headers['content-disposition'];
      const disposition = typeof dispositionHeader === 'string' ? dispositionHeader : '';
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename="?([^";]+)"?/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      } else {
        try {
          const u = new URL(urlStr);
          const segments = u.pathname.split('/');
          const last = segments[segments.length - 1];
          if (last && last.includes('.')) {
            filename = last;
          } else {
            const contentTypeHeader = response.headers['content-type'];
            const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : '';
            if (contentType.includes('html')) filename = 'index.html';
            else if (contentType.includes('json')) filename = 'data.json';
            else if (contentType.includes('javascript')) filename = 'script.js';
            else if (contentType.includes('css')) filename = 'style.css';
            else if (contentType.includes('image/png')) filename = 'image.png';
            else if (contentType.includes('image/jpeg')) filename = 'image.jpg';
            else if (contentType.includes('image/gif')) filename = 'image.gif';
            else if (contentType.includes('application/pdf')) filename = 'document.pdf';
            else if (contentType.includes('text')) filename = 'document.txt';
          }
        } catch(e) {}
      }

      const contentTypeHeaderFinal = response.headers['content-type'];
      if (contentTypeHeaderFinal) {
        res.setHeader('Content-Type', String(contentTypeHeaderFinal));
      }
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(response.data);
    } catch (error: any) {
      console.error("Downloader API proxy failed:", error.message);
      res.status(500).send(`Failed to fetch and package stream: ${error.message}`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
