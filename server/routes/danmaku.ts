import { Router, type Request, type Response } from "express";
import type { WebSocket } from "ws";

type Platform = "douyin" | "bilibili" | "xiaohongshu" | "kuaishou";

interface DanmakuMessage {
  platform: Platform;
  uid?: string;
  nickname?: string;
  text: string;
  ts: number;
}

abstract class DanmakuBridge {
  protected readonly platform: Platform;
  protected readonly clientWs: WebSocket;
  protected platformWs: WebSocket | null = null;

  constructor(platform: Platform, clientWs: WebSocket) {
    this.platform = platform;
    this.clientWs = clientWs;
  }

  abstract connect(token: string): Promise<void>;
  abstract close(): void;

  protected forwardToClient(message: DanmakuMessage): void {
    if (this.clientWs.readyState === this.clientWs.OPEN) {
      this.clientWs.send(JSON.stringify(message));
    }
  }
}

class DouyinDanmakuBridge extends DanmakuBridge {
  async connect(_token: string): Promise<void> {
    // TODO 抖音直播弹幕协议差异：
    // - 接入入口为 wss://webcast5-ws-web-lf.douyinpc.com/webcast/im/push/v2，
    //   需要先调用 https://webcast-open.douyin.com/webcast/fetch/ 获取 roomid、ttwid cookie 与 signature
    // - 鉴权使用 access_token + roomid + sign(open_id, roomid, timestamp, nonce)，signature 算法为 HMAC-SHA256
    // - 鉴权握手包体为 protobuf，proto 定义见开放平台 douyin/im/Action 子包
    // - 心跳包每 15s 发送一次 ack 帧，否则服务端会主动断连
    // - 弹幕消息体为 PushFrame 包装的 Message，需按 proto 解出 Common 字段下的 method=RoomChatMessage
  }
  close(): void {
    this.platformWs?.close();
    this.platformWs = null;
  }
}

class BilibiliDanmakuBridge extends DanmakuBridge {
  async connect(_token: string): Promise<void> {
    // TODO B 站直播弹幕协议差异：
    // - 接入入口为 wss://broadcast-msg.chat.bilibili.com:7895/sub
    // - 帧格式为固定 16 字节头（packet_length / header_length / protocol_version / operation）+ body
    // - 鉴权包 operation=7(AUTH)，body 为 JSON：{ uid, roomid, protover:3, platform:"web", type:2, key }
    //   key 需先通过 https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?id=real_roomid 拉取
    // - roomid 需用 https://api.live.bilibili.com/room/v1/Room/getInfo?room_id=xxx 短号换算成真实房间号
    // - 心跳包每 30s 发送一次 operation=2(HEARTBEAT)，body 为空，服务端回 operation=8 在线人数
    // - 弹幕为 operation=5(SMALL_HEARTBEAT)/operation=5(NOTICE) 下 cmd="DANMU_MSG" 的 JSON
  }
  close(): void {
    this.platformWs?.close();
    this.platformWs = null;
  }
}

class XiaohongshuDanmakuBridge extends DanmakuBridge {
  async connect(_token: string): Promise<void> {
    // TODO 小红书直播弹幕协议差异：
    // - 开放平台 https://open.xiaohongshu.com 直播弹幕 WS 接入需企业认证后申请白名单
    // - 接入地址与 appKey 绑定，鉴权使用 access_token + liveStreamId + 签名
    // - 帧格式为 length-prefixed JSON，消息类型 chat / gift / like / enter
    // - 与抖音/B站不同，小红书未公开稳定 proto，需以企业接口文档为准
  }
  close(): void {
    this.platformWs?.close();
    this.platformWs = null;
  }
}

class KuaishouDanmakuBridge extends DanmakuBridge {
  async connect(_token: string): Promise<void> {
    // TODO 快手直播弹幕协议差异：
    // - 接入入口为 wss://live-ws.kuaishou.com/websocket，需 appId + accessToken + liveStreamId
    // - 鉴权握手为自定义二进制帧：header(8B) + payload，payload 为 CSAGSocketUserAuthP 包
    // - 心跳包每 10s 一次，类型为 PING，服务端回 PONG
    // - 弹幕 payload 为 CSWebcastLiveMessage，需按 .proto 反序列化出 content / userName
    // - 与 B 站二进制帧不同，快手用 varint length-prefixed protobuf，无 JSON 文本帧
  }
  close(): void {
    this.platformWs?.close();
    this.platformWs = null;
  }
}

function isPlatform(value: string): value is Platform {
  return (
    value === "douyin" ||
    value === "bilibili" ||
    value === "xiaohongshu" ||
    value === "kuaishou"
  );
}

function createBridge(
  platform: Platform,
  clientWs: WebSocket
): DanmakuBridge | null {
  switch (platform) {
    case "douyin":
      return new DouyinDanmakuBridge(platform, clientWs);
    case "bilibili":
      return new BilibiliDanmakuBridge(platform, clientWs);
    case "xiaohongshu":
      return new XiaohongshuDanmakuBridge(platform, clientWs);
    case "kuaishou":
      return new KuaishouDanmakuBridge(platform, clientWs);
    default:
      return null;
  }
}

export async function handleDanmakuWs(
  ws: WebSocket,
  platform: string,
  token: string
): Promise<void> {
  if (!platform || !token) {
    ws.close(4001, "missing platform or token");
    return;
  }
  if (!isPlatform(platform)) {
    ws.close(4002, "unknown platform");
    return;
  }
  const bridge = createBridge(platform, ws);
  if (!bridge) {
    ws.close(4002, "unsupported platform");
    return;
  }
  ws.on("message", (data) => {
    void data;
  });
  ws.on("close", () => {
    bridge.close();
  });
  try {
    await bridge.connect(token);
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "connected", platform }));
    }
  } catch (err: unknown) {
    console.error("[danmaku] connect failed", err);
    ws.close(1011, "connect failed");
  }
}

export const danmakuRouter = Router();

danmakuRouter.get("/connect/:platform", (req: Request, res: Response) => {
  const platform = req.params.platform;
  res.json({
    platform,
    ws_path: `/ws?platform=${encodeURIComponent(platform)}&token=ACCESS_TOKEN`,
    note: "Real danmaku WebSocket endpoints must be wired per open-platform docs (see routes/danmaku.ts TODO).",
  });
});
