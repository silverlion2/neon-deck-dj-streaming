# NEON DECK Server

DJ 直播应用 NEON DECK 的独立后端服务，为前端 React + Vite 应用提供平台 OAuth 代理与弹幕 WebSocket 桥接。

## 用途

为前端 NEON DECK 提供两件前端无法独立完成的事情：

1. **OAuth 代理**：统一对接抖音 / B 站 / 小红书 / 快手的 OAuth 授权流程。
2. **弹幕 WebSocket 桥接**：在服务端维护到各平台弹幕 WS 的长连接，统一转发给前端。

## 为什么需要后端

前端直接对接平台开放平台存在两个硬性阻碍：

- **OAuth `client_secret` 不能暴露给前端**。浏览器端代码可被任意查看，把 secret 放到前端等于公开应用凭据。授权码换 token 这一步必须在服务端用 secret 调用平台 token 接口。
- **弹幕 WS 需要服务端维护长连接**。Vercel Serverless Functions 有执行时长限制（最长几分钟），无法承载持续在线的 WebSocket。弹幕协议还要求心跳保活、二进制帧解析、proto 反序列化，这些都不适合放在浏览器端。

因此前端负责展示与交互，后端负责凭据托管与长连接维护。

## 目录结构

```
server/
├── package.json          独立依赖与脚本
├── tsconfig.json         TypeScript 配置（ES2022 / ESNext / strict）
├── index.ts              Express + WebSocket 入口
├── routes/
│   ├── oauth.ts          OAuth 代理路由（auth-url / callback / refresh）
│   └── danmaku.ts        弹幕桥接骨架（DanmakuBridge + handleDanmakuWs）
├── .env.example          环境变量示例
└── README.md             本文档
```

## 开发运行

```bash
cd server
cp .env.example .env      # 按需填入各平台 client_id / client_secret
npm install
npm run dev               # tsx watch index.ts，默认监听 :4000
```

生产构建：

```bash
npm run build             # tsc -> dist/
npm start                 # node dist/index.js
```

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `PORT` | HTTP/WS 监听端口，默认 `4000` |
| `CLIENT_ORIGIN` | 允许跨域的前端来源，默认 `http://localhost:5173`（Vite 默认端口） |
| `DOUYIN_CLIENT_ID` / `DOUYIN_CLIENT_SECRET` | 抖音开放平台应用凭据 |
| `DOUYIN_REDIRECT_URI` | 抖音回调地址，默认 `http://localhost:4000/api/oauth/douyin/callback` |
| `BILIBILI_CLIENT_ID` / `BILIBILI_CLIENT_SECRET` | B 站开放平台应用凭据 |
| `BILIBILI_REDIRECT_URI` | B 站回调地址 |

小红书、快手只需按同样命名规则补充 `XIAOHONGSHU_*` / `KUAISHOU_*` 即可，路由已内置占位配置。

任一平台的 `client_id` 未配置时，对应接口返回 `501` 并提示该平台未配置。

## API 一览

### OAuth 代理

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/oauth/:platform/auth-url` | 返回授权 URL（拼好 `client_id` / `redirect_uri` / 随机 `state`） |
| GET | `/api/oauth/:platform/callback` | 平台回调，用 `code` 换 `access_token`，把 token 返回给前端 |
| POST | `/api/oauth/:platform/refresh` | 用 `refresh_token` 刷新 token，请求体 `{ refresh_token }` |

`:platform` 取值：`douyin` / `bilibili` / `xiaohongshu` / `kuaishou`。

### 弹幕桥接

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/danmaku/connect/:platform` | 返回连接说明与 WS 路径模板 |
| WS | `/ws?platform=:platform&token=ACCESS_TOKEN` | 升级为 WebSocket，服务端建立到平台弹幕 WS 的桥接并转发消息 |

### 健康检查

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 返回 `{ ok: true, service: "neon-deck-server" }` |

## 前端对接

前端在 NEON DECK 的「平台对接」入口里，按以下流程调用：

1. 发起授权：调用 `http://localhost:4000/api/oauth/:platform/auth-url`，拿到 `authorize_url` 与 `state`。
2. 重定向：`window.location.href = authorize_url`，用户在平台页面授权后回调到 `:platform/callback`。
3. 拿到 token：回调接口把平台返回的 token JSON 直接返回前端，前端持久化保存。
4. 连接弹幕：用 token 拼接 `ws://localhost:4000/ws?platform=:platform&token=...` 建立 WebSocket，后续服务端会把各平台弹幕统一成 `{ platform, uid, nickname, text, ts }` 转发过来。

## 部署建议

前端已部署到 Vercel，但 **后端不能放在 Vercel Serverless**：Serverless Function 有执行时长上限，无法承载弹幕长连接。

推荐部署到支持常驻进程 + WebSocket 的平台：

- [Render](https://render.com) — Web Service，免费档支持 WS
- [Railway](https://railway.app) — 容器化部署，原生支持 WS
- [Fly.io](https://fly.io) — 全球边缘节点，支持持久 WS

部署后：

1. 把环境变量里的 `CLIENT_ORIGIN` 改为线上前端域名。
2. 把各平台 `REDIRECT_URI` 改为线上后端域名对应的回调地址，并在各平台开放平台后台同步配置。
3. 前端把 API 基址与 WS 基址指向线上后端域名。

## 当前状态

本仓库为**骨架**：

- ✅ OAuth 代理流程框架已搭好（auth-url / callback / refresh 三段式 + 501 兜底 + async handler）。
- ✅ WebSocket Server 在同端口 `/ws` 路径就绪，`handleDanmakuWs` 已导出。
- ⚠️ 弹幕协议适配为占位实现，`routes/danmaku.ts` 中每个平台的 `connect()` 都标注了 TODO，说明了各平台 WS 协议差异（接入地址、鉴权方式、帧格式、心跳频率、消息类型），需按各平台开放平台文档逐个补全。

参考文档（需登录开放平台后台查看）：

- 抖音开放平台：<https://developer.open-douyin.com/>
- 哔哩哔哩开放平台：<https://open.bilibili.com/>
- 小红书开放平台：<https://open.xiaohongshu.com/>
- 快手开放平台：<https://open.kuaishou.com/>

## 安全提醒

生产环境上线前务必处理：

- **校验 `state`**：当前 `auth-url` 生成了随机 `state` 但回调里未做校验。应在 session / redis 里保存 `state`，回调时比对，防止 CSRF。
- **HTTPS**：回调地址与 WS 都要走 `https` / `wss`，避免 token 在中间链路被嗅探。
- **token 加密存储**：前端拿到的 `access_token` / `refresh_token` 不要明文存 localStorage，建议由后端加密落库并下发短期 session。
- **限制 CORS 来源**：`CLIENT_ORIGIN` 必须精确到线上域名，不要用 `*`。
- **凭据不入仓库**：`.env` 必须加入 `.gitignore`，密钥走平台环境变量注入。
