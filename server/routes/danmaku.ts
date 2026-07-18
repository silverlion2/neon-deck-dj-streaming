import { Router, type Request, type Response } from "express";
import type { WebSocket } from "ws";
import { WebSocket as WsClient } from "ws";
import { brotliDecompressSync as zlibBrotliDecompressSync } from "zlib";

type Platform = "douyin" | "bilibili" | "xiaohongshu" | "kuaishou";

interface DanmakuMessage {
  platform: Platform;
  uid?: string;
  nickname?: string;
  text: string;
  ts: number;
}

const BILI_HEADER_LENGTH = 16;
const BILI_OPERATION_AUTH = 7;
const BILI_OPERATION_HEARTBEAT = 2;
const BILI_OPERATION_HEARTBEAT_REPLY = 8;
const BILI_OPERATION_MESSAGE = 5;
const BILI_PROTOCOL_JSON = 0;
const BILI_PROTOCOL_BROTLI = 3;
const BILI_WS_URL = "wss://broadcast-msg.chat.bilibili.com:7895/sub";
const BILI_GET_INFO_URL = "https://api.live.bilibili.com/room/v1/Room/getInfo?room_id=";
const BILI_GET_DANMU_INFO_URL = "https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?id=";

interface BiliAuthBody {
  uid: number;
  roomid: number;
  protover: number;
  platform: string;
  type: number;
  key: string;
}

function buildBiliPacket(operation: number, body: Buffer, protocol = BILI_PROTOCOL_JSON): Buffer {
  const packetLength = BILI_HEADER_LENGTH + body.length;
  const header = Buffer.alloc(BILI_HEADER_LENGTH);
  header.writeUInt32BE(packetLength, 0);
  header.writeUInt16BE(BILI_HEADER_LENGTH, 4);
  header.writeUInt16BE(protocol, 6);
  header.writeUInt32BE(operation, 8);
  header.writeUInt32BE(1, 12);
  return Buffer.concat([header, body]);
}

function parseBiliHeader(buf: Buffer): { packetLength: number; headerLength: number; protocol: number; operation: number } | null {
  if (buf.length < BILI_HEADER_LENGTH) return null;
  return {
    packetLength: buf.readUInt32BE(0),
    headerLength: buf.readUInt16BE(4),
    protocol: buf.readUInt16BE(6),
    operation: buf.readUInt32BE(8),
  };
}

interface DanmuInfoResponse {
  code: number;
  data?: { token?: string };
}

interface RoomInfoResponse {
  code: number;
  data?: { room_id?: number; short_id?: number };
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
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private buffer = Buffer.alloc(0);

  async connect(roomInput: string): Promise<void> {
    const roomid = await this.resolveRealRoomId(roomInput);
    const token = await this.fetchDanmuToken(roomid);

    return new Promise<void>((resolve, reject) => {
      const ws = new WsClient(BILI_WS_URL);
      this.platformWs = ws;

      ws.on("open", () => {
        const authBody: BiliAuthBody = {
          uid: 0,
          roomid,
          protover: BILI_PROTOCOL_BROTLI,
          platform: "web",
          type: 2,
          key: token,
        };
        ws.send(buildBiliPacket(BILI_OPERATION_AUTH, Buffer.from(JSON.stringify(authBody))));
        this.heartbeatTimer = setInterval(() => {
          if (ws.readyState === ws.OPEN) {
            ws.send(buildBiliPacket(BILI_OPERATION_HEARTBEAT, Buffer.alloc(0)));
          }
        }, 30000);
        resolve();
      });

      ws.on("message", (data: Buffer) => this.handleFrame(data));
      ws.on("error", (err: Error) => reject(err));
      ws.on("close", () => {
        if (this.heartbeatTimer) {
          clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = null;
        }
      });
    });
  }

  private async resolveRealRoomId(roomInput: string): Promise<number> {
    const res = await fetch(`${BILI_GET_INFO_URL}${encodeURIComponent(roomInput)}`);
    const json = (await res.json()) as RoomInfoResponse;
    if (json.code !== 0 || !json.data?.room_id) {
      throw new Error(`resolve roomid failed: code=${json.code}`);
    }
    return json.data.room_id;
  }

  private async fetchDanmuToken(roomid: number): Promise<string> {
    const res = await fetch(`${BILI_GET_DANMU_INFO_URL}${roomid}`);
    const json = (await res.json()) as DanmuInfoResponse;
    if (json.code !== 0 || !json.data?.token) {
      throw new Error(`fetch danmu token failed: code=${json.code}`);
    }
    return json.data.token;
  }

