import { ref, onUnmounted, computed, type Ref } from "vue";
import { type MaybeRef } from "@vueuse/core";

interface TimeoutTimer {
  timeLeft: Ref<number>;
  isTimeout: Ref<boolean>;
  start: () => void;
}

function useTimeoutTimer(
  timespan: MaybeRef<number>,
  onTimeout: () => void,
): TimeoutTimer {
  const timespanRef = ref(timespan);
  const timeLeft = ref(timespanRef.value);
  const isTimeout = ref(false);
  let intervalId: NodeJS.Timeout;
  const updateInterval = 200;
  let startTime: number;

  const updateTimer = () => {
    const elapsedTime = performance.now() - startTime;
    const remainingTime = timespanRef.value - elapsedTime;

    if (remainingTime > 0) {
      timeLeft.value = remainingTime;
    } else {
      clearInterval(intervalId);
      timeLeft.value = 0;
      isTimeout.value = true;
      onTimeout();
    }
  };
  const startTimer = () => {
    timeLeft.value = timespanRef.value;
    if (intervalId) clearInterval(intervalId);
    isTimeout.value = false;
    startTime = performance.now();
    intervalId = setInterval(updateTimer, updateInterval);
  };

  onUnmounted(() => {
    clearInterval(intervalId);
  });

  return {
    timeLeft: computed(() => timeLeft.value),
    isTimeout: computed(() => isTimeout.value),
    start: startTimer,
  };
}

export default useTimeoutTimer;
