import { useState } from "react";
import { useBeatEngine } from "@/hooks/useBeatEngine";
import { Background } from "@/components/shared/Background";
import { ParticleField } from "@/components/shared/ParticleField";
import { BeatPulse } from "@/components/shared/BeatPulse";
import { TopBar } from "@/components/TopBar/TopBar";
import { Stage } from "@/components/Stage/Stage";
import { ChatPanel } from "@/components/Chat/ChatPanel";
import { DJConsole } from "@/components/Deck/DJConsole";
import { QueuePanel } from "@/components/Queue/QueuePanel";
import { PlatformHub } from "@/components/Platform/PlatformHub";
import { EngagementPanel } from "@/components/Engagement/EngagementPanel";
import { DJInfoCard } from "@/components/Engagement/DJInfoCard";
import { FlyingHearts } from "@/components/Engagement/FlyingHearts";
import { NextTrackAdvisor } from "@/components/Deck/NextTrackAdvisor";
import { EnergyCurve } from "@/components/Deck/EnergyCurve";
import { WelcomeOverlay } from "@/components/Audience/WelcomeOverlay";
import { ViewerBadges } from "@/components/Audience/ViewerBadges";
import { Leaderboard } from "@/components/Audience/Leaderboard";
import { HeatCurve } from "@/components/Analytics/HeatCurve";
import { AnalyticsPanel } from "@/components/Analytics/AnalyticsPanel";
import { HighlightPanel } from "@/components/Analytics/HighlightPanel";
import { QuickReplies } from "@/components/Host/QuickReplies";
import { LevelMeter } from "@/components/Host/LevelMeter";
import { PlatformAdapter } from "@/components/Platform/PlatformAdapter";
import { IntegrationHub } from "@/components/Platform/IntegrationHub";
import { StreamConfig } from "@/components/Platform/StreamConfig";
import { SimulcastDashboard } from "@/components/Platform/SimulcastDashboard";
import { ComplianceFilter } from "@/components/Platform/ComplianceFilter";
import { GamePanel } from "@/components/Games/GamePanel";
import { GiftTarget } from "@/components/Games/GiftTarget";
import { PaidRequest } from "@/components/Games/PaidRequest";
import { ThemeNightSwitcher } from "@/components/Vibe/ThemeNightSwitcher";
import { LayoutSwitcher } from "@/components/Vibe/LayoutSwitcher";
import { ColdWarning } from "@/components/Vibe/ColdWarning";
import { LoopRecorder } from "@/components/Deck/LoopRecorder";
import { KeyboardMapper } from "@/components/Deck/KeyboardMapper";
import {
  ListMusic, Lightbulb, MonitorSmartphone, MonitorPlay, MessageSquareText,
  BarChart3, Trophy, Gamepad2, Moon, Star, Repeat, Sparkles, PlugZap,
} from "lucide-react";

type LeftTab = "queue" | "advisor" | "platform" | "adapter" | "integrate" | "games" | "vibe";
type IntegSub = "hub" | "stream" | "simulcast" | "compliance";
type RightTab = "chat" | "analytics" | "audience" | "host" | "highlight" | "loop";

