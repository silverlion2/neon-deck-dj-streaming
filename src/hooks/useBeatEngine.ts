import { useEffect, useRef } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import { useChatStore } from "@/store/useChatStore";
import { useEngagementStore } from "@/store/useEngagementStore";
import { useQueueStore } from "@/store/useQueueStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAudienceStore } from "@/store/useAudienceStore";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { useMonetizationStore } from "@/store/useMonetizationStore";
import { useVibeStore } from "@/store/useVibeStore";
import { useIntegrationStore } from "@/store/useIntegrationStore";
import { audioEngine } from "@/audio/AudioEngine";
import { randInt } from "@/utils/random";

const TICK_MS = 100;

export function useBeatEngine() {
  const beatAcc = useRef(0);
  const beatCount = useRef(0);
  const lastTrackId = useRef<string>("");
  const heatAcc = useRef({ chat: 0, gift: 0, like: 0 });
  const lastHeatTick = useRef(0);

  useEffect(() => {
    let last = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = (now - last) / 1000;
      last = now;

      const live = useLiveStore.getState();
      live.tick(delta);

      if (lastTrackId.current !== live.currentTrack.id) {
        lastTrackId.current = live.currentTrack.id;
        useAnalyticsStore.getState().recordTrackStart(live.currentTrack);
      }

      if (live.isPlaying) {
        const beatInterval = 60 / live.bpm;
        beatAcc.current += delta;
        if (beatAcc.current >= beatInterval) {
          beatAcc.current -= beatInterval;
          beatCount.current += 1;
          live.pulseBeat();
          const settings = useSettingsStore.getState();
          if (!settings.muted && beatCount.current % 2 === 0) {
            audioEngine.playBeatTick();
          }
        }
      }

      const tNow = Date.now();
      if (tNow - lastHeatTick.current > 3000) {
        lastHeatTick.current = tNow;
        const a = useAnalyticsStore.getState();
        a.recordHeat(heatAcc.current.chat, heatAcc.current.gift, heatAcc.current.like);
        const heatLevel = Math.min(1, (heatAcc.current.chat + heatAcc.current.gift * 3) / 8);
        useVibeStore.getState().updateHeatLevel(heatLevel);
        heatAcc.current = { chat: 0, gift: 0, like: 0 };
        const eng = useEngagementStore.getState();
        a.setPeak(eng.online);
      }
    }, TICK_MS);

    const chatTimer = setInterval(() => {
      const before = useChatStore.getState().messages.length;
      useChatStore.getState().pushRandom();
      const after = useChatStore.getState().messages.length;
      const added = Math.max(0, after - before);
      heatAcc.current.chat += added;
      const lastMsg = useChatStore.getState().messages[useChatStore.getState().messages.length - 1];
      if (lastMsg?.isGift) {
        heatAcc.current.gift += 1;
        useAnalyticsStore.getState().recordGiftForTrack(
          useLiveStore.getState().currentTrack.id,
          useLiveStore.getState().currentTrack.title
        );
        useAudienceStore.getState().addContribution(lastMsg.user, 1);
        useMonetizationStore.getState().addGift(randInt(20, 120));
      }
    }, randInt(1200, 2500));

    const onlineTimer = setInterval(() => {
      useEngagementStore.getState().fluctuateOnline();
      useAudienceStore.getState().tickEntries();
      useIntegrationStore.getState().tickLive();
    }, 3000);

    const viewerTimer = setInterval(() => {
      if (Math.random() < 0.55) useAudienceStore.getState().spawnViewer();
    }, 4000);

    const autoVoteTimer = setInterval(() => {
      useEngagementStore.getState().autoVote();
    }, 4500);

    const autoRequestTimer = setInterval(() => {
      if (Math.random() < 0.5) useQueueStore.getState().autoRequest();
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(chatTimer);
      clearInterval(onlineTimer);
      clearInterval(viewerTimer);
      clearInterval(autoVoteTimer);
      clearInterval(autoRequestTimer);
    };
  }, []);
}
