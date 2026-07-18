import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "node:http";
import { WebSocketServer } from "ws";
import { oauthRouter } from "./routes/oauth.js";
import { danmakuRouter, handleDanmakuWs } from "./routes/danmaku.js";

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

app.use("/api/oauth", oauthRouter);
app.use("/api/danmaku", danmakuRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "neon-deck-server" });
});

const port = Number(process.env.PORT ?? 4000);
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url ?? "", `http://localhost:${port}`);
  const platform = url.searchParams.get("platform") ?? "";
  const token = url.searchParams.get("token") ?? "";
  void handleDanmakuWs(ws, platform, token);
});

server.listen(port, () => {
  console.log(`[neon-deck-server] listening on :${port} (ws path: /ws)`);
  console.log(`[neon-deck-server] CLIENT_ORIGIN=${clientOrigin}`);
});
