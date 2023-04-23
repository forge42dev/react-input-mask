import { LETTER_REGEX, DIGIT_REGEX } from "../hook/useInputMask";

export const isLetter = (char: string, regex = LETTER_REGEX) =>
  regex.test(char);
export const isDigit = (char: string, regex = DIGIT_REGEX) => regex.test(char);
export const isWildcard = (char: string) => char === "*";

export const getMaskedValueFromRaw = (mask: string, rawValue: string) => {
  let output = mask;
  let reachedIndex = 0;
  mask.split("").forEach((char) => {
    if (!rawValue[reachedIndex]) return;
    if (char === "*") {
      output = output.replace(char, rawValue[reachedIndex]);
      reachedIndex += 1;
    }
    if (char === "A" && isLetter(rawValue[reachedIndex])) {
      output = output.replace(char, rawValue[reachedIndex]);
      reachedIndex += 1;
    }
    if (char === "9" && isDigit(rawValue[reachedIndex])) {
      output = output.replace(char, rawValue[reachedIndex]);
      reachedIndex += 1;
    }
  });

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

const getNonMaskedCharCount = (mask: string, lastCharIndex: number) => {
  return mask
    .substring(0, lastCharIndex)
    .split("")
    .filter((char) => char !== "*" && char !== "9" && char !== "A").length;
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

export const isValidInput = ({
  filteredMask,
  value,
  rawValue,
  currentMaskChar,
  charRegex,
  numRegex,
}: {
  value: string;
  currentMaskChar: string;
  filteredMask: string;
  rawValue: string;
  charRegex: RegExp;
  numRegex: RegExp;
}) => {
  if (value.length > 1) {
    return false;
  }
  if (filteredMask.length === rawValue.length) {
    return false;
  }
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
