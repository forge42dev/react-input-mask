import { useRef, useLayoutEffect, useState } from "react";
import {
  convertMaskToPlaceholder,
  convertRawValueToMaskedValue,
  isValidInput,
} from "../utils";

interface UseInputMaskProps {
  mask: string;
  onChange: (value: string) => void;
  placeholderChar?: string;
  charRegex?: RegExp;
  numRegex?: RegExp;
  type?: "raw" | "mask";
}
export const LETTER_REGEX = /^[a-zA-Z]*$/;
export const DIGIT_REGEX = /^[0-9]*$/;

const useRunAfterUpdate = () => {
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

export function useInputMask({
  mask,
  placeholderChar = "_",
  type = "raw",
  charRegex = LETTER_REGEX,
  numRegex = DIGIT_REGEX,
  onChange,
}: UseInputMaskProps) {
  const maskRegex = /[^A9*]+/g;
  const filteredMask = mask.replace(maskRegex, "");
  const run = useRunAfterUpdate();
  const [rawValue, setRawValue] = useState("");
  const [maskValue, setMaskValue] = useState(
    convertMaskToPlaceholder(mask, placeholderChar)
  );

  const setMaskValues = (raw: string, input: HTMLInputElement) => {
    setRawValue(raw);
    const maskValue = convertRawValueToMaskedValue(raw, mask, placeholderChar);
    setMaskValue(maskValue);
    // Calls the provided onChange function with the new value
    onChange(type === "raw" ? raw : maskValue);
    // sets the caret position to the next available position
    run(() => {
      const caretPosition = maskValue.indexOf(placeholderChar);
      input.setSelectionRange(caretPosition, caretPosition);
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const value = event.key;
    const input = event.target as HTMLInputElement;
    const currentMaskIndex = rawValue.length;
    const currentMaskChar = filteredMask[currentMaskIndex];
    if (value === "Tab" || value === "Enter") {
      return;
    }

    event.preventDefault();

    if (value === "Backspace" && rawValue.length > 0) {
      const newValue = rawValue.slice(0, -1);
      return setMaskValues(newValue, input);
    }

    const isValid = isValidInput({
      value,
      currentMaskChar,
      charRegex,
      numRegex,
      filteredMask,
      rawValue,
    });

    if (!isValid) {
      return;
    }

    const newValue = rawValue + value;
    setMaskValues(newValue, input);
  };

  const inputProps = {
    value: maskValue,
    onKeyDown,
  };

  return { ...inputProps };
}
