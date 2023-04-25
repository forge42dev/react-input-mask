import { useRef, useLayoutEffect } from "react";

export const useRunAfterUpdate = () => {
  const afterPaintRef = useRef<() => void | undefined>();
  useLayoutEffect(() => {
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
