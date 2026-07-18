import { useState } from "react";
import { QuickStart } from "@/pages/QuickStart";
import { StageShow } from "@/components/Stage/StageShow";
import LiveDeck from "@/pages/LiveDeck";
import { ObsGuide } from "@/pages/ObsGuide";

type View = "quickstart" | "stage" | "console" | "obsguide";

export default function App() {
  const [view, setView] = useState<View>("quickstart");

  if (view === "quickstart") {
    return (
      <QuickStart
        onEnterStage={() => setView("stage")}
        onEnterConsole={() => setView("console")}
        onEnterObsGuide={() => setView("obsguide")}
      />
    );
  }

  if (view === "stage") {
    return <StageShow onExit={() => setView("console")} />;
  }

  if (view === "obsguide") {
    return <ObsGuide onBack={() => setView("quickstart")} />;
  }

  return <LiveDeck onGoStage={() => setView("stage")} />;
}
