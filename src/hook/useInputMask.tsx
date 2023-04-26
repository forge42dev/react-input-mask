import { useState } from "react";
import type { KeyboardEvent } from "react";
import {
  convertMaskToPlaceholder,
  convertRawValueToMaskedValue,
  isValidInput,
  isWholeInputSelected,
  triggerInputChange,
  useRunAfterUpdate,
} from "../utils";

interface UseInputMaskProps {
  mask?: string;
  placeholderChar?: string;
  charRegex?: RegExp;
  numRegex?: RegExp;
  type?: "raw" | "mask";
}
export const LETTER_REGEX = /^[a-zA-Z]*$/;
export const DIGIT_REGEX = /^[0-9]*$/;

export function useInputMask({
  mask,
  placeholderChar = "_",
  type = "raw",
  charRegex = LETTER_REGEX,
  numRegex = DIGIT_REGEX,
}: UseInputMaskProps) {
  const maskRegex = /[^A9*]+/g;
  const filteredMask = mask?.replace(maskRegex, "");
  const run = useRunAfterUpdate();
  const [rawValue, setRawValue] = useState("");
  const [maskValue, setMaskValue] = useState(
    convertMaskToPlaceholder(mask ?? "", placeholderChar)
  );
  if (!mask) {
    return {};
  }
  // If rendering on the server, return the mask value
  if (typeof document === "undefined") {
    return { value: maskValue };
  }

  const setMaskValues = (
    raw: string,
    input: HTMLInputElement,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    setRawValue(raw);
    const maskValue = convertRawValueToMaskedValue(raw, mask, placeholderChar);
    setMaskValue(maskValue);
    const value = type === "raw" ? raw : maskValue;
    // Calls react onChange event
    triggerInputChange(event.target as HTMLInputElement, value);
    // sets the caret position to the next available position
    run(() => {
      const caretPosition = maskValue.indexOf(placeholderChar);
      input.setSelectionRange(caretPosition, caretPosition);
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const value = event.key;
    const input = event.target as HTMLInputElement;
    const currentMaskIndex = rawValue.length;
    const currentMaskChar = filteredMask![currentMaskIndex];
    // Select whole input if user presses Ctrl+A
    if (event.ctrlKey && event.key.toLowerCase() === "a") {
      event.preventDefault();
      input.setSelectionRange(0, mask.length);
      return;
    }
    if (value === "Tab" || value === "Enter") {
      return;
    }

    event.preventDefault();

    if (value === "Backspace" && rawValue.length > 0) {
      const isWholeSelected = isWholeInputSelected(input, mask);
      const newValue = isWholeSelected ? "" : rawValue.slice(0, -1);
      return setMaskValues(newValue, input, event);
    }

    const isValid = isValidInput({
      value,
      currentMaskChar,
      charRegex,
      numRegex,
      filteredMask: filteredMask!,
      rawValue,
    });

    if (!isValid) {
      return;
    }

    const newValue = rawValue + value;
    setMaskValues(newValue, input, event);
  };

  const inputProps = {
    value: maskValue,
    onKeyDown,
  };

  return { ...inputProps };
}
