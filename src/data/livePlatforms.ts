export type PlatformTarget = "douyin" | "xiaohongshu" | "bilibili" | "kuaishou" | "generic";

export type ConnState = "disconnected" | "authorizing" | "connected" | "live" | "error";
export type SyncDir = "in" | "out" | "bidirectional";

export interface StreamConfig {
  rtmpUrl: string;
  streamKeyPlaceholder: string;
  resolution: string;
  fps: number;
  bitrate: number;
  encoder: "x264" | "nvenc" | "amd" | "apple";
  audioBitrate: number;
  keyframeInterval: number;
}

export interface DanmakuProtocol {
  transport: "websocket" | "tcp" | "http";
  endpoint: string;
  authType: string;
  messageFormat: string;
  syncDirection: SyncDir;
}

export interface ComplianceRule {
  sensitiveWords: string[];
  autoBlock: boolean;
  warningLevel: "strict" | "moderate" | "loose";
  maxDanmakuLength: number;
  rateLimit: number;
  bannedContent: string[];
}

export interface PlatformApi {
  oauthUrl: string;
  tokenEndpoint: string;
  danmakuWs: string;
  giftCallback: string;
  statsEndpoint: string;
  scope: string[];
}

export interface LivePlatform {
  id: PlatformTarget;
  name: string;
  short: string;
  color: string;
  danmakuStyle: "float" | "side" | "bottom";
  aspectRatio: "9:16" | "16:9" | "1:1" | "4:3";
  giftSystem: boolean;
  recommendBitrate: string;
  exportMode: "window" | "browser" | "obs";
  notes: string;
  stream: StreamConfig;
  danmaku: DanmakuProtocol;
  compliance: ComplianceRule;
  api: PlatformApi;
}