export default function LiveDeck({ onGoStage }: { onGoStage?: () => void }) {
  useBeatEngine();
  const [leftTab, setLeftTab] = useState<LeftTab>("integrate");
  const [integSub, setIntegSub] = useState<IntegSub>("hub");
  const [rightTab, setRightTab] = useState<RightTab>("chat");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Background />
      <ParticleField />
      <BeatPulse />
      <TopBar />
      <ColdWarning />

      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-1.5">
        <ViewerBadges />
        <div className="ml-auto flex items-center gap-2">
          {onGoStage && (
            <button
              onClick={onGoStage}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1 font-display text-[10px] font-bold uppercase tracking-widest transition active:scale-95"
              style={{ borderColor: "rgba(255,45,149,0.4)", background: "rgba(255,45,149,0.1)", color: "#FF2D95" }}
            >
              <MonitorPlay className="h-3.5 w-3.5" />
              舞台模式
            </button>
          )}
          <div className="hidden md:block">
            <LayoutSwitcher />
          </div>
        </div>
      </div>

      <div className="border-b border-white/5 px-3 py-1">
        <GiftTarget />
      </div>

      <main className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 xl:grid-cols-[340px_1fr_340px] xl:overflow-hidden">
        <section className="flex min-w-0 flex-col gap-2 xl:overflow-hidden">
          <DJInfoCard />
          <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-ink-900/50 p-1">
            <TabBtn active={leftTab === "integrate"} onClick={() => setLeftTab("integrate")} icon={<PlugZap className="h-3.5 w-3.5" />} label="对接" />
            <TabBtn active={leftTab === "queue"} onClick={() => setLeftTab("queue")} icon={<ListMusic className="h-3.5 w-3.5" />} label="点歌" />
            <TabBtn active={leftTab === "advisor"} onClick={() => setLeftTab("advisor")} icon={<Lightbulb className="h-3.5 w-3.5" />} label="选曲" />
            <TabBtn active={leftTab === "games"} onClick={() => setLeftTab("games")} icon={<Gamepad2 className="h-3.5 w-3.5" />} label="游戏" />
            <TabBtn active={leftTab === "vibe"} onClick={() => setLeftTab("vibe")} icon={<Moon className="h-3.5 w-3.5" />} label="氛围" />
            <TabBtn active={leftTab === "adapter"} onClick={() => setLeftTab("adapter")} icon={<MonitorSmartphone className="h-3.5 w-3.5" />} label="适配" />
          </div>
          {leftTab === "integrate" && (
            <div className="flex gap-1 rounded-lg border border-white/10 bg-ink-900/30 p-0.5">
              <SubTabBtn active={integSub === "hub"} onClick={() => setIntegSub("hub")} label="对接中心" />
              <SubTabBtn active={integSub === "stream"} onClick={() => setIntegSub("stream")} label="推流" />
              <SubTabBtn active={integSub === "simulcast"} onClick={() => setIntegSub("simulcast")} label="同播" />
              <SubTabBtn active={integSub === "compliance"} onClick={() => setIntegSub("compliance")} label="合规" />
            </div>
          )}
          <div className="min-h-[380px] flex-1 xl:min-h-0">
            {leftTab === "integrate" && integSub === "hub" && <IntegrationHub />}
            {leftTab === "integrate" && integSub === "stream" && <StreamConfig />}
            {leftTab === "integrate" && integSub === "simulcast" && <SimulcastDashboard />}
            {leftTab === "integrate" && integSub === "compliance" && <ComplianceFilter />}
            {leftTab === "queue" && <QueuePanel />}
            {leftTab === "advisor" && <NextTrackAdvisor />}
            {leftTab === "games" && <GamePanel />}
            {leftTab === "vibe" && <ThemeNightSwitcher />}
            {leftTab === "platform" && <PlatformHub />}
            {leftTab === "adapter" && <PlatformAdapter />}
          </div>
          {leftTab === "queue" && <PaidRequest />}
        </section>

        <section className="flex min-w-0 flex-col gap-3 xl:overflow-hidden">
          <HeatCurve />
          <div className="min-h-[300px] flex-1 xl:min-h-0">
            <Stage />
          </div>
          <DJConsole />
          <EnergyCurve />
          <KeyboardMapper />
        </section>

        <section className="flex min-w-0 flex-col gap-2 xl:overflow-hidden">
          <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-ink-900/50 p-1">
            <TabBtn active={rightTab === "chat"} onClick={() => setRightTab("chat")} icon={<MessageSquareText className="h-3.5 w-3.5" />} label="弹幕" />
            <TabBtn active={rightTab === "analytics"} onClick={() => setRightTab("analytics")} icon={<BarChart3 className="h-3.5 w-3.5" />} label="数据" />
            <TabBtn active={rightTab === "audience"} onClick={() => setRightTab("audience")} icon={<Trophy className="h-3.5 w-3.5" />} label="观众" />
            <TabBtn active={rightTab === "host"} onClick={() => setRightTab("host")} icon={<Sparkles className="h-3.5 w-3.5" />} label="主播" />
            <TabBtn active={rightTab === "highlight"} onClick={() => setRightTab("highlight")} icon={<Star className="h-3.5 w-3.5" />} label="高光" />
            <TabBtn active={rightTab === "loop"} onClick={() => setRightTab("loop")} icon={<Repeat className="h-3.5 w-3.5" />} label="Loop" />
          </div>
          {rightTab === "chat" && (
            <div className="flex min-h-[300px] flex-1 flex-col gap-2 xl:min-h-0">
              <div className="min-h-0 flex-1"><ChatPanel /></div>
              <EngagementPanel />
            </div>
          )}
          {rightTab === "analytics" && (
            <div className="flex min-h-[300px] flex-1 flex-col gap-2 xl:min-h-0">
              <AnalyticsPanel />
              <Leaderboard />
            </div>
          )}
          {rightTab === "audience" && (
            <div className="flex min-h-[300px] flex-1 flex-col gap-2 xl:min-h-0">
              <Leaderboard />
              <EngagementPanel />
            </div>
          )}
          {rightTab === "host" && (
            <div className="flex min-h-[300px] flex-1 flex-col gap-2 xl:min-h-0">
              <QuickReplies />
              <LevelMeter />
            </div>
          )}
          {rightTab === "highlight" && (
            <div className="flex min-h-[300px] flex-1 xl:min-h-0">
              <HighlightPanel />
            </div>
          )}
          {rightTab === "loop" && (
            <div className="flex min-h-[300px] flex-1 xl:min-h-0">
              <LoopRecorder />
            </div>
          )}
        </section>
      </main>

      <FlyingHearts />
      <WelcomeOverlay />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest transition"
      style={{
        background: active ? "rgba(255,255,255,0.08)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.4)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function SubTabBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded px-1.5 py-1 font-body text-[10px] font-semibold transition"
      style={{
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.4)",
      }}
    >
      {label}
    </button>
  );
}
