import { useState } from "react";
import { QuickStart } from "@/pages/QuickStart";
import { StageShow } from "@/components/Stage/StageShow";
import LiveDeck from "@/pages/LiveDeck";
import { ObsGuide } from "@/pages/ObsGuide";
import { BpmLab } from "@/pages/BpmLab";

type View = "quickstart" | "stage" | "console" | "obsguide" | "bpmlab";

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

  if (view === "stage") {
    return <StageShow onExit={() => setView("console")} />;
  }

  if (view === "obsguide") {
    return <ObsGuide onBack={() => setView("quickstart")} />;
  }

  if (view === "bpmlab") {
    return <BpmLab onBack={() => setView("quickstart")} />;
  }

  return <LiveDeck onGoStage={() => setView("stage")} />;
}
