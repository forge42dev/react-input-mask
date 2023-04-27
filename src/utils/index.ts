import { LETTER_REGEX, DIGIT_REGEX } from "../hook/useInputMask";

export const isLetter = (char: string, regex = LETTER_REGEX) =>
  regex.test(char);
export const isDigit = (char: string, regex = DIGIT_REGEX) => regex.test(char);
export const isWildcard = (char: string) => char === "*";
export const isMaskChar = (char: string) =>
  char === "A" || char === "9" || char === "*";

export const getMaskedValueFromRaw = (mask: string, rawValue: string) => {
  let reachedIndex = 0;
  const output = mask
    .split("")
    .map((char) => {
      if (!isMaskChar(char)) return char;
      const returnValue = rawValue[reachedIndex];
      if (!returnValue) return char;

      if (char === "*") {
        reachedIndex += 1;
        return returnValue;
      }
      if (char === "A" && isLetter(rawValue[reachedIndex])) {
        reachedIndex += 1;
        return returnValue;
      }
      if (char === "9" && isDigit(rawValue[reachedIndex])) {
        reachedIndex += 1;
        return returnValue;
      }
      return char;
    })
    .join("");

  return output;
};

export const convertMaskToPlaceholder = (
  mask: string,
  placeholderChar: string,
  reachedIndex = 0
) => {
  return (
    mask.slice(0, reachedIndex) +
    mask
      .slice(reachedIndex, mask.length)
      .replaceAll("*", placeholderChar)
      .replaceAll("A", placeholderChar)
      .replaceAll("9", placeholderChar)
  );
};
/**
 * Goes through the mask until it reaches the raw value length and returns the count of non-masked characters
 * @param mask Mask string
 * @param rawLength Length of the raw value
 * @returns Returns the count of non-masked characters
 */
export const getNonMaskedCharCount = (mask: string, rawLength: number) => {
  let reachedIndex = 0;
  return mask.split("").filter((char) => {
    if (reachedIndex >= rawLength) return false;
    if (isMaskChar(char)) {
      reachedIndex += 1;
      return false;
    }
    return true;
  }).length;
};

export const convertRawValueToMaskedValue = (
  rawValue: string,
  mask: string,
  placeholderChar: string
) => {
  const output = getMaskedValueFromRaw(mask, rawValue);
  const extraChars = getNonMaskedCharCount(mask, rawValue.length);
  return convertMaskToPlaceholder(
    output,
    placeholderChar,
    rawValue.length + extraChars
  );
};
interface IsValidInputProps {
  value: string;
  currentMaskChar: string;
  filteredMask: string;
  rawValue: string;
  charRegex: RegExp;
  numRegex: RegExp;
}
export const isValidInput = ({
  filteredMask,
  value,
  rawValue,
  currentMaskChar,
  charRegex,
  numRegex,
}: IsValidInputProps) => {
  if (value.length > 1) {
    return false;
  }
  if (filteredMask.length === rawValue.length) {
    return false;
  }

  return maskAndValueMatch(value, currentMaskChar, charRegex, numRegex);
};

export const maskAndValueMatch = (
  value: string,
  currentMaskChar: string,
  charRegex: RegExp,
  numRegex: RegExp
) => {
  if (isLetter(value, charRegex) && isLetter(currentMaskChar, charRegex)) {
    return true;
  }
  if (isDigit(value, numRegex) && isDigit(currentMaskChar, numRegex)) {
    return true;
  }
  if (isWildcard(currentMaskChar)) {
    return true;
  }
  return false;
};

export const isWholeInputSelected = (input: HTMLInputElement, mask: string) => {
  return input.selectionStart === 0 && input.selectionEnd === mask.length;
};

export const triggerInputChange = (
  node: HTMLInputElement,
  inputValue: string
) => {
  node.value = inputValue;

  const e = document.createEvent("HTMLEvents");
  e.initEvent("change", true, false);
  node.dispatchEvent(e);
};
export * from "./useRunAfterUpdate";

export const generateRawValue = (
  mask = "",
  value = "",
  charRegex: RegExp,
  numRegex: RegExp,
  placeholderChar: string
) => {
  const defaultReturn = {
    maskValue: convertMaskToPlaceholder(mask, placeholderChar),
    rawValue: "",
  };
  if (!mask || !value) {
    return defaultReturn;
  }
  const filteredMask = mask.replace(/[^A9*]+/g, "");
  const chars = value.split("");
  const allValid = chars.every((char, index) =>
    isValidInput({
      value: char,
      currentMaskChar: filteredMask[index],
      charRegex,
      numRegex,
      filteredMask,
      rawValue: value.slice(0, index),
    })
  );

  if (allValid) {
    return {
      maskValue: convertRawValueToMaskedValue(value, mask, placeholderChar),
      rawValue: value,
    };
  }

  return defaultReturn;
};

export const generateMaskValue = (
  mask: string,
  value: string,
  charRegex: RegExp,
  numRegex: RegExp,
  placeholderChar: string
) => {
  const defaultReturn = {
    maskValue: convertMaskToPlaceholder(mask, placeholderChar),
    rawValue: "",
  };
  if (value.length != mask.length) {
    return defaultReturn;
  }
  const chars = mask.split("");
  const valid = chars.every((char, index) => {
    if (!isMaskChar(char)) {
      return char === value[index];
    }
    return maskAndValueMatch(value[index], char, charRegex, numRegex);
  });
  if (valid) {
    const rawValue = chars
      .map((char, index) => {
        if (isMaskChar(char)) {
          return value[index];
        }
        return "";
      })
      .join("");
    return { maskValue: value, rawValue };
  }
  return defaultReturn;
};
export const generateDefaultValues = (
  mask = "",
  value = "",
  type: "raw" | "mask",
  charRegex: RegExp,
  numRegex: RegExp,
  placeholderChar: string
) => {
  if (type === "mask") {
    return generateMaskValue(mask, value, charRegex, numRegex, placeholderChar);
  }
  return generateRawValue(mask, value, charRegex, numRegex, placeholderChar);
};
