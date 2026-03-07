import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "E-Absensi Backend is running",
      whatsappConfigured: !!process.env.FONNTE_TOKEN
    });
  });

  // Fonnte WhatsApp API Proxy (to keep token secure)
  app.post("/api/whatsapp/send", async (req, res) => {
    const { target, message } = req.body;
    const token = process.env.FONNTE_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "Fonnte token not configured" });
    }

    try {
      const response = await axios.post(
        "https://api.fonnte.com/send",
        {
          target,
          message,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("WhatsApp Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to send WhatsApp message" });
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
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
