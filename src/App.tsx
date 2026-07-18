import { useState, lazy, Suspense } from "react";
import { QuickStart } from "@/pages/QuickStart";

const StageShow = lazy(() => import("@/components/Stage/StageShow").then((m) => ({ default: m.StageShow })));
const LiveDeck = lazy(() => import("@/pages/LiveDeck"));
const ObsGuide = lazy(() => import("@/pages/ObsGuide").then((m) => ({ default: m.ObsGuide })));
const BpmLab = lazy(() => import("@/pages/BpmLab").then((m) => ({ default: m.BpmLab })));

type View = "quickstart" | "stage" | "console" | "obsguide" | "bpmlab";

function PageFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: "#05050C" }}>
      <div className="font-display text-sm uppercase tracking-[0.3em] text-white/30">loading...</div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("quickstart");

  if (view === "quickstart") {
    return (
      <QuickStart
        onEnterStage={() => setView("stage")}
        onEnterConsole={() => setView("console")}
        onEnterObsGuide={() => setView("obsguide")}
        onEnterBpmLab={() => setView("bpmlab")}
      />
    );
  }

  return (
    <Suspense fallback={<PageFallback />}>
      {view === "stage" && <StageShow onExit={() => setView("console")} />}
      {view === "obsguide" && <ObsGuide onBack={() => setView("quickstart")} />}
      {view === "bpmlab" && <BpmLab onBack={() => setView("quickstart")} />}
      {view === "console" && <LiveDeck onGoStage={() => setView("stage")} />}
    </Suspense>
  );
}
