# NEON DECK · DJ Streaming 助手

赛博朋克霓虹风格的 DJ 直播全链路助手。前端是 OBS 友好的 DJ 动效前台（真实音频驱动可视化），后端是平台对接骨架（OAuth 代理 + B 站弹幕 WebSocket 协议）。

## 项目定位

**前端（可立即使用）**：一个 OBS 友好的 DJ 动效前台。DJ 在浏览器拖入音乐，动效实时跟随音频，OBS 捕获窗口即可推流。无需后端。

**后端（骨架已就绪，需填凭据）**：为产品化提供平台对接能力。B 站弹幕协议已完整实现，OAuth 流程已搭好框架。

## ✨ 功能特性

### DJ 自用核心（前端，真实可用）

- **3 步 QuickStart**：选氛围 -> 拖入音乐 -> 进入舞台
- **真实音乐播放**：Web Audio API + MediaElementSourceNode，MP3/WAV/FLAC 拖入即播
- **音频反应可视化**：环形频谱 / 波形 / 粒子三种模式，从 AnalyserNode 读真实频率数据，随节拍脉冲
- **3 频段 EQ**：BiquadFilterNode 链（lowshelf 200Hz / peaking 1k / highshelf 4k），±12dB 实时调节
- **BPM 智能切歌**：离线解码 + 低通滤波 + 自相关检测 BPM，AutoMix 按倍频距离选最接近的下一首
- **LRC 歌词同步**：拖入 .lrc 文件，舞台全屏逐行高亮，T 键切换显示
- **交叉淡入淡出**：GainNode linearRampToValueAtTime，3 秒淡出 -> 切源 -> 淡入
- **OBS 导出模式**：纯净黑底视图，按 O 键切换，OBS 直接窗口捕获
- **会话持久化**：localStorage 每 5 秒自动存氛围/音量/EQ/可视化模式
- **键盘快捷键**：空格 播放/暂停 · ← → 切歌 · L 列表 · E EQ · O OBS · M 静音 · T 歌词 · 1/2/3 可视化
- **BPM 检测实验室**：独立调试页，拖入音频显示 BPM/置信度/频谱，智能选曲模拟器，JSON 导出

### 舞台动效

- 暂停时呼吸光晕（breathe 动画）
- 切歌时主题色径向闪光（flashOut 动画）
- 转盘唱片旋转（spinSlow 动画）
- 4 套主题配色：霓虹紫青 / 极光翠绿 / 熔岩暖橙 / 深海蓝

### OBS 集成

- **OBS 推流配置指南页**：4 章节教程（窗口捕获 / 音频捕获 2 方案 / 画面叠加 / 编码参数表）
- 窗口捕获 + 音频输出捕获的标准工作流

### 平台对接（后端，需填凭据）

- **B 站弹幕 WebSocket**：完整实现 16 字节帧头 + operation=7 鉴权 + 30s 心跳 + brotli 解压 + DANMU_MSG 解析，roomid 自动换算，wscat 可直接连测
- **OAuth 代理**：抖音 / B 站 / 小红书 / 快手统一接口，state 校验防 CSRF（10 分钟 TTL + 一次性消费）
- **RTMP 推流配置**：一键复制 OBS 配置（地址/码率/编码器/分辨率）
- **合规过滤**：按平台差异化敏感词库

### 互动与变现（前端 mock）

- 弹幕系统、礼物面板、互动游戏（猜歌名/BPM 竞猜/抽奖）
- 付费点歌插队、打赏目标进度条
- 观众留存：进场欢迎、等级徽章、贡献榜
- 数据复盘：实时热度曲线、峰值在线、精彩时刻标记

## 🛠 技术栈

**前端**：
- React 18 + TypeScript + Vite
- Tailwind CSS 自定义霓虹设计系统
- Zustand 状态管理（14+ stores）
- Web Audio API 实时音频合成与分析
- Canvas 2D 高性能可视化
- React.lazy 路由懒加载 + manualChunks 拆包

**后端**：
- Node.js + Express + TypeScript
- ws 库 WebSocket 服务
- OAuth 2.0 代理 + state 校验
- B 站直播弹幕协议原生实现

## 🚀 快速开始

### 前端

```bash
npm install
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 生产构建
npm run check    # 类型检查
npm run lint     # 代码规范
```

### 后端（可选，平台对接用）

```bash
cd server
cp .env.example .env   # 填入平台凭据
npm install
npm run dev            # http://localhost:4000
```

详见 [server/OAUTH_TESTING.md](server/OAUTH_TESTING.md)。

## 📁 项目结构

```
├── src/                    # 前端
│   ├── audio/              # AudioEngine + BPM 检测 + 音色预设
│   ├── components/         # UI 组件（25+ 模块）
│   │   ├── Stage/          # 舞台（StageShow 核心前台）
│   │   ├── Deck/           # DJ 控制台
│   │   ├── Platform/       # 平台对接 UI
│   │   └── ...
│   ├── pages/              # QuickStart / LiveDeck / ObsGuide / BpmLab
│   ├── store/              # Zustand stores（14+）
│   ├── hooks/              # 节拍引擎 + 可视化
│   └── utils/              # LRC 解析 + 工具函数
├── server/                 # 后端（独立子项目）
│   ├── routes/             # oauth.ts + danmaku.ts
│   ├── index.ts            # Express + WS 入口
│   └── OAUTH_TESTING.md    # OAuth + 弹幕实测指引
├── vercel.json             # Vercel 部署配置
└── README.md
```

## 📡 平台对接状态

| 平台 | OAuth | 弹幕 | 说明 |
|---|---|---|---|
| B 站 | ✅ 框架就绪 | ✅ 完整实现 | 无需企业认证，wscat 可直接连测 |
| 抖音 | ✅ 框架就绪 | ⚠️ 协议 TODO | 需企业认证 + protobuf |
| 小红书 | ✅ 框架就绪 | ⚠️ 协议 TODO | 需企业认证白名单 |
| 快手 | ✅ 框架就绪 | ⚠️ 协议 TODO | 自定义二进制帧 |

B 站弹幕实测：`wscat -c "ws://localhost:4000/ws?platform=bilibili&token=房间号"`

## 🎯 使用场景

### 场景 1：DJ 自己用（最常见）

1. 浏览器打开前端，QuickStart 选氛围 + 拖入歌单
2. 进入舞台，按 O 进 OBS 导出模式
3. OBS 添加窗口捕获（抓浏览器）+ 音频输出捕获（抓浏览器声音）
4. 开始推流

### 场景 2：接入平台弹幕

1. 后端填 B 站凭据（其实弹幕不需要 OAuth，只要房间号）
2. 前端连 `ws://localhost:4000/ws?platform=bilibili&token=房间号`
3. 收到弹幕转发到舞台弹幕层

### 场景 3：BPM 调参

1. 进入 BPM 检测实验室
2. 拖入不同曲风的音频，观察 BPM/置信度
3. 用智能选曲模拟器验证 AutoMix 切歌逻辑

## 🚢 部署

- **前端**：Vercel（vercel.json 已配置）
- **后端**：不支持 Vercel Serverless（WS 长连接），建议 Render / Railway / Fly.io

## License

MIT