  private handleFrame(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data]);
    while (this.buffer.length >= BILI_HEADER_LENGTH) {
      const header = parseBiliHeader(this.buffer);
      if (!header) break;
      if (this.buffer.length < header.packetLength) break;
      const body = this.buffer.subarray(header.headerLength, header.packetLength);
      this.buffer = this.buffer.subarray(header.packetLength);
      this.dispatchFrame(header.operation, header.protocol, body);
    }
  }

  private dispatchFrame(operation: number, protocol: number, body: Buffer): void {
    if (operation === BILI_OPERATION_HEARTBEAT_REPLY) {
      const online = body.length >= 4 ? body.readUInt32BE(0) : 0;
      this.forwardToClient({
        platform: "bilibili",
        text: `[系统] 当前在线 ${online}`,
        ts: Date.now(),
      });
      return;
    }
    if (operation === BILI_OPERATION_MESSAGE) {
      if (protocol === BILI_PROTOCOL_BROTLI) {
        try {
          const decompressed = zlibBrotliDecompressSync(body);
          this.parseJsonPayloads(decompressed);
        } catch {
          // ignore decompress error
        }
      } else {
        this.parseJsonPayloads(body);
      }
    }
  }

  private parseJsonPayloads(buf: Buffer): void {
    let offset = 0;
    while (offset + BILI_HEADER_LENGTH <= buf.length) {
      const header = parseBiliHeader(buf.subarray(offset));
      if (!header) break;
      if (offset + header.packetLength > buf.length) break;
      const payload = buf.subarray(offset + header.headerLength, offset + header.packetLength);
      offset += header.packetLength;
      if (header.operation !== BILI_OPERATION_MESSAGE) continue;
      try {
        const cmd = JSON.parse(payload.toString("utf8")) as { cmd?: string; info?: unknown[] };
        if (cmd.cmd === "DANMU_MSG" && Array.isArray(cmd.info)) {
          const info = cmd.info;
          const text = typeof info[1] === "string" ? info[1] : "";
          const userInfo = Array.isArray(info[2]) ? info[2] : [];
          const uid = typeof userInfo[0] === "number" ? String(userInfo[0]) : undefined;
          const nickname = typeof userInfo[1] === "string" ? userInfo[1] : undefined;
          if (text) {
            this.forwardToClient({
              platform: "bilibili",
              uid,
              nickname,
              text,
              ts: Date.now(),
            });
          }
        }
      } catch {
        // ignore json parse error
      }
    }
  }

  close(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.platformWs?.close();
    this.platformWs = null;
  }
}

class XiaohongshuDanmakuBridge extends DanmakuBridge {
  async connect(_token: string): Promise<void> {
    // 小红书直播弹幕协议现状（2024-2025 调研）：
    //
    // 【传输层】WebSocket，URL 含 longlink（如 wss://web-meta-lf.chat.xiaohongshu.com/...）
    // 【编码层】私有二进制帧 + protobuf payload（ms.cmd 风格），非公开协议
    // 【鉴权层】需要 web_session + x-s / x-t 签名（x-s 是 jsvmp 加密的动态 token）
    //          x-s 算法在小红书前端 JS 里，用 VMP 虚拟机保护，逆向难度高且会随版本变化
    //
    // 【开放平台】open.xiaohongshu.com 有电商开放平台，但直播弹幕接口未对外开放
    //            需要：企业实名认证 + 创建应用 + 申请权限 + 审核
    //            即便通过审核，开放的是电商/笔记类 API，直播弹幕大概率仍走私有协议
    //
    // 【结论】无法像 B 站那样做"协议补全即可 wscat 实测"
    //        可行路径只有两条：
    //   (A) 走官方：申请小红书开放平台，若有直播数据开放能力则用官方 SDK
    //   (B) 走私有：逆向 x-s 签名 + protobuf 定义（技术可行但维护成本高，且违反 ToS 风险）
    //
    // 本骨架保留接口占位，真实实现待官方开放或明确走 (B) 方案后再补
    throw new Error("xiaohongshu danmaku not implemented: requires open-platform qualification or x-s signature reverse engineering");
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
  const tokenHint =
    platform === "bilibili"
      ? "token = B站房间号(短号或真实号均可，服务端自动换算真实roomid并拉取danmu key)"
      : "token = 平台 access_token (OAuth 回调获得)";
  res.json({
    platform,
    ws_path: `/ws?platform=${encodeURIComponent(platform)}&token=YOUR_TOKEN_OR_ROOMID`,
    note: tokenHint,
  });
});
