import express from "express";
import path from "path";
import axios from "axios";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // --- Strava OAuth API ---

  // 1. Get the Auth URL
  app.get("/api/auth/strava/url", (req, res) => {
    // Injecting keys from user's print directly to simplify the process
    const clientId = process.env.STRAVA_CLIENT_ID || "229584";
    
    // Ensure we use the exact public URL of the app instance, not an internal 'localhost'
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const clientOrigin = req.query.origin ? String(req.query.origin) : `${protocol}://${host}`;
    
    if (!clientId) {
      return res.status(500).json({ error: "STRAVA_CLIENT_ID not configured" });
    }

    const redirectUri = process.env.STRAVA_REDIRECT_URI || `${clientOrigin}/api/auth/strava/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      approval_prompt: "auto",
      scope: "read,activity:read_all",
    });

    const authUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // 2. Callback handler (Token Exchange)
  app.get(["/api/auth/strava/callback", "/api/auth/strava/callback/"], async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      const response = await axios.post("https://www.strava.com/oauth/token", {
        client_id: process.env.STRAVA_CLIENT_ID || "229584",
        client_secret: process.env.STRAVA_CLIENT_SECRET || "a6e2ebd6894fbbc7ab849e8c35f676f1cbab24ff",
        code,
        grant_type: "authorization_code",
      });

      const { access_token, refresh_token, expires_at, athlete } = response.data;

      // Send success message to parent window and close popup
      // We pass the tokens back to the client so it can store them (e.g. in Firestore)
      // NOTE: In a production app, you'd store these in a session or database, 
      // but here we pass them to the client-side app to persist in Firestore via Firebase Auth UID.
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'STRAVA_AUTH_SUCCESS',
                  payload: ${JSON.stringify({ access_token, refresh_token, expires_at, athlete })}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Conexão com Strava bem-sucedida! Esta janela fechará automaticamente.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Strava token exchange error:", error.response?.data || error.message);
      res.status(500).send("Erro ao trocar código por token do Strava");
    }
  });

  // --- Strava Data Proxy ---
  app.get("/api/strava/activities", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 10 }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
