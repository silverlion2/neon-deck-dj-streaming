import { Monitor, Volume2, Camera, Settings, Lightbulb, X, Cable, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSettingsStore, type ThemeTokens } from "@/store/useSettingsStore";

interface ObsGuideProps {
  onBack: () => void;
}

interface SectionHeaderProps {
  num: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  theme: ThemeTokens;
}

function SectionHeader({ num, title, subtitle, icon: Icon, theme }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full font-display text-base font-black text-ink-900"
        style={{ background: theme.primary, boxShadow: `0 0 18px ${theme.primary}66` }}
      >
        {num}
      </span>
      <div className="flex flex-col">
        <h2 className="font-display text-xl font-bold uppercase tracking-widest text-white">
          {title}
        </h2>
        <span className="font-body text-[11px] text-white/40">{subtitle}</span>
      </div>
      <Icon className="ml-auto h-5 w-5" style={{ color: theme.secondary }} />
    </div>
  );
}

interface Plan {
  id: "A" | "B";
  title: string;
  tag: string;
  colorKey: "primary" | "secondary";
  icon: LucideIcon;
  steps: string[];
}

interface EncodeRow {
  param: string;
  value: string;
}

export function ObsGuide({ onBack }: ObsGuideProps) {
  const { theme } = useSettingsStore();

  const captureSteps: string[] = [
    `在 OBS 添加 "窗口捕获" 或 "浏览器" 来源`,
    `选择 NEON DECK 所在的浏览器窗口`,
    `建议在 NEON DECK 里按 O 键进入 OBS 导出模式（纯净黑底视图）`,
    `调整捕获窗口大小铺满画布`,
  ];

  const plans: Plan[] = [
    {
      id: "A",
      title: "浏览器音频输出捕获",
      tag: "推荐",
      colorKey: "primary",
      icon: Volume2,
      steps: [
        `OBS 添加 "音频输出捕获" 来源`,
        `选择默认输出设备（即浏览器播放声音的设备）`,
        `在 OBS 混音器里确认有音量跳动`,
      ],
    },
    {
      id: "B",
      title: "虚拟音频电缆",
      tag: "进阶",
      colorKey: "secondary",
      icon: Cable,
      steps: [
        `安装 VB-Cable / VoiceMeeter`,
        `浏览器输出设为虚拟电缆`,
        `OBS 监听虚拟电缆`,
      ],
    },
  ];

  const overlayTips: string[] = [
    `动效全屏铺底`,
    `摄像头（DJ 镜头）叠加在右下角，用圆形或圆角遮罩`,
    `歌曲信息条放在底部`,
    `弹幕层（如有）放在左侧`,
  ];

  const encodeRows: EncodeRow[] = [
    { param: "分辨率", value: "1920x1080" },
    { param: "帧率", value: "30fps" },
    { param: "码率", value: "4500-6000 Kbps" },
    { param: "编码器", value: "x264 或 NVENC" },
    { param: "关键帧间隔", value: "2s" },
  ];

  return (
    <div
      className="relative min-h-screen overflow-y-auto"
      style={{ background: theme.bg }}
    >
      <div
        className="pointer-events-none fixed -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ background: theme.glow1 }}
      />
      <div
        className="pointer-events-none fixed -right-40 bottom-0 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ background: theme.glow2 }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-10">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1"
              style={{
                background: `${theme.primary}1a`,
                border: `1px solid ${theme.primary}44`,
              }}
            >
              <Monitor className="h-3 w-3" style={{ color: theme.primary }} />
              <span
                className="font-body text-[10px] uppercase tracking-widest"
                style={{ color: theme.primary }}
              >
                OBS Setup Guide
              </span>
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight text-white">
              OBS 推流<span style={{ color: theme.primary }}>配置指南</span>
            </h1>
            <p className="mt-2 font-body text-sm text-white/40">
              把 NEON DECK 的动效和音乐推到直播平台
            </p>
          </div>
          <button
            onClick={onBack}
            aria-label="返回"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-ink-900/60 text-white/70 backdrop-blur-md transition hover:text-white active:scale-95"
            style={{ borderColor: `${theme.primary}44` }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="mb-10">
          <SectionHeader num={1} title="窗口捕获" subtitle="动效画面" icon={Monitor} theme={theme} />
          <ol className="space-y-3">
            {captureSteps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border bg-ink-900/60 p-4 backdrop-blur-md"
                style={{ borderColor: `${theme.primary}22` }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold"
                  style={{ background: `${theme.primary}22`, color: theme.primary }}
                >
                  {String.fromCharCode(97 + i)}
                </span>
                <span className="font-body text-sm leading-relaxed text-white/70">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-10">
          <SectionHeader num={2} title="音频捕获" subtitle="音乐输出" icon={Volume2} theme={theme} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {plans.map((plan) => {
              const color = theme[plan.colorKey];
              const PlanIcon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className="rounded-2xl border bg-ink-900/60 p-5 backdrop-blur-md"
                  style={{ borderColor: `${color}44` }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: `${color}1a`, color }}
                    >
                      <PlanIcon className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-display text-xs font-black"
                          style={{ color }}
                        >
                          方案 {plan.id}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 font-body text-[9px]"
                          style={{ background: `${color}22`, color }}
                        >
                          {plan.tag}
                        </span>
                      </div>
                      <span className="font-display text-sm font-bold text-white">
                        {plan.title}
                      </span>
                    </div>
                  </div>
                  <ol className="space-y-2">
                    {plan.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="font-display text-xs font-bold"
                          style={{ color }}
                        >
                          {String.fromCharCode(97 + i)}.
                        </span>
                        <span className="font-body text-xs leading-relaxed text-white/65">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
          <div
            className="mt-4 flex items-start gap-3 rounded-xl border p-4"
            style={{
              borderColor: `${theme.accent}33`,
              background: `${theme.accent}0d`,
            }}
          >
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" style={{ color: theme.accent }} />
            <p className="font-body text-xs leading-relaxed text-white/65">
              <span className="font-bold" style={{ color: theme.accent }}>提示：</span>
              方案 A 更简单，但会捕获系统所有声音；方案 B 可隔离浏览器音频。
            </p>
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader num={3} title="画面叠加" subtitle="布局建议" icon={Camera} theme={theme} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {overlayTips.map((tip, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border bg-ink-900/60 p-4 backdrop-blur-md"
                style={{ borderColor: `${theme.secondary}22` }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${theme.secondary}1a`, color: theme.secondary }}
                >
                  <Layers className="h-3.5 w-3.5" />
                </span>
                <span className="font-body text-sm text-white/70">{tip}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader num={4} title="编码参数" subtitle="推荐配置" icon={Settings} theme={theme} />
          <div
            className="overflow-hidden rounded-2xl border bg-ink-900/60 backdrop-blur-md"
            style={{ borderColor: `${theme.primary}44` }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: `${theme.primary}1a` }}>
                  <th className="px-4 py-3 text-left font-display text-xs font-bold uppercase tracking-widest text-white/80">
                    参数
                  </th>
                  <th className="px-4 py-3 text-left font-display text-xs font-bold uppercase tracking-widest text-white/80">
                    推荐值
                  </th>
                </tr>
              </thead>
              <tbody>
                {encodeRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t"
                    style={{ borderColor: `${theme.primary}22` }}
                  >
                    <td className="px-4 py-3 font-body text-sm text-white/60">
                      {row.param}
                    </td>
                    <td
                      className="px-4 py-3 font-display text-sm font-bold"
                      style={{ color: theme.secondary }}
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div
          className="rounded-2xl border p-5 backdrop-blur-md"
          style={{
            borderColor: `${theme.accent}44`,
            background: `${theme.accent}0d`,
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${theme.accent}22`, color: theme.accent }}
            >
              <Lightbulb className="h-5 w-5" />
            </span>
            <div>
              <div
                className="font-display text-sm font-bold uppercase tracking-widest"
                style={{ color: theme.accent }}
              >
                重要提示
              </div>
              <p className="mt-1 font-body text-sm leading-relaxed text-white/70">
                NEON DECK 运行在浏览器中，关闭浏览器或切换标签页会暂停动效。建议用独立窗口全屏运行。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
