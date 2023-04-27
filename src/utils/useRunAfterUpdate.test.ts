import { renderHook } from "@testing-library/react";
import { useRunAfterUpdate } from "./useRunAfterUpdate";

describe("useRunAfterUpdate", () => {
  it("should not run the callback immediately", () => {
    const callback = vi.fn();
    renderHook(() => {
      const runAfterUpdate = useRunAfterUpdate();
      runAfterUpdate(callback);
    });
    expect(callback).toHaveBeenCalled();
  });

  it("should run the callback after the next paint", () => {
    const callback = vi.fn();
    renderHook(() => {
      const runAfterUpdate = useRunAfterUpdate();
      runAfterUpdate(() => {
        callback();
      });
    });
    expect(callback).toHaveBeenCalled();
  });

  it("should run multiple callbacks after the next paint", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    renderHook(() => {
      const runAfterUpdate = useRunAfterUpdate();
      runAfterUpdate(() => {
        callback1();

        callback2();
      });
    });
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });
});
