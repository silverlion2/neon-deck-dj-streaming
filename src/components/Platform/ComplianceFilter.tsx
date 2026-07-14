import { useState } from "react";
import { ShieldCheck, X, Plus, Ban, Send, Check, ShieldAlert } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { useIntegrationStore } from "@/store/useIntegrationStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { ComplianceRule } from "@/data/livePlatforms";

const WARNING_LEVEL: Record<ComplianceRule["warningLevel"], { label: string; color: string }> = {
  strict: { label: "严格", color: "#FF6B6B" },
  moderate: { label: "中等", color: "#FFC53D" },
  loose: { label: "宽松", color: "#B6FF3C" },
};

export function ComplianceFilter() {
  const platform = useIntegrationStore((s) => s.platform);
  const activePlatform = useIntegrationStore((s) => s.activePlatform);
  const blockedCount = useIntegrationStore((s) => s.connections[activePlatform].blockedCount);
  const filterDanmaku = useIntegrationStore((s) => s.filterDanmaku);
  const theme = useSettingsStore((s) => s.theme);

  const rules = platform.compliance;
  const level = WARNING_LEVEL[rules.warningLevel];
  const [testText, setTestText] = useState("");
  const [result, setResult] = useState<{ blocked: boolean; reason: string } | null>(null);
  const [newWord, setNewWord] = useState("");
  const [addedWords, setAddedWords] = useState<string[]>([]);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const words = [...rules.sensitiveWords.filter((w) => !removed.has(w)), ...addedWords];

  const handleTest = () => {
    if (!testText.trim()) return;
    setResult(filterDanmaku(testText));
  };
  const handleAdd = () => {
    const w = newWord.trim();
    if (!w || words.includes(w)) return;
    setAddedWords((prev) => [...prev, w]);
    setNewWord("");
  };
  const handleRemove = (w: string) => {
    setAddedWords((prev) => prev.filter((x) => x !== w));
    setRemoved((prev) => new Set(prev).add(w));
  };

  return (
    <NeonPanel
      title="合规过滤"
      accent="gold"
      icon={<ShieldCheck className="h-3.5 w-3.5" />}
      className="h-full"
      action={
        <span className="flex items-center gap-1 font-display text-[9px] font-bold uppercase tracking-widest" style={{ color: "#FF6B6B" }}>
          <Ban className="h-3 w-3" />
          本场已屏蔽 {blockedCount} 条
        </span>
      }
    >
      <div className="scrollbar-thin flex h-full flex-col gap-3 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-1.5">
          <RuleCell label="警告等级">
            <span className="rounded-full px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-widest" style={{ background: `${level.color}22`, color: level.color }}>
              {level.label}
            </span>
          </RuleCell>
          <RuleCell label="自动拦截">
            <span className="font-body text-xs font-bold" style={{ color: rules.autoBlock ? "#B6FF3C" : "rgba(255,255,255,0.4)" }}>
              {rules.autoBlock ? "ON" : "OFF"}
            </span>
          </RuleCell>
          <RuleCell label="弹幕上限">
            <span className="font-body text-xs font-semibold text-white/85">{rules.maxDanmakuLength} 字</span>
          </RuleCell>
          <RuleCell label="频率限制">
            <span className="font-body text-xs font-semibold text-white/85">{rules.rateLimit} 条/秒</span>
          </RuleCell>
        </div>

        <div className="rounded-lg border p-2.5" style={{ borderColor: `${platform.color}33`, background: `${platform.color}0d` }}>
          <div className="mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" style={{ color: "#FF6B6B" }} />
            <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/50">敏感词库</span>
            <span className="ml-auto font-body text-[10px] text-white/35">{words.length}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {words.length === 0 && <span className="font-body text-[10px] text-white/30">无敏感词</span>}
            {words.map((w) => (
              <span key={w} className="flex items-center gap-1 rounded-full border px-2 py-0.5 font-body text-[10px]" style={{ borderColor: "#FF6B6B55", background: "#FF6B6B1a", color: "#FF6B6B" }}>
                {w}
                <button onClick={() => handleRemove(w)} className="opacity-50 transition hover:opacity-100">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="添加敏感词…"
              className="h-7 flex-1 rounded-md border border-white/10 bg-ink-900/60 px-2 font-body text-[11px] text-white placeholder:text-white/30 focus:border-neon-gold/50 focus:outline-none"
            />
            <button onClick={handleAdd} className="flex items-center gap-0.5 rounded-md border border-neon-gold/40 bg-neon-gold/10 px-2 py-1 font-display text-[9px] font-bold uppercase tracking-widest text-neon-gold transition hover:bg-neon-gold/20 active:scale-95">
              <Plus className="h-3 w-3" />
              添加
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Ban className="h-3.5 w-3.5" style={{ color: theme.accent }} />
            <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/50">违禁内容</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rules.bannedContent.length === 0 && <span className="font-body text-[10px] text-white/30">无违禁内容</span>}
            {rules.bannedContent.map((c) => (
              <span key={c} className="rounded-full border px-2 py-0.5 font-body text-[10px]" style={{ borderColor: `${theme.accent}55`, background: `${theme.accent}1a`, color: theme.accent }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-ink-900/40 p-2.5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" style={{ color: theme.secondary }} />
            <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/50">测试弹幕过滤</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTest()}
              placeholder="输入测试弹幕…"
              className="h-7 flex-1 rounded-md border border-white/10 bg-ink-900/60 px-2 font-body text-[11px] text-white placeholder:text-white/30 focus:border-neon-gold/50 focus:outline-none"
            />
            <button onClick={handleTest} className="rounded-md bg-neon-gold/15 px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-widest text-neon-gold transition hover:bg-neon-gold/25 active:scale-95">
              测试
            </button>
          </div>
          {result && (
            <div className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 font-body text-[11px] font-semibold" style={{ background: result.blocked ? "#FF6B6B1a" : "#B6FF3C1a", color: result.blocked ? "#FF6B6B" : "#B6FF3C" }}>
              {result.blocked ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              {result.blocked ? `已屏蔽✗ ${result.reason}` : "通过✓"}
            </div>
          )}
        </div>
      </div>
    </NeonPanel>
  );
}

function RuleCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/40 px-2 py-1.5">
      <div className="font-display text-[8px] font-bold uppercase tracking-widest text-white/40">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
