import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";

type Platform = "douyin" | "bilibili" | "xiaohongshu" | "kuaishou";

interface PlatformConfig {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  redirectUriEnv: string;
}

const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  douyin: {
    authorizeUrl: "https://open.douyin.com/platform/oauth/connect",
    tokenUrl: "https://open.douyin.com/oauth/access_token",
    scope: "user_info",
    clientIdEnv: "DOUYIN_CLIENT_ID",
    clientSecretEnv: "DOUYIN_CLIENT_SECRET",
    redirectUriEnv: "DOUYIN_REDIRECT_URI",
  },
  bilibili: {
    authorizeUrl: "https://passport.bilibili.com/register/pc/oauth/login",
    tokenUrl: "https://passport.bilibili.com/x/oauth2/access_token",
    scope: "info",
    clientIdEnv: "BILIBILI_CLIENT_ID",
    clientSecretEnv: "BILIBILI_CLIENT_SECRET",
    redirectUriEnv: "BILIBILI_REDIRECT_URI",
  },
  xiaohongshu: {
    authorizeUrl: "https://open.xiaohongshu.com/oauth/authorize",
    tokenUrl: "https://open.xiaohongshu.com/oauth/access_token",
    scope: "user_info",
    clientIdEnv: "XIAOHONGSHU_CLIENT_ID",
    clientSecretEnv: "XIAOHONGSHU_CLIENT_SECRET",
    redirectUriEnv: "XIAOHONGSHU_REDIRECT_URI",
  },
  kuaishou: {
    authorizeUrl: "https://open.kuaishou.com/oauth2/authorize",
    tokenUrl: "https://open.kuaishou.com/oauth2/access_token",
    scope: "user_info",
    clientIdEnv: "KUAISHOU_CLIENT_ID",
    clientSecretEnv: "KUAISHOU_CLIENT_SECRET",
    redirectUriEnv: "KUAISHOU_REDIRECT_URI",
  },
};

function isPlatform(value: string): value is Platform {
  return value in PLATFORM_CONFIG;
}

function getConfig(platform: Platform) {
  const cfg = PLATFORM_CONFIG[platform];
  const clientId = process.env[cfg.clientIdEnv];
  const clientSecret = process.env[cfg.clientSecretEnv];
  const redirectUri =
    process.env[cfg.redirectUriEnv] ??
    `http://localhost:4000/api/oauth/${platform}/callback`;
  return { cfg, clientId, clientSecret, redirectUri };
}

type AsyncRoute = (req: Request, res: Response) => Promise<void>;

function asyncHandler(fn: AsyncRoute) {
  return (req: Request, res: Response) => {
    fn(req, res).catch((err: unknown) => {
      console.error("[oauth] error", err);
      res.status(500).json({ error: "internal_error" });
    });
  };
}

export const oauthRouter = Router();

oauthRouter.get(
  "/:platform/auth-url",
  asyncHandler(async (req, res) => {
    const platform = req.params.platform;
    if (!isPlatform(platform)) {
      res.status(404).json({ error: "unknown_platform" });
      return;
    }
    const { cfg, clientId, redirectUri } = getConfig(platform);
    if (!clientId) {
      res
        .status(501)
        .json({ error: `${platform}_client_id not configured` });
      return;
    }
    const state = crypto.randomBytes(16).toString("hex");
    const params = new URLSearchParams({
      client_key: clientId,
      response_type: "code",
      scope: cfg.scope,
      redirect_uri: redirectUri,
      state,
    });
    const authorizeUrl = `${cfg.authorizeUrl}?${params.toString()}`;
    res.json({ platform, state, authorize_url: authorizeUrl });
  })
);

oauthRouter.get(
  "/:platform/callback",
  asyncHandler(async (req, res) => {
    const platform = req.params.platform;
    if (!isPlatform(platform)) {
      res.status(404).json({ error: "unknown_platform" });
      return;
    }
    const { cfg, clientId, clientSecret, redirectUri } = getConfig(platform);
    if (!clientId || !clientSecret) {
      res
        .status(501)
        .json({ error: `${platform} credentials not configured` });
      return;
    }
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    if (!code) {
      res.status(400).json({ error: "missing_code" });
      return;
    }
    const body = new URLSearchParams({
      client_key: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });
    const resp = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = (await resp.json()) as unknown;
    res.json({ platform, state, token: data });
  })
);

oauthRouter.post(
  "/:platform/refresh",
  asyncHandler(async (req, res) => {
    const platform = req.params.platform;
    if (!isPlatform(platform)) {
      res.status(404).json({ error: "unknown_platform" });
      return;
    }
    const { cfg, clientId, clientSecret } = getConfig(platform);
    if (!clientId || !clientSecret) {
      res
        .status(501)
        .json({ error: `${platform} credentials not configured` });
      return;
    }
    const refreshToken =
      typeof req.body?.refresh_token === "string"
        ? req.body.refresh_token
        : "";
    if (!refreshToken) {
      res.status(400).json({ error: "missing_refresh_token" });
      return;
    }
    const body = new URLSearchParams({
      client_key: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
    const resp = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = (await resp.json()) as unknown;
    res.json({ platform, token: data });
  })
);
