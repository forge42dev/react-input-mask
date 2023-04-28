import React from "react";
import {
  act,
  fireEvent,
  getByTestId,
  render,
  renderHook,
} from "@testing-library/react";
import { useInputMask } from "./useInputMask";

describe("useInputMask", () => {
  it("renders correctly", () => {
    const { result } = renderHook(() => useInputMask({ mask: "AAA-999" }));
    expect(result.current).toMatchObject({ value: "___-___" });
  });

  it("updates letter value on input when valid", () => {
    const Component = () => {
      const props = useInputMask({ mask: "AAA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "a", target: { value: "a" } });
    });
    expect(input.getAttribute("value")).toBe("a__-___");
  });
  it("updates letter value on input when valid and is A", () => {
    const Component = () => {
      const props = useInputMask({ mask: "AAA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "A", target: { value: "A" } });
    });
    expect(input.getAttribute("value")).toBe("A__-___");
  });

  it("nothing happens when letter is next and number entered", () => {
    const Component = () => {
      const props = useInputMask({ mask: "AAA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "8", target: { value: "8" } });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("nothing happens when letter is next and special char entered", () => {
    const Component = () => {
      const props = useInputMask({ mask: "AAA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "*" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("when number entered and number is next it updates value", () => {
    const Component = () => {
      const props = useInputMask({ mask: "9AA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "1" });
    });
    expect(input.getAttribute("value")).toBe("1__-___");
  });

  it("when letter entered and number is next it does not update the value", () => {
    const Component = () => {
      const props = useInputMask({ mask: "9AA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "a" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("when special char entered and number is next it does not update the value", () => {
    const Component = () => {
      const props = useInputMask({ mask: "9AA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "*" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("when special char entered and wildcard is next value updated", () => {
    const Component = () => {
      const props = useInputMask({ mask: "*AA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "*" });
    });
    expect(input.getAttribute("value")).toBe("*__-___");
  });

  it("when letter entered and wildcard is next value updated", () => {
    const Component = () => {
      const props = useInputMask({ mask: "*AA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "A" });
    });
    expect(input.getAttribute("value")).toBe("A__-___");
  });
  it("when number entered and wildcard is next value updated", () => {
    const Component = () => {
      const props = useInputMask({ mask: "*AA-999", type: "raw" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "2" });
    });
    expect(input.getAttribute("value")).toBe("2__-___");
  });

  it("when backspace is clicked it deletes a character", () => {
    const Component = () => {
      const props = useInputMask({ mask: "*AA-999", type: "raw", value: "2" });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "Backspace" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("when CTRL + A is clicked then backspace everything is deleted", () => {
    const Component = () => {
      const props = useInputMask({
        mask: "*AA-999",
        type: "raw",
        value: "2AA123",
      });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "A", ctrlKey: true });
      fireEvent.keyDown(input, { key: "Backspace" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("when you Tab out the element loses focus", () => {
    const Component = () => {
      const props = useInputMask({
        mask: "*AA-999",
        type: "raw",
        value: "2AA123",
      });
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "Tab" });
    });
    expect(document.activeElement).not.toBe(input);
  });

  it("when mask not provided value is not set", () => {
    const Component = () => {
      const props = useInputMask({});
      return <input data-testid="input" {...props} />;
    };
    const { getByTestId } = render(<Component />);
    const input = getByTestId("input");
    expect(input.getAttribute("value")).toBe(null);
  });
});
