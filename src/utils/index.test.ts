import { DIGIT_REGEX, LETTER_REGEX } from "../hook/useInputMask";
import {
  isLetter,
  isDigit,
  isWildcard,
  getMaskedValueFromRaw,
  convertMaskToPlaceholder,
  convertRawValueToMaskedValue,
  isValidInput,
  isWholeInputSelected,
  getNonMaskedCharCount,
  generateMaskValue,
  maskAndValueMatch,
  generateRawValue,
  isMaskChar,
  generateDefaultValues,
  triggerInputChange,
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

describe("maskAndValueMatch", () => {
  const charRegex = LETTER_REGEX;
  const numRegex = DIGIT_REGEX;

  test("returns true for matching letter and letter mask char", () => {
    expect(maskAndValueMatch("a", "A", charRegex, numRegex)).toBe(true);
    expect(maskAndValueMatch("z", "A", charRegex, numRegex)).toBe(true);
    expect(maskAndValueMatch("B", "A", charRegex, numRegex)).toBe(true);
  });

  test("returns true for matching digit and digit mask char", () => {
    expect(maskAndValueMatch("1", "9", charRegex, numRegex)).toBe(true);
    expect(maskAndValueMatch("5", "9", charRegex, numRegex)).toBe(true);
    expect(maskAndValueMatch("0", "9", charRegex, numRegex)).toBe(true);
  });

  test("returns true for wildcard mask char", () => {
    expect(maskAndValueMatch("a", "*", charRegex, numRegex)).toBe(true);
    expect(maskAndValueMatch("5", "*", charRegex, numRegex)).toBe(true);
    expect(maskAndValueMatch("!", "*", charRegex, numRegex)).toBe(true);
  });

  test("returns false for non-matching value and mask char", () => {
    expect(maskAndValueMatch("a", "9", charRegex, numRegex)).toBe(false);
    expect(maskAndValueMatch("1", "A", charRegex, numRegex)).toBe(false);
    expect(maskAndValueMatch("&", "9", charRegex, numRegex)).toBe(false);
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

describe("isValidInput", () => {
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

describe("isWholeInputSelected", () => {
  const mask = "(___) ___-____";

  it("returns true when whole input is selected", () => {
    const input = document.createElement("input");
    input.value = "(123) 4567-8911";
    input.selectionStart = 0;
    input.selectionEnd = mask.length;

    expect(isWholeInputSelected(input, mask)).toBe(true);
  });

  it("returns false when only part of input is selected", () => {
    const input = document.createElement("input");
    input.value = "1234567890";
    input.selectionStart = 0;
    input.selectionEnd = 5;

    expect(isWholeInputSelected(input, mask)).toBe(false);
  });

  it("returns false when no input is selected", () => {
    const input = document.createElement("input");
    input.value = "1234567890";
    input.selectionStart = input.selectionEnd = 5;

    expect(isWholeInputSelected(input, mask)).toBe(false);
  });

  it("returns false when input is empty", () => {
    const input = document.createElement("input");
    input.value = "";
    input.selectionStart = input.selectionEnd = 0;

    expect(isWholeInputSelected(input, mask)).toBe(false);
  });
});

describe("getNonMaskedCharCount", () => {
  it("returns 0 for empty mask and any raw length", () => {
    expect(getNonMaskedCharCount("", 0)).toBe(0);
    expect(getNonMaskedCharCount("", 1)).toBe(0);
    expect(getNonMaskedCharCount("", 10)).toBe(0);
  });

  it("returns 0 for mask containing non mask characters that haven't been reached", () => {
    expect(getNonMaskedCharCount("***-***-****", 0)).toBe(0);
    expect(getNonMaskedCharCount("***-***-****", 1)).toBe(0);
    expect(getNonMaskedCharCount("***-***-****", 2)).toBe(0);
    expect(getNonMaskedCharCount("***-***-****", 3)).toBe(0);
  });

  it("returns proper char count when the placeholders have been reached", () => {
    expect(getNonMaskedCharCount("***-***-****", 3)).toBe(0);
    expect(getNonMaskedCharCount("***-***-****", 4)).toBe(1);
    expect(getNonMaskedCharCount("***-***-****", 10)).toBe(2);
    expect(getNonMaskedCharCount("9999 9999 9999 9999", 10)).toBe(2);
    expect(getNonMaskedCharCount("9999 9999 9999 9999", 12)).toBe(2);
    expect(getNonMaskedCharCount("9999 9999 9999 9999", 13)).toBe(3);
  });

  it("returns 0 when there are no placeholder characters no matter of position reached", () => {
    expect(getNonMaskedCharCount("9A***9", 0)).toBe(0);
    expect(getNonMaskedCharCount("9A***9", 1)).toBe(0);
    expect(getNonMaskedCharCount("9A***9", 10)).toBe(0);
  });
});

describe("generateMaskValue", () => {
  const charRegex = LETTER_REGEX;
  const numRegex = DIGIT_REGEX;
  const placeholderChar = "_";

  it("returns default values when value length is less than mask length", () => {
    const result = generateMaskValue(
      "A9A-9A9",
      "abc",
      charRegex,
      numRegex,
      placeholderChar
    );
    expect(result).toEqual({
      maskValue: "___-___",
      rawValue: "",
    });
  });

  it("returns default values when value length is greater than mask length", () => {
    const result = generateMaskValue(
      "A9A-9A9",
      "abc12345",
      charRegex,
      numRegex,
      placeholderChar
    );
    expect(result).toEqual({
      maskValue: "___-___",
      rawValue: "",
    });
  });

  it("returns mask value and raw value when mask and value match", () => {
    const result = generateMaskValue(
      "AAA-999",
      "abc-123",
      charRegex,
      numRegex,
      placeholderChar
    );
    expect(result).toEqual({
      maskValue: "abc-123",
      rawValue: "abc123",
    });
  });

  it("returns mask value with placeholder when mask and value don't match", () => {
    const result = generateMaskValue(
      "A9A-9A9",
      "a!b@c#d$e",
      charRegex,
      numRegex,
      placeholderChar
    );
    expect(result).toEqual({
      maskValue: "___-___",
      rawValue: "",
    });
  });

  it("returns mask value with placeholder containing special non mask characters properly", () => {
    const result = generateMaskValue(
      "AAA-BBBB",
      "123abc45",
      charRegex,
      numRegex,
      placeholderChar
    );
    expect(result).toEqual({
      maskValue: "___-BBBB",
      rawValue: "",
    });
  });

  it("returns mask value with placeholder when value contains non-alphanumeric characters for an alphanumeric mask character", () => {
    const result = generateMaskValue(
      "A9A-9A9",
      "a!b@c#d$e",
      charRegex,
      numRegex,
      placeholderChar
    );
    expect(result).toEqual({
      maskValue: "___-___",
      rawValue: "",
    });
  });
});

describe("generateRawValue", () => {
  const charRegex = LETTER_REGEX;
  const numRegex = DIGIT_REGEX;
  const placeholderChar = "_";

  test("returns default values if mask or value are empty", () => {
    expect(
      generateRawValue("", "", charRegex, numRegex, placeholderChar)
    ).toEqual({
      maskValue: "",
      rawValue: "",
    });
    expect(
      generateRawValue("A9A-9A9", "", charRegex, numRegex, placeholderChar)
    ).toEqual({
      maskValue: "___-___",
      rawValue: "",
    });
  });

  test("returns default values if mask contains no mask characters", () => {
    expect(
      generateRawValue("abc", "abc", charRegex, numRegex, placeholderChar)
    ).toEqual({
      maskValue: "abc",
      rawValue: "",
    });
  });

  test("returns default values if value length doesn't match mask length", () => {
    expect(
      generateRawValue("A9A-9A9", "123", charRegex, numRegex, placeholderChar)
    ).toEqual({
      maskValue: "___-___",
      rawValue: "",
    });
  });

  test("returns default values if input contains invalid characters", () => {
    expect(
      generateRawValue("A9A-9A9", "abcde", charRegex, numRegex, placeholderChar)
    ).toEqual({
      maskValue: "___-___",
      rawValue: "",
    });
    expect(
      generateRawValue(
        "A9A-9A9",
        "12#-345",
        charRegex,
        numRegex,
        placeholderChar
      )
    ).toEqual({
      maskValue: "___-___",
      rawValue: "",
    });
  });

  test("returns masked and raw values when input is valid", () => {
    expect(
      generateRawValue(
        "A9A-9A9",
        "A1B2C3",
        charRegex,
        numRegex,
        placeholderChar
      )
    ).toEqual({
      maskValue: "A1B-2C3",
      rawValue: "A1B2C3",
    });
    expect(
      generateRawValue(
        "A9A-9A9",
        "a1b2c3",
        charRegex,
        numRegex,
        placeholderChar
      )
    ).toEqual({
      maskValue: "a1b-2c3",
      rawValue: "a1b2c3",
    });
  });
});

describe("isMaskChar", () => {
  test("returns true when the character is 'A'", () => {
    expect(isMaskChar("A")).toBe(true);
  });

  test("returns true when the character is '9'", () => {
    expect(isMaskChar("9")).toBe(true);
  });

  test("returns true when the character is '*'", () => {
    expect(isMaskChar("*")).toBe(true);
  });

  test("returns false when the character is not 'A', '9', or '*'", () => {
    expect(isMaskChar("a")).toBe(false);
    expect(isMaskChar("1")).toBe(false);
    expect(isMaskChar("#")).toBe(false);
  });
});

describe("generateDefaultValues", () => {
  it("should return default values when mask and value are empty", () => {
    const result = generateDefaultValues("", "", "raw", /[A-Za-z]/, /\d/, "*");
    expect(result).toEqual({
      maskValue: "",
      rawValue: "",
    });
  });

  it("should generate mask value and raw value for raw input", () => {
    const result = generateDefaultValues(
      "AAA-9999",
      "abc1234",
      "raw",
      /[A-Za-z]/,
      /\d/,
      "*"
    );
    expect(result).toEqual({
      maskValue: "abc-1234",
      rawValue: "abc1234",
    });
  });

  it("should generate mask value and raw value for mask input", () => {
    const result = generateDefaultValues(
      "AAA-9999",
      "abc-1234",
      "mask",
      /[A-Za-z]/,
      /\d/,
      "*"
    );
    expect(result).toEqual({
      maskValue: "abc-1234",
      rawValue: "abc1234",
    });
  });

  it("should return partial values when mask and value have different lengths for raw input", () => {
    const result = generateDefaultValues(
      "AAA-9999",
      "abc",
      "raw",
      /[A-Za-z]/,
      /\d/,
      "*"
    );
    expect(result).toEqual({
      maskValue: "abc-****",
      rawValue: "abc",
    });
  });

  it("should return default values when mask and value have different lengths for mask input", () => {
    const result = generateDefaultValues(
      "AAA-9999",
      "abc-12",
      "mask",
      /[A-Za-z]/,
      /\d/,
      "*"
    );
    expect(result).toEqual({
      maskValue: "***-****",
      rawValue: "",
    });
  });

  it("should return default values when input is invalid for raw input", () => {
    const result = generateDefaultValues(
      "AAA-9999",
      "123-abc",
      "raw",
      /[A-Za-z]/,
      /\d/,
      "*"
    );
    expect(result).toEqual({
      maskValue: "***-****",
      rawValue: "",
    });
  });

  it("should return default values when input is invalid for mask input", () => {
    const result = generateDefaultValues(
      "AAA-9999",
      "123abc",
      "mask",
      /[A-Za-z]/,
      /\d/,
      "*"
    );
    expect(result).toEqual({
      maskValue: "***-****",
      rawValue: "",
    });
  });
});

describe("triggerInputChange", () => {
  it("should trigger a change event on the input element", () => {
    const input = document.createElement("input");
    const inputValue = "test";
    vi.spyOn(input, "dispatchEvent");
    triggerInputChange(input, inputValue);
    expect(input.value).toBe(inputValue);
    expect(input.dispatchEvent).toHaveBeenCalled();
    expect(input.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "change",
      })
    );
  });

  it("should properly set the value of the input element", () => {
    const input = document.createElement("input");
    const inputValue = "test";
    triggerInputChange(input, inputValue);
    expect(input.value).toBe(inputValue);
  });
});
