# OAuth + 弹幕 实测指引

本文件指导你如何用真实凭据走通后端的 OAuth 授权流和 B 站弹幕 WebSocket。

## 一、OAuth 全流程实测

### 1. 申请平台凭据

#### B 站（最易上手，无需企业认证）

1. 访问 https://passport.bilibili.com/register/pc/oauth/login 注册应用
2. 在应用管理后台获取：
   - `Client ID`（即 appkey）
   - `Client Secret`（即 appsecret）
3. 配置回调地址为：`http://localhost:4000/api/oauth/bilibili/callback`

#### 抖音（需企业认证 + 开放平台申请）

1. 访问 https://developer.open-douyin.com 创建应用
2. 申请「用户授权」能力，获取 `client_key` / `client_secret`
3. 配置回调地址同上格式

### 2. 配置环境变量

复制 `server/.env.example` 为 `server/.env`，填入凭据：

```bash
cd server
cp .env.example .env
# 编辑 .env 填入真实值
```

示例（B 站）：

```env
BILIBILI_CLIENT_ID=你的appkey
BILIBILI_CLIENT_SECRET=你的appsecret
BILIBILI_REDIRECT_URI=http://localhost:4000/api/oauth/bilibili/callback
```

### 3. 启动后端

```bash
cd server
npm install
npm run dev
# 看到 [neon-deck-server] listening on :4000
```

### 4. 走授权流（3 步）

**第 1 步：获取授权 URL**

```bash
curl http://localhost:4000/api/oauth/bilibili/auth-url
# 返回：{ platform, state, authorize_url }
```

**第 2 步：浏览器打开 authorize_url**

用户在 B 站登录并授权，B 站会带 `code` 和 `state` 回调到：
`http://localhost:4000/api/oauth/bilibili/callback?code=XXX&state=YYY`

后端校验 state（防 CSRF），用 code 换 access_token，返回 JSON。

**第 3 步：刷新 token（如需要）**

```bash
curl -X POST http://localhost:4000/api/oauth/bilibili/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"你的refresh_token"}'
```

### 5. state 校验机制说明

- `auth-url` 接口生成随机 state 存入内存 Map（TTL 10 分钟）
- `callback` 接口必须校验 state 存在、未过期、平台匹配
- 校验后立即删除（一次性），防重放攻击
- 生产环境应改用 Redis 持久化 state store

---

## 二、B 站弹幕 WebSocket 实测

B 站弹幕协议是公开的，无需 OAuth，只要有一个正在直播的房间号即可。

### 1. 确认房间号

打开任意 B 站直播间，URL 形如 `https://live.bilibili.com/12345`，其中 `12345` 就是房间号（可能是短号，后端会自动换算成真实 roomid）。

### 2. 连接弹幕 WS

后端已实现完整协议（16 字节帧头 / operation=7 鉴权 / 30s 心跳 / brotli 解压 / DANMU_MSG 解析）。

用任意 WebSocket 客户端连接：

```
ws://localhost:4000/ws?platform=bilibili&token=12345
```

其中 `token` 参数填**房间号**（不是 access_token）。

### 3. 用 wscat 测试

```bash
npm install -g wscat
wscat -c "ws://localhost:4000/ws?platform=bilibili&token=12345"
```

连接成功后会收到：

```json
{"type":"connected","platform":"bilibili"}
```

随后每 30s 收到在线人数心跳，直播间有弹幕时会收到：

```json
{
  "platform":"bilibili",
  "uid":"123456",
  "nickname":"用户名",
  "text":"弹幕内容",
  "ts":1700000000000
}
```

### 4. 协议实现细节（参考）

| 项 | 实现 |
|---|---|
| WS 地址 | `wss://broadcast-msg.chat.bilibili.com:7895/sub` |
| 帧头 | 16 字节：packet_length(4) / header_length(2) / protocol(2) / operation(4) / reserved(4) |
| 鉴权 | operation=7，body=JSON `{uid:0, roomid, protover:3, platform:"web", type:2, key}` |
| key 获取 | `GET /xlive/web-room/v1/index/getDanmuInfo?id={real_roomid}` |
| roomid 换算 | `GET /room/v1/Room/getInfo?room_id={input}` 取 `data.room_id` |
| 心跳 | 每 30s 发 operation=2（空 body），回 operation=8（4 字节在线人数） |
| 弹幕 | operation=5，protocol=3（brotli 压缩），解压后为多个子帧，cmd=`DANMU_MSG` |
| DANMU_MSG | `info[1]`=文本，`info[2][0]`=uid，`info[2][1]`=昵称 |

### 5. 常见问题

- **连接立即断开**：房间号无效或未在直播，检查 `getInfo` 返回
- **无弹幕**：该房间无人在直播或无弹幕，换个热门直播间测试
- **brotli 解压失败**：protover 用了 2（JSON），后端会兼容 protocol=0 的 JSON 帧
- **被 B 站封 IP**：高频重连会触发风控，生产环境要做重连退避

---

## 三、生产部署清单

- [ ] state store 改 Redis（多实例共享 + 持久化）
- [ ] token 加密存储（AES + KMS），不要明文入库
- [ ] CORS 限制精确域名（生产环境 `CLIENT_ORIGIN` 改正式域名）
- [ ] HTTPS 强制（OAuth callback 必须 HTTPS）
- [ ] WS 连接加速率限制（防滥用）
- [ ] 弹幕转发加敏感词过滤（复用前端 `ComplianceFilter` 逻辑）
- [ ] 日志脱敏（token/refresh_token 不能进日志）
