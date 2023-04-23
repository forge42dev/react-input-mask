import { DIGIT_REGEX, LETTER_REGEX } from "../hook/useInputMask";
import {
  isLetter,
  isDigit,
  isWildcard,
  getMaskedValueFromRaw,
  convertMaskToPlaceholder,
  convertRawValueToMaskedValue,
  isValidInput,
} from "./";

describe("isLetter", () => {
  test("returns true for valid letters", () => {
    expect(isLetter("a")).toBe(true);
    expect(isLetter("A")).toBe(true);
    expect(isLetter("z")).toBe(true);
    expect(isLetter("Z")).toBe(true);
  });

  test("returns false for non-letter characters", () => {
    expect(isLetter("1")).toBe(false);
    expect(isLetter("*")).toBe(false);
    expect(isLetter(" ")).toBe(false);
  });
});

describe("isDigit", () => {
  test("returns true for valid digits", () => {
    expect(isDigit("0")).toBe(true);
    expect(isDigit("1")).toBe(true);
    expect(isDigit("9")).toBe(true);
  });

  test("returns false for non-digit characters", () => {
    expect(isDigit("a")).toBe(false);
    expect(isDigit("*")).toBe(false);
    expect(isDigit(" ")).toBe(false);
  });
});

describe("isWildcard", () => {
  test("returns true for wildcard character", () => {
    expect(isWildcard("*")).toBe(true);
  });

  test("returns false for non-wildcard characters", () => {
    expect(isWildcard("a")).toBe(false);
    expect(isWildcard("1")).toBe(false);
    expect(isWildcard(" ")).toBe(false);
  });
});

describe("getMaskedValueFromRaw", () => {
  test("returns the correct output for a simple mask and raw value", () => {
    expect(getMaskedValueFromRaw("***-***", "abc123")).toBe("abc-123");
  });

  test("returns the correct output when the mask and raw value have the same length", () => {
    expect(getMaskedValueFromRaw("AAA-999", "abc123")).toBe("abc-123");
  });

  test("returns the correct output when the raw value is shorter than the mask", () => {
    expect(getMaskedValueFromRaw("AAA-999", "ab")).toBe("abA-999");
  });

  test("returns the correct output when the raw value is longer than the mask", () => {
    expect(getMaskedValueFromRaw("AAA-999", "abcdefghi")).toBe("abc-999");
  });

  test("returns the correct output when the raw value contains non-letter and non-digit characters", () => {
    expect(getMaskedValueFromRaw("A9A-9A9", "a!b@c#")).toBe("a9A-9A9");
  });

  test("returns the correct output when the mask contains only wildcards", () => {
    expect(getMaskedValueFromRaw("***", "abc123")).toBe("abc");
  });

  test("returns the correct output when the mask and raw value contain only one type of character", () => {
    expect(getMaskedValueFromRaw("AAA", "abc")).toBe("abc");
    expect(getMaskedValueFromRaw("999", "123")).toBe("123");
    expect(getMaskedValueFromRaw("***", "abc")).toBe("abc");
  });

  test("returns the correct output when the raw value is empty", () => {
    expect(getMaskedValueFromRaw("AAA-999", "")).toBe("AAA-999");
  });

  test("returns the correct output when the mask is empty", () => {
    expect(getMaskedValueFromRaw("", "abc123")).toBe("");
  });
});

describe("convertMaskToPlaceholder", () => {
  test("returns an empty string if the input mask is an empty string", () => {
    expect(convertMaskToPlaceholder("", "-")).toBe("");
  });

  test("replaces all '*' characters in the mask with the placeholder character", () => {
    expect(convertMaskToPlaceholder("***", "-")).toBe("---");
    expect(convertMaskToPlaceholder("*A*B*C*", "-")).toBe("---B-C-");
    expect(convertMaskToPlaceholder("*", "-")).toBe("-");
  });

  test("replaces all 'A' characters in the mask with the placeholder character", () => {
    expect(convertMaskToPlaceholder("AAA", "-")).toBe("---");
    expect(convertMaskToPlaceholder("A*A*A", "-")).toBe("-----");
    expect(convertMaskToPlaceholder("A", "-")).toBe("-");
  });

  test("replaces all '9' characters in the mask with the placeholder character", () => {
    expect(convertMaskToPlaceholder("999", "-")).toBe("---");
    expect(convertMaskToPlaceholder("9*9*9", "-")).toBe("-----");
    expect(convertMaskToPlaceholder("9", "-")).toBe("-");
  });

  test("replaces all '*' and 'A' and '9' characters in the mask with the placeholder character", () => {
    expect(convertMaskToPlaceholder("*A9", "-")).toBe("---");
    expect(convertMaskToPlaceholder("*A9B*C*D*9A", "-")).toBe("---B-C-D---");
    expect(convertMaskToPlaceholder("A99**", "-")).toBe("-----");
  });

  test("returns the same string if the mask doesn't contain '*' or 'A' or '9' characters", () => {
    expect(convertMaskToPlaceholder("abc123", "-")).toBe("abc123");
    expect(convertMaskToPlaceholder("-", "-")).toBe("-");
    expect(convertMaskToPlaceholder(" ", "-")).toBe(" ");
  });

  test("replaces all '*' and 'A' and '9' characters in the mask with the provided placeholder character", () => {
    expect(convertMaskToPlaceholder("**A9*", "#")).toBe("#####");
    expect(convertMaskToPlaceholder("*A*B*C*", "@")).toBe("@@@B@C@");
    expect(convertMaskToPlaceholder("A999B", "$")).toBe("$$$$B");
  });
});