export const LIVE_PLATFORMS: LivePlatform[] = [
  {
    id: "douyin",
    name: "抖音直播",
    short: "抖音",
    color: "#FE2C55",
    danmakuStyle: "float",
    aspectRatio: "9:16",
    giftSystem: true,
    recommendBitrate: "4000kbps",
    exportMode: "obs",
    notes: "竖屏 9:16，弹幕飘浮，需 OBS 虚拟摄像头 + 抖音直播伴侣推流",
    stream: {
      rtmpUrl: "rtmp://push.douyin.com/live",
      streamKeyPlaceholder: "推流码·开播中心获取",
      resolution: "1080x1920",
      fps: 30,
      bitrate: 4000,
      encoder: "nvenc",
      audioBitrate: 128,
      keyframeInterval: 2,
    },
    danmaku: {
      transport: "websocket",
      endpoint: "wss://webcast5-ws-web-lf.douyin.com/webcast/im/push/v2",
      authType: "Room ID + Token",
      messageFormat: "Protobuf",
      syncDirection: "bidirectional",
    },
    compliance: {
      sensitiveWords: ["违禁", "加微信", "刷单", "赌博", "色情", "外挂", "代练"],
      autoBlock: true,
      warningLevel: "strict",
      maxDanmakuLength: 50,
      rateLimit: 5,
      bannedContent: ["二维码引流", "第三方支付", "诱导私下交易"],
    },
    api: {
      oauthUrl: "https://open.douyin.com/platform/oauth/connect",
      tokenEndpoint: "https://open.douyin.com/oauth/access_token",
      danmakuWs: "wss://webcast5-ws-web-lf.douyin.com/webcast/im/push/v2",
      giftCallback: "https://developer.toutiao.com/api/v1/gift/callback",
      statsEndpoint: "https://open.douyin.com/api/live/data/realtime",
      scope: ["live.cast", "live.data", "user.info"],
    },
  },
  {
    id: "xiaohongshu",
    name: "小红书直播",
    short: "小红书",
    color: "#FF2442",
    danmakuStyle: "float",
    aspectRatio: "9:16",
    giftSystem: true,
    recommendBitrate: "3500kbps",
    exportMode: "obs",
    notes: "竖屏 9:16，偏生活向，弹幕密度较低需暖场",
    stream: {
      rtmpUrl: "rtmp://live-push.xiaohongshu.com/live",
      streamKeyPlaceholder: "推流码·小红书创作者中心",
      resolution: "1080x1920",
      fps: 30,
      bitrate: 3500,
      encoder: "x264",
      audioBitrate: 128,
      keyframeInterval: 2,
    },
    danmaku: {
      transport: "websocket",
      endpoint: "wss://chat.xiaohongshu.com/ws/live",
      authType: "Session + Live ID",
      messageFormat: "JSON",
      syncDirection: "bidirectional",
    },
    compliance: {
      sensitiveWords: ["加微信", "微信号", "刷单", "代购", "私聊", "二维码", "转账"],
      autoBlock: true,
      warningLevel: "strict",
      maxDanmakuLength: 40,
      rateLimit: 4,
      bannedContent: ["导流到站外", "虚假宣传", "医疗保健断言"],
    },
    api: {
      oauthUrl: "https://open.xiaohongshu.com/oauth/authorize",
      tokenEndpoint: "https://open.xiaohongshu.com/oauth/token",
      danmakuWs: "wss://chat.xiaohongshu.com/ws/live",
      giftCallback: "https://open.xiaohongshu.com/api/live/gift/callback",
      statsEndpoint: "https://open.xiaohongshu.com/api/live/stats",
      scope: ["live.stream", "live.comment", "live.gift"],
    },
  },
  {
    id: "bilibili",
    name: "哔哩哔哩",
    short: "B站",
    color: "#00A1D6",
    danmakuStyle: "float",
    aspectRatio: "16:9",
    giftSystem: true,
    recommendBitrate: "6000kbps",
    exportMode: "obs",
    notes: "横屏 16:9，弹幕文化浓厚，支持大航海礼物",
    stream: {
      rtmpUrl: "rtmp://live-push.bilivideo.com/live-bvc",
      streamKeyPlaceholder: "推流码·B站直播中心",
      resolution: "1920x1080",
      fps: 60,
      bitrate: 6000,
      encoder: "nvenc",
      audioBitrate: 160,
      keyframeInterval: 2,
    },
    danmaku: {
      transport: "websocket",
      endpoint: "wss://broadcast-msg.chat.bilibili.com:443/sub",
      authType: "Room ID + UID",
      messageFormat: "Brotli + JSON",
      syncDirection: "bidirectional",
    },
    compliance: {
      sensitiveWords: ["刷量", "代刷", "挂机", "赌博", "色情", "政治敏感"],
      autoBlock: true,
      warningLevel: "moderate",
      maxDanmakuLength: 30,
      rateLimit: 6,
      bannedContent: ["引战", "人身攻击", "未经授权转载"],
    },
    api: {
      oauthUrl: "https://passport.bilibili.com/oauth2/authorize",
      tokenEndpoint: "https://passport.bilibili.com/oauth2/access_token",
      danmakuWs: "wss://broadcast-msg.chat.bilibili.com:443/sub",
      giftCallback: "https://api.live.bilibili.com/gift/v2/gift/callback",
      statsEndpoint: "https://api.live.bilibili.com/room/v1/Room/getInfo",
      scope: ["live.chat", "live.gift", "live.stats"],
    },
  },
  {
    id: "kuaishou",
    name: "快手直播",
    short: "快手",
    color: "#FF4906",
    danmakuStyle: "side",
    aspectRatio: "9:16",
    giftSystem: true,
    recommendBitrate: "4000kbps",
    exportMode: "obs",
    notes: "竖屏 9:16，弹幕侧边滚动风格",
    stream: {
      rtmpUrl: "rtmp://push.kuaishouzt.com/live",
      streamKeyPlaceholder: "推流码·快手直播伴侣",
      resolution: "1080x1920",
      fps: 30,
      bitrate: 4000,
      encoder: "x264",
      audioBitrate: 128,
      keyframeInterval: 2,
    },
    danmaku: {
      transport: "websocket",
      endpoint: "wss://live.kuaishou.com/websocket",
      authType: "Live ID + Token",
      messageFormat: "Protobuf",
      syncDirection: "bidirectional",
    },
    compliance: {
      sensitiveWords: ["加微信", "刷单", "赌博", "色情", "外挂", "私聊转账"],
      autoBlock: true,
      warningLevel: "strict",
      maxDanmakuLength: 50,
      rateLimit: 5,
      bannedContent: ["站外导流", "虚假宣传", "违禁品"],
    },
    api: {
      oauthUrl: "https://open.kuaishou.com/oauth2/authorize",
      tokenEndpoint: "https://open.kuaishou.com/oauth2/access_token",
      danmakuWs: "wss://live.kuaishou.com/websocket",
      giftCallback: "https://open.kuaishou.com/api/live/gift/callback",
      statsEndpoint: "https://open.kuaishou.com/api/live/stats",
      scope: ["live.cast", "live.comment", "live.gift"],
    },
  },
  {
    id: "generic",
    name: "通用模式",
    short: "通用",
    color: "#9D4EDD",
    danmakuStyle: "bottom",
    aspectRatio: "16:9",
    giftSystem: false,
    recommendBitrate: "5000kbps",
    exportMode: "browser",
    notes: "横屏通用，浏览器全屏导出，适配其他平台",
    stream: {
      rtmpUrl: "rtmp://your-server/live",
      streamKeyPlaceholder: "自定义推流码",
      resolution: "1920x1080",
      fps: 30,
      bitrate: 5000,
      encoder: "x264",
      audioBitrate: 128,
      keyframeInterval: 2,
    },
    danmaku: {
      transport: "http",
      endpoint: "https://your-server/api/danmaku",
      authType: "API Key",
      messageFormat: "JSON",
      syncDirection: "in",
    },
    compliance: {
      sensitiveWords: [],
      autoBlock: false,
      warningLevel: "loose",
      maxDanmakuLength: 100,
      rateLimit: 10,
      bannedContent: [],
    },
    api: {
      oauthUrl: "",
      tokenEndpoint: "",
      danmakuWs: "",
      giftCallback: "",
      statsEndpoint: "",
      scope: [],
    },
  },
];

export const ASPECT_RATIO_MAP: Record<string, { w: number; h: number; label: string }> = {
  "9:16": { w: 9, h: 16, label: "竖屏 9:16" },
  "16:9": { w: 16, h: 9, label: "横屏 16:9" },
  "1:1": { w: 1, h: 1, label: "方形 1:1" },
  "4:3": { w: 4, h: 3, label: "标清 4:3" },
};

export const COMMON_SENSITIVE_WORDS = [
  "加微信", "微信号", "刷单", "赌博", "色情", "外挂", "代练",
  "代购", "私聊转账", "二维码", "刷量", "违禁品", "站外导流",
];
