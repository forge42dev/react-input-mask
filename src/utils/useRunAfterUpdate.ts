import { useRef, useEffect, useLayoutEffect } from "react";

const canUseDOM = typeof window !== "undefined";
const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

export const useRunAfterUpdate = () => {
  const afterPaintRef = useRef<() => void | undefined>();
  useIsomorphicLayoutEffect(() => {
    if (afterPaintRef.current) {
      afterPaintRef.current();
      afterPaintRef.current = undefined;
    }
  });
  const runAfterUpdate = (fn: () => void) => {
    afterPaintRef.current = fn;
  };

  return runAfterUpdate;
};