describe("convertRawValueToMaskedValue", () => {
  test("returns an empty string if the input raw value and mask are both empty strings", () => {
    expect(convertRawValueToMaskedValue("", "", "-")).toBe("");
  });

  test("returns the masked value if the input raw value is an empty string", () => {
    expect(convertRawValueToMaskedValue("", "A9A-9A9", "-")).toBe("-------");
    expect(convertRawValueToMaskedValue("", "***", "-")).toBe("---");
    expect(convertRawValueToMaskedValue("", "ABC", "-")).toBe("-BC");
  });

  test("returns the masked value with placeholders for each character in the input raw value", () => {
    expect(convertRawValueToMaskedValue("B2C3A3", "A9A-9A9", "-")).toBe(
      "B2C-3A3"
    );
    expect(convertRawValueToMaskedValue("abc1", "***-9A9", "-")).toBe(
      "abc-1--"
    );
    expect(convertRawValueToMaskedValue("AAA", "A*A*A", "-")).toBe("AAA--");
  });

  test("replaces all '*' and 'A' and '9' characters in the mask with the provided placeholder character", () => {
    expect(
      convertRawValueToMaskedValue("123456789", "999-999-999-9", "#")
    ).toBe("123-456-789-#");
    expect(convertRawValueToMaskedValue("abc123", "***-9999", "@")).toBe(
      "abc-123@"
    );
    expect(convertRawValueToMaskedValue("123", "****A", "$")).toBe("123$$");
  });

  test("handles edge cases", () => {
    expect(convertRawValueToMaskedValue("a", "A", "-")).toBe("a");
    expect(convertRawValueToMaskedValue("1", "9", "-")).toBe("1");
    expect(convertRawValueToMaskedValue("*", "*", "-")).toBe("*");
  });
});

describe("isValidInput()", () => {
  const charRegex = LETTER_REGEX;
  const numRegex = DIGIT_REGEX;

  it("should return false if value has length greater than 1", () => {
    const result = isValidInput({
      value: "abc",
      currentMaskChar: "A",
      filteredMask: "AAA",
      rawValue: "a",
      charRegex,
      numRegex,
    });
    expect(result).toBe(false);
  });

  it("should return false if filteredMask has the same length as rawValue", () => {
    const result = isValidInput({
      value: "a",
      currentMaskChar: "A",
      filteredMask: "AAA",
      rawValue: "abc",
      charRegex,
      numRegex,
    });
    expect(result).toBe(false);
  });

  it("should return true if value and currentMaskChar are both letters", () => {
    const result = isValidInput({
      value: "a",
      currentMaskChar: "A",
      filteredMask: "AAA",
      rawValue: "a",
      charRegex,
      numRegex,
    });
    expect(result).toBe(true);
  });

  it("should return true if value and currentMaskChar are both digits", () => {
    const result = isValidInput({
      value: "1",
      currentMaskChar: "9",
      filteredMask: "999",
      rawValue: "1",
      charRegex,
      numRegex,
    });
    expect(result).toBe(true);
  });

  it("should return true if currentMaskChar is a wildcard", () => {
    const result = isValidInput({
      value: "a",
      currentMaskChar: "*",
      filteredMask: "**",
      rawValue: "a",
      charRegex,
      numRegex,
    });
    expect(result).toBe(true);
  });

  it("should return false if value is a digit and currentMaskChar is a letter", () => {
    const result = isValidInput({
      value: "1",
      currentMaskChar: "A",
      filteredMask: "AAA",
      rawValue: "a",
      charRegex,
      numRegex,
    });
    expect(result).toBe(false);
  });

  it("should return false if value is a letter and currentMaskChar is a digit", () => {
    const result = isValidInput({
      value: "a",
      currentMaskChar: "9",
      filteredMask: "999",
      rawValue: "1",
      charRegex,
      numRegex,
    });
    expect(result).toBe(false);
  });
});
