export interface LyricLine {
  t: number;
  text: string;
  highlight?: boolean;
}

export const LYRICS: Record<string, LyricLine[]> = {
  t1: [
    { t: 0, text: "♪ ~", highlight: false },
    { t: 8, text: "午夜的脉冲在跳动", highlight: true },
    { t: 16, text: "霓虹淹没整座城", highlight: true },
    { t: 24, text: "BPM 128 我们不回头", highlight: true },
    { t: 34, text: "♪ ~ bass drop incoming", highlight: false },
    { t: 42, text: "低频穿透每一寸皮肤", highlight: true },
    { t: 52, text: "跟着节拍一起沉沦", highlight: true },
    { t: 62, text: "♪ ~", highlight: false },
    { t: 74, text: "这就是我们的午夜", highlight: true },
    { t: 84, text: "永不停歇的脉冲", highlight: true },
  ],
  t2: [
    { t: 0, text: "♪ ~", highlight: false },
    { t: 10, text: "水晶般的梦境浮现", highlight: true },
    { t: 22, text: "138 的心跳在加速", highlight: true },
    { t: 36, text: "穿越云层飞向光", highlight: true },
    { t: 50, text: "♪ ~ trance lifting", highlight: false },
    { t: 64, text: "每一次呼吸都是节拍", highlight: true },
    { t: 80, text: "在水晶梦境里翱翔", highlight: true },
  ],
  t3: [
    { t: 0, text: "♪ ~", highlight: false },
    { t: 6, text: "酸雨淋湿了我的思绪", highlight: true },
    { t: 14, text: "145 的疯狂节奏", highlight: true },
    { t: 24, text: "303 在尖叫", highlight: true },
    { t: 36, text: "♪ ~ acid mode on", highlight: false },
    { t: 48, text: "液体般的贝斯线", highlight: true },
    { t: 60, text: "腐蚀所有理性", highlight: true },
  ],
  t4: [
    { t: 0, text: "♪ ~", highlight: false },
    { t: 12, text: "太阳耀斑划破天际", highlight: true },
    { t: 26, text: "124 的温暖律动", highlight: true },
    { t: 42, text: "金色光芒包裹一切", highlight: true },
    { t: 60, text: "♪ ~ progressive build", highlight: false },
    { t: 78, text: "宇宙在为我们跳舞", highlight: true },
  ],
  t5: [
    { t: 0, text: "♪ ~", highlight: false },
    { t: 10, text: "深海暗流涌动", highlight: true },
    { t: 24, text: "120 的深沉脉搏", highlight: true },
    { t: 40, text: "紫色光芒穿透水底", highlight: true },
    { t: 58, text: "♪ ~ deep dive", highlight: false },
    { t: 76, text: "在暗流中漂浮", highlight: true },
  ],
  t6: [
    { t: 0, text: "♪ ~", highlight: false },
    { t: 4, text: "超光速驱动启动", highlight: true },
    { t: 10, text: "174 的极限冲刺", highlight: true },
    { t: 18, text: "电光蓝撕裂黑暗", highlight: true },
    { t: 28, text: "♪ ~ dnb break", highlight: false },
    { t: 38, text: "速度即是信仰", highlight: true },
    { t: 50, text: "永不止步", highlight: true },
  ],
  t7: [
    { t: 0, text: "♪ ~", highlight: false },
    { t: 12, text: "霓虹蜃楼在远方闪烁", highlight: true },
    { t: 28, text: "110 的复古浪潮", highlight: true },
    { t: 44, text: "品红与橙的日落", highlight: true },
    { t: 62, text: "♪ ~ synthwave dreamscape", highlight: false },
    { t: 80, text: "回到那个永远", highlight: true },
  ],
  t8: [
    { t: 0, text: "♪ ~", highlight: false },
    { t: 10, text: "引力井吞噬一切", highlight: true },
    { t: 22, text: "132 的黑洞旋转", highlight: true },
    { t: 36, text: "青色光环无法逃离", highlight: true },
    { t: 54, text: "♪ ~ gravity pulls", highlight: false },
    { t: 72, text: "坠入无尽深渊", highlight: true },
  ],
};

export function getLyrics(trackId: string): LyricLine[] {
  return LYRICS[trackId] ?? [{ t: 0, text: "♪ ~ 纯音乐演奏中", highlight: false }];
}

export interface ThemeNight {
  id: string;
  name: string;
  label: string;
  themeId: string;
  presetId: "TECHNO" | "ACID" | "TRAP" | "SYNTHWAVE";
  welcomeMsg: string;
  color: string;
}

export const THEME_NIGHTS: ThemeNight[] = [
  {
    id: "techno-night",
    name: "Techno 之夜",
    label: "工业深空",
    themeId: "neon",
    presetId: "TECHNO",
    welcomeMsg: "欢迎来到 Techno 之夜 · 工业四四拍轰炸",
    color: "#FF2D95",
  },
  {
    id: "synthwave-night",
    name: "Synthwave 复古",
    label: "蒸汽波日落",
    themeId: "lava",
    presetId: "SYNTHWAVE",
    welcomeMsg: "欢迎回到 80 年代 · 蒸汽波复古派对",
    color: "#FFC53D",
  },
  {
    id: "acid-night",
    name: "Acid 狂欢",
    label: "303 共振",
    themeId: "aurora",
    presetId: "ACID",
    welcomeMsg: "Acid 狂欢开始 · 303 共振贝斯警告",
    color: "#B6FF3C",
  },
  {
    id: "deep-night",
    name: "深海 Chill",
    label: "深沉 Lounge",
    themeId: "abyss",
    presetId: "TRAP",
    welcomeMsg: "深海 Chill 时间 · 放下沉溺此刻",
    color: "#2D7BFF",
  },
];

export interface LayoutPreset {
  id: string;
  name: string;
  label: string;
  icon: string;
  desc: string;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: "full", name: "全功能工作台", label: "三栏完整", icon: "LayoutGrid", desc: "左中右三栏全功能，适合桌面直播" },
  { id: "stage", name: "舞台特写", label: "沉浸舞台", icon: "MonitorPlay", desc: "舞台最大化，弹幕浮层叠加，适合竖屏" },
  { id: "chat", name: "弹幕沉浸", label: "弹幕优先", icon: "MessageCircle", desc: "弹幕区放大，舞台缩小为画中画" },
  { id: "minimal", name: "极简直播", label: "纯净输出", icon: "Circle", desc: "仅舞台+底部控制，适合 OBS 捕获" },
];
