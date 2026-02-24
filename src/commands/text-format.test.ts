import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("opennexus", 16)).toBe("opennexus");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("opennexus-status-output", 10)).toBe("opennexus-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
