import React from "react";
import { act, fireEvent, render, renderHook } from "@testing-library/react";
import { useInputMask } from "./useInputMask";

const renderComponent = (
  props: Parameters<typeof useInputMask>[0],
  onChange: () => void = () => {}
) => {
  const Component = () => {
    const { getInputProps } = useInputMask(props);
    return (
      <input data-testid="input" {...getInputProps()} onChange={onChange} />
    );
  };
  return render(<Component />);
};

describe("useInputMask", () => {
  it("renders correctly", () => {
    const { result } = renderHook(() => useInputMask({ mask: "AAA-999" }));
    expect(result.current.getInputProps()).toMatchObject({ value: "___-___" });
  });

  it("updates letter value on input when valid", () => {
    const { getByTestId } = renderComponent({ mask: "AAA-999", type: "raw" });

    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "a", target: { value: "a" } });
    });
    expect(input.getAttribute("value")).toBe("a__-___");
  });
  it("updates letter value on input when valid and is A", () => {
    const { getByTestId } = renderComponent({ mask: "AAA-999", type: "raw" });

    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "A", target: { value: "A" } });
    });
    expect(input.getAttribute("value")).toBe("A__-___");
  });

  it("nothing happens when letter is next and number entered", () => {
    const { getByTestId } = renderComponent({ mask: "AAA-999", type: "raw" });

    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "8", target: { value: "8" } });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("nothing happens when letter is next and special char entered", () => {
    const { getByTestId } = renderComponent({ mask: "AAA-999", type: "raw" });

    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "*" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("when number entered and number is next it updates value", () => {
    const { getByTestId } = renderComponent({ mask: "9AA-999", type: "raw" });

    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "1" });
    });
    expect(input.getAttribute("value")).toBe("1__-___");
  });

  it("when letter entered and number is next it does not update the value", () => {
    const { getByTestId } = renderComponent({ mask: "9AA-999", type: "raw" });
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "a" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("when special char entered and number is next it does not update the value", () => {
    const { getByTestId } = renderComponent({ mask: "9AA-999", type: "raw" });
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "*" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("when special char entered and wildcard is next value updated", () => {
    const { getByTestId } = renderComponent({ mask: "*AA-999", type: "raw" });
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "*" });
    });
    expect(input.getAttribute("value")).toBe("*__-___");
  });

  it("when letter entered and wildcard is next value updated", () => {
    const { getByTestId } = renderComponent({ mask: "*AA-999", type: "raw" });
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "A" });
    });
    expect(input.getAttribute("value")).toBe("A__-___");
  });
  it("when number entered and wildcard is next value updated", () => {
    const { getByTestId } = renderComponent({ mask: "*AA-999", type: "raw" });
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "2" });
    });
    expect(input.getAttribute("value")).toBe("2__-___");
  });

  it("when backspace is clicked it deletes a character", () => {
    const { getByTestId } = renderComponent({ mask: "*AA-999", type: "raw" });
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "Backspace" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("deleting over non mask values works correctly", () => {
    const { getByTestId } = renderComponent({
      mask: "9999 9999 9999 9999",
      type: "raw",
      value: "9999999999999999",
    });
    for (let i = 0; i < 9; i++) {
      act(() => {
        fireEvent.keyDown(getByTestId("input"), { key: "Backspace" });
      });
    }
    expect(getByTestId("input").getAttribute("value")).toBe(
      "9999 999_ ____ ____"
    );
  });

  it("entering values when mask complete does not work", () => {
    const { getByTestId } = renderComponent({
      mask: "9999 9999 9999 9999",
      type: "raw",
      value: "9999999999999999",
    });
    act(() => {
      fireEvent.keyDown(getByTestId("input"), { key: "1" });
    });
    expect(getByTestId("input").getAttribute("value")).toBe(
      "9999 9999 9999 9999"
    );
  });

  it("entering values when mask complete and it is a special key with multiple letters doesn't work", () => {
    const { getByTestId } = renderComponent({
      mask: "9999 9999 9999 9999",
      type: "raw",
      value: "9999999999999999",
    });
    act(() => {
      fireEvent.keyDown(getByTestId("input"), { key: "Capital" });
    });
    expect(getByTestId("input").getAttribute("value")).toBe(
      "9999 9999 9999 9999"
    );
  });

  it("entering values with multiple characters does not work", () => {
    const { getByTestId } = renderComponent({
      mask: "AAAAAAAAAAAAA",
      type: "raw",
      value: "",
    });
    act(() => {
      fireEvent.keyDown(getByTestId("input"), { key: "Capital" });
    });
    expect(getByTestId("input").getAttribute("value")).toBe("_____________");
  });

  it("when CTRL + A is clicked then backspace everything is deleted", () => {
    const { getByTestId } = renderComponent({
      mask: "*AA-999",
      type: "raw",
      value: "2AA123",
    });

    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "A", ctrlKey: true });
      fireEvent.keyDown(input, { key: "Backspace" });
    });
    expect(input.getAttribute("value")).toBe("___-___");
  });

  it("when a full valid mask is provided in raw mode it is displayed and saved correctly", () => {
    const { getByTestId } = renderComponent({
      mask: "*AA-999",
      type: "raw",
      value: "2AA123",
    });

    const input = getByTestId("input");
    expect(input.getAttribute("value")).toBe("2AA-123");
  });

  it("when a partial valid mask is provided in raw mode it is displayed and saved correctly", () => {
    const { getByTestId } = renderComponent({
      mask: "*AA-999",
      type: "raw",
      value: "2AA",
    });

    const input = getByTestId("input");
    expect(input.getAttribute("value")).toBe("2AA-___");
  });

  it("when a full valid mask is provided in mask mode it is displayed and saved correctly", () => {
    const { getByTestId } = renderComponent({
      mask: "*AA-999",
      type: "mask",
      value: "2AA-123",
    });

    const input = getByTestId("input");
    expect(input.getAttribute("value")).toBe("2AA-123");
  });
  /* 
  it("when a partial valid mask is provided in mask mode it is displayed and saved correctly", () => {
    const { getByTestId } = renderComponent({
      mask: "*AA-999",
      type: "mask",
      value: "2AA-2",
    });

    const input = getByTestId("input");
    expect(input.getAttribute("value")).toBe("2AA-2__");
  }); */

  it("when you Tab out the element loses focus", () => {
    const { getByTestId } = renderComponent({
      mask: "*AA-999",
      type: "raw",
      value: "2AA123",
    });
    const input = getByTestId("input");

    act(() => {
      fireEvent.keyDown(input, { key: "Tab" });
    });
    expect(document.activeElement).not.toBe(input);
  });

  it("when mask not provided value is not set", () => {
    const { getByTestId } = renderComponent({
      type: "raw",
      value: "2AA123",
    });
    const input = getByTestId("input");
    expect(input.getAttribute("value")).toBe(null);
  });
});
